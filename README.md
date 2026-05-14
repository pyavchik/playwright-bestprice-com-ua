# Playwright E2E Framework — bestprice.com.ua

End-to-end test automation for [bestprice.com.ua](https://bestprice.com.ua) built with **Playwright + TypeScript** following the Page Object Model and modern automation best practices.

---

## Tech stack

- **Playwright Test** (Chromium / Firefox / WebKit + mobile emulation)
- **TypeScript** (strict mode)
- **Page Object Model** with shared `fixtures`
- **dotenv** for environment configuration
- **ESLint + Prettier** for code quality and formatting
- **Allure Report** (with epics, severities, descriptions, steps, screenshots, videos, traces)
- **Playwright HTML reporter** + JUnit output for CI
- **GitHub Actions** workflow ready out of the box

---

## Project structure

```
.
├── pages/                 # Page Objects (HomePage, CartPage, …)
├── fixtures/              # Playwright fixtures that wire Page Objects to tests
├── tests/                 # Test specs grouped by feature
├── test-data/             # Factories and static datasets (users, search terms)
├── utils/                 # Cross-cutting helpers (env, console logger, cookies)
├── .github/workflows/     # CI definitions
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install browsers (Chromium / Firefox / WebKit)
npm run install:browsers

# 3. Copy environment template and edit if needed
cp .env.example .env
```

`.env` variables:

| Variable        | Default                    | Description                                                                |
| --------------- | -------------------------- | -------------------------------------------------------------------------- |
| `BASE_URL`      | `https://bestprice.com.ua` | Base URL under test.                                                       |
| `TEST_MODE`     | `false`                    | When `true`, tests may submit real forms. Keep `false` against production. |
| `CI`            | unset                      | Set automatically in CI. Enables retries and the CI reporter settings.     |
| `USER_EMAIL`    |                            | Optional account for authenticated flows.                                  |
| `USER_PASSWORD` |                            | Optional account password.                                                 |

---

## Run tests

**Default — run the suite and open the Allure report with screenshots:**

```bash
npm run test:screenshots && npm run allure:open
```

That captures a screenshot for every test (passing or failing), generates the
Allure HTML report, and opens it in your default browser. Use this whenever you
want a shareable, human-readable run — for QA reviews, demos, or PR evidence.

Other run modes:

```bash
# Plain run (no per-test screenshots; default Playwright behavior)
npm test

# Headed
npm run test:headed

# Interactive UI mode
npm run test:ui

# Per-project
npm run test:chromium
npm run test:firefox
npm run test:webkit

# By tag
npm run test:smoke         # @smoke
npm run test:regression    # @regression
npm run test:mobile        # @mobile only (Pixel 7 / iPhone 14)

# Open the last Playwright HTML report (separate from Allure)
npm run report
```

## Allure report

Allure produces a richer, human-readable report with epics, suites, severities,
descriptions, collapsible test steps, screenshots, videos, and Playwright traces.

**The default workflow already covers this:**

```bash
npm run test:screenshots && npm run allure:open
```

`allure:open` regenerates the HTML report from `allure-results/` and opens it
in your default browser. Use `allure:serve` instead if you prefer the live
server flow (boots a temporary HTTP server and opens the report):

```bash
npm run test:screenshots && npm run allure:serve
```

Step-by-step equivalents:

```bash
# 1. Run the tests (allure-results/ is populated automatically)
npm run test:screenshots    # or `npm test` if you don't need pass-screenshots

# 2. Generate the static HTML report (requires Java; preinstalled on most dev machines)
npm run allure:generate    # → ./allure-report/index.html

# 3. Open it locally
npm run allure:open        # also runs allure:generate first

# Wipe inputs and previous report
npm run allure:clean
```

### Capture controls

The `test:screenshots` script wraps `REPORT_SCREENSHOTS=true playwright test`.
Three env vars opt in to richer artifacts (combinable, all default to `false`):

```bash
REPORT_SCREENSHOTS=true npm test    # screenshots on every test
REPORT_VIDEO=true npm test          # full video of every test
REPORT_TRACE=true npm test          # Playwright trace on every test
```

When all three flags are off, Playwright still captures screenshots / videos /
traces **on failure** — so failing runs always carry full diagnostic artifacts,
and you only opt into pass-time captures when you want them in the report.

**What's in the report:**

- **Behaviors** view: tests grouped by Epic → Feature → Story (e.g. _Cart → Cart management → Add product to cart_).
- **Suites** view: tests grouped by project / spec file / describe block.
- **Severities** (`blocker`, `critical`, `normal`, `minor`, `trivial`) drive the priority dashboard.
- **Descriptions**: every test has a plain-language paragraph explaining what it verifies and why.
- **Steps**: each `await step('...')` call becomes a collapsible row, so you can see exactly which action failed.
- **Attachments on failure**: screenshot, video, Playwright trace and the `error-context.md` (page snapshot) are attached automatically.
- **Categories** (in `allure/categories.json`): failures are grouped as _Product defects_, _Locator timeouts_, _Navigation issues_, _Test infrastructure_, or _Flaky on retry_.
- **Environment** widget: base URL, platform, Node version and CI flag.
- **Executor** info: build/run number and a deep link back to the GitHub Actions run when running in CI.

In CI, the dedicated `allure-report` job merges `allure-results-*` artifacts
from every browser into a single report and publishes it as the `allure-report`
workflow artifact — open the workflow run in GitHub Actions, download
`allure-report.zip`, and open `index.html` from the unzipped folder.

### Tags

Tests are tagged so CI and local runs can scope easily:

- `@smoke` — minimum-viable health checks for the home page
- `@regression` — broader coverage (search, catalog, product, cart, checkout, login, footer)
- `@mobile` — runs only on mobile projects
- `@search`, `@cart`, `@product`, `@catalog`, `@checkout`, `@login`, `@footer` — feature-scoped filters

Example: `npx playwright test --grep "@smoke|@cart"`

---

## Code quality

```bash
npm run lint          # ESLint
npm run lint:fix      # Auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check (used by CI)
npm run typecheck     # tsc --noEmit
```

---

## CI

`.github/workflows/playwright.yml` runs the suite on every push and pull request against `main`/`master` across the three desktop browsers in a matrix. Artifacts (HTML report, traces, screenshots, videos) are uploaded for every run; raw test results are uploaded on failure.

To override the base URL in CI without code changes, set a repository variable `BASE_URL`.

---

## Conventions

- **Stable locators only** — role, accessible name, label, placeholder, semantic landmarks. CSS/XPath is used only as a fallback `.or()` chain.
- **No hard waits** — `waitForTimeout` is forbidden by ESLint (`playwright/no-wait-for-timeout`). Use `expect.poll`, `toBeVisible`, or web-first assertions instead.
- **Page Objects** never contain test assertions. They expose locators and actions; tests own expectations.
- **Failure artifacts** — screenshots, videos and traces are automatically retained on failure (`playwright.config.ts`).
- **Retries** — only enabled in CI (2 retries) to keep local feedback tight.
- **Safety** — checkout and any submission flows refuse to submit unless `TEST_MODE=true`, so the suite is safe to run against production.

---

## Known limitations

The framework was scaffolded without a fixed snapshot of the live DOM. The following areas commonly have weak or shifting selectors on Ukrainian e-commerce sites and may require minor locator tuning the first time you run against production:

- **Cookie / GDPR banner** — `utils/cookie-helper.ts` covers common patterns (`accept`, `прийняти`, `погоджуюсь`). If the live banner uses a vendor-specific overlay (Cookiebot, OneTrust), extend the helper.
- **Cart counter badge** — uses heuristic CSS class matching (`count`, `badge`, `qty`). If the live DOM uses a different class or a `data-*` attribute, update `HeaderComponent.getCartCount()`.
- **Quantity controls in cart** — increase/decrease buttons frequently lack accessible names. The current fallback matches `+` / `−` / `больше` / `менше`; replace with `data-testid` selectors once added.
- **Breadcrumbs** — optional in the UI; tests skip when not present.
- **Register flow** — many Ukrainian retailers use a unified `login`/`register` modal. The register-page test will `test.skip` if no standalone link is found.
- **Checkout** — production-safety guards prevent the suite from completing an order. When you have a true staging environment, set `TEST_MODE=true` to exercise the final submit.
- **Search URL** — assumed to be `/search?search=…`. Adjust `SearchPage.gotoQuery` if the production query parameter differs.

When you discover a stable `data-testid` or `aria-*` attribute on the live site, prefer migrating the relevant page-object locator to it — they are far more durable than text or class-based matches.

---

## Troubleshooting

- **All tests failing with "page closed"** — most likely a network/CDN block at the firewall. Verify you can `curl -I https://bestprice.com.ua` from the runner.
- **Locator timeouts on a single page** — run with `--debug` to inspect the page in Playwright Inspector and copy a more stable locator into the corresponding page object.
- **Console-error test fails** — extend `NON_CRITICAL_PATTERNS` in `utils/console-logger.ts` to filter out new third-party noise (analytics, marketing pixels) rather than weakening the assertion.
