# VELVET FX – Fan sign-up and delete-account flows (React frontend)

React + TypeScript implementation of the mobile mockups
`VELVET FX - FAN - Sign up Process - with email and password - 10.1.26.pdf` and
`VELVET FX - FAN - Delete Account Process - 10.4.26.pdf`.
Frontend only: every backend call is a mocked placeholder in `src/services/api.ts`.
`npm run build` produces a static bundle (`dist/`) that is published to IIS as-is.

## Run it

Requires Node.js 20+.

```bash
npm install        # install dependencies
npm run dev        # development server with hot reload (http://localhost:5173)
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally to check the production build
```

## How the flow maps to the PDF

The mockup is a phone view (Galaxy S25 Ultra). Phones and tablets get that layout; from 1024px
wide the same screens are laid out full-width (see "Desktop layout" below).

| PDF page | Screen | Route | Component |
| --- | --- | --- | --- |
| 3 left | Landing – "Join as a Creator" / "Sign Up as a Fan", Menu button | `/` | `pages/LandingPage` |
| 3 right | Public menu overlay (8 links, 3 footer buttons, Close) | `/` (overlay) | `components/PublicMenu` |
| 4 left | Fan sign-up – Google, X, e-mail + password, Stay Updated toggle | `/signup` | `pages/SignUpPage` |
| 4 right | "Check your email" – Send again, Change email, human check | `/home` (not verified yet) | `pages/CheckEmailPage` |
| 5 | Verification e-mail, "Verify your account" button | `/mock-inbox` (demo only) | `pages/MockInboxPage` |
| – | E-mail link target, redirects to sign-in | `/verify-email?token=…` | `pages/VerifyEmailPage` |
| 6 left | Sign-in | `/signin` | `pages/SignInPage` |
| 6 centre | Home – hero, Elite Creators, bottom tab bar | `/home` (signed in) | `pages/HomePage` |
| 6 right | Account drawer, opened by the "Menu" tab | `/home` (overlay) | `components/AccountDrawer` |

End to end: **Landing → Sign Up as a Fan → e-mail + password → Sign Up → Check your email →
(e-mail) Verify your account → Sign-in → Home → Menu → account drawer → Logout → Landing.**

`/home` serves two screens because both mockup screenshots show `velvetfx.com/home`:
signed in → home, signed up but unverified → "Check your email", otherwise → redirect to `/signin`.

### Delete account flow

`VELVET FX - FAN - Delete Account Process - 10.4.26.pdf` (pages 1, 2 and 7 are title slides):

| PDF page | Screen | Route | Component |
| --- | --- | --- | --- |
| 3 | Sign in (Google in the mockup), then Home | `/signin` → `/home` | existing screens |
| 4 left/centre | Home → "Menu" tab → account drawer → **Settings** | `/home` (overlay) | `components/AccountDrawer` |
| 4 right | Settings – 7 rows, Display & Language toggles, × | `/settings` | `pages/SettingsPage` |
| 5 left | Account – Account Info, Password and security, **Delete my account** | `/settings/account` | `pages/AccountSettingsPage` |
| 5 centre | Delete my account – warning, caution box, **DELETE ACCOUNT** | `/settings/account/delete` | `pages/DeleteAccountPage` |
| 5 right | "Why are you deleting your account?" pop-up, optional reason, **DELETE MY ACCOUNT** | same (overlay) | `components/DeleteReasonSheet` |
| 6 | Account deleted, back on sign-in | `/signin` | `pages/SignInPage` |

End to end: **Home → Menu → Settings → Account → Delete my account → DELETE ACCOUNT → reason →
DELETE MY ACCOUNT → Sign-in** (the account is gone; signing in with it fails). The settings
screens require a signed-in user; anyone else is sent to `/signin`.

Registration data travels between steps through `context/SessionContext` (pending e-mail,
Stay Updated choice, signed-in user), mirrored to `sessionStorage` so a page refresh keeps the user
in the flow. Passwords are never stored there.

### Creator sign-up flow (phase 1)

