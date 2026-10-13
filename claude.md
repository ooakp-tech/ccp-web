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

# Project status (updated 2026-10-12)

Everything above is the original brief. This section records what has been built so work can resume without re-deriving it. Keep it current when the project changes.

## State of the work

- The Fan sign-up flow from `VELVET FX - FAN - Sign up Process - with email and password - 10.1.26.pdf` (7 pages, phone mockup) is fully implemented, frontend only, with a mocked API.
- A full-width desktop layout (1024px and up) was added on 2026-10-12 at the user's request. The PDF has no desktop design, so that layout is our own.
- `npm run build` passes. The flow was clicked through in headless Chrome at phone and desktop sizes with no console errors.
- Not done: hosting on a real IIS server has never been tested (only `vite preview`).
- Git: the desktop-layout changes are uncommitted on `main` (`src/styles/desktop.css` is new). Commit only when the user asks.
- The source PDFs and the asset pack folder (`velvet-fx-frontend-assets-V2`) are no longer in the repo folder; the assets the app uses are already copied to `public/assets/`.

## Stack and commands

Vite 6, React 18, TypeScript, react-router-dom 6, fonts bundled with `@fontsource-variable/inter` and `@fontsource-variable/montserrat` (no CDN). Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build -> dist/ (hashed files in dist/static)
npm run preview    # serve dist/ locally
```

There is no automated test suite in the repo. Earlier checks used throwaway Puppeteer scripts kept outside the project.

## Where things are

- `src/services/api.ts`: every placeholder API call (`registerUser`, `resendVerificationEmail`, `verifyHumanChallenge`, `verifyEmail`, `signIn`, `signInWithProvider`, `signOut`, `getVerificationMessage`), each with a `TODO: call API` comment and a suggested endpoint. `src/services/mockDb.ts` is the pretend user table in `sessionStorage`.
- `src/context/SessionContext.tsx`: user, pending e-mail and marketing opt-in, mirrored to `sessionStorage` (`velvetfx.session`). No passwords are stored.
- `src/routes/paths.ts`: `PATHS` for the PDF screens and `PLACEHOLDER_ROUTES` for every link whose destination the PDF does not show. `src/routes/AppRoutes.tsx` holds the `/home` gate.
- `src/config.ts`: `DEMO_MODE` (turns the simulated inbox on or off), `MOCK_LATENCY_MS`, `asset()`.
- `src/styles/`: `tokens.css`, `base.css`, `components.css`, `screens.css` are the phone layout from the mockup; `desktop.css` holds all desktop overrides in one `@media (min-width: 1024px)` block, plus a 1280px block for the inline landing nav.
- `public/web.config`: IIS SPA rewrite (needs the URL Rewrite module), MIME types, cache headers. `public/assets/`: logos, icons and photos.
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

## Conventions to keep

- Phone layout must keep matching the PDF. Put desktop-only changes in `desktop.css`; elements that exist only on desktop are hidden by default at the end of `screens.css`.
- Sizes inside screens use container units (`cqw`/`cqh`) relative to `.app-shell`, always capped with `min()`/`clamp()`.
- Photos go through `components/Picture` (AVIF with WebP fallback), logos through `components/BrandLogo`, icons through `components/Icon` (CSS mask).
- Mark anything not shown in the PDF with an `ASSUMPTION` comment and list it in the README.
- No real network calls: new backend interactions go in `src/services/api.ts` as mocked functions.

## Decisions made without a design (open to change)

- Destinations not in the PDF (menu links, policies, Forgot password, Join as a Creator, tabs, drawer entries) open a generic `PlaceholderPage`.
- Validation: well-formed e-mail; new password needs 8+ characters with a letter and a number. Error messages are ours.
- "Send again" needs the human check first; "Change email" returns to sign-up with the address prefilled; the dialog's × returns to landing.
- Google/X sign-in is simulated; the Cloudflare box is a stand-in for the real Turnstile widget.
- Display name and @handle are derived from the e-mail by the mock.
- Fonts are Inter and Montserrat as the closest match; photos come from the asset pack and differ from the people in the mockup.
- Desktop: landing shows the menu links and a "Login" button inline from 1280px; sign-up/sign-in and check-email are split screens with a photo; home's tab bar becomes a top bar; windows under 1024px keep the centred phone column.

## Possible next steps

- Review the desktop layout with the user and adjust.
- Test the build on a real IIS site with the URL Rewrite module.
- Replace placeholder pages as their designs arrive (Creator sign-up has its own PDF, not yet supplied).
- Wire `src/services/api.ts` to the ASP.NET Core backend when it exists.
- Add an in-repo end-to-end test if the user wants one.
