# 피드 관리 가이드

tera-rss의 피드 개수가 늘어나면서 **죽은 링크·휴면 블로그**가 섞이기 쉬워졌다.
이 문서는 그 문제를 데이터로 풀기 위해 도입한 **3단계 활성도 청크**와
이를 관리하는 스크립트·워크플로우를 설명한다.

## 파일 구조

각 그룹 디렉터리(`feeds/dev/`, `feeds/economy/`, `feeds/anime/`)는 아래 파일을 가진다.

| 파일 | 역할 | 수집 여부 |
|---|---|---|
| `publishers.csv` | 퍼블리셔 메타 (id/name/url) — 모든 피드의 참조 테이블 | — |
| `feed_specs.csv` | **active**: 최근 90일 내 게시된 피드 | ✅ 매 실행 |
| `feed_specs_slow.csv` | **slow**: 90일~365일 휴면 피드 | ✅ 매 실행 |
| `feed_specs_archive.csv` | **archive**: 365일+ 휴면 또는 응답 실패 피드 | ❌ 수집 제외 |
| `classification.json` | 분류기가 남긴 마지막 스냅샷 (감사용, gitignore 후보) | — |

`collect.ts`는 `feeds/<group>/` 안에서 `feed_specs*.csv` 파일을 **자동으로 모두 로드**한다.
단 `feed_specs_archive.csv`만 예외로 건너뛴다 (`loadAllFeedSpecs` 참고).

## 분류 기준

`src/classify.ts`가 각 피드의 RSS를 fetch해서 **가장 최신 게시 날짜**를 뽑고
아래 기준으로 분류한다.

| 상태 | 조건 |
|---|---|
| `active` | 최근 90일 내 게시 |
| `slow` | 90일~365일 사이 게시 |
| `archive` | 365일 초과, 또는 fetch 실패(HTTP 에러·타임아웃·파싱 실패) |

임계값은 `src/classify.ts` 상단의 `ACTIVE_DAYS` / `ARCHIVE_DAYS` 상수로 조정한다.

## 워크플로우

### 1) 피드 재분류

```bash
deno task classify:dev     # dev 그룹만
deno task classify economy # 임의 그룹
```

- 10개 동시 요청, 10초 타임아웃
- 결과는 `feeds/<group>/classification.json`에 저장
- 콘솔에 피드별 상태와 `N일 전 게시`가 출력됨

### 2) CSV 청크로 분할

```bash
deno task split dev
```

- `classification.json`을 읽어 `feed_specs.csv`를 3개 파일로 재구성
- 분류에 매치되지 않은 행(신규 피드 등)은 안전하게 `feed_specs.csv` (active)에 유지
- **결과를 git diff로 반드시 리뷰** — 일시적 네트워크 오류로 archive로 밀려난 피드가 없는지 확인

### 3) 수집

```bash
deno task collect:dev   # active + slow 수집
deno task merge:dev
```

archive는 수집 대상이 아니다. 부활시키려면 archive CSV에서 해당 행을 잘라
`feed_specs.csv`로 옮기면 된다.

## 피드 부활 (Resurrection)

archive에 들어갔지만 블로그가 다시 살아나는 경우가 있다.
월 1회 정도 아래 루틴을 권장한다.

1. `deno task classify:dev` 재실행 — **이때 archive도 포함해서 fetch하도록
   임시로 `feed_specs_archive.csv` → `feed_specs_resurrect.csv`로 리네임**
   (파일명이 `feed_specs`로 시작하면 자동 로드됨)
2. `deno task split dev` 실행 — 되살아난 피드가 active/slow로 자동 분배됨
3. 남은 행을 다시 `feed_specs_archive.csv`로 되돌리기

향후 `classify.ts --include-archive` 플래그를 추가하면 이 과정이 한 명령으로 줄어든다.

## 신규 피드 추가 절차

1. `publishers.csv`에 `id,name,url` 추가
2. `feed_specs.csv`에 `publisher,title,categories,url` 추가 (publisher는 publishers.csv의 `name`과 정확히 일치)
3. 다음 `classify` 실행 시 실제 활동성에 따라 자동 재배치됨

## 자동화 제안 (미구현)

- **월 1회 GitHub Actions cron**: `classify` → `split` → PR 자동 생성
- **PR 상세**: active↔slow↔archive로 이동한 피드 목록을 diff로 표시
- **GitHub Issue 라벨**: 신규 archive 편입은 별도 이슈로 올려 사람 눈 리뷰

## 설계 원칙

1. **사람이 tier를 분류하지 않는다** — 게시 날짜가 말해주게 한다
2. **publishers.csv는 단일 출처** — 청크가 나뉘어도 퍼블리셔 메타는 한 곳
3. **archive는 삭제가 아니라 격리** — 피드 부활을 항상 허용
4. **분할은 되돌릴 수 있다** — 3개 파일을 다시 cat하면 원본과 동일
