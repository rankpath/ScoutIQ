'use client'

import { useEffect } from 'react'

const replacements = new Map([
  ['What ScoutIQ compares', 'How ScoutIQ Calculates Your Score'],
  ['Total weight 100%', 'What to calculate'],
  ['Each business is scored across the same 7 factors. The planned live version uses the most recent 7-day social data where available, then ScoutIQ applies the weights below to produce the overall score.', 'Compare your business with three competitors across seven factors to reveal strengths, weaknesses, ranking gaps, and recommended actions for improvement.'],
  ['AdsCraft Digital', 'ScoutIQ'],
  ['ScoutIQ Workspace', 'Social Media Analytics Platform'],
  ['Good morning, AdsCraft!', 'Good morning!'],
  ['ScoutIQ Beta', 'ScoutIQ v.1'],
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

  const accountMeta = document.querySelector('.account > div:last-child')
  if (accountMeta && !accountMeta.querySelector('.builtByRankPath')) {
    const builtBy = document.createElement('span')
    builtBy.className = 'builtByRankPath'
    builtBy.textContent = 'Built by Rank-Path'
    builtBy.style.fontSize = '10px'
    builtBy.style.opacity = '0.78'
    builtBy.style.marginTop = '3px'
    accountMeta.appendChild(builtBy)
  }

  // Analyze layout: ScoutIQ Score on the left, Follower Trend on the right.
  const allPanels = [...document.querySelectorAll('.panel')]
  const scorePanel = allPanels.find(panel => [...panel.querySelectorAll('small')].some(el => el.textContent?.trim() === 'SCOUTIQ SCORE'))
  const followerPanel = allPanels.find(panel => [...panel.querySelectorAll('small')].some(el => el.textContent?.trim() === 'FOLLOWER TREND'))
  if (scorePanel && followerPanel && scorePanel.parentElement === followerPanel.parentElement) {
    const row = scorePanel.parentElement
    if (row.firstElementChild !== scorePanel) row.insertBefore(scorePanel, followerPanel)
  }

  // Add address to Profile signals.
  const profileHeading = [...document.querySelectorAll('h2')].find(el => el.textContent?.trim() === 'Profile signals')
  const profilePanel = profileHeading?.closest('.panel')
  if (profilePanel && !profilePanel.querySelector('[data-scoutiq-address]')) {
    const pageLinkRow = [...profilePanel.children].find(child => child.querySelector?.('span')?.textContent?.trim() === 'Page link')
    const addressRow = document.createElement('div')
    addressRow.dataset.scoutiqAddress = 'true'
    addressRow.style.display = 'grid'
    addressRow.style.gridTemplateColumns = '110px 1fr'
    addressRow.style.gap = '12px'
    addressRow.style.padding = '11px 0'
    addressRow.style.borderBottom = '1px solid #eef0f5'
    addressRow.style.fontSize = '12px'

    const label = document.createElement('span')
    label.className = 'muted'
    label.textContent = 'Address'

    const value = document.createElement('b')
    value.textContent = 'Bangkok, Thailand'
    value.style.wordBreak = 'break-word'

    addressRow.append(label, value)
    if (pageLinkRow) profilePanel.insertBefore(addressRow, pageLinkRow)
    else profilePanel.appendChild(addressRow)
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
