# VELVET FX – Fan sign-up flow (React frontend)

React + TypeScript implementation of the mobile mockup
`VELVET FX - FAN - Sign up Process - with email and password - 10.1.26.pdf`.
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

The mockup is a phone view (Galaxy S25 Ultra) and no desktop layout was supplied, so the app
renders as one phone-width column, centred on larger screens.

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

Registration data travels between steps through `context/SessionContext` (pending e-mail,
Stay Updated choice, signed-in user), mirrored to `sessionStorage` so a page refresh keeps the user
in the flow. Passwords are never stored there.

## Project structure

```
index.html
vite.config.ts            base path + build output (dist/, hashed files in dist/static)
public/
  web.config              IIS: SPA rewrite, MIME types, cache headers (copied into dist/)
  assets/                 logos, icons, photos from the asset pack (copied into dist/assets)
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
                          BrandLogo, Icon, Picture, useOverlay
  pages/                  one file per screen (see table above) + PlaceholderPage
  styles/                 tokens.css, base.css, components.css, screens.css
```

## Plugging in the real API

Only `src/services/api.ts` needs to change. Each function carries a `TODO: call API` comment
naming the endpoint it stands in for:

| Function | Used by | Suggested endpoint |
| --- | --- | --- |
| `registerUser` | Sign Up button | `POST /api/auth/register` |
| `resendVerificationEmail` | Send again | `POST /api/auth/resend-verification` |
| `verifyEmail` | e-mail link | `POST /api/auth/verify-email` |
| `signIn` | Sign In button | `POST /api/auth/login` |
| `signInWithProvider` | Continue with Google / X | OAuth flow + `POST /api/auth/external/{provider}` |
| `signOut` | Logout | `POST /api/auth/logout` |
| `verifyHumanChallenge` | "Verify you are human" | replace `HumanCheck` with the real Cloudflare Turnstile widget |
| `getVerificationMessage` | demo inbox | none – delete with the demo inbox |

Keep throwing `ApiError` with the existing codes (`EMAIL_TAKEN`, `INVALID_CREDENTIALS`,
`EMAIL_NOT_VERIFIED`, `INVALID_TOKEN`) and the screens keep working unchanged. Then delete
`mockDb.ts`, set `DEMO_MODE = false` in `src/config.ts` (removes `/mock-inbox` and its shortcut on
the "Check your email" screen), and load the signed-in user from the API instead of
`sessionStorage` in `SessionContext`.

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
- **Google / X** sign-in is simulated: it skips the provider's account chooser and signs in a
  demo fan.
- **Fonts**: the PDF's font files were not supplied; Inter (UI) and Montserrat (headlines) are
  bundled locally (no CDN) as the closest open-licensed match.
- **Photos and logos** come from the supplied asset pack, which replaces the people in the
  mockup screenshots with newly generated artwork and uses the current official Google icon.
- A one-line "Your email is verified" notice on the sign-in screen is not in the PDF.
