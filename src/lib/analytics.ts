// Google Analytics 4 helper functions

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const GA_TRACKING_ID = 'G-PLACEHOLDER_ID'

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Predefined events for ChainPulse
export const Analytics = {
  // CTA clicks
  ctaClick: (ctaName: string) => event({
    action: 'click',
    category: 'cta',
    label: ctaName,
  }),
  
  // Waitlist signup
  waitlistSignup: () => event({
    action: 'submit',
    category: 'waitlist',
    label: 'email_submitted',
  }),
  
  // Dashboard events
  filterUsed: (filterType: string) => event({
    action: 'filter',
    category: 'dashboard',
    label: filterType,
  }),
  
  signalViewed: (token: string) => event({
    action: 'view',
    category: 'signal',
    label: token,
  }),
  
  // Pricing
  pricingView: (tier: string) => event({
    action: 'view',
    category: 'pricing',
    label: tier,
  }),
  
  // Navigation
  navClick: (item: string) => event({
    action: 'click',
    category: 'navigation',
    label: item,
  }),
}

export default Analytics
