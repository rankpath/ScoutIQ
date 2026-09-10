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

const knownFacebookPages = {
  'thearthospital.lipo': {
    name: 'The Art Hospital',
    username: '@TheArtHospital.Lipo',
    initial: 'T',
  },
}

const seededCompetitors = new Set(['inZ Hospital', 'Lovely Eye & Skin', 'Beproud Clinic'])
const PROFILE_STORAGE_KEY = 'scoutiq-current-facebook-profile'

function setText(el, value) {
  if (el && value && el.textContent?.trim() !== value) el.textContent = value
}

function rememberProfile(profile) {
  if (!profile) return
  try { sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)) } catch {}
}

function getRememberedProfile() {
  try {
    const saved = sessionStorage.getItem(PROFILE_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function getFacebookProfile() {
  // Only use the main Analyze/Dashboard Facebook field, never competitor inputs.
  const facebookInput = document.querySelector('.searchBox input')
  if (!facebookInput) return getRememberedProfile()

  const rawUrl = String(facebookInput.value || '').trim()
  if (!rawUrl || !rawUrl.toLowerCase().includes('facebook.com')) return getRememberedProfile()

  try {
    const parsed = new URL(rawUrl)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const slug = decodeURIComponent(parts[0] || '').replace(/^@/, '')
    if (!slug || ['share', 'profile.php', 'pages'].includes(slug.toLowerCase())) return getRememberedProfile()

    const known = knownFacebookPages[slug.toLowerCase()]
    if (known) {
      const profile = { ...known, url: rawUrl }
      rememberProfile(profile)
      return profile
    }

    const readable = slug
      .replace(/[._-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim()

    const profile = {
      name: readable || slug,
      username: `@${slug}`,
      initial: (readable || slug).charAt(0).toUpperCase(),
      url: rawUrl,
    }
    rememberProfile(profile)
    return profile
  } catch {
    return getRememberedProfile()
  }
}

function syncProfileSignalRows(panel, profile) {
  if (!panel || !profile) return

  const rows = [...panel.querySelectorAll('.metricList > div, :scope > div:not(.panelHead)')]
  rows.forEach(row => {
    const label = row.querySelector?.('span')?.textContent?.trim()
    const value = row.querySelector?.('b')
    if (label === 'Page name') setText(value, profile.name)
    if (label === 'Username') setText(value, profile.username)
    if (label === 'Page link') setText(value, profile.url)
  })
}

function patchAnalyzeIdentity() {
  const profile = getFacebookProfile()
  if (!profile) return

  // English Analyze profile.
  const enIdentity = document.querySelector('.pageIdentity')
  if (enIdentity) {
    setText(enIdentity.querySelector('.pageAvatar'), profile.initial)
    setText(enIdentity.querySelector('h2'), profile.name)

    const meta = enIdentity.querySelector('p.muted')
    if (meta) setText(meta, `${profile.username} · Health / Beauty · Bangkok, Thailand`)

    const shownUrl = enIdentity.querySelector('.pageUrl')
    if (shownUrl) setText(shownUrl, profile.url)

    const openLink = enIdentity.querySelector('a[href]')
    if (openLink && openLink.getAttribute('href') !== profile.url) openLink.setAttribute('href', profile.url)
  }

  // Thai Analyze profile.
  const thIdentity = document.querySelector('.identity.panel')
  if (thIdentity) {
    setText(thIdentity.querySelector('.logoBubble'), profile.initial)
    setText(thIdentity.querySelector('h2'), profile.name)

    const meta = thIdentity.querySelector('p')
    if (meta) setText(meta, `${profile.username} · Health / Beauty · Bangkok, Thailand`)

    const openLink = thIdentity.querySelector('a[href]')
    if (openLink && openLink.getAttribute('href') !== profile.url) openLink.setAttribute('href', profile.url)
  }

  // Keep English Profile signals in sync with the analyzed page.
  const enProfileHeading = [...document.querySelectorAll('h2')].find(el => el.textContent?.trim() === 'Profile signals')
  syncProfileSignalRows(enProfileHeading?.closest('.panel'), profile)

  // Keep Thai PROFILE SIGNALS / ข้อมูลโปรไฟล์ in sync with the analyzed page.
  const thProfileHeading = [...document.querySelectorAll('h2')].find(el => el.textContent?.trim() === 'ข้อมูลโปรไฟล์')
  syncProfileSignalRows(thProfileHeading?.closest('.panel'), profile)
}

function setReactInputValue(input, value) {
  if (!input) return
  const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function patchCompetitorSetup() {
  const profile = getFacebookProfile()
  const headings = [...document.querySelectorAll('h2')]
  const thHeading = headings.find(el => el.textContent?.trim() === 'เพิ่มคู่แข่ง 3 ธุรกิจ')
  const enHeading = headings.find(el => el.textContent?.trim() === 'Input 3 businesses')
  const heading = thHeading || enHeading
  const panel = heading?.closest('.panel')
  if (!panel) return

  const intro = panel.querySelector('p.muted')
  if (intro && profile) {
    const isThai = Boolean(thHeading)
    const desiredKey = `${isThai ? 'th' : 'en'}:${profile.name}`
    if (intro.dataset.scoutiqProfile !== desiredKey) {
      const label = document.createElement('b')
      label.textContent = isThai ? 'ธุรกิจของคุณ:' : 'Your business:'
      const copy = isThai
        ? ` ${profile.name} · ใส่ชื่อธุรกิจหรือ Facebook Page URL ของคู่แข่ง 3 ราย`
        : ` ${profile.name} · Enter three competitor business names or Facebook Page URLs.`
      intro.replaceChildren(label, document.createTextNode(copy))
      intro.dataset.scoutiqProfile = desiredKey
    }
  }

  // Start all three competitor fields blank instead of pre-filling demo competitor names.
  const competitorInputs = [...panel.querySelectorAll('input')]
  competitorInputs.forEach(input => {
    if (input.dataset.scoutiqInitialCleared === 'true') return
    input.dataset.scoutiqInitialCleared = 'true'
    if (seededCompetitors.has(String(input.value || '').trim())) {
      setReactInputValue(input, '')
    }
  })
}

function patchFollowerTrendDemoState() {
  const followerPanel = [...document.querySelectorAll('.panel')].find(panel =>
    [...panel.querySelectorAll('small')].some(el => el.textContent?.trim() === 'FOLLOWER TREND')
  )
  if (!followerPanel) return

  const heading = followerPanel.querySelector('h2')
  const isThai = heading?.textContent?.includes('แนวโน้มผู้ติดตาม')
  const pill = followerPanel.querySelector('.pill')
  const note = followerPanel.querySelector('p.muted')

  if (isThai) {
    setText(pill, 'Demo · ยังไม่ใช่ข้อมูลจริง')
    setText(note, 'ข้อมูลตัวอย่างเท่านั้น — ยังไม่ได้เชื่อม Facebook/Metricool จึงไม่ใช่จำนวนผู้ติดตามจริงของเพจที่วิเคราะห์')
  } else {
    setText(pill, 'Demo · Not Live')
    setText(note, 'Demo data only — Facebook/Metricool live follower history is not connected yet.')
  }
}

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

  // Add address to English Profile signals.
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

  patchAnalyzeIdentity()
  patchCompetitorSetup()
  patchFollowerTrendDemoState()
}

export default function CopyPatch() {
  useEffect(() => {
    const handleInput = event => {
      if (event.target?.tagName === 'INPUT') requestAnimationFrame(patchCopy)
    }
    const handleClick = () => setTimeout(patchCopy, 0)

    patchCopy()
    document.addEventListener('input', handleInput, true)
    document.addEventListener('click', handleClick, true)

    const observer = new MutationObserver(patchCopy)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    return () => {
      observer.disconnect()
      document.removeEventListener('input', handleInput, true)
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  return null
}
