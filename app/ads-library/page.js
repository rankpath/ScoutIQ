'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const COMPARE_FACTORS = [
  { key:'hook', name:'Hook', weight:20, description:'Opening line / first-message strength.' },
  { key:'offer', name:'Offer', weight:20, description:'Benefit, promotion and urgency clarity.' },
  { key:'cta', name:'CTA', weight:20, description:'Clarity of the next action: book, message, call or learn more.' },
  { key:'creative', name:'Creative', weight:20, description:'Variety across video/Reels, carousel and image formats.' },
  { key:'proof', name:'Proof', weight:20, description:'Reviews, cases, results, before/after and expert credibility.' },
]

const offerWords = ['%', 'discount', 'sale', 'promo', 'promotion', 'special', 'free', 'deal', 'package', 'เริ่ม', 'ลด', 'โปร', 'โปรโมชั่น', 'ฟรี', 'ราคา', 'แพ็กเกจ']
const ctaWords = ['book', 'booking', 'message', 'dm', 'contact', 'learn more', 'shop now', 'call', 'inbox', 'appointment', 'จอง', 'ทัก', 'แชท', 'ติดต่อ', 'ปรึกษา', 'นัดหมาย']
const proofWords = ['review', 'testimonial', 'before', 'after', 'doctor', 'expert', 'case', 'result', 'patient', 'รีวิว', 'ก่อน', 'หลัง', 'แพทย์', 'หมอ', 'เคส', 'ผลลัพธ์', 'คนไข้']
const videoWords = ['video', 'reel', 'reels', 'วีดีโอ', 'วิดีโอ']
const carouselWords = ['carousel', 'album', 'หลายภาพ', 'สไลด์']
const urgencyWords = ['today', 'now', 'limited', 'last chance', 'ends', 'only', 'วันนี้', 'ด่วน', 'จำนวนจำกัด', 'หมดเขต', 'เท่านั้น']
const STORAGE_KEY = 'scoutiq-ads-competitor-v12'
const MAX_ADS_PER_BRAND = 60

