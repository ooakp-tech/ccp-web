import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled (no CDN) so the app also works on intranet IIS servers.
// ASSUMPTION: the PDF's font files were not supplied; Inter (UI) and
// Montserrat (headlines) are the closest open-licensed matches.
import '@fontsource-variable/inter'
import '@fontsource-variable/montserrat'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/screens.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
