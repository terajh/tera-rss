# tera-rss — AI 에이전트 가이드

이 문서는 AI 에이전트가 **tera-rss 저장소에서 작업할 때** 빠르게 컨텍스트를 잡도록 돕는다.
사람용 개괄은 [README.md](README.md), 피드 관리 절차는 [docs/FEED_MANAGEMENT.md](docs/FEED_MANAGEMENT.md)에 있다.

## 프로젝트 한 줄 요약

**Deno로 구현한 RSS 피드 병합기.** `feeds/<group>/*.csv`에 정의된 수백 개의 RSS 피드를 fetch해서, 그룹별로 통합 XML(`rss/<group>/all.xml`)과 퍼블리셔·카테고리별 XML을 만들어 GitHub Pages에 배포한다. 이노리더 같은 개인 RSS 리더에서 한 번에 구독하는 "개인용 RSS 허브"가 목표다.

## 스택

| 항목 | 값 |
|---|---|
| 런타임 | Deno v2.x |
| 언어 | TypeScript |
| 의존성 | `std/csv`, `x/rss`, `x/xml`, `x/sleep` (전부 `src/deps.ts`에 모음) |
| 배포 | GitHub Actions + GitHub Pages (`.github/workflows/update-feeds.yaml`) |
| 스케줄 | 매일 00:00 UTC + main push + 수동 실행 |

## 디렉터리 레이아웃

```
tera-rss/
├── feeds/<group>/              # 그룹별 피드 정의 (dev, economy, anime)
│   ├── publishers.csv          # id,name,url — 퍼블리셔 메타 (단일 출처)
│   ├── feed_specs.csv          # active 피드 (최근 90일 내 게시)
│   ├── feed_specs_slow.csv     # slow 피드 (90~365일) ※ dev만
│   ├── feed_specs_archive.csv  # archive (수집 제외) ※ dev만
│   └── classification.json     # classifier 스냅샷 (gitignore)
├── src/
│   ├── parser.ts               # 모든 핵심 로직 (CSV 로드, fetch, 파싱, XML 생성)
│   ├── collect.ts              # 피드 수집 엔트리포인트
│   ├── merge.ts                # JSON → XML 머지 엔트리포인트
│   ├── classify.ts             # 피드 활성도 분류 (NEW)
│   ├── split.ts                # 분류 결과로 CSV 분할 (NEW)
│   ├── deps.ts / dev_deps.ts   # 외부 의존성
│   └── tests/parser_test.ts
├── rss/                        # 실행 결과물 (gitignore, GitHub Pages가 배포)
├── docs/FEED_MANAGEMENT.md     # 3단계 청크 관리 가이드
├── bins/                       # 셸 래퍼
├── deno.json                   # task 정의
└── .github/workflows/update-feeds.yaml
```

## 핵심 데이터 모델

`src/parser.ts` 상단에 정의된 3개 타입이 전부다.

```typescript
type Publisher = { id: string; name: string; url: string };
type FeedSpec  = { publisher: Publisher; title: string; categories: string[]; url: string };
type FeedItem  = { spec: FeedSpec; title: string; partialText: string; date: string; url: string };
```

**불변성 원칙** — 모든 타입은 `readonly`다. 수정은 새 객체로만.

## CSV 스키마 (엄격)

### `publishers.csv`
```csv
id,name,url
nextjs,Next.js Blog,https://nextjs.org
```

- `id`: 파일명·URL에 쓰이므로 영소문자+하이픈만
- `name`: **`feed_specs.csv`의 `publisher` 컬럼과 정확히 일치해야 함** (불일치 시 해당 피드 스킵)
- `url`: 홈페이지 URL (피드 URL 아님)

### `feed_specs.csv`
```csv
publisher,title,categories,url
Next.js Blog,Next.js 공식 블로그,frontend,https://nextjs.org/feed.xml
```

- `publisher`: `publishers.csv`의 `name`을 참조
- `categories`: `|` 구분 (`frontend|devops`), `_all_`는 전체 피드로 승격됨
- `url`: RSS/Atom 피드 URL

## 파이프라인

```
  feed_specs.csv ─┐
                  ├─▶ collect.ts ─▶ rss/<group>/jsons/*.json ─▶ merge.ts ─▶ rss/<group>/{all,publishers,categories}/*.xml
  publishers.csv ─┘
```

### 1) collect (`deno task collect` / `collect:<group>`)
- `loadAllFeedSpecs(feedsDir)` — `feed_specs*.csv` 전부 자동 로드 (archive만 제외)
- 순차 fetch + `1 + (i % 5)` 초 throttle
- 파일당 실패는 로그만 남기고 계속 진행 (**fail-soft**)
- 결과: `rss/<group>/jsons/<publisherId>-<categories>.json`