function includesAny(text, words) {
  const lower = String(text || '').toLowerCase()
  return words.some(word => lower.includes(word.toLowerCase()))
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
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
      .filter(item => /active|sponsored|facebook|instagram|video|reel|carousel|book|message|จอง|ทัก|โฆษณา/i.test(item))
  }

  const seen = new Set()
  return blocks
    .map((block, index) => {
      const idMatch = block.match(/(?:Library ID|Ad Library ID|รหัสคลังโฆษณา|รหัสไลบรารี)\s*:?\s*(\d+)/i)
      const libraryId = idMatch?.[1] || ''
      const key = libraryId || block.slice(0, 220).toLowerCase()
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
    .slice(0, MAX_ADS_PER_BRAND)
}

function analyzeAds(raw) {
  const records = extractMetaAds(raw)
  const ads = records.map(item => item.text)
  if (!ads.length) return null

  const joined = ads.join('\n').toLowerCase()
  const video = ads.filter(ad => includesAny(ad, videoWords)).length
  const carousel = ads.filter(ad => includesAny(ad, carouselWords)).length
  const image = Math.max(0, ads.length - video - carousel)
  const offerHits = ads.filter(ad => includesAny(ad, offerWords)).length
  const ctaHits = ads.filter(ad => includesAny(ad, ctaWords)).length
  const proofHits = ads.filter(ad => includesAny(ad, proofWords)).length
  const urgencyHits = ads.filter(ad => includesAny(ad, urgencyWords)).length
  const shortOpenings = ads.filter(ad => {
    const opening = (ad.split(/\n|[.!?]/)[0] || '').trim()
    return opening.length > 0 && opening.length <= 85
  }).length
  const formats = [video > 0, carousel > 0, image > 0].filter(Boolean).length
  const ratio = value => ads.length ? value / ads.length : 0

  const scores = {
    hook: clamp(42 + ratio(shortOpenings) * 48 + ratio(urgencyHits) * 10),
    offer: clamp(34 + ratio(offerHits) * 54 + ratio(urgencyHits) * 12),
    cta: clamp(30 + ratio(ctaHits) * 68),
    creative: clamp(34 + formats * 18 + Math.min(12, video * 3)),
    proof: clamp(34 + ratio(proofHits) * 64),
  }

  const overall = Math.round(COMPARE_FACTORS.reduce((sum, factor) => sum + scores[factor.key] * factor.weight / 100, 0))

  const themes = []
  if (offerHits) themes.push('Promotion / Price')
  if (proofHits) themes.push('Review / Proof')
  if (joined.includes('doctor') || joined.includes('แพทย์') || joined.includes('หมอ')) themes.push('Expert / Doctor')
  if (urgencyHits) themes.push('Urgency')
  if (video) themes.push('Video / Reels')
  if (carousel) themes.push('Carousel')

  return {
    records,
    ads,
    count: ads.length,
    video,
    carousel,
    image,
    offerHits,
    ctaHits,
    proofHits,
    urgencyHits,
    scores,
    overall,
    themes,
  }
}

function getRecommendations(yourResult, ranked) {
  if (!yourResult) return []
  const competitors = ranked.filter(item => item.role !== 'Your Brand' && item.result)
  if (!competitors.length) return ['Capture at least one competitor to generate evidence-based gap recommendations.']

  const bestByFactor = COMPARE_FACTORS.map(factor => {
    const best = [...competitors].sort((a,b) => b.result.scores[factor.key] - a.result.scores[factor.key])[0]
    const yourScore = yourResult.scores[factor.key]
    const gap = best.result.scores[factor.key] - yourScore
    return { factor, best, yourScore, gap }
  }).sort((a,b) => b.gap - a.gap)

  return bestByFactor.slice(0,3).map(item => {
    if (item.gap <= 0) return `${item.factor.name}: you already match or lead the captured competitors. Keep testing new variants to defend the advantage.`
    return `${item.factor.name}: ${item.best.name} leads by ${item.gap} points (${item.best.result.scores[item.factor.key]} vs ${item.yourScore}). Review its visible ${item.factor.name.toLowerCase()} pattern and test a stronger variant.`
  })
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

function emptyBrand(role) {
  return { role, name:'', country:'TH', raw:'', source:'', capturedAt:'' }
}

export default function AdsLibraryPage() {
  const [brands, setBrands] = useState([
    emptyBrand('Your Brand'),
    emptyBrand('Competitor 1'),
    emptyBrand('Competitor 2'),
    emptyBrand('Competitor 3'),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [captureStatus, setCaptureStatus] = useState('Ready — add your brand and 3 competitors.')
  const [bookmarklet, setBookmarklet] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const bookmarkRef = useRef(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved?.brands?.length === 4) setBrands(saved.brands)
      if (Number.isInteger(saved?.selectedIndex)) setSelectedIndex(Math.max(0, Math.min(3, saved.selectedIndex)))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ brands, selectedIndex })) } catch {}
  }, [brands, selectedIndex, hydrated])

  const results = useMemo(() => brands.map(brand => analyzeAds(brand.raw)), [brands])

  const ranked = useMemo(() => brands
    .map((brand, index) => ({ ...brand, index, result:results[index], name:brand.name.trim() || brand.role }))
    .filter(item => item.result)
    .sort((a,b) => b.result.overall - a.result.overall), [brands, results])

  const recommendations = useMemo(() => getRecommendations(results[0], ranked), [results, ranked])

  const updateBrand = (index, patch) => {
    setBrands(current => current.map((item, i) => i === index ? { ...item, ...patch } : item))
  }

  const libraryUrl = brand => {
    const query = encodeURIComponent(brand.name.trim())
    return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${encodeURIComponent(brand.country)}&q=${query}&search_type=keyword_unordered&media_type=all`
  }

  const resolveCaptureIndex = brandHint => {
    const hint = normalizeName(brandHint)
    if (hint) {
      const found = brands.findIndex(item => normalizeName(item.name) === hint)
      if (found >= 0) return found
    }
    return selectedIndex
  }

  const importCapture = (raw, source='Meta Ads Library', brandHint='') => {
    const records = extractMetaAds(raw)
    if (!records.length) {
      setCaptureStatus('No ad blocks detected. Scroll the Ads Library results until ads are visible, then capture again.')
      return false
    }

    const targetIndex = resolveCaptureIndex(brandHint)
    const normalized = records.map(item => item.text).join('\n\n---\n\n')
    const label = brands[targetIndex]?.name?.trim() || brands[targetIndex]?.role || `Brand ${targetIndex + 1}`
    updateBrand(targetIndex, {
      raw: normalized,
      source,
      capturedAt: new Date().toLocaleString(),
    })
    setSelectedIndex(targetIndex)
    setCaptureStatus(`${records.length} ads captured for ${label}. Ranking updated automatically.`)
    return true
  }

  useEffect(() => {
    const origin = window.location.origin
    const target = `${origin}/ads-library?autocapture=1`
    const code = `javascript:(()=>{try{const u=new URL(location.href);const payload={type:'SCOUTIQ_AD_CAPTURE_V12',text:document.body.innerText||'',source:location.href,title:document.title,searchBrand:u.searchParams.get('q')||''};const w=window.open('${target}','scoutiq_capture');const send=()=>{try{w&&w.postMessage(payload,'${origin}')}catch(e){}};setTimeout(send,900);setTimeout(send,1900);setTimeout(send,3200)}catch(e){alert('ScoutIQ capture failed')}})()`
    setBookmarklet(code)

    const receiveCapture = event => {
      const data = event.data
      if (!data || data.type !== 'SCOUTIQ_AD_CAPTURE_V12' || typeof data.text !== 'string') return
      const allowed = event.origin === 'https://www.facebook.com' || event.origin.endsWith('.facebook.com') || event.origin.endsWith('.meta.com')
      if (!allowed) return
      importCapture(data.text, data.source || 'Meta Ads Library', data.searchBrand || '')
    }

    window.addEventListener('message', receiveCapture)
    return () => window.removeEventListener('message', receiveCapture)
  }, [brands, selectedIndex])

  useEffect(() => {
    if (bookmarkRef.current && bookmarklet) bookmarkRef.current.setAttribute('href', bookmarklet)
  }, [bookmarklet])

  const copyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(bookmarklet)
      setCaptureStatus('Bookmarklet code copied. Create a browser bookmark and paste it into the bookmark URL field.')
    } catch {
      setCaptureStatus('Could not copy automatically. Drag the ScoutIQ Capture button to the bookmarks bar instead.')
    }
  }

  const importClipboard = async index => {
    setSelectedIndex(index)
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        setCaptureStatus('Clipboard is empty.')
        return
      }
      importCapture(text, 'Clipboard capture from Meta Ads Library', brands[index].name)
    } catch {
      setCaptureStatus('Clipboard permission was blocked. Use Paste Capture for this brand instead.')
    }
  }

  const pasteCapture = index => {
    setSelectedIndex(index)
    const pasted = window.prompt(`Paste visible Meta Ads Library text for ${brands[index].name || brands[index].role}`)
    if (pasted) importCapture(pasted, 'Manual paste from Meta Ads Library', brands[index].name)
  }

  const clearBrand = index => {
    updateBrand(index, { raw:'', source:'', capturedAt:'' })
    setCaptureStatus(`${brands[index].name || brands[index].role} capture cleared.`)
  }

  const clearAll = () => {
    setBrands([
      emptyBrand('Your Brand'),
      emptyBrand('Competitor 1'),
      emptyBrand('Competitor 2'),
      emptyBrand('Competitor 3'),
    ])
    setSelectedIndex(0)
    setCaptureStatus('Ready — add your brand and 3 competitors.')
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  return <div className="appShell">
    <aside className="sidebar">
      <ScoutLogo />
      <nav>
        <a href="/" style={navLinkStyle}><span className="navIcon">⌂</span><span className="navLabel">Dashboard</span></a>
        <a href="/instagram" style={navLinkStyle}><span className="navIcon">◎</span><span className="navLabel">Instagram Analytics</span></a>
        <a href="/ads-library" style={{...navLinkStyle,...navActiveStyle}}><span className="navIcon">✦</span><span className="navLabel">Ads Competitor</span></a>
      </nav>
      <div className="sideCard"><small>AUTO ADS COMPETITOR</small><strong>4 Brands → Ads →<br/>Compare → Rank.</strong><p>Capture your brand and three competitors, then compare visible paid-media signals.</p><span>ScoutIQ v1.2</span></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><small>PAID MEDIA COMPETITOR INTELLIGENCE</small><h1>Auto Ads Competitor v1.2</h1></div>
        <div className="account"><div className="avatar">S</div><div><b>ScoutIQ</b><span>Social Media Analytics Platform</span><span>Built by Rank-Path</span></div></div>
      </header>

      <section className="panel" style={{padding:28}}>
        <div className="panelHead"><div><small>4-BRAND WORKFLOW</small><h2>Your Brand + 3 Competitors → Capture → Compare → Rank</h2></div><span className="pill">Auto ranking</span></div>
        <p className="muted" style={{maxWidth:960}}>Use the same country and visible Ads Library view for all four brands. ScoutIQ compares Hook, Offer, CTA, Creative and Proof using the captured public ad content. Missing hidden metrics remain Unavailable.</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:12,marginTop:20}}>
          {brands.map((brand,index) => {
            const result = results[index]
            const url = libraryUrl(brand)
            return <article className="factorCard" key={brand.role} style={{borderColor:selectedIndex===index?'#9F91F5':'#E2E6F6'}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><b>{brand.role}</b><span className="pill">{result ? `${result.overall}/100` : 'Waiting'}</span></div>
              <label style={{...fieldStyle,marginTop:12}}><span style={labelStyle}>Brand / Page name</span><input value={brand.name} onFocus={()=>setSelectedIndex(index)} onChange={e=>updateBrand(index,{name:e.target.value})} placeholder={index===0?'e.g. The Art Hospital':`Competitor ${index}`} style={inputStyle}/></label>
              <label style={{...fieldStyle,marginTop:10}}><span style={labelStyle}>Country</span><select value={brand.country} onChange={e=>updateBrand(index,{country:e.target.value})} style={inputStyle}><option value="TH">Thailand</option><option value="SG">Singapore</option><option value="VN">Vietnam</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="FR">France</option></select></label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
                <a className="secondary" href={brand.name.trim()?url:'#'} target="_blank" rel="noreferrer" onClick={()=>setSelectedIndex(index)} style={{textDecoration:'none',opacity:brand.name.trim()?1:.5,pointerEvents:brand.name.trim()?'auto':'none'}}>Open Ads Library ↗</a>
                <button className="secondary" type="button" onClick={()=>importClipboard(index)}>Import Clipboard</button>
                <button className="secondary" type="button" onClick={()=>pasteCapture(index)}>Paste Capture</button>
              </div>
              <div style={{marginTop:12,fontSize:12}}><span className="sourceText">{result ? `${result.count} ads captured` : 'No ads captured yet'}</span>{brand.capturedAt && <p className="muted" style={{margin:'6px 0 0'}}>Last capture: {brand.capturedAt}</p>}</div>
              {result && <button className="secondary" type="button" onClick={()=>clearBrand(index)} style={{marginTop:10}}>Clear capture</button>}
            </article>
          })}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:16}}>
          <div className="factorCard"><b>Desktop one-click capture</b><p className="muted" style={{fontSize:12,lineHeight:1.5}}>Drag this once to your bookmarks bar. Open each brand through its Ads Library button, scroll until the ads load, then click the bookmark. ScoutIQ reads the search brand from the Ads Library URL and assigns the capture automatically.</p>{bookmarklet && <><a ref={bookmarkRef} href="#" className="secondary" style={{display:'inline-block',textDecoration:'none'}}>ScoutIQ Capture v1.2 ✦</a><button className="secondary" type="button" onClick={copyBookmarklet} style={{marginLeft:8}}>Copy code</button></>}</div>
          <div className="factorCard"><b>Capture status</b><p style={{fontSize:13,fontWeight:750,margin:'10px 0 4px'}}>{captureStatus}</p><span className="sourceText">Selected target: {brands[selectedIndex]?.name || brands[selectedIndex]?.role}</span></div>
          <div className="factorCard"><b>Fair comparison rule</b><p className="muted" style={{fontSize:12,lineHeight:1.5}}>Capture all brands with the same country, active-ad filter and similar scroll depth. Up to {MAX_ADS_PER_BRAND} visible ads per brand are kept to protect browser storage and keep comparisons stable.</p></div>
        </div>

        <div style={{marginTop:14}}><button className="secondary" type="button" onClick={clearAll}>Reset all 4 brands</button></div>
        <div className="notice"><b>Data boundary:</b> ScoutIQ analyzes only visible public ad content captured from Meta Ads Library. Spend, impressions, targeting, conversions and other hidden performance metrics remain <b>Unavailable</b>.</div>
      </section>

      <section className="panel" style={{marginTop:18}}>
        <div className="panelHead"><div><small>AUTO RANKING</small><h2>Ads competitor leaderboard</h2></div><span className="pill">Hook · Offer · CTA · Creative · Proof</span></div>
        {!ranked.length && <p className="muted">Capture at least one brand to start. The leaderboard updates automatically after every capture.</p>}
        <div className="bars">{ranked.map((item,index)=><div className="barRow" key={`${item.role}-${item.name}`}><span><b className={index===0?'rankTop':'rankMuted'}>#{index+1}</b>{item.name}</span><div className="track"><i style={{width:`${item.result.overall}%`}}/></div><b>{item.result.overall}</b></div>)}</div>
      </section>

      {ranked.length > 0 && <>
        <section className="panel" style={{marginTop:18}}>
          <div className="panelHead"><div><small>FACTOR COMPARISON</small><h2>Where each brand wins</h2></div><span className="pill">Equal 20% weights</span></div>
          <div style={{overflowX:'auto',marginTop:14}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:720,fontSize:12}}>
              <thead><tr><th style={thStyle}>Factor</th>{brands.map(brand=><th key={brand.role} style={thStyle}>{brand.name || brand.role}</th>)}</tr></thead>
              <tbody>{COMPARE_FACTORS.map(factor => {
                const available = results.map(result => result?.scores[factor.key]).filter(value => Number.isFinite(value))
                const best = available.length ? Math.max(...available) : null
                return <tr key={factor.key}><td style={tdStyle}><b>{factor.name}</b><div className="muted" style={{fontSize:10}}>{factor.description}</div></td>{results.map((result,index) => {
                  const value = result?.scores[factor.key]
                  const isBest = Number.isFinite(value) && value === best
                  return <td key={`${factor.key}-${index}`} style={{...tdStyle,fontWeight:isBest?850:650,color:isBest?'#5C4DE8':'#0D1B3D'}}>{Number.isFinite(value)?value:'Unavailable'}{isBest?' ★':''}</td>
                })}</tr>
              })}</tbody>
              <tfoot><tr><td style={tdStyle}><b>Overall</b></td>{results.map((result,index)=><td key={`overall-${index}`} style={tdStyle}><b>{result ? `${result.overall}/100` : 'Unavailable'}</b></td>)}</tr></tfoot>
            </table>
          </div>
        </section>

        <section className="twoCol">
          <div className="panel">
            <div className="panelHead"><div><small>YOUR BRAND GAPS</small><h2>3 prioritized moves</h2></div><span className="pill">Evidence-based</span></div>
            {(recommendations.length?recommendations:['Capture Your Brand to generate recommendations.']).map((action,index)=><div className="insight" key={`${action}-${index}`}><span className="signal up">{index+1}</span><div><b>{action}</b><p>Based only on the public ad content captured in this comparison set.</p></div></div>)}
          </div>
          <div className="panel">
            <div className="panelHead"><div><small>LEADER PATTERNS</small><h2>What the top brand is pushing</h2></div><span className="pill">Observed</span></div>
            {ranked[0] && <><p style={{fontWeight:800,marginBottom:8}}>{ranked[0].name} · {ranked[0].result.overall}/100</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{(ranked[0].result.themes.length?ranked[0].result.themes:['No strong theme detected']).map(theme=><span className="pill" key={theme}>{theme}</span>)}</div><div className="metricList" style={{marginTop:16}}><div><span>Ads captured</span><b>{ranked[0].result.count}</b></div><div><span>Video / Reels</span><b>{ranked[0].result.video}</b></div><div><span>Carousel</span><b>{ranked[0].result.carousel}</b></div><div><span>Image / Other</span><b>{ranked[0].result.image}</b></div></div></>}
          </div>
        </section>

        <section className="panel" style={{marginTop:18}}>
          <div className="panelHead"><div><small>CAPTURE QUALITY CHECK</small><h2>Recheck before trusting the ranking</h2></div><span className="pill">QA</span></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginTop:14}}>{brands.map((brand,index)=>{
            const result=results[index]
            const status = !brand.name.trim() ? 'Missing brand name' : !result ? 'No capture' : result.count < 3 ? 'Low sample' : 'Ready'
            return <div className="factorCard" key={`qa-${brand.role}`}><b>{brand.name || brand.role}</b><p className="muted" style={{fontSize:12}}>{status === 'Ready' ? `${result.count} ad blocks detected. Capture is usable for directional comparison.` : status === 'Low sample' ? `Only ${result.count} ad block(s) detected. Capture more before relying on the rank.` : status === 'No capture' ? 'No Ads Library content has been captured yet.' : 'Add the brand/page name before capture.'}</p><span className="sourceText">Status: {status}</span></div>
          })}</div>
        </section>
      </>}
    </main>
  </div>
}

const navLinkStyle = {color:'#C7CEE1',textDecoration:'none',padding:'11px 12px',borderRadius:11,display:'flex',alignItems:'center',gap:11,fontSize:13,fontWeight:650}
const navActiveStyle = {background:'linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)',color:'#fff'}
const fieldStyle = {display:'grid',gap:7}
const labelStyle = {fontSize:12,fontWeight:750}
const inputStyle = {border:'1px solid #E2E6F6',borderRadius:12,padding:'12px',font:'inherit',background:'#fff',color:'#0D1B3D',width:'100%'}
const thStyle = {textAlign:'left',padding:'11px 10px',borderBottom:'1px solid #E2E6F6',color:'#667093',fontSize:10,textTransform:'uppercase',letterSpacing:'.05em'}
const tdStyle = {padding:'12px 10px',borderBottom:'1px solid #EEF0F5',verticalAlign:'top'}
