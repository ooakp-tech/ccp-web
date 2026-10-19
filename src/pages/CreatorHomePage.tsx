import { Button } from '../components/Button'
import { CreatorTopBar } from '../components/CreatorTopBar'
import { MediaPlaceholder } from '../components/MediaPlaceholder'
import { SignedInLayout } from '../components/SignedInLayout'
import { PLACEHOLDER_ROUTES } from '../routes/paths'
import type { User } from '../types'

/**
 * Creator PDF p.8 (centre): /home for a signed-in creator - where "Close" on
 * the onboarding carousel lands. Same tab bar and account drawer as the fan home.
 * ASSUMPTION: "Explore Creators" opens a placeholder until that page is designed.
 */
export function CreatorHomePage({ user }: { user: User }) {
  return (
    <SignedInLayout user={user} homeActive className="creator-home">
      <CreatorTopBar />
      <section className="creator-home__feed">
        <MediaPlaceholder className="creator-home__photo" />
        <h1>Build Your Feed</h1>
        <p>Subscribe to premium creators to unlock exclusive content</p>
        <Button to={PLACEHOLDER_ROUTES.exploreCreators.path}>Explore Creators</Button>
      </section>
    </SignedInLayout>
  )
}
