'use client'

import { useEffect, useMemo, useState } from 'react'

const FACTORS = [
  { key:'volume', name:'Ad Activity', weight:20 },
  { key:'creative', name:'Creative Variety', weight:20 },
  { key:'hook', name:'Hook Strength', weight:20 },
  { key:'offer', name:'Offer & CTA', weight:25 },
  { key:'proof', name:'Trust & Proof', weight:15 },
]

const offerWords = ['%', 'discount', 'sale', 'promo', 'promotion', 'special', 'free', 'เริ่ม', 'ลด', 'โปร', 'โปรโมชั่น', 'ฟรี', 'ราคา']
const ctaWords = ['book', 'booking', 'message', 'dm', 'contact', 'learn more', 'shop now', 'call', 'inbox', 'จอง', 'ทัก', 'แชท', 'ติดต่อ', 'ปรึกษา']
const proofWords = ['review', 'testimonial', 'before', 'after', 'doctor', 'expert', 'case', 'result', 'รีวิว', 'ก่อน', 'หลัง', 'แพทย์', 'หมอ', 'เคส', 'ผลลัพธ์']
const videoWords = ['video', 'reel', 'reels', 'วีดีโอ', 'วิดีโอ']
const carouselWords = ['carousel', 'album', 'หลายภาพ', 'สไลด์']
const urgencyWords = ['today', 'now', 'limited', 'last chance', 'ends', 'วันนี้', 'ด่วน', 'จำนวนจำกัด', 'หมดเขต']

