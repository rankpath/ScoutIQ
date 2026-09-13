'use client'

import { useEffect } from 'react'

export default function AdsLibraryNavBridge() {
  useEffect(() => {
    const handler = event => {
      if (window.location.pathname.startsWith('/ads-library')) return
      const target = event.target?.closest?.('button, [role="button"], a, .featureCard')
      if (!target) return
      const label = target.textContent?.replace(/\s+/g, ' ').trim() || ''
      const isAdsLibrary = label === 'Ads Library' || label.includes('Track Ads') || label.includes('คลังโฆษณา')
      if (!isAdsLibrary) return

      event.preventDefault()
      event.stopPropagation()
      window.location.assign('/ads-library')
    }

    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  return null
}
