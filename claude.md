You are an expert React + .NET Core full‑stack engineer. I want you to generate a **complete React application** (frontend only for now) that implements a registration/sign‑up flow exactly as defined in an attached PDF.

Context and constraints:
- We are building an **enterprise web application**.
- **Frontend:** React (TypeScript preferred, but JavaScript is acceptable if you think it’s cleaner).
- **Backend:** Will be ASP.NET Core with SQL Server, but for now we are **NOT** calling any APIs.
- **Assets:** We have an `/assets` folder that contains high‑definition logos and images. Assume:
  - `/assets/logo.png` for the main logo
  - `/assets/background.jpg` or similar for hero/background imagery
  - You can reference other images as needed from `/assets/...`.
- **Deployment target:** The React app will be **built and published to IIS**.
  - Please structure the project so that `npm run build` (or `yarn build`) produces a static bundle that can be hosted in IIS.
  - Assume we’ll serve it from the site root (e.g., `http://server/`), so avoid hard‑coded subpaths.

Functional requirements (for this version):
1. The app should implement the **full sign‑up flow** exactly as shown in the PDF:
   - Follow the **step‑by‑step screens**, layout, and clickable flow.
   - Every button, link, and navigation element in the PDF should be represented and functional on the client side.
   - Use React Router (or your recommended routing solution) if the flow spans multiple pages/screens.
2. **No real API calls yet**:
   - For now, all data handling should be **local state only** (React state, context, or a simple store).
   - Where an API call would normally happen (e.g., “Submit registration”, “Send OTP”, “Validate email”), implement:
     - A clearly marked placeholder function (e.g., `async registerUser(formData) { /* TODO: call API */ }`).
     - Mocked behavior (e.g., simulate success/failure with `setTimeout`) so the flow is fully clickable and testable.
   - Make it **easy to plug in real API calls later** by centralizing these placeholder functions in a separate module (e.g., `src/services/api.ts`).
3. **Exact flow fidelity**:
   - Respect the order of steps in the PDF (e.g., email entry → OTP verification → profile details → confirmation).
   - Implement validation rules that are visible or implied in the PDF (required fields, format hints, error messages).
   - If the PDF shows conditional flows (e.g., “If user selects business account, show extra fields”), implement those conditions.
4. **UI/UX details**:
   - Use a clean component structure: `components/`, `pages/`, `routes/`, `services/`, etc.
   - Use the logo and images from `/assets` in headers, sidebars, or hero sections as appropriate to match the PDF.
   - Implement reusable form components (e.g., `TextInput`, `Select`, `Checkbox`, `Stepper`) if the flow is multi‑step.
   - Make the layout responsive enough to work on common desktop resolutions; mobile responsiveness is a bonus but not mandatory unless clearly implied by the PDF.
5. **Technical structure**:
   - Provide:
     - `package.json` with all required dependencies.
     - `src/index.(tsx|jsx)` and `src/App.(tsx|jsx)` wired up properly.
     - A routing setup (if needed) that mirrors the PDF’s navigation.
     - A simple state management approach (React hooks or context) to carry registration data across steps.
   - Include comments where:
     - API integration will later be added.
     - Any assumptions about the PDF flow are made.
6. **IIS deployment readiness**:
   - Ensure the app uses **relative paths** that work when served from IIS.
   - If React Router is used, configure it so that refreshing a route will still work when hosted on IIS (e.g., using `BrowserRouter` with proper IIS rewrite rules—include a short note or `web.config` example for IIS to route all requests to `index.html`).
   - Provide any additional configuration files or notes needed for IIS hosting.

Deliverables:
- Full project structure with all source files (React components, routing, services, assets references).
- Complete code for:
  - The registration/sign‑up flow components.
  - Routing and navigation.
  - Placeholder API service module.
- A brief README section (can be in a comment or separate file) explaining:
  - How to install dependencies.
  - How to run the app in development.
  - How to build for production.
  - Any IIS‑specific notes (e.g., sample `web.config` for SPA routing).

Important:
- Assume the PDF is available and describe how you are mapping each screen/step from the PDF to React components and routes.
- If something in the PDF is ambiguous, make reasonable enterprise‑grade assumptions and document them in comments.
- The output should be **ready to copy into files** and run with minimal adjustments.

