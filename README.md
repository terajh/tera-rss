# tera-rss

한국 뉴스 RSS 피드 수집기. 그룹별로 RSS 피드를 수집하고, 신문사별/카테고리별로 통합된 RSS XML을 생성합니다.

[akngs/knews-rss](https://github.com/akngs/knews-rss) 프로젝트의 구조를 참고하여 제작되었습니다.

## 피드 그룹

`feeds/` 디렉토리 아래에 그룹별로 구성됩니다. 새 그룹을 추가하려면 폴더를 만들고 CSV 파일 2개만 넣으면 됩니다.

| 그룹 | 설명 | 소스 수 | 피드 수 |
|------|------|---------|---------|
| `economy` | 경제신문사 + 해외 주요 매체 | 15 | 104 |
| `dev` | 개발/테크 블로그 + FE 생태계 | 254 | 276 |

### economy 그룹

| ID | 신문사 | 피드 수 | 홈페이지 |
|----|--------|---------|----------|
| `hankyung` | 한국경제 | 12 | https://www.hankyung.com |
| `mk` | 매일경제 | 10 | https://www.mk.co.kr |
| `sedaily` | 서울경제 | 12 | https://www.sedaily.com |
| `asiae` | 아시아경제 | 10 | https://www.asiae.co.kr |
| `edaily` | 이데일리 | 10 | https://www.edaily.co.kr |
| `mt` | 머니투데이 | 1 | https://www.mt.co.kr |
| `fnnews` | 파이낸셜뉴스 | 16 | https://www.fnnews.com |
| `herald` | 헤럴드경제 | 13 | https://biz.heraldcorp.com |
| `ajunews` | 아주경제 | 9 | https://www.ajunews.com |
| `bbc` | BBC News | 2 | https://www.bbc.com |
| `cnn` | CNN | 2 | https://www.cnn.com |
| `reuters` | Reuters | 2 | https://www.reuters.com |
| `nyt` | NYT | 2 | https://www.nytimes.com |
| `wsj` | WSJ | 2 | https://www.wsj.com |
| `aljazeera` | Al Jazeera | 1 | https://www.aljazeera.com |

### economy 카테고리

| 카테고리 | 설명 |
|----------|------|
| `stock` | 증권/주식 |
| `economy` | 경제/정책 |
| `finance` | 금융/채권/외환 |
| `realestate` | 부동산 |
| `industry` | 산업/기업 |
| `it` | IT/과학/AI |
| `international` | 국제 |
| `politics` | 정치 |
| `society` | 사회 |
| `culture` | 문화/생활 |
| `opinion` | 오피니언/칼럼 |
| `sports` | 스포츠 |
| `entertainment` | 연예 |

### dev 그룹

254개 소스에서 276개 피드를 수집합니다. 국내 테크 블로그부터 글로벌 FE 생태계까지 포괄합니다.

#### 국내 테크 블로그 (15개)

| ID | 소스 | 포커스 |
|----|------|--------|
| `geeknews` | GeekNews 개발뉴스 | 국내 개발 트렌드 |
| `nhn` | NHN Toast 기술블로그 | 클라우드/웹 개발 |
| `woowahan` | 우아한형제들 테크 | 백엔드/DevOps |
| `kurly` | 컬리 기술블로그 | 마이크로서비스 |
| `naver-d2` | 네이버 D2 | AI/웹 표준 |
| `coupang` | 쿠팡 테크블로그 | 스케일링 |
| `daangn` | 당근마켓 테크 | React Native |
| `awesome-blogs` | Awesome Blogs | 250+ 개발자 블로그 모음 |
| `musinsa` | 무신사 테크블로그 | e커머스 개발 |
| `banksalad` | 뱅크샐러드 테크 | 핀테크 |
| `line-tech` | LINE Tech Blog | 모바일/백엔드 |
| `samsung-dev` | Samsung Developers | 안드로이드/모바일 |
| `velog` | Velog | 개발자 블로그 플랫폼 |
| `javacan` | Java Can (최범균) | Java/백엔드 |
| `jojoldu` | 기억보단 기록을 (이동욱) | 백엔드/인프라 |

#### 해외 개발 미디어 & 뉴스레터 (15개)

| ID | 소스 | 포커스 |
|----|------|--------|
| `js-weekly` | JavaScript Weekly | JS/프론트엔드 |
| `frontend-focus` | Frontend Focus | 웹 개발 뉴스 |
| `css-tricks` | CSS-Tricks | CSS/디자인 |
| `smashing` | Smashing Magazine | UX/웹 개발 |
| `hackernews` | Hacker News | 스타트업/테크 |
| `devto` | Dev.to | React/Next.js |
| `logrocket` | LogRocket Blog | 디버깅/퍼포먼스 |
| `webdev` | Web.dev (Google) | 웹 표준 |
| `github` | GitHub Blog | GitHub 업데이트/엔지니어링 |
| `cloudflare` | Cloudflare Blog | DevOps/CDN |
| `netflix` | Netflix Tech Blog | 스케일링 |
| `infoq` | InfoQ | DevOps/JavaScript/엔터프라이즈 |
| `hackernoon` | Hacker Noon | 스타트업/테크 (태그별 6개 피드 포함) |
| `stackoverflow` | Stack Overflow Blog | 개발 커뮤니티 |
| `google-dev` | Google Developers Blog | 웹/AI 표준 |

#### Multi-Author 블로그 (31개)

| ID | 소스 | 포커스 |
|----|------|--------|
| `codrops` | Codrops | 크리에이티브 프론트엔드 |
| `sitepoint` | SitePoint | 웹 개발 튜토리얼 |
| `tutsplus` | Tuts+ Code | 코딩 튜토리얼 |
| `alistapart` | A List Apart | 웹 표준/디자인 |
| `frontend-masters` | Frontend Masters | FE 교육 |
| `nngroup` | Nielsen Norman Group | UX 리서치 |
| `dzone` | DZone Web Dev | 웹 개발 |
| `bitsrc` | Bits and Pieces | 컴포넌트 개발 |
| `deque` | Deque Accessibility | 접근성 |
| `perfplanet` | Web Performance Calendar | 웹 퍼포먼스 |
| `levelup` | Level Up Coding | 코딩 튜토리얼 |
| | 외 20개 | 1stwebdesigner, 24 Accessibility, 24 ways, 30 seconds of code, CodeinWP, CodyHouse, Design Modo, Full Stack Training, Go Make Things, GOV.UK Blogs, Kirupa, Love2Dev, TPGI, SitePen, Telerik, Treehouse, Twilio JavaScript, Vue School, Webdesigner Depot, WebGL Fundamentals |

#### Top 프론트엔드 블로거 (31명)

Dan Abramov, Kent C. Dodds, Addy Osmani, Jake Archibald, Lea Verou, Sara Soueidan, Josh W. Comeau, Robin Wieruch, Tania Rascia, Zach Leatherman, Brad Frost, Una Kravets, Nicholas C. Zakas, David Walsh, Eric Meyer, Jeremy Keith, Rachel Andrew, Remy Sharp, Philip Walton, Tim Kadlec, Harry Roberts, Axel Rauschmayer, Ethan Marcotte, Mark Otto, Mathias Bynens, Tab Atkins, Stoyan Stefanov, Peter-Paul Koch, Jonathan Snook, Christian Heilmann, Dave Rupert 외

#### 프론트엔드 블로거 (93명)

Ahmed Shadeed, Andy Bell, Robin Wieruch, Tania Rascia, Josh W. Comeau, Dmitri Pavlutin, Flavio Copes, Stefan Judis, Stephanie Eckles, Mark Erikson, Sindre Sorhus, Sean Wang (swyx), Max Stoiber, Adrian Roselli, Michelle Barker, Hidde de Vries, Scott O'Hara, Manuel Matuzovic, Bruce Lawson 외 74명

> 전체 블로거 목록은 `feeds/dev/publishers.csv` 참조

#### 브라우저 & 엔진 (23개)

| ID | 소스 | 포커스 |
|----|------|--------|
| `chrome-dev` | Chrome Developers | Chrome DevRel |
| `chromium` | Chromium Blog | Chromium 엔진 |
| `chrome-blog` | Chrome Blog | Chrome 소식 |
| `mozilla-hacks` | Mozilla Hacks | 웹 실험 |
| `mozilla` | Mozilla Blog | Mozilla 소식 |
| `mozilla-a11y` | Mozilla Accessibility | 접근성 |
| `v8` | V8 Blog | V8 엔진 |
| `webkit` | WebKit Blog | WebKit/Safari |
| `msedge` | MS Edge Blog | Edge 브라우저 |
| `w3c` | W3C | 웹 표준 (Blog, News, WAI) |
| `vscode` | Visual Studio Code | VS Code |
| | 외 12개 | AdBlock Plus, AMP, Brave, DuckDuckGo, Freedom Scientific, Google Web Fundamentals, Google Webmaster, Opera, WebAIM, WHATWG 등 |

#### 프레임워크 & 라이브러리 (12개)

| ID | 소스 | 포커스 |
|----|------|--------|
| `react` | React Blog | React |
| `angular` | Angular Blog | Angular |
| `vue` | Vue Blog | Vue.js |
| `vue-news` | Vue News | Vue.js 뉴스 |
| `svelte` | Svelte Blog | Svelte |
| `nodejs` | Node.js Blog | Node.js |
| `babel` | Babel.js Blog | Babel 트랜스파일러 |
| `bootstrap` | Bootstrap Blog | Bootstrap |
| `gsap` | GSAP Blog | 애니메이션 |
| `sass` | Sass Blog | Sass |
| `inclusive-components` | Inclusive Components | 접근성 컴포넌트 |
| `naver-fe` | Naver FE News | FE 큐레이션 |

#### 기업 엔지니어링 블로그 (20개)

| ID | 소스 | 포커스 |
|----|------|--------|
| `facebook-eng` | Facebook Engineering | Meta 엔지니어링 |
| `shopify-eng` | Shopify Engineering | Shopify 개발 |
| `codeascraft` | Code as Craft (Etsy) | Etsy 엔지니어링 |
| `instagram-eng` | Instagram Engineering | Instagram 개발 |
| `twitter-eng` | Twitter Engineering | Twitter 개발 |
| `auth0` | Auth0 Blog | 인증/보안 |
| `amex-tech` | AMEX Technology | 핀테크 개발 |
| `codepen` | CodePen Blog | 코드 플레이그라운드 |
| `heroku` | Heroku Blog | PaaS/배포 |
| `thoughtbot` | thoughtbot | Ruby/Rails/디자인 |
| | 외 10개 | Axess Lab, Bocoup, Calibre, Cloud Four, DebugBear, Flywheel, MachMetrics, ShimmerCat, SpeedCurve, Volument |

#### 뉴스 & 커뮤니티 (9개)

| ID | 소스 | 포커스 |
|----|------|--------|
| `codrops-collective` | Codrops Collective | FE 큐레이션 |
| `echojs` | Echo JS | JS 뉴스 |
| `frontend-dogma` | Frontend Dogma | FE 뉴스 |
| `heydesigner` | Hey designer! | 디자이너 뉴스 |
| `unicornclub` | Unicorn Club | 데일리 링크 |
| `webplatformnews` | Web Platform News | 웹 플랫폼 뉴스 |
| `wdrl` | WDRL | 웹 개발 뉴스레터 |
| `reddit-dev` | Reddit Dev | /r/css, /r/javascript, /r/reactjs, /r/vuejs |
| `so-tags` | Stack Overflow Tags | CSS, JavaScript, React, Vue |

### dev 카테고리

| 카테고리 | 설명 |
|----------|------|
| `frontend` | 프론트엔드 (JS, CSS, React, UX, 접근성) |
| `backend` | 백엔드 (서버, DB, 마이크로서비스, Node.js) |
| `devops` | DevOps (CI/CD, 인프라, CDN) |
| `ai` | AI/ML |
| `trend` | 개발 트렌드/뉴스 |
| `mobile` | 모바일 (React Native, Android) |

## 프로젝트 구조

```
tera-rss/
├── feeds/                       # 그룹별 피드 설정
│   ├── economy/                 # 경제 그룹
│   │   ├── publishers.csv
│   │   └── feed_specs.csv
│   └── dev/                     # 개발 그룹
│       ├── publishers.csv
│       └── feed_specs.csv
├── src/
│   ├── deps.ts                  # 외부 의존성
│   ├── dev_deps.ts              # 테스트 의존성
│   ├── parser.ts                # 핵심 로직 (CSV 파싱, 피드 수집, XML 생성)
│   ├── collect.ts               # 1단계: RSS 수집 → JSON
│   ├── merge.ts                 # 2단계: JSON 병합 → RSS XML
│   └── tests/
│       └── parser_test.ts       # 유닛 테스트
├── bins/
│   ├── collect.sh               # 수집 셸 스크립트
│   └── merge.sh                 # 병합 셸 스크립트
├── .github/workflows/
│   └── update-feeds.yaml        # GitHub Actions (매일 자동 수집 + 배포)
├── deno.json                    # Deno 태스크 설정
└── .gitignore
```

## 동작 방식

2단계 파이프라인으로 동작합니다. 인수 없이 실행하면 모든 그룹을 처리하고, 그룹명을 지정하면 해당 그룹만 처리합니다.

### 1단계: 수집 (Collect)

```
feeds/{group}/feed_specs.csv → 각 RSS URL fetch → 파싱 → rss/{group}/jsons/*.json
```

- `feed_specs.csv`에 정의된 피드를 순차적으로 가져옵니다.
- 레이트 리밋을 위해 요청 사이에 1~5초 딜레이를 줍니다.
- XML 인코딩을 자동 감지합니다 (EUC-KR, UTF-8 등).
- 결과를 `rss/{group}/jsons/` 디렉토리에 JSON 파일로 저장합니다.

### 2단계: 병합 (Merge)

```
rss/{group}/jsons/*.json → 그룹핑 → RSS XML 생성
```

- 수집된 JSON을 읽어 3가지 형태의 RSS XML을 생성합니다:
  - `rss/{group}/all.xml` - 그룹 전체 피드 통합
  - `rss/{group}/publishers/{id}.xml` - 신문사별
  - `rss/{group}/categories/{category}.xml` - 카테고리별

## 사용법

### 요구사항

- [Deno](https://deno.land/) v2.x

### 설치 및 실행

```bash
# Deno 설치 (미설치 시)
curl -fsSL https://deno.land/install.sh | sh

# 전체 그룹 수집 + 병합
deno task update

# 전체 그룹 수집
deno task collect

# 전체 그룹 병합
deno task merge

# 특정 그룹만 수집/병합
deno task collect:economy
deno task merge:economy

# dev 그룹만
deno task collect:dev
deno task merge:dev

# 테스트
deno task test
```

### 출력 파일

실행 후 `rss/` 디렉토리에 그룹별로 결과가 생성됩니다.

```
rss/
├── economy/                          # 경제 그룹
│   ├── all.xml
│   ├── publishers/
│   │   ├── hankyung.xml
│   │   └── ...
│   └── categories/
│       ├── stock.xml
│       └── ...
└── dev/                              # 개발 그룹
    ├── all.xml
    ├── publishers/
    │   ├── geeknews.xml
    │   └── ...
    └── categories/
        ├── frontend.xml
        ├── backend.xml
        └── ...
```

## GitHub Actions 자동 배포

GitHub에 push하면 Actions workflow가 설정됩니다.

- **트리거**: `main` 브랜치 push, 매일 00:00 UTC, 수동 실행
- **동작**: 전체 그룹 피드 수집 → 병합 → `gh-pages` 브랜치에 배포
- **결과**: GitHub Pages에서 RSS XML에 접근 가능

```
# 경제
https://{username}.github.io/tera-rss/economy/all.xml
https://{username}.github.io/tera-rss/economy/publishers/hankyung.xml
https://{username}.github.io/tera-rss/economy/categories/stock.xml

# 개발
https://{username}.github.io/tera-rss/dev/all.xml
https://{username}.github.io/tera-rss/dev/publishers/geeknews.xml
https://{username}.github.io/tera-rss/dev/categories/frontend.xml
```

## 새 그룹 추가

코드 수정 없이 `feeds/` 아래에 폴더와 CSV 파일만 추가하면 됩니다.

### 1. 그룹 폴더 생성

```bash
mkdir feeds/dev        # 개발 뉴스 그룹 예시
mkdir feeds/enter      # 연예 뉴스 그룹 예시
```

### 2. publishers.csv 작성

```csv
id,name,url
techcrunch,TechCrunch,https://techcrunch.com
```

### 3. feed_specs.csv 작성

```csv
publisher,title,categories,url
TechCrunch,전체,_all_,https://techcrunch.com/feed/
```

여러 카테고리에 속하는 피드는 `|`로 구분합니다:

```csv
TechCrunch,AI/스타트업,ai|startup,https://techcrunch.com/category/ai/feed/
```

### 4. deno.json에 태스크 추가 (선택)

```json
{
  "tasks": {
    "collect:dev": "deno run --allow-net --allow-read --allow-write src/collect.ts dev",
    "merge:dev": "deno run --allow-read --allow-write src/merge.ts dev"
  }
}
```

`deno task collect` / `deno task merge`는 인수 없이 실행하면 모든 그룹을 자동 탐색하므로, 그룹별 태스크는 선택사항입니다.

## 라이선스

CC0-1.0
