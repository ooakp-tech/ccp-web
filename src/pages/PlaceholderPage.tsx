import { useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { PATHS } from '../routes/paths'

/**
 * NOT IN THE PDF. Generic stand-in for every link whose destination the Fan
 * sign-up mockup does not show (menu items, policies, drawer entries, the
 * Creator flow...). It keeps each control clickable without inventing designs.
 */
export function PlaceholderPage({ title }: { title: string }) {
  const navigate = useNavigate()

  // A page opened directly (new tab / refresh) has no in-app history to go back to.
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(PATHS.landing)
  }

  return (
    <div className="screen auth status-page">
      <BrandLogo variant="horizontal" onLight className="status-page__logo" />
      <h1>{title}</h1>
      <p className="status-page__text">This screen is not part of the Fan sign-up mockup yet.</p>
      <Button variant="outline" onClick={goBack}>
        Go back
      </Button>
    </div>
  )
}
