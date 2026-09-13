'use client'

import { useMemo, useState } from 'react'

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
  const lower = text.toLowerCase()
  return words.some(word => lower.includes(word.toLowerCase()))
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function parseAds(raw) {
  return raw
    .split(/\n\s*---+\s*\n|\n\s*\n\s*\n/g)
    .map(item => item.trim())
    .filter(Boolean)
}

function analyzeAds(raw, activeCount) {
  const ads = parseAds(raw)
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
  const formats = [video>0,carousel>0,image>0].filter(Boolean).length

  const scores = {
    volume: clamp(count >= 10 ? 95 : count >= 6 ? 82 : count >= 3 ? 68 : count >= 1 ? 50 : 20),
    creative: clamp(40 + formats*18 + Math.min(12, video*3)),
    hook: clamp(45 + (ads.length ? (shortOpenings/ads.length)*45 : 0) + (urgencyHits ? 8 : 0)),
    offer: clamp(35 + (ads.length ? (offerHits/ads.length)*30 : 0) + (ads.length ? (ctaHits/ads.length)*35 : 0)),
    proof: clamp(35 + (ads.length ? (proofHits/ads.length)*60 : 0)),
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
  if (count < 3) actions.push('Test more active creative variations before drawing strong conclusions.')
  if (!actions.length) actions.push('Keep the winning message and test new hooks, offers and creative variants around it.')

  return { ads, count, video, carousel, image, offerHits, ctaHits, proofHits, urgencyHits, scores, overall, themes, actions:actions.slice(0,3) }
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
  const [brand,setBrand] = useState('')
  const [country,setCountry] = useState('TH')
  const [activeCount,setActiveCount] = useState('')
  const [adText,setAdText] = useState('')
  const [result,setResult] = useState(null)

  const libraryUrl = useMemo(() => {
    const query = encodeURIComponent(brand.trim())
    return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${encodeURIComponent(country)}&q=${query}&search_type=keyword_unordered&media_type=all`
  }, [brand,country])

  const run = () => setResult(analyzeAds(adText, activeCount))

  return <div className="appShell">
    <aside className="sidebar">
      <ScoutLogo />
      <nav>
        <a href="/" style={navLinkStyle}><span className="navIcon">⌂</span><span className="navLabel">Dashboard</span></a>
        <a href="/" style={navLinkStyle}><span className="navIcon">◉</span><span className="navLabel">Analyze</span></a>
        <a href="/instagram" style={navLinkStyle}><span className="navIcon">◎</span><span className="navLabel">Instagram Analytics</span></a>
        <a href="/ads-library" style={{...navLinkStyle,...navActiveStyle}}><span className="navIcon">✦</span><span className="navLabel">Ads Library</span></a>
      </nav>
      <div className="sideCard"><small>AD INTELLIGENCE</small><strong>See the message.<br/>Find the pattern.</strong><p>Turn public ad signals into clearer creative and offer decisions.</p><span>ScoutIQ v.1</span></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><small>PAID MEDIA INTELLIGENCE</small><h1>Ads Library Analysis</h1></div>
        <div className="account"><div className="avatar">S</div><div><b>ScoutIQ</b><span>Social Media Analytics Platform</span><span>Built by Rank-Path</span></div></div>
      </header>

      <section className="panel" style={{padding:28}}>
        <div className="panelHead"><div><small>META ADS LIBRARY</small><h2>Analyze a brand's active ads</h2></div><span className="pill">Assisted analysis v1</span></div>
        <p className="muted" style={{maxWidth:900}}>Search the brand in Meta Ads Library, then paste the visible ad copy or notes here. ScoutIQ analyzes ad volume, creative variety, hooks, offers, CTA and trust signals without pretending unavailable metrics are known.</p>

        <div style={{display:'grid',gridTemplateColumns:'minmax(220px,1.6fr) minmax(120px,.5fr) minmax(140px,.6fr)',gap:12,marginTop:20}}>
          <label style={fieldStyle}><span style={labelStyle}>Brand / Page name</span><input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="e.g. The Art Hospital" style={inputStyle}/></label>
          <label style={fieldStyle}><span style={labelStyle}>Country</span><select value={country} onChange={e=>setCountry(e.target.value)} style={inputStyle}><option value="TH">Thailand</option><option value="SG">Singapore</option><option value="VN">Vietnam</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="FR">France</option></select></label>
          <label style={fieldStyle}><span style={labelStyle}>Active ads found</span><input value={activeCount} onChange={e=>setActiveCount(e.target.value)} type="number" min="0" placeholder="e.g. 8" style={inputStyle}/></label>
        </div>

        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}>
          <a className="primary" href={brand.trim()?libraryUrl:'#'} target="_blank" rel="noreferrer" style={{textDecoration:'none',opacity:brand.trim()?1:.55,pointerEvents:brand.trim()?'auto':'none'}}>Open Meta Ads Library ↗</a>
          <span className="muted" style={{fontSize:12,alignSelf:'center'}}>Use the same country and active-ad view for every brand you compare.</span>
        </div>
      </section>

      <section className="panel" style={{marginTop:18}}>
        <div className="panelHead"><div><small>AD CAPTURE</small><h2>Paste ad copy / observations</h2></div><span className="pill">1 ad per block</span></div>
        <p className="muted" style={{fontSize:12}}>Copy visible primary text, headline and notes such as “Video”, “Carousel”, “Review”, “Book now”. Separate ads with a blank line + <b>---</b> + blank line.</p>
        <textarea value={adText} onChange={e=>setAdText(e.target.value)} placeholder={'Example:\nVideo / Reel\nFree consultation. Book now. Doctor review case...\n\n---\n\nCarousel\nSpecial promotion 20% off. Message us today...'} style={{...inputStyle,width:'100%',minHeight:210,resize:'vertical',lineHeight:1.5}}/>
        <div style={{display:'flex',gap:10,marginTop:12,flexWrap:'wrap'}}><button className="primary" type="button" onClick={run}>Analyze Ads</button><button className="secondary" type="button" onClick={()=>{setAdText('');setActiveCount('');setResult(null)}}>Clear</button></div>
      </section>

      {!result && <section className="panel" style={{marginTop:18}}><small>WHAT SCOUTIQ CHECKS</small><h2>Ad analysis framework</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginTop:16}}>{FACTORS.map(f=><div className="factorCard" key={f.key}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><b>{f.name}</b><span className="pill">{f.weight}%</span></div><p className="muted" style={{fontSize:12}}>{factorCopy[f.key]}</p></div>)}</div><div className="notice"><b>Data note:</b> ScoutIQ does not infer spend, impressions, targeting or conversions when those values are not publicly available.</div></section>}

      {result && <>
        <section className="metricGrid">
          <Metric label="Ads analyzed" value={result.ads.length || result.count} sub="Captured / observed" />
          <Metric label="Active ads" value={result.count} sub="Entered from Ads Library" />
          <Metric label="Video / Reels" value={result.video} sub="Detected in pasted notes" />
          <Metric label="ScoutIQ Ads Score" value={`${result.overall}/100`} sub="Rule-based v1" />
        </section>

        <section className="twoCol">
          <div className="panel">
            <div className="panelHead"><div><small>SCORE BREAKDOWN</small><h2>Paid Ads Activity</h2></div><span className="pill">Public signals</span></div>
            <div className="bars">{FACTORS.map(f=><div className="barRow" key={f.key}><span>{f.name}</span><div className="track"><i style={{width:`${result.scores[f.key]}%`}}/></div><b>{result.scores[f.key]}</b></div>)}</div>
          </div>
          <div className="panel">
            <div className="panelHead"><div><small>MESSAGE PATTERNS</small><h2>What the brand is pushing</h2></div><span className="pill">Observed</span></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>{(result.themes.length?result.themes:['No strong theme detected']).map(theme=><span className="pill" key={theme}>{theme}</span>)}</div>
            <div className="detailRow"><span className="muted">Offer signals</span><b>{result.offerHits}</b></div>
            <div className="detailRow"><span className="muted">CTA signals</span><b>{result.ctaHits}</b></div>
            <div className="detailRow"><span className="muted">Trust / proof</span><b>{result.proofHits}</b></div>
            <div className="detailRow"><span className="muted">Urgency signals</span><b>{result.urgencyHits}</b></div>
          </div>
        </section>

        <section className="twoCol">
          <div className="panel"><div className="panelHead"><div><small>CREATIVE MIX</small><h2>Format distribution</h2></div><span className="pill">From pasted notes</span></div><div className="metricList" style={{marginTop:16}}><div><span>Video / Reels</span><b>{result.video}</b></div><div><span>Carousel</span><b>{result.carousel}</b></div><div><span>Image / Other</span><b>{result.image}</b></div></div></div>
          <div className="panel"><div className="panelHead"><div><small>NEXT ACTIONS</small><h2>3 recommended moves</h2></div><span className="pill">Evidence-based</span></div>{result.actions.map((action,i)=><div className="insight" key={action}><span className="signal up">{i+1}</span><div><b>{action}</b><p>Based on the ad copy and public signals captured in this analysis.</p></div></div>)}</div>
        </section>

        <section className="panel" style={{marginTop:18}}><div className="panelHead"><div><small>DATA QUALITY</small><h2>Source & limitations</h2></div><span className="pill">Meta Ads Library + ScoutIQ</span></div><p className="muted" style={{fontSize:12}}>Source: public Meta Ads Library observations entered by the user. Missing spend, impressions, audience, conversion and performance data remain <b>Unavailable</b> unless a supported authorized data source provides them.</p></section>
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
