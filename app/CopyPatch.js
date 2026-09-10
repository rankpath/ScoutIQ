'use client'

import { useEffect } from 'react'

const replacements = new Map([
  ['What ScoutIQ compares', 'How ScoutIQ Calculates Your Score'],
  ['Total weight 100%', 'What to calculate'],
  ['Each business is scored across the same 7 factors. The planned live version uses the most recent 7-day social data where available, then ScoutIQ applies the weights below to produce the overall score.', 'Compare your business with three competitors across seven factors to reveal strengths, weaknesses, ranking gaps, and recommended actions for improvement.'],
])

function patchCopy() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node

  while ((node = walker.nextNode())) {
    const value = node.nodeValue?.trim()
    if (value && replacements.has(value)) {
      node.nodeValue = node.nodeValue.replace(value, replacements.get(value))
    }
  }
}

export default function CopyPatch() {
  useEffect(() => {
    patchCopy()
    const observer = new MutationObserver(patchCopy)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return null
}