`VELVET FX - CREATOR - Sign up Process - with email and password - 10.9.26 - PHASE 1.pdf`
(pages 1, 2 and 9 are title slides). A creator is a *Presenter* in the API.

| PDF page | Screen | Route | Component |
| --- | --- | --- | --- |
| 3 | Landing / public menu → **Join as a Creator** | `/` | `pages/LandingPage`, `components/PublicMenu` |
| 4 | Creator sign-up – Google, X, e-mail + password (9–30 chars, number, upper and lower case) | `/signup?type=creator` | `pages/SignUpPage` |
| 5 left | **Verify your email** pop-up – Resend link, Use a different email, × | `/home` (pending creator) | `pages/CreatorVerifyEmailPage` |
| 5 right | E-mail "Confirm your VELVET FX account" → **Confirm your account** | `/creator/verify?token=…` | `pages/CreatorVerifyPage` (+ API template) |
| 6–7 | Onboarding carousel, 6 slides (arrows, dots, swipe, auto-advance) – Start Monetizing, Close | `/myprofile` | `pages/CreatorOnboardingPage` |
| 8 centre | Close → creator home "Build Your Feed" – Explore Creators | `/home` (creator) | `pages/CreatorHomePage` |
| 8 right | Start Monetizing → **Referrals**, step 1 of 9 – Proceed, Skip this step | `/myprofile/referral` | `pages/CreatorReferralPage` |

End to end: **Landing → Join as a Creator → e-mail + password → Sign Up → Verify your email →
(e-mail) Confirm your account → onboarding carousel → Start Monetizing → Referrals → (phase 2)**,
or **Close → creator home**. Google on the creator sign-up skips the e-mail and goes to the carousel.
Signing in later as a creator lands on the creator home.

Assumptions (also `ASSUMPTION` comments in the code):

- Photos stay off: every "PHOTO HERE" box is a soft placeholder tile (`components/MediaPlaceholder`).
- The carousel advances every 5 s, stops on the last slide and for good once the creator uses an
  arrow, a dot or a swipe; it pauses on hover/focus and is off with reduced motion.
- Proceed and Skip on Referrals both continue to `/myprofile/setup`, a placeholder for phase 2.
  The API has no referral field yet, so a code is kept in `sessionStorage`.
- "Use a different email" returns to the creator sign-up with the address prefilled; × leaves the
  flow (back to landing). Search and Explore Creators open placeholders.
- The signed-in fan's "Join as a Creator" (home, drawer, Settings) still opens a placeholder: a fan
  becoming a creator is not designed yet.

## Project structure

```
index.html
vite.config.ts            base path + build output (dist/, hashed files in dist/static)
public/
  web.config              IIS: SPA rewrite, MIME types, cache headers (copied into dist/)
  assets/                 logos, icons (and currently unused photos) from the asset pack
src/
  index.tsx               entry: fonts, styles, <App />
  App.tsx                 BrowserRouter + SessionProvider + phone-width shell
  config.ts               DEMO_MODE, mock latency, asset() URL helper
  types.ts
  routes/
    paths.ts              route table (PDF screens + placeholder destinations)
    AppRoutes.tsx         <Routes>, /home gate, auth guard
  context/
    SessionContext.tsx    state shared across the sign-up steps
  services/
    api.ts                ALL placeholder API calls  <-- plug the real API in here
    mockDb.ts             pretend user table in sessionStorage (delete with the mocks)
  utils/
    validation.ts         e-mail / password rules
  components/             Button, TextInput, PasswordInput, ToggleSwitch, SocialButtons,
                          AuthLayout, PublicMenu, AccountDrawer, BottomNav, HumanCheck,
                          SignedInLayout, Settings (rows), DeleteReasonSheet,
                          BrandLogo, Icon, Picture, useOverlay, useLogout
  pages/                  one file per screen (see table above) + PlaceholderPage
  styles/                 tokens.css, base.css, components.css, screens.css (mockup layout),
                          desktop.css (full-width layout from 1024px)
```

## Desktop layout

The PDF has no desktop design, so `src/styles/desktop.css` is our own arrangement of the same
screens, controls and assets. It applies from 1024px wide and does not change the flow.

