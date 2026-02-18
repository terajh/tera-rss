# tera-rss

한국어/글로벌 RSS 피드를 그룹 단위로 수집해서, 통합 RSS XML(`all.xml`)과 발행사별/카테고리별 RSS XML을 생성하는 Deno 프로젝트입니다.

개인용 RSS 리더(예: 이노리더)에서 구독 소스를 한 번에 묶어 관리하기 쉽게 만드는 **개인용 RSS 병합 모듈**을 목표로 합니다.

## 핵심 동작

`tera-rss`는 2단계 파이프라인으로 동작합니다.

1. `collect`: `feeds/{group}/feed_specs.csv`에 정의된 피드를 수집해 `rss/{group}/jsons/*.json` 생성
2. `merge`: 수집된 JSON을 합쳐 `rss/{group}/all.xml`, `publishers/*.xml`, `categories/*.xml` 생성

인수 없이 실행하면 `feeds/` 하위의 모든 그룹을 자동 탐색해 처리합니다.
그룹명을 인수로 주면 해당 그룹만 처리합니다.

## 현재 그룹 현황 (2026-02-18 기준)

| 그룹 | 소스(publishers) | 피드(feed_specs) | 카테고리 수 |
|---|---:|---:|---:|
| `economy` | 15 | 104 | 13 |
| `dev` | 254 | 279 | 6 |
| `anime` | 8 | 12 | 5 |

카테고리는 각 그룹의 `feeds/{group}/feed_specs.csv`의 `categories` 컬럼(`|` 구분)에서 `_all_`을 제외한 값을 사용합니다.

### 그룹별 카테고리

- `economy`: `stock`, `economy`, `finance`, `realestate`, `industry`, `it`, `international`, `politics`, `society`, `culture`, `opinion`, `sports`, `entertainment`
- `dev`: `frontend`, `backend`, `devops`, `ai`, `trend`, `mobile`
- `anime`: `game`, `anime`, `review`, `entertainment`, `trend`

## 프로젝트 구조

```text
tera-rss/
├── feeds/
│   ├── economy/
│   │   ├── publishers.csv
│   │   └── feed_specs.csv
│   ├── dev/
│   │   ├── publishers.csv
│   │   └── feed_specs.csv
│   └── anime/
│       ├── publishers.csv
│       └── feed_specs.csv
├── src/
│   ├── parser.ts
│   ├── collect.ts
│   ├── merge.ts
│   └── tests/parser_test.ts
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