Now, based on all of the above, generate:
1. The full React project file tree.
2. The complete code for each file.
3. A short explanation of how the sign‑up flow works end‑to‑end and where to plug in real APIs later.


---

# Project status (updated 2026-10-19)

Everything above is the original brief. This section records what has been built so work can resume without re-deriving it. Keep it current when the project changes.

## State of the work

- The Fan sign-up flow from `VELVET FX - FAN - Sign up Process - with email and password - 10.1.26.pdf` (7 pages, phone mockup) is fully implemented, frontend only, with a mocked API.
- The Fan delete-account flow from `VELVET FX - FAN - Delete Account Process - 10.4.26.pdf` (7 pages; screens on p.3-6) was added on 2026-10-19: Settings, Account, Delete my account and the reason pop-up, landing on sign-in. Clicked through at phone and desktop sizes with no console errors.
- A full-width desktop layout (1024px and up) was added on 2026-10-12 at the user's request. The PDF has no desktop design, so that layout is our own.
- `npm run build` passes. The flow was clicked through in headless Chrome at phone and desktop sizes with no console errors.
- Hosted: the React build is on IIS at http://velvet.love (GitHub Actions `deploy.yml` -> Windows EC2). The ModelFeed API is an IIS application under the same site: https://velvet.love/api, Swagger at https://velvet.love/api/index.html.
- Backend integration (2026-10-19): sign-up, sign-in, Google, forgot/reset password and delete (deactivate) call the real API through `src/services/api.ts`. Verified against a stand-in of the endpoints (not the live API, at the user's request); not yet clicked through against the live API.
- Git: the desktop-layout changes are uncommitted on `main` (`src/styles/desktop.css` is new). Commit only when the user asks.
- The source PDFs and the asset pack folder (`velvet-fx-frontend-assets-V2`) are no longer in the repo folder; the assets the app uses are already copied to `public/assets/`.

## Environments, servers and where the secrets are

Secrets (passwords, keys) are never written here or anywhere in git: this file is committed to
GitHub. Each entry says where the secret lives instead.

| What | Value / location |
| --- | --- |
| Live site | https://velvet.love (React build on IIS, Windows EC2, us-west-2) |
| Frontend repo | `C:\ccp-web`, github.com/ooakp-tech/ccp-web, branch `main`. Push to `main` deploys (`.github/workflows/deploy.yml`: build, scp `dist/` to EC2, `iisreset`). |
| Frontend public config | `.env.production` (committed): `VITE_API_BASE_URL=/api/api`, `VITE_GOOGLE_CLIENT_ID`. Never set `VITE_*` under `env:` in the workflow (an empty Actions variable overrides the file). |
| API | https://velvet.love/api (IIS application under the same site); Swagger `https://velvet.love/api/index.html`; controllers under `api/...`, so calls go to `/api/api/<Controller>/...` |
| API repo | `C:\ccp-api-temp`, github.com/ooakp-tech/ccp-api-temp, branch `ba/init` (.NET 5, `ModelFeed.sln`). Published by the user from Visual Studio (folder profile) to the `/api` IIS app. `.github/workflows/staging.yml` is the old Azure pipeline, not used for velvet.love. |
| API server-only settings | `C:\ccp-api-temp\src\ModelFeed.Api\appsettings.Production.json` (git-ignored, included in publish; the server runs as Production). Holds `ConnectionStrings`, `EmailSettings`, `GoogleSettings`, `VelvetSettings` and overrides `appsettings.json`, whose committed values are old Azure/CharmluxVIP ones. |
| Database | Amazon RDS SQL Server `charmluxviptech-db-dev.c382aw2a2g13.us-west-2.rds.amazonaws.com`, port 1433, database `charmluxviptech`. Login: in `appsettings.Production.json` (from the user). Needs `Encrypt=True;TrustServerCertificate=True` (RDS CA is not trusted by Windows). The RDS security group allows the EC2 server (fixed 2026-10-19). Open from the user's PC too, so read-only checks can be run from here with `System.Data.SqlClient` in PowerShell. Never write to it without asking. |
| SMTP (e-mail) | Amazon SES Mail Manager SMTP ingress endpoint `rx8gpsihybkp.fips.qbns.mail-manager-smtp.amazonaws.com` (us-west-2, replaced the us-west-1 one on 2026-10-19), port 587, STARTTLS, AUTH LOGIN/PLAIN. Credentials: `C:\velvet project\smtp-credentials (1).csv` (columns: endpoint, port, username, username b64, password, password b64), copied into `EmailSettings` in `appsettings.Production.json`. Login to the new endpoint verified 2026-10-19 without sending. Delivery needs the Mail Manager rule set to relay to the internet and the sender to be allowed; `EmailFrom` is `no-reply@velvet.love` (not yet confirmed by the user). `EmailService` swallows send errors but logs them to the API's `log` folder. |
| Google sign-in | OAuth client ID `605212062971-5pm4pahema90v3if4buk76v006h77939.apps.googleusercontent.com` (public; in `.env.production`, `.env.local`, API `GoogleSettings`). The client secret was given in chat once and is deliberately stored nowhere; this flow does not need it. Google Cloud Console must list origin `https://velvet.love` and redirect URI `https://velvet.love/auth/callback/google` (plus `http://localhost:5173` ones for dev). |
| Design PDFs | `C:\velvet project\`: Fan sign-up (10.1.26), Fan delete account (10.4.26), Creator sign-up phase 1 (10.9.26), Fanvue fan sign-up (theme reference). |
| Browser checks | Throwaway Puppeteer scripts in the session scratchpad, using `puppeteer-core` from `C:\Users\BibhuRocks\AppData\Local\Temp\claude\C--ccp-web\5830f29b-d2ba-4579-b1ac-993ea276ac8f\scratchpad\pdftool\` and Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`. Serve `dist/` with `npx vite preview --port 4199` and answer `/api/api/*` with request interception, so no real accounts are created. |

## Stack and commands

Vite 6, React 18, TypeScript, react-router-dom 6, font bundled with `@fontsource-variable/inter` (no CDN). Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build -> dist/ (hashed files in dist/static)
npm run preview    # serve dist/ locally
```

There is no automated test suite in the repo. Earlier checks used throwaway Puppeteer scripts kept outside the project.

## Where things are

- Backend: ModelFeed ASP.NET Core API (.NET 5, EF Core, SQL Server on Amazon RDS), source at `C:/Users/BibhuRocks/Downloads/SOURCE CODE (1)/API/ModelFeed.Api-develop` (not a git repo; originals of the files changed on 2026-10-19 were backed up to the session scratchpad). Controllers are `api/[controller]` under the `/api` IIS app, so the frontend base URL is `/api/api` (`VITE_API_BASE_URL` in the committed `.env.production` / `.env.development`; dev proxies `/api` to https://velvet.love). A fan is a `Visitor`. Endpoints used: `POST /Visitor`, `POST /Auth/login`, `POST /Visitor/google` (added by us), `POST /Auth/forgetpassword`, `POST /Auth/changepassword`, `PATCH /Visitor/deactivate`. Responses are `{ success, data, errors }`, unwrapped by `src/services/http.ts`. Never write the RDS or other server credentials into either repo or these notes.
- API CHANGES WE MADE (NEED RE-PUBLISHING): `SENDWELCOMECHATMESSAGE` SKIPS FANS WITHOUT A CREATOR (IT CRASHED REGISTRATION); `VISITORSERVICE.GOOGLESIGNINASYNC` + `GOOGLESETTINGS:CLIENTID` + `GOOGLE.APIS.AUTH`; SWAGGER ENDPOINT MADE RELATIVE. THE SOURCE `APPSETTINGS.JSON` STILL POINTS AT THE OLD AZURE SQL SERVER; THE SERVER'S OWN APPSETTINGS (RDS) MUST BE KEPT WHEN PUBLISHING.
- `src/services/api.ts`: every placeholder API call (`registerUser`, `resendVerificationEmail`, `verifyHumanChallenge`, `verifyEmail`, `signIn`, `signInWithProvider`, `signOut`, `deleteAccount`, `requestPasswordReset`, `resetPassword`, `getVerificationMessage`). Each calls the API, or the mock when `USE_MOCK_API` (empty `VITE_API_BASE_URL`). E-mail verification, X sign-in, Stay Updated and the delete reason have no API support yet. `src/services/mockDb.ts` is the mock user table in `sessionStorage`.
- `src/context/SessionContext.tsx`: user, pending e-mail and marketing opt-in, mirrored to `sessionStorage` (`velvetfx.session`). No passwords are stored.
- `src/routes/paths.ts`: `PATHS` for the PDF screens and `PLACEHOLDER_ROUTES` for every link whose destination the PDF does not show. `src/routes/AppRoutes.tsx` holds the `/home` gate.
- `src/config.ts`: `DEMO_MODE` (turns the simulated inbox on or off), `MOCK_LATENCY_MS`, `asset()`.
- `src/styles/`: `tokens.css`, `base.css`, `components.css`, `screens.css` are the phone layout from the mockup; `desktop.css` holds all desktop overrides in one `@media (min-width: 1024px)` block, plus a 1280px block for the inline landing nav.
- `public/web.config`: IIS SPA rewrite (needs the URL Rewrite module), MIME types, cache headers. `public/assets/`: logos, icons and (unused) photos.
- `README.md`: install, run, build, IIS notes, screen mapping, desktop layout table, assumptions.

## Screens and routes

| PDF page | Screen | Route | Component |
| --- | --- | --- | --- |
| 3 left | Landing | `/` | `pages/LandingPage` |
| 3 right | Public menu overlay | `/` | `components/PublicMenu` |
| 4 left | Fan sign-up | `/signup` | `pages/SignUpPage` |
| 4 right | Check your email | `/home` while unverified | `pages/CheckEmailPage` |
| 5 | Verification e-mail | `/mock-inbox` (demo only) | `pages/MockInboxPage` |
| – | E-mail link target | `/verify-email?token=…` | `pages/VerifyEmailPage` |
| 6 left | Sign-in | `/signin` | `pages/SignInPage` |
| 6 centre | Home | `/home` when signed in | `pages/HomePage` |
| 6 right | Account drawer | `/home` | `components/AccountDrawer` |
| – | Forgot password (not in PDF) | `/forgot-password` | `pages/ForgotPasswordPage` |
| – | Reset password, e-mail link (not in PDF) | `/reset-password/:hash` | `pages/ResetPasswordPage` |

Delete Account PDF:

| PDF page | Screen | Route | Component |
| --- | --- | --- | --- |
| 4 right | Settings | `/settings` | `pages/SettingsPage` |
| 5 left | Account | `/settings/account` | `pages/AccountSettingsPage` |
| 5 centre | Delete my account | `/settings/account/delete` | `pages/DeleteAccountPage` |
| 5 right | Reason pop-up | same route | `components/DeleteReasonSheet` |
| 6 | Deleted, back on sign-in | `/signin` | `pages/SignInPage` |

Creator sign-up PDF (10.9.26, phase 1):

| PDF page | Screen | Route | Component |
| --- | --- | --- | --- |
| 4 | Creator sign-up | `/signup?type=creator` | `pages/SignUpPage` (role from `?type=`) |
| 5 left | Verify your email | `/home` while a creator is pending | `pages/CreatorVerifyEmailPage` |
| 5 right | E-mail link target | `/creator/verify?token=` | `pages/CreatorVerifyPage` |
| 6-7 | Onboarding carousel | `/myprofile` | `pages/CreatorOnboardingPage` |
| 8 centre | Creator home | `/home` when `user.role === 'creator'` | `pages/CreatorHomePage` |
| 8 right | Referrals step 1/9 | `/myprofile/referral` | `pages/CreatorReferralPage` |

Signed-in screens share `components/SignedInLayout` (tab bar + drawer); routes needing a user use `RequireUser` in `AppRoutes.tsx`.
`User.role` (`fan` | `creator`, from TokenResponse.userTypeId: 2 = Presenter) and `session.pendingRole` pick the fan or creator screens; `RequireCreator` guards the onboarding routes.

## Conventions to keep

- Phone layout must keep matching the PDF. Put desktop-only changes in `desktop.css`; elements that exist only on desktop are hidden by default at the end of `screens.css`.
- Visual theme (2026-10-19): Fanvue fan sign-up look (`C:/velvet project/Fanvue - Fan - Sign up Process - 9.15.26.pdf`) in VELVET FX purple. Every screen (landing and public menu included) uses the sign-up look: white page, purple glow behind the centred stacked logo, grey inputs, black primary pills, white outlined pills, purple CTAs. No photos on any page (removed 2026-10-19 at the user's request; Elite Creators cards are empty placeholder tiles; photo files and `components/Picture` are kept but unused). Use the tokens in `tokens.css` (`--brand`, `--ink`, `--field`, `--night`, ...) rather than raw colours. Button variants: `primary` (black), `brand` (purple), `outline` (white), `dark` (on black). On light backgrounds use `<BrandLogo onLight />` (the `-ink` SVGs).
- Sizes inside screens use container units (`cqw`/`cqh`) relative to `.app-shell`, always capped with `min()`/`clamp()`.
- Photos (if they return) go through `components/Picture` (AVIF with WebP fallback), logos through `components/BrandLogo`, icons through `components/Icon` (CSS mask).
- Mark anything not shown in the PDF with an `ASSUMPTION` comment and list it in the README.
- All backend calls go through `src/services/api.ts` (real endpoint + mock fallback); add new ones there, not in components.

## Decisions made without a design (open to change)

- Destinations not in the PDF (menu links, policies, Forgot password, Join as a Creator, tabs, drawer entries) open a generic `PlaceholderPage`.
- Validation: well-formed e-mail; new password needs 8+ characters with a letter and a number. Error messages are ours.
- "Send again" needs the human check first; "Change email" returns to sign-up with the address prefilled; the dialog's × returns to landing.
- Google/X sign-in (added 2026-10-13): real redirect flows in `src/services/oauth.ts` (Google OIDC id_token, X OAuth 2.0 + PKCE) back to `/auth/callback/:provider` (`pages/OAuthCallbackPage`), enabled by `VITE_GOOGLE_CLIENT_ID` / `VITE_X_CLIENT_ID` in `.env.local` (see `.env.example`). Without an ID the old simulation is used. A real Google client ID is set in `.env.local` (2026-10-19); Google answered `redirect_uri_mismatch` until the user registers `http://localhost:5173/auth/callback/google` (and the https IIS URL) in Google Cloud Console. The client secret was deliberately not put in the frontend; it belongs to the backend. Production is https://velvet.love (GitHub Actions `deploy.yml` -> IIS on EC2). The Google client ID (public) is committed in `.env.production`; `deploy.yml` must not set VITE_* under `env:`, because a missing Actions variable arrives as an empty string and overrides the .env file (that is why the live button once said Google was unavailable). X has no client ID yet; X needs the backend to exchange its code, so the mock signs X users in as a demo fan.
- The Cloudflare box is a stand-in for the real Turnstile widget.
- Display name and @handle are derived from the e-mail by the mock.
- Inter is the only font (headings and UI).
- Creator flow: no photos (placeholder tiles); carousel auto-advances every 5 s until the creator interacts; Referrals Proceed/Skip go to the `/myprofile/setup` placeholder (phase 2), the code is kept in sessionStorage (no API field); the signed-in fan's "Join as a Creator" stays a placeholder.
- Delete flow: rows crossed out in the PDF ("not set up yet") open the placeholder page; Log out works; NSFW/Dark mode toggles do nothing yet; the crossed-out tab bar is kept; Settings x -> home, < goes up one level; the reason is optional; sign-in shows "Your account has been deleted."
- Desktop: landing shows the menu links and a "Login" button inline from 1280px; landing, sign-up/sign-in and check-email are single centred columns on the white page; home's tab bar becomes a top bar; windows under 1024px keep the centred phone column.

## Possible next steps

- Review the desktop layout with the user and adjust.
- Test the build on a real IIS site with the URL Rewrite module.
- Replace placeholder pages as their designs arrive (Creator onboarding phase 2: steps 2-9 after Referrals).
- Re-publish the API with the 2026-10-19 changes, then remove the register-then-login fallback in `registerUser`.
- Add API support for e-mail verification, X sign-in, Stay Updated and the delete reason.
- Add an in-repo end-to-end test if the user wants one.
