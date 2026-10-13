/**
 * Route table. The first block mirrors the screens in the Fan sign-up PDF;
 * the URLs match the address bar shown in each mockup screenshot.
 */
export const PATHS = {
  landing: '/', // PDF p.3 left  - landing (+ public menu overlay, p.3 right)
  signUp: '/signup', // PDF p.4 left  - fan sign-up
  home: '/home', // PDF p.4 right - "Check your email" (not verified yet)
  //                PDF p.6 centre/right - home + account drawer (signed in)
  verifyEmail: '/verify-email', // target of the e-mail button (PDF p.5), redirects to sign-in
  signIn: '/signin', // PDF p.6 left  - sign-in
  mockInbox: '/mock-inbox', // DEMO ONLY - stands in for the user's mailbox (PDF p.5)
} as const

export interface PlaceholderRoute {
  path: string
  title: string
  /** Only reachable when signed in. */
  requiresAuth?: boolean
}

/**
 * ASSUMPTION: the PDF shows these links/buttons but not where they lead
 * ("no destination pages"). Each one routes to a generic placeholder so every
 * control is clickable; replace the entries with real pages as they are designed.
 */
export const PLACEHOLDER_ROUTES = {
  // Public menu (PDF p.3 right)
  about: { path: '/about', title: 'About' },
  highlights: { path: '/highlights', title: 'Highlights' },
  photographers: { path: '/photographers', title: 'Photographers' },
  videomakers: { path: '/videomakers', title: 'Videomakers' },
  locations: { path: '/locations', title: 'Locations' },
  blog: { path: '/blog', title: 'Blog' },
  referAndEarn: { path: '/refer-and-earn', title: 'Refer & Earn' },
  support: { path: '/support', title: 'Support' },
  // Creator sign-up is a separate flow (its own PDF)
  joinAsCreator: { path: '/creator/join', title: 'Join as a Creator' },
  // Auth screens
  forgotPassword: { path: '/forgot-password', title: 'Forgot password?' },
  terms: { path: '/terms', title: 'Terms and Conditions' },
  privacy: { path: '/privacy', title: 'Privacy Policy' },
  policies: { path: '/policies', title: 'All our policies' },
  // Bottom navigation (PDF p.6 centre)
  notifications: { path: '/notifications', title: 'Notifications', requiresAuth: true },
  discover: { path: '/discover', title: 'Discover', requiresAuth: true },
  messages: { path: '/messages', title: 'Messages', requiresAuth: true },
  // Account drawer (PDF p.6 right)
  profile: { path: '/account/profile', title: 'My Profile', requiresAuth: true },
  wallet: { path: '/account/wallet', title: 'Wallet', requiresAuth: true },
  following: { path: '/account/following', title: 'Following', requiresAuth: true },
  subscriptions: { path: '/account/subscriptions', title: 'Subscriptions', requiresAuth: true },
  settings: { path: '/account/settings', title: 'Settings', requiresAuth: true },
  languages: { path: '/account/languages', title: 'Multiple Languages', requiresAuth: true },
  help: { path: '/account/help', title: 'Help and Support', requiresAuth: true },
} as const satisfies Record<string, PlaceholderRoute>
