'use client'

import { useEffect } from 'react'

export default function AdsLibraryNavBridge() {
  useEffect(() => {
    const handler = event => {
      const target = event.target?.closest?.('button, [role="button"], a')
      if (!target) return
      const label = target.textContent?.replace(/\s+/g, ' ').trim() || ''
      if (label === 'Ads Library' || label.includes('Track Ads')) {
        event.preventDefault()
        event.stopPropagation()
        window.location.assign('/ads-library')
      }
    }

    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  return null
}
