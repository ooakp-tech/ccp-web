import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { AppRoutes } from './routes/AppRoutes'

/**
 * The mockup is a mobile view (Galaxy S25 Ultra). Phones and tablets get that
 * layout (a phone-width column, see .app-shell in base.css); from 1024px up
 * the same screens are re-laid out full-width by styles/desktop.css.
 * ASSUMPTION: no desktop design was supplied, so the desktop layout is ours.
 */
export default function App() {
  return (
    // basename follows Vite's `base`, so IIS site-root and virtual-directory hosting both work.
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SessionProvider>
        <div className="app-shell">
          <AppRoutes />
        </div>
      </SessionProvider>
    </BrowserRouter>
  )
}