### 2) merge (`deno task merge` / `merge:<group>`)
- JSON 모으기 → 날짜 내림차순 정렬 → XML 직렬화
- 출력: `all.xml`, `publishers/<id>.xml`, `categories/<cat>.xml`

### 3) classify (`deno task classify:<group>`) — 피드 관리용
- 각 피드 fetch 후 최신 `pubDate`로 `active`/`slow`/`archive` 분류
- 10 concurrent, 10s timeout — collect와 달리 **빠르게 끝남**
- 결과: `feeds/<group>/classification.json`

### 4) split (`deno task split <group>`) — 피드 관리용
- `classification.json` 읽어 `feed_specs.csv`를 3개 파일로 재구성
- 매치 안 되는 행은 **안전하게 active 유지** (신규 피드 보호)

## 주요 task

```bash
deno task update              # collect + merge, 모든 그룹
deno task collect:dev         # dev만 수집
deno task merge:dev           # dev만 머지
deno task classify:dev        # dev 피드 활성도 분류
deno task split dev           # 분류 결과로 CSV 분할
deno task test                # parser 테스트
```

## 주의사항 (에이전트가 자주 실수하는 포인트)

1. **`publishers.csv`와 `feed_specs.csv`는 동시에 업데이트** — 새 피드 추가 시 publisher도 추가해야 함. 이름 철자 일치 필수
2. **파일명이 `feed_specs`로 시작하는 모든 CSV가 자동 로드됨** — `feed_specs_archive.csv`만 예외
3. **`rss/` 디렉터리는 실행 결과물** — 직접 수정 금지, gitignore 됨
4. **파서는 throw하지 않는다** — `parseFuzzyDate`는 실패 시 현재 시각 반환. 날짜 파싱 의심 시 해당 피드의 원본 XML을 먼저 확인
5. **XML 인코딩** — `decodeXml`이 preamble에서 encoding 선언을 자동 탐지. EUC-KR 피드가 섞여 있으므로 임의로 UTF-8 가정 금지
6. **GitHub Actions는 cron 기반** — 로컬에서 수집한 `rss/` 커밋 금지 (gitignore로 방지됨)
7. **카테고리 `_all_`** — 카테고리별 XML에는 포함시키지 않고, `all.xml`에만 포함 (`groupByCategory` 참고)

## 코딩 스타일

루트 `CLAUDE.md` 및 `~/.ai/rules/coding-style.md`를 따른다. 핵심만:

- **불변성** — 객체 수정 금지, 새 객체 반환
- **작은 파일** — 200~400줄 선호
- **포괄적 에러 처리** — fail-soft 원칙 (한 피드 실패가 전체를 막으면 안 됨)
- **타입 힌트 필수** — 모든 export는 반환 타입 명시

## Git 워크플로우

- **계정**: `terajh <terajoohyun@ajou.ac.kr>` (회사 계정 `kakao-carter-p` 금지 — `.claude/rules/git-identity.md` 참고)
- **커밋 메시지**: `<타입>: <설명>` (feat/fix/refactor/docs/test/chore/perf/ci)
- **어트리뷰션**: `~/.claude/settings.json`에서 전역 비활성화됨

## 자주 하는 작업

### 새 피드 추가
1. `feeds/<group>/publishers.csv`에 `id,name,url` 한 줄 추가
2. `feeds/<group>/feed_specs.csv`에 `publisher,title,categories,url` 한 줄 추가 (publisher는 위 name과 일치)
3. 커밋만 해도 다음 cron에서 자동 수집 — classify는 언젠가 실행되면 자동 재배치됨

### 죽은 피드 정리
```bash
deno task classify:dev
deno task split dev
git diff feeds/dev/  # archive 오탐 여부 반드시 리뷰
```

### 새 그룹 추가
`feeds/<new-group>/`에 `publishers.csv` + `feed_specs.csv` 두 파일만 놓으면 코드 수정 없이 동작한다 (`discoverGroups`가 자동 탐지).

## 관련 문서

- [README.md](README.md) — 사람용 프로젝트 개괄
- [docs/FEED_MANAGEMENT.md](docs/FEED_MANAGEMENT.md) — 3단계 청크 관리 상세
- 상위 `~/Dev/claude/CLAUDE.md` — 워크스페이스 전반 가이드
- `.claude/rules/git-identity.md` — 이 저장소 git 계정 규칙
