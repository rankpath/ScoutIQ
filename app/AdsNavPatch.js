'use client'

import { useEffect } from 'react'

export default function AdsNavPatch() {
  useEffect(() => {
    const handleClick = event => {
      if (window.location.pathname.startsWith('/ads-library')) return
      const clickable = event.target?.closest?.('button, [role="button"], .featureCard')
      if (!clickable) return
      const text = String(clickable.textContent || '').trim()
      const isAdsLibrary = text.includes('Ads Library') || text.includes('Track Ads') || text.includes('คลังโฆษณา')
      if (!isAdsLibrary) return

      event.preventDefault()
      event.stopPropagation()
      window.location.href = '/ads-library'
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
