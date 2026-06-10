# tera-rss

한국어/글로벌 RSS 피드를 그룹 단위로 수집해서, 통합 RSS XML(`all.xml`)과 발행사별/카테고리별 RSS XML을 생성하는 Deno 프로젝트입니다.

개인용 RSS 리더(예: 이노리더)에서 구독 소스를 한 번에 묶어 관리하기 쉽게 만드는 **개인용 RSS 병합 모듈**을 목표로 합니다.

## 핵심 동작

`tera-rss`는 2단계 파이프라인으로 동작합니다.

1. `collect`: `feeds/{group}/feed_specs.csv`에 정의된 피드를 수집해 `rss/{group}/jsons/*.json` 생성
2. `merge`: 수집된 JSON을 합쳐 `rss/{group}/all.xml`, `publishers/*.xml`, `categories/*.xml` 생성

인수 없이 실행하면 `feeds/` 하위의 모든 그룹을 자동 탐색해 처리합니다.
그룹명을 인수로 주면 해당 그룹만 처리합니다.

## 현재 그룹 현황 (2026-06-10 기준)

| 그룹 | 소스(publishers) | 피드 합계 | active | slow | archive |
|---|---:|---:|---:|---:|---:|
| `economy` | 15 | 104 | — | — | — |
| `dev` | 275 | 300 | 157 | 33 | 110 |
| `anime` | 8 | 12 | — | — | — |

> `dev` 그룹은 [활성도 기반 청크 분리](docs/FEED_MANAGEMENT.md)를 적용 중이다.
> `feed_specs.csv` = active, `feed_specs_slow.csv` = slow, `feed_specs_archive.csv` = 수집 제외.

카테고리는 각 그룹의 `feeds/{group}/feed_specs.csv`의 `categories` 컬럼(`|` 구분)에서 `_all_`을 제외한 값을 사용합니다.

### 그룹별 카테고리

- `economy`: `stock`, `economy`, `finance`, `realestate`, `industry`, `it`, `international`, `politics`, `society`, `culture`, `opinion`, `sports`, `entertainment`
- `dev`: `frontend`, `backend`, `devops`, `ai`, `trend`, `mobile`, `essentials`
- `anime`: `game`, `anime`, `review`, `entertainment`, `trend`

### `dev/essentials` — 큐레이션 카테고리

`frontend|backend|ai`는 양이 많고 노이즈도 섞여 있어, **실무에 바로 쓸만한 글이 자주 올라오는 35개 피드**만 골라 별도 태그(`essentials`)로 묶어둔 한 줄이다. 독립 카테고리가 아니라 기존 카테고리에 덧붙는 보조 태그이므로, 큐레이션을 바꾸고 싶으면 `feed_specs.csv`에서 `essentials`를 추가/제거하면 된다.

| 분류 | 개수 | 예시 |
|---|---:|---|
| 프레임워크·런타임 공식 | 10 | Next.js / Astro / Nuxt / Vite / Svelte / Angular / TypeScript / Deno / Web.dev / WebKit |
| 한국 대형 테크 | 7 | 네이버 D2 / 토스 / 카카오페이 / 우아한형제들 / 무신사 / 당근 / 뱅크샐러드 |
| 큐레이션 뉴스레터 | 5 | JS Weekly / Frontend Focus / This Week in React / CSS Weekly / Naver FE News |
| Backend·DevOps | 6 | NHN / Netflix / GitHub Eng / Node.js / 이동욱 / Cloudflare |
| AI | 6 | OpenAI / Google AI / Anthropic / Hugging Face / Simon Willison / Vercel |
| 시그널 개인 블로그 | 1 | Addy Osmani |

## 프로젝트 구조

```text
tera-rss/
├── feeds/
│   ├── economy/
│   │   ├── publishers.csv
│   │   └── feed_specs.csv
│   ├── dev/
│   │   ├── publishers.csv
│   │   ├── feed_specs.csv              # active (<90d)
│   │   ├── feed_specs_slow.csv         # slow (90~365d)
│   │   ├── feed_specs_archive.csv      # archive (수집 제외)
│   │   └── classification.json         # classifier 스냅샷
│   └── anime/
│       ├── publishers.csv
│       └── feed_specs.csv
├── src/
│   ├── parser.ts
│   ├── collect.ts
│   ├── classify.ts                     # 피드 활성도 분류
│   ├── split.ts                        # 분류 결과로 CSV 분할
│   ├── merge.ts
│   └── tests/parser_test.ts
├── docs/
│   └── FEED_MANAGEMENT.md              # 3단계 청크 관리 가이드
├── bins/
│   ├── collect.sh
│   └── merge.sh
├── rss/                           # 실행 결과물
├── deno.json
└── .github/workflows/update-feeds.yaml
```

## 설치 및 실행

요구사항: [Deno](https://deno.land/) v2.x

```bash
# 전체 그룹 collect + merge
deno task update

# 전체 그룹 collect
deno task collect

# 전체 그룹 merge
deno task merge

# 특정 그룹만 (인수 방식)
deno run --allow-net --allow-read --allow-write src/collect.ts anime
deno run --allow-read --allow-write src/merge.ts anime

# 등록된 그룹별 task
deno task collect:economy
deno task merge:economy
deno task collect:dev
deno task merge:dev

# 테스트
deno task test

# 피드 활성도 분류 (dev 그룹 예시) — 상세는 docs/FEED_MANAGEMENT.md
deno task classify:dev       # feed_specs.csv의 피드를 fetch해서 classification.json 생성
deno task split dev          # classification.json을 읽어 3단계 CSV로 재구성
```

## 출력 파일

실행 결과는 `rss/{group}` 아래에 생성됩니다.

```text
rss/
└── {group}/
    ├── all.xml
    ├── jsons/
    │   └── *.json
    ├── publishers/
    │   └── *.xml
    └── categories/
        └── *.xml
```

## GitHub Actions

`.github/workflows/update-feeds.yaml`에서 자동 실행을 설정합니다.

- 트리거: `main` 브랜치 push, `cron: 0 0 * * *`(매일 00:00 UTC), 수동 실행
- 동작: `deno task collect` -> `deno task merge` -> `./rss`를 GitHub Pages로 배포

배포 시 RSS URL 예시:

- `https://{username}.github.io/tera-rss/economy/all.xml`
- `https://{username}.github.io/tera-rss/dev/categories/frontend.xml`
- `https://{username}.github.io/tera-rss/dev/categories/essentials.xml`
- `https://{username}.github.io/tera-rss/anime/publishers/ign.xml`

## 새 그룹 추가

`feeds/{new-group}` 폴더에 아래 CSV 2개를 추가하면 코드 수정 없이 동작합니다.

1. `publishers.csv`

```csv
id,name,url
techcrunch,TechCrunch,https://techcrunch.com
```

2. `feed_specs.csv`

```csv
publisher,title,categories,url
TechCrunch,전체,_all_,https://techcrunch.com/feed/
TechCrunch,AI/스타트업,ai|startup,https://techcrunch.com/category/ai/feed/
```

필요하면 `deno.json`에 그룹 전용 task(`collect:{group}`, `merge:{group}`)를 추가할 수 있습니다.

## 라이선스

CC0-1.0