function includesAny(text, words) {
  const lower = String(text || '').toLowerCase()
  return words.some(word => lower.includes(word.toLowerCase()))
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function cleanBlock(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractMetaAds(raw) {
  const text = cleanBlock(raw)
  if (!text) return []

  const starts = []
  const marker = /(?:^|\n)(?:Library ID|Ad Library ID|รหัสคลังโฆษณา|รหัสไลบรารี)\s*:?\s*(\d+)/gi
  let match
  while ((match = marker.exec(text))) {
    starts.push({ index: match.index + (match[0].startsWith('\n') ? 1 : 0), id: match[1] })
  }

  let blocks = []
  if (starts.length) {
    blocks = starts.map((item, index) => {
      const end = starts[index + 1]?.index ?? text.length
      return cleanBlock(text.slice(item.index, end))
    })
  } else {
    blocks = text
      .split(/\n\s*---+\s*\n|\n\s*\n\s*\n/g)
      .map(cleanBlock)
      .filter(item => item.length >= 35)
  }

  const seen = new Set()
  return blocks
    .map((block, index) => {
      const idMatch = block.match(/(?:Library ID|Ad Library ID|รหัสคลังโฆษณา|รหัสไลบรารี)\s*:?\s*(\d+)/i)
      const libraryId = idMatch?.[1] || ''
      const key = libraryId || block.slice(0, 180).toLowerCase()
      if (seen.has(key)) return null
      seen.add(key)

      const platforms = []
      if (/\bfacebook\b/i.test(block)) platforms.push('Facebook')
      if (/\binstagram\b/i.test(block)) platforms.push('Instagram')
      if (/\bmessenger\b/i.test(block)) platforms.push('Messenger')
      if (/\bthreads\b/i.test(block)) platforms.push('Threads')

      const status = /\binactive\b/i.test(block) ? 'Inactive' : /\bactive\b/i.test(block) ? 'Active' : 'Observed'
      return { id: libraryId || `captured-${index + 1}`, libraryId, text:block, status, platforms }
    })
    .filter(Boolean)
}

function parseAds(raw) {
  return extractMetaAds(raw).map(item => item.text)
}

function analyzeAds(raw, activeCount) {
  const records = extractMetaAds(raw)
  const ads = records.map(item => item.text)
  if (!ads.length && !activeCount) return null

  const count = Number(activeCount || ads.length || 0)
  const joined = ads.join('\n').toLowerCase()
  const video = ads.filter(ad => includesAny(ad, videoWords)).length
  const carousel = ads.filter(ad => includesAny(ad, carouselWords)).length
  const image = Math.max(0, ads.length - video - carousel)
  const offerHits = ads.filter(ad => includesAny(ad, offerWords)).length
  const ctaHits = ads.filter(ad => includesAny(ad, ctaWords)).length
  const proofHits = ads.filter(ad => includesAny(ad, proofWords)).length
  const urgencyHits = ads.filter(ad => includesAny(ad, urgencyWords)).length
  const shortOpenings = ads.filter(ad => (ad.split(/\n|[.!?]/)[0] || '').trim().length > 0 && (ad.split(/\n|[.!?]/)[0] || '').trim().length <= 85).length
  const formats = [video > 0, carousel > 0, image > 0].filter(Boolean).length

  const scores = {
    volume: clamp(count >= 10 ? 95 : count >= 6 ? 82 : count >= 3 ? 68 : count >= 1 ? 50 : 20),
    creative: clamp(40 + formats * 18 + Math.min(12, video * 3)),
    hook: clamp(45 + (ads.length ? (shortOpenings / ads.length) * 45 : 0) + (urgencyHits ? 8 : 0)),
    offer: clamp(35 + (ads.length ? (offerHits / ads.length) * 30 : 0) + (ads.length ? (ctaHits / ads.length) * 35 : 0)),
    proof: clamp(35 + (ads.length ? (proofHits / ads.length) * 60 : 0)),
  }

  const overall = Math.round(FACTORS.reduce((sum, factor) => sum + scores[factor.key] * factor.weight / 100, 0))

  const themes = []
  if (offerHits) themes.push('Promotion / Price')
  if (proofHits) themes.push('Review / Proof')
  if (joined.includes('doctor') || joined.includes('แพทย์') || joined.includes('หมอ')) themes.push('Expert / Doctor')
  if (urgencyHits) themes.push('Urgency')
  if (video) themes.push('Video / Reels')
  if (carousel) themes.push('Carousel')

  const actions = []
  if (scores.hook < 70) actions.push('Strengthen the first line or first 2 seconds with a clearer hook.')
  if (scores.offer < 70) actions.push('Make the benefit, offer and CTA more explicit in each ad.')
  if (scores.proof < 70) actions.push('Add more proof: reviews, cases, results, expert credibility or before/after evidence.')
  if (scores.creative < 70) actions.push('Increase creative variety with video/Reels, carousel and static variations.')
  if (count < 3) actions.push('Capture more active creative variations before drawing strong conclusions.')
  if (!actions.length) actions.push('Keep the winning message and test new hooks, offers and creative variants around it.')

  return { records, ads, count, video, carousel, image, offerHits, ctaHits, proofHits, urgencyHits, scores, overall, themes, actions:actions.slice(0,3) }
}

function ScoutLogo() {
  return <div className="brandLockup">
    <svg className="scoutLogoMark" viewBox="0 0 64 64" role="img" aria-label="ScoutIQ logo">
      <defs><linearGradient id="scoutGradientAds" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient></defs>
      <circle cx="31" cy="33" r="7" fill="url(#scoutGradientAds)"/>
      <path d="M31 16a17 17 0 1 0 17 17" fill="none" stroke="url(#scoutGradientAds)" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M31 7A26 26 0 1 0 57 33" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" opacity=".96"/>
      <path d="M36 5c12 2 21 12 23 24" fill="none" stroke="url(#scoutGradientAds)" strokeWidth="5.5" strokeLinecap="round"/>
    </svg>
    <div className="brandText"><strong>Scout<span>IQ</span></strong><small>From Data to Next Move.</small></div>
  </div>
}

export default function AdsLibraryPage() {
  const [brand, setBrand] = useState('')
  const [country, setCountry] = useState('TH')
  const [activeCount, setActiveCount] = useState('')
  const [adText, setAdText] = useState('')
  const [result, setResult] = useState(null)
  const [captureStatus, setCaptureStatus] = useState('Ready to capture')
  const [captureSource, setCaptureSource] = useState('')
  const [capturedAt, setCapturedAt] = useState('')
  const [bookmarklet, setBookmarklet] = useState('')

  const libraryUrl = useMemo(() => {
    const query = encodeURIComponent(brand.trim())
    return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${encodeURIComponent(country)}&q=${query}&search_type=keyword_unordered&media_type=all`
  }, [brand, country])

  const importCapture = (raw, source = 'Meta Ads Library') => {
    const records = extractMetaAds(raw)
    if (!records.length) {
      setCaptureStatus('No ad blocks detected — try scrolling Meta Ads Library so the ads are visible, then capture again.')
      return
    }

    const normalized = records.map(item => item.text).join('\n\n---\n\n')
    setAdText(normalized)
    setActiveCount(String(records.length))
    setCaptureSource(source)
    setCapturedAt(new Date().toLocaleString())
    setCaptureStatus(`${records.length} ads captured and analyzed automatically`)
    setResult(analyzeAds(normalized, records.length))
  }

  useEffect(() => {
    const origin = window.location.origin
    const target = `${origin}/ads-library?autocapture=1`
    const code = `javascript:(()=>{try{const payload={type:'SCOUTIQ_AD_CAPTURE',text:document.body.innerText||'',source:location.href,title:document.title};const w=window.open('${target}','scoutiq_capture');const send=()=>{try{w&&w.postMessage(payload,'${origin}')}catch(e){}};setTimeout(send,900);setTimeout(send,1900);setTimeout(send,3200)}catch(e){alert('ScoutIQ capture failed')}})()`
    setBookmarklet(code)

    const receiveCapture = event => {
      const data = event.data
      if (!data || data.type !== 'SCOUTIQ_AD_CAPTURE' || typeof data.text !== 'string') return
      const allowed = event.origin === 'https://www.facebook.com' || event.origin.endsWith('.facebook.com') || event.origin.endsWith('.meta.com')
      if (!allowed) return
      importCapture(data.text, data.source || 'Meta Ads Library')
    }

    window.addEventListener('message', receiveCapture)
    return () => window.removeEventListener('message', receiveCapture)
  }, [])

  const run = () => {
    const analyzed = analyzeAds(adText, activeCount)
    setResult(analyzed)
    if (analyzed) setCaptureStatus(`${analyzed.ads.length || analyzed.count} ads analyzed`)
  }

  const importClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        setCaptureStatus('Clipboard is empty.')
        return
      }
      importCapture(text, 'Clipboard capture from Meta Ads Library')
    } catch {
      setCaptureStatus('Clipboard permission was blocked. Paste the copied Ads Library text into the capture box instead.')
    }
  }

  const clearAll = () => {
    setAdText('')
    setActiveCount('')
    setResult(null)
    setCaptureSource('')
    setCapturedAt('')
    setCaptureStatus('Ready to capture')
  }

  return <div className="appShell">
    <aside className="sidebar">
      <ScoutLogo />
      <nav>
        <a href="/" style={navLinkStyle}><span className="navIcon">⌂</span><span className="navLabel">Dashboard</span></a>
        <a href="/" style={navLinkStyle}><span className="navIcon">◉</span><span className="navLabel">Analyze</span></a>
        <a href="/instagram" style={navLinkStyle}><span className="navIcon">◎</span><span className="navLabel">Instagram Analytics</span></a>
        <a href="/ads-library" style={{...navLinkStyle, ...navActiveStyle}}><span className="navIcon">✦</span><span className="navLabel">Ads Library</span></a>
      </nav>
      <div className="sideCard"><small>AUTO ADS CAPTURE</small><strong>Brand → Ads →<br/>Patterns → Action.</strong><p>Capture multiple visible Meta ads and analyze them in one workflow.</p><span>ScoutIQ v1.1</span></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><small>PAID MEDIA INTELLIGENCE</small><h1>Auto Ads Capture v1.1</h1></div>
        <div className="account"><div className="avatar">S</div><div><b>ScoutIQ</b><span>Social Media Analytics Platform</span><span>Built by Rank-Path</span></div></div>
      </header>

      <section className="panel" style={{padding:28}}>
        <div className="panelHead"><div><small>META ADS LIBRARY</small><h2>Brand / Page → capture multiple ads → analyze automatically</h2></div><span className="pill">Browser Capture v1.1</span></div>
        <p className="muted" style={{maxWidth:920}}>ScoutIQ captures the ads that are visibly loaded in your Meta Ads Library browser session, separates the ad blocks, detects formats and message patterns, then runs the analysis automatically. It does not access your Facebook password, cookies or hidden ad data.</p>

        <div style={{display:'grid',gridTemplateColumns:'minmax(220px,1.6fr) minmax(120px,.5fr)',gap:12,marginTop:20}}>
          <label style={fieldStyle}><span style={labelStyle}>Brand / Page name</span><input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="e.g. The Art Hospital" style={inputStyle}/></label>
          <label style={fieldStyle}><span style={labelStyle}>Country</span><select value={country} onChange={e=>setCountry(e.target.value)} style={inputStyle}><option value="TH">Thailand</option><option value="SG">Singapore</option><option value="VN">Vietnam</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="FR">France</option></select></label>
        </div>

        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}>
          <a className="primary" href={brand.trim() ? libraryUrl : '#'} target="_blank" rel="noreferrer" style={{textDecoration:'none',opacity:brand.trim()?1:.55,pointerEvents:brand.trim()?'auto':'none'}}>1. Open Meta Ads Library ↗</a>
          <button className="secondary" type="button" onClick={importClipboard}>2. Import Clipboard & Auto Analyze</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginTop:18}}>
          <div className="factorCard"><b>Desktop: one-click capture</b><p className="muted" style={{fontSize:12,lineHeight:1.5}}>Drag the button below to your bookmarks bar once. On Meta Ads Library, scroll to load the ads you want, then click the bookmark. ScoutIQ opens and analyzes all detected visible ads.</p>{bookmarklet && <a href={bookmarklet} className="secondary" style={{display:'inline-block',textDecoration:'none'}}>ScoutIQ Auto Capture ✦</a>}</div>
          <div className="factorCard"><b>Mobile / fallback</b><p className="muted" style={{fontSize:12,lineHeight:1.5}}>Open Meta Ads Library, copy the visible page text/results, return here and tap <b>Import Clipboard & Auto Analyze</b>. You do not need to separate each ad manually.</p></div>
          <div className="factorCard"><b>Capture status</b><p style={{fontSize:13,fontWeight:750,margin:'10px 0 4px'}}>{captureStatus}</p><span className="sourceText">{capturedAt ? `Last capture: ${capturedAt}` : 'No capture yet'}</span></div>
        </div>

        <div className="notice"><b>Important:</b> for markets such as Thailand, Meta’s official Ad Library API does not provide unrestricted programmatic access to all commercial ads. Browser Capture uses only the ads already visible to you in Meta Ads Library; missing spend, impressions, targeting and conversion data remain <b>Unavailable</b>.</div>
      </section>

      <section className="panel" style={{marginTop:18}}>
        <div className="panelHead"><div><small>CAPTURED ADS</small><h2>Auto-detected ad blocks</h2></div><span className="pill">{result ? `${result.ads.length} detected` : 'Waiting for capture'}</span></div>
        <textarea value={adText} onChange={e=>setAdText(e.target.value)} placeholder={'Captured ads will appear here automatically. You can also paste Ads Library text here as a fallback.'} style={{...inputStyle,width:'100%',minHeight:190,resize:'vertical',lineHeight:1.5,marginTop:14}}/>
        <div style={{display:'flex',gap:10,marginTop:12,flexWrap:'wrap'}}><button className="primary" type="button" onClick={run}>Analyze Captured Ads</button><button className="secondary" type="button" onClick={clearAll}>Clear</button>{captureSource && <span className="muted" style={{fontSize:12,alignSelf:'center'}}>Source: {captureSource}</span>}</div>
      </section>

      {!result && <section className="panel" style={{marginTop:18}}><small>WHAT SCOUTIQ CHECKS</small><h2>Ad analysis framework</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginTop:16}}>{FACTORS.map(f=><div className="factorCard" key={f.key}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><b>{f.name}</b><span className="pill">{f.weight}%</span></div><p className="muted" style={{fontSize:12}}>{factorCopy[f.key]}</p></div>)}</div></section>}

      {result && <>
        <section className="metricGrid">
          <Metric label="Ads captured" value={result.ads.length} sub="Visible ad blocks detected" />
          <Metric label="Active / observed" value={result.count} sub="Current capture set" />
          <Metric label="Video / Reels" value={result.video} sub="Detected creative format" />
          <Metric label="ScoutIQ Ads Score" value={`${result.overall}/100`} sub="Rule-based v1.1" />
        </section>

        <section className="twoCol">
          <div className="panel">
            <div className="panelHead"><div><small>SCORE BREAKDOWN</small><h2>Paid Ads Activity</h2></div><span className="pill">Public signals</span></div>
            <div className="bars">{FACTORS.map(f=><div className="barRow" key={f.key}><span>{f.name}</span><div className="track"><i style={{width:`${result.scores[f.key]}%`}}/></div><b>{result.scores[f.key]}</b></div>)}</div>
          </div>
          <div className="panel">
            <div className="panelHead"><div><small>MESSAGE PATTERNS</small><h2>What the brand is pushing</h2></div><span className="pill">Observed</span></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>{(result.themes.length ? result.themes : ['No strong theme detected']).map(theme=><span className="pill" key={theme}>{theme}</span>)}</div>
            <div className="detailRow"><span className="muted">Offer signals</span><b>{result.offerHits}</b></div>
            <div className="detailRow"><span className="muted">CTA signals</span><b>{result.ctaHits}</b></div>
            <div className="detailRow"><span className="muted">Trust / proof</span><b>{result.proofHits}</b></div>
            <div className="detailRow"><span className="muted">Urgency signals</span><b>{result.urgencyHits}</b></div>
          </div>
        </section>

        <section className="twoCol">
          <div className="panel"><div className="panelHead"><div><small>CREATIVE MIX</small><h2>Format distribution</h2></div><span className="pill">Auto detected</span></div><div className="metricList" style={{marginTop:16}}><div><span>Video / Reels</span><b>{result.video}</b></div><div><span>Carousel</span><b>{result.carousel}</b></div><div><span>Image / Other</span><b>{result.image}</b></div></div></div>
          <div className="panel"><div className="panelHead"><div><small>NEXT ACTIONS</small><h2>3 recommended moves</h2></div><span className="pill">Evidence-based</span></div>{result.actions.map((action,i)=><div className="insight" key={action}><span className="signal up">{i+1}</span><div><b>{action}</b><p>Based on the ad copy and public signals captured in this analysis.</p></div></div>)}</div>
        </section>

        <section className="panel" style={{marginTop:18}}>
          <div className="panelHead"><div><small>CAPTURE PREVIEW</small><h2>Ads detected in this session</h2></div><span className="pill">{result.records.length} blocks</span></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:16}}>{result.records.slice(0,12).map((record,index)=><article className="factorCard" key={record.id}><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><b>Ad {index+1}</b><span className="pill">{record.libraryId ? `ID ${record.libraryId}` : record.status}</span></div><p className="muted" style={{fontSize:12,lineHeight:1.5,whiteSpace:'pre-line',maxHeight:130,overflow:'hidden'}}>{record.text.slice(0,420)}</p>{record.platforms.length>0 && <span className="sourceText">{record.platforms.join(' · ')}</span>}</article>)}</div>
        </section>

        <section className="panel" style={{marginTop:18}}><div className="panelHead"><div><small>DATA QUALITY</small><h2>Source & limitations</h2></div><span className="pill">Meta Ads Library + ScoutIQ</span></div><p className="muted" style={{fontSize:12}}>Source: visible public Meta Ads Library content captured from the user’s browser session. ScoutIQ does not infer hidden spend, impressions, audience, conversion or performance data. Any unavailable metric remains <b>Unavailable</b>.</p></section>
      </>}
    </main>
  </div>
}

const navLinkStyle = {color:'#C7CEE1',textDecoration:'none',padding:'11px 12px',borderRadius:11,display:'flex',alignItems:'center',gap:11,fontSize:13,fontWeight:650}
const navActiveStyle = {background:'linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)',color:'#fff'}
const fieldStyle = {display:'grid',gap:7}
const labelStyle = {fontSize:12,fontWeight:750}
const inputStyle = {border:'1px solid #E2E6F6',borderRadius:12,padding:'12px',font:'inherit',background:'#fff',color:'#0D1B3D'}
const factorCopy = {
  volume:'How many active ad variations the brand is currently running.',
  creative:'Mix of video/Reels, carousel and static creative.',
  hook:'Clarity and strength of the opening line or first-message hook.',
  offer:'Benefit, promotion, urgency and call-to-action clarity.',
  proof:'Reviews, results, cases, before/after and expert credibility.',
}

function Metric({label,value,sub}) {
  return <div className="panel metricCard"><small>{label.toUpperCase()}</small><strong>{value}</strong><span style={{color:'#667093'}}>{sub}</span></div>
}