| Screen | Desktop layout |
| --- | --- |
| Landing | Centred logo, headline and buttons on the white page. From 1280px the menu links sit in the header next to a "Login" button; below that the "Menu" button opens the overlay. |
| Sign up / Sign in | One centred form column under the logo. |
| Check your email | Logo on top, the dialog as a centred card. |
| Verification e-mail | Centred reading column. |
| Home | The tab bar becomes a top bar with the logo; centred hero copy; the three Elite Creators cards sit side by side. |
| Account drawer | 400px panel on the right over a dimmed page. |
| Settings, Account, Delete my account | 680px centred column under the top bar; the reason pop-up becomes a centred dialog. |

## Backend API (ModelFeed)

The frontend talks to the existing **ModelFeed ASP.NET Core API** (.NET 5), hosted on the same IIS
site as an application at `https://velvet.love/api` (Swagger: `https://velvet.love/api/index.html`).
Its controllers are routed `api/[controller]`, so the base URL is **`/api/api`**. A fan is a
*Visitor* in that API. Source: `C:\Users\BibhuRocks\Downloads\SOURCE CODE (1)\API\ModelFeed.Api-develop`.

All calls are in `src/services/api.ts` (fetch wrapper: `src/services/http.ts`, which unwraps the
API's `{ success, data, errors }` envelope into `ApiError` messages):

| Function | Used by | Endpoint |
| --- | --- | --- |
| `registerUser` | Sign Up | `POST /Visitor` `{ name, user: { login, password } }` → signs the fan in |
| `signIn` | Sign In | `POST /Auth/login` `{ login, password }` (deactivated fans are refused) |
| `completeExternalSignIn` | return from Google | `POST /Visitor/google` `{ idToken, nonce }` (added 2026-10-19) |
| `requestPasswordReset` | Forgot password? (`/forgot-password`) | `POST /Auth/forgetpassword` `{ email, url }` |
| `resetPassword` | link in the reset e-mail (`/reset-password/:hash`) | `POST /Auth/changepassword` `{ hash, password }` |
| `deleteAccount` | DELETE MY ACCOUNT | `PATCH /Visitor/deactivate` with `Authorization: Bearer <token>` |
| `registerCreator` | creator Sign Up | `POST /Creator/signup` `{ email, password, marketingOptIn }` (added 2026-10-19) |
| `resendCreatorVerification` | Resend link | `POST /Creator/resend-verification` `{ email }` |
| `verifyCreatorEmail` | Confirm your account (`/creator/verify`) | `POST /Creator/verify-email` `{ token }` → signs the creator in |
| `completeExternalSignIn` (creator) | Continue with Google on the creator sign-up | `POST /Creator/google` `{ idToken, nonce }` |
| `signOut` | Logout | none – the API issues stateless JWTs; the token is dropped client-side |

Configuration: `VITE_API_BASE_URL` in `.env.production` and `.env.development` (both committed,
`/api/api`). `npm run dev` proxies `/api` to `https://velvet.love` (`vite.config.ts`). Set
`VITE_API_BASE_URL=` (empty) in `.env.local` to go back to the in-browser mocks, which also bring
back the e-mail-verification screens and the demo inbox.

Not in the API yet, so still mock-only or unavailable:

- **E-mail verification** (Check your email, Send again, Verify your account): the API activates
  fans immediately, so with the API, Sign Up goes straight to Home.
- **"Stay Updated"** and the **delete reason** have no fields in the API.
- The JWT lives in `sessionStorage` with the rest of the session (one tab, until it closes).

API changes made for VELVET FX (2026-10-19, need a re-publish of the API):

- `VisitorService.SendWelcomeChatMessage` skips fans without a creator. The deployed API saves the
  fan and then answers 400 on that step; `registerUser` signs in with the same credentials to
  recover, which can be removed once the fixed API is live.
- `POST api/Visitor/google` + `GoogleSettings:ClientId` in `appsettings.json` + package
  `Google.Apis.Auth`: verifies the Google ID token and signs in, or creates, the fan.
- `POST api/Visitor/x` and `POST api/Creator/x` + `XSettings:ClientId` / `XSettings:ClientSecret`
  (added 2026-10-24): exchange X's one-time code with X, read the account's confirmed e-mail and
  then follow the same rules as Google (`Services/XOAuthClient.cs`).
- Swagger UI loads `swagger/v1/swagger.json` relative to itself (it used to fetch the React site's
  `index.html`).
## Google and X sign-in

"Continue with Google" and "Continue with X" (sign-up and sign-in) use the providers' real
consent screens once a client ID is set. Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it | Redirect URI to register |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud console → Credentials → OAuth client ID (Web application) | `https://<server>/auth/callback/google` (and `http://localhost:5173/...` for dev) |
| `VITE_X_CLIENT_ID` | X developer portal → app → User authentication settings (OAuth 2.0, Web App) | `https://<server>/auth/callback/x` (X may refuse `localhost`; use `http://127.0.0.1:5173/...`) |

The values are baked in at build time, so set them before `npm run build`. An empty value keeps
that provider simulated. Only client IDs go here; client secrets belong to the API.

**Deployed builds (GitHub Actions → velvet.love):** the public client IDs are committed in
`.env.production`. Do not set `VITE_*` under `env:` in `deploy.yml`: a missing Actions variable
arrives as an empty string and overrides the file. Google only accepts `https` redirect URIs
outside `localhost`.

**Turning on X** (developer portal → your app → User authentication settings):

1. App type **Web App** (confidential client), permissions **Read**, and switch on
   **Request email from users** (X then asks for a privacy policy and terms URL).
2. Callback URIs: `https://velvet.love/auth/callback/x` and, for dev,
   `http://127.0.0.1:5173/auth/callback/x` (open the dev site on 127.0.0.1, not localhost).
3. Keys and tokens → OAuth 2.0 Client ID → `VITE_X_CLIENT_ID` in `.env.production` (and
   `.env.local`), then push.
4. Client ID **and** Client Secret → `XSettings` in the API's server-only
   `appsettings.Production.json`, then re-publish the API.

Sign-in fails with "Your X account has no confirmed e-mail address" if the X account has none or
the e-mail permission is off, because VELVET FX accounts are keyed by e-mail.

How it works (`src/services/oauth.ts`, `pages/OAuthCallbackPage`):

- **Google**: OpenID Connect redirect with `response_type=id_token`, plus `state` and `nonce`.
  Google returns a signed ID token to `/auth/callback/google`.
- **X**: OAuth 2.0 authorization code with PKCE. X returns a one-time code to `/auth/callback/x`.
- The callback page checks `state`, then calls `completeExternalSignIn`, which posts to
  `/Visitor/google` or `/Visitor/x` (`/Creator/...` from the creator sign-up). The API validates
  the Google ID token (`GoogleJsonWebSignature.ValidateAsync`, audience = client ID, matching
  nonce) or, for X, exchanges the code (`POST https://api.x.com/2/oauth2/token` with the PKCE
  verifier) and reads `GET /2/users/me?user.fields=confirmed_email`. X does not allow that
  exchange from a browser, so it happens on the server.

With the mock (`VITE_API_BASE_URL` empty), Google's token is read without checking its signature,
and X users are signed in as a demo fan because the code cannot be exchanged.

## Deploying to IIS

1. `npm run build`
2. Copy the **contents** of `dist/` to the IIS site folder (it already contains `web.config`).
3. Install the **URL Rewrite** module on the server
   (<https://www.iis.net/downloads/microsoft/url-rewrite>). Without it IIS returns
   HTTP 500.19 because `web.config` contains a `<rewrite>` section.

`web.config` does three things:

- rewrites every request that is not an existing file or folder (and not under `/api/`) to
  `/index.html`, so refreshing `/signup`, `/signin`, `/home` … works with `BrowserRouter`;
- registers the `.avif`, `.webp` and `.woff2` MIME types (older IIS versions do not serve them);
- disables caching for `index.html` and enables long caching for the hashed files in `/static`.

The app is configured for the site root (`http://server/`). To host it under a virtual
directory such as `http://server/fan/`, set `base: '/fan/'` in `vite.config.ts` and change the
rewrite target in `web.config` to `/fan/index.html`; the router and asset URLs follow `base`.

## Assumptions

The PDF leaves these open; each is also marked with an `ASSUMPTION` comment in the code.

- **Destinations not shown in the PDF** (menu links, policies, Forgot password, Join as a
  Creator, bottom tabs, drawer entries) open a generic `PlaceholderPage` so every control is
  clickable without inventing designs. They are listed in `routes/paths.ts`.
- **Validation**: e-mail must be well-formed; a new password needs 8+ characters with a letter
  and a number. The Fan PDF shows no error states, so messages and styling are our own.
- **Name and @handle** in the drawer are derived from the e-mail address by the mock, because the
  sign-up form only collects e-mail and password.
- **Send again** requires the human check first; **Change email** returns to sign-up with the
  address prefilled; the dialog's **×** returns to the landing screen.
- **"Join VELVET FX"** on the sign-in screen opens the sign-up screen.
- **Google / X** sign-in goes through the real providers when client IDs are configured (see
  "Google and X sign-in"); otherwise it is simulated and signs in a demo fan. Social accounts
  skip e-mail verification and keep the "Stay Updated" choice. A failed or cancelled attempt
  shows a short message with a link back to the screen it started from (not in the PDF).
- **Visual theme** (since 2026-10-19) follows the Fanvue fan sign-up screens
  (`Fanvue - Fan - Sign up Process - 9.15.26.pdf`) with the VELVET FX purple (`--brand`,
  `#7e21ef`) in place of Fanvue green. The screens and flow still come from the VELVET FX PDF;
  only the look changed. Every screen, landing and menu included, uses the sign-up page's look:
  white page with a soft purple glow behind the centred stacked logo, borderless light-grey
  inputs, black primary pills ("Sign Up", "Sign In", "Send again", menu "Login"), white outlined
  pills (Google, X, secondary links), purple creator CTAs, links, focus rings, toggle and active
  tab marker. All colours are tokens in `src/styles/tokens.css`. The screens use the `-ink`
  versions of the logos in `public/assets/brand/` (same artwork, dark "VELVET" lettering)
  through `<BrandLogo onLight />`.
- **No photos** (since 2026-10-19, at the user's request): the landing, sign-up/sign-in
  (desktop), check-email and home hero photos were removed and replaced by the centred logo.
  The three Elite Creators cards on home are empty placeholder tiles until real creator content
  exists. The photo files are still in `public/assets/` and `components/Picture` is kept for
  when photos come back; only the logos, the Google/X icons and the mock e-mail's logos are
  still shown.
- **Fonts**: the PDF's font files were not supplied; Inter is bundled locally (no CDN) for both
  headings and UI, as the closest open-licensed match to Fanvue's grotesque.
- **Logos and icons** come from the supplied asset pack, including the current official Google icon.
- A one-line "Your email is verified" notice on the sign-in screen is not in the PDF.
- **Delete account flow** (Delete Account PDF):
  - rows the mockup crosses out in red ("not set up yet") still work as links to the
    placeholder page: Become a creator, Payments and subscriptions, Notifications, Privacy and
    safety, Help terms and support, Account Info, Password and security settings. "Log out" logs
    out. The NSFW Contents and Dark mode switches toggle but change nothing yet;
  - the tab bar, also crossed out on the Settings screen, is kept on all three settings screens
    (no tab selected) so Home and the drawer stay reachable;
  - Settings × returns to home; the < buttons go back one level (Account → Settings,
    Delete my account → Account);
  - the reason is optional; the pop-up closes with ×, Escape or a tap outside it, except while
    the delete request runs;
  - after deleting, sign-in shows a one-line "Your account has been deleted." notice (not in the
    PDF). The mock removes the account from `mockDb`, so signing in with it again fails.
- **Desktop layout** is not in the PDF; see "Desktop layout" above.
