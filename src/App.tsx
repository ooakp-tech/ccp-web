import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { AppRoutes } from './routes/AppRoutes'

/**
 * The mockup is a mobile view (Galaxy S25 Ultra) and no desktop layout was
 * supplied, so the app renders as a phone-width column centred on larger
 * screens instead of inventing a desktop design. See .app-shell in base.css.
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
