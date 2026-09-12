'use client'

import { useMemo, useState } from 'react'

const weights = {
  profile: 20,
  consistency: 15,
  engagement: 25,
  creative: 15,
  relevance: 15,
  offer: 10,
}

const factorLabels = {
  profile: 'Profile & discoverability',
  consistency: 'Content consistency',
  engagement: 'Public engagement',
  creative: 'Creative quality',
  relevance: 'Content relevance',
  offer: 'Offer & CTA',
}

const blankCompetitor = () => ({
  handle: '',
  followers: '',
  postsPerWeek: '',
  avgLikes: '',
  avgComments: '',
  profileScore: '',
  creativeScore: '',
  relevanceScore: '',
  offerScore: '',
})

const emptyOwn = {
  handle: '',
  followers: '',
  postsPerWeek: '',
  avgLikes: '',
  avgComments: '',
  reelsShare: '',
  bioKeywords: '',
  hasLocation: false,
  hasBooking: false,
  hasMessageCta: false,
  creativeScore: '',
  relevanceScore: '',
  topFormat: '',
  bestPost: '',
  postsAnalyzed: '',
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function engagementRate(account) {
  const followers = toNumber(account.followers)
  const likes = toNumber(account.avgLikes)
  const comments = toNumber(account.avgComments)
  if (!followers || followers <= 0 || likes === null || comments === null) return null
  return ((likes + comments) / followers) * 100
}

function engagementScore(rate) {
  if (rate === null) return null
  if (rate >= 5) return 95
  if (rate >= 3) return 85
  if (rate >= 2) return 75
  if (rate >= 1) return 62
  if (rate >= 0.5) return 48
  return 32
}

function consistencyScore(postsPerWeek) {
  const posts = toNumber(postsPerWeek)
  if (posts === null) return null
  if (posts >= 5) return 95
  if (posts >= 4) return 88
  if (posts >= 3) return 78
  if (posts >= 2) return 65
  if (posts >= 1) return 48
  return 25
}

function ownProfileScore(account) {
  if (!String(account.handle || '').trim()) return null
  let score = 45
  const keywordCount = toNumber(account.bioKeywords)
  if (keywordCount !== null) score += Math.min(keywordCount, 4) * 8
  if (account.hasLocation) score += 10
  if (account.hasBooking) score += 13
  return clamp(score)
}

function ownOfferScore(account) {
  if (!String(account.handle || '').trim()) return null
  let score = 42
  if (account.hasBooking) score += 30
  if (account.hasMessageCta) score += 23
  return clamp(score)
}

function ownFactors(account) {
  return {
    profile: ownProfileScore(account),
    consistency: consistencyScore(account.postsPerWeek),
    engagement: engagementScore(engagementRate(account)),
    creative: toNumber(account.creativeScore),
    relevance: toNumber(account.relevanceScore),
    offer: ownOfferScore(account),
  }
}

function competitorFactors(account) {
  return {
    profile: toNumber(account.profileScore),
    consistency: consistencyScore(account.postsPerWeek),
    engagement: engagementScore(engagementRate(account)),
    creative: toNumber(account.creativeScore),
    relevance: toNumber(account.relevanceScore),
    offer: toNumber(account.offerScore),
  }
}

function overallScore(factors) {
  const keys = Object.keys(weights)
  if (keys.some(key => factors[key] === null)) return null
  const total = keys.reduce((sum, key) => sum + factors[key] * weights[key], 0)
  return Math.round(total / 100)
}

function avg(values) {
  const available = values.filter(value => value !== null && Number.isFinite(value))
  if (!available.length) return null
  return available.reduce((sum, value) => sum + value, 0) / available.length
}

function formatPct(value, digits = 2) {
  return value === null ? 'Unavailable' : `${value.toFixed(digits)}%`
}

function formatScore(value) {
  return value === null ? 'Unavailable' : `${Math.round(value)}/100`
}

function ScoutLogo() {
  return <div className="brandLockup">
    <svg className="scoutLogoMark" viewBox="0 0 64 64" role="img" aria-label="ScoutIQ logo">
      <defs><linearGradient id="igScoutGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient></defs>
      <circle cx="31" cy="33" r="7" fill="url(#igScoutGradient)"/>
      <path d="M31 16a17 17 0 1 0 17 17" fill="none" stroke="url(#igScoutGradient)" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M31 7A26 26 0 1 0 57 33" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" opacity=".96"/>
      <path d="M36 5c12 2 21 12 23 24" fill="none" stroke="url(#igScoutGradient)" strokeWidth="5.5" strokeLinecap="round"/>
    </svg>
    <div className="brandText"><strong>Scout<span>IQ</span></strong><small>From Data to Next Move.</small></div>
  </div>
}

export default function InstagramAnalyticsPage() {
  const [own, setOwn] = useState(emptyOwn)
  const [competitors, setCompetitors] = useState([blankCompetitor(), blankCompetitor(), blankCompetitor()])
  const [dateRange, setDateRange] = useState('7 days')
  const [connected, setConnected] = useState(false)
  const [privateInsights, setPrivateInsights] = useState({ reach:'', views:'', saves:'', shares:'', followerTrend:'' })
  const [lastUpdated, setLastUpdated] = useState('Not calculated yet')

  const ownResult = useMemo(() => {
    const factors = ownFactors(own)
    return { factors, overall: overallScore(factors), engagement: engagementRate(own) }
  }, [own])

  const competitorResults = useMemo(() => competitors.map((competitor, index) => {
    const factors = competitorFactors(competitor)
    return {
      index,
      handle: competitor.handle.trim() || `Competitor ${index + 1}`,
      factors,
      overall: overallScore(factors),
      engagement: engagementRate(competitor),
      postsPerWeek: toNumber(competitor.postsPerWeek),
    }
  }), [competitors])

  const competitorAvg = useMemo(() => ({
    overall: avg(competitorResults.map(item => item.overall)),
    engagement: avg(competitorResults.map(item => item.engagement)),
    postsPerWeek: avg(competitorResults.map(item => item.postsPerWeek)),
    factors: Object.fromEntries(Object.keys(weights).map(key => [key, avg(competitorResults.map(item => item.factors[key]))])),
  }), [competitorResults])

  const actions = useMemo(() => {
    const list = []
    const ownPosts = toNumber(own.postsPerWeek)
    const ownRate = ownResult.engagement
    const reelsShare = toNumber(own.reelsShare)

    if (ownPosts !== null && competitorAvg.postsPerWeek !== null && ownPosts < competitorAvg.postsPerWeek) {
      list.push({
        title: 'Increase posting consistency',
        evidence: `You post ${ownPosts.toFixed(1)} times/week vs ${competitorAvg.postsPerWeek.toFixed(1)} competitor average.`
      })
    }
    if (ownRate !== null && competitorAvg.engagement !== null && ownRate < competitorAvg.engagement) {
      list.push({
        title: 'Improve public engagement',
        evidence: `Your engagement is ${ownRate.toFixed(2)}% vs ${competitorAvg.engagement.toFixed(2)}% competitor average.`
      })
    }
    if (reelsShare !== null && reelsShare < 35) {
      list.push({
        title: 'Increase Reels share',
        evidence: `Reels are ${reelsShare.toFixed(0)}% of your content mix. Test a higher short-form video share.`
      })
    }
    if (ownResult.factors.profile !== null && ownResult.factors.profile < 75) {
      list.push({
        title: 'Strengthen profile discoverability',
        evidence: `Profile & discoverability score is ${ownResult.factors.profile}/100. Add service keywords, location and a clear booking path.`
      })
    }
    if (ownResult.factors.offer !== null && ownResult.factors.offer < 75) {
      list.push({
        title: 'Make the booking CTA clearer',
        evidence: `Offer & CTA score is ${ownResult.factors.offer}/100. Make the next step obvious in bio and content.`
      })
    }
    if (toNumber(own.creativeScore) !== null && toNumber(own.creativeScore) < 75) {
      list.push({
        title: 'Improve creative clarity',
        evidence: `Creative Quality rubric is ${own.creativeScore}/100. Strengthen opening hooks, covers and visual hierarchy.`
      })
    }
    while (list.length < 3) {
      list.push({
        title: list.length === 0 ? 'Complete the public-signal inputs' : 'Add more competitor evidence',
        evidence: 'More complete same-range data will make the comparison and recommendations more reliable.'
      })
    }
    return list.slice(0, 3)
  }, [own, ownResult, competitorAvg])

  const updateOwn = (key, value) => setOwn(current => ({...current, [key]: value}))
  const updateCompetitor = (index, key, value) => setCompetitors(current => current.map((item, i) => i === index ? {...item, [key]: value} : item))
  const calculate = () => setLastUpdated(new Date().toLocaleString())

  return <div className="appShell">
    <aside className="sidebar">
      <ScoutLogo />
      <nav>
        <button type="button" onClick={()=>window.location.href='/'}><span className="navIcon">⌂</span><span className="navLabel">Dashboard</span></button>
        <button type="button" onClick={()=>window.location.href='/'}><span className="navIcon">◉</span><span className="navLabel">Facebook Analytics</span></button>
        <button type="button" className="active" data-instagram-nav="true"><span className="navIcon">◎</span><span className="navLabel">Instagram Analytics</span></button>
        <button type="button" onClick={()=>window.location.href='/'}><span className="navIcon">▤</span><span className="navLabel">Content</span></button>
      </nav>
      <div className="sideCard"><small>INSTAGRAM ANALYTICS</small><strong>Public signals.<br/>Clear next actions.</strong><p>Compare your account with three competitors while keeping private Insights separate.</p><span>ScoutIQ v.1</span></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><small>SOCIAL & BUSINESS INTELLIGENCE</small><h1>Instagram Analytics</h1></div>
        <div className="account"><div className="avatar">S</div><div><b>ScoutIQ</b><span>Social Media Analytics Platform</span><span style={{fontSize:10,opacity:.78,marginTop:3}}>Built by Rank-Path</span></div></div>
      </header>

      <section className="panel" style={{padding:28}}>
        <div className="panelHead"><div><small>INSTAGRAM ANALYTICS</small><h2>Compare your account + 3 competitors</h2></div><span className="pill">6 factors · 100%</span></div>
        <p className="muted" style={{maxWidth:900}}>Use the same date range for every account. Public competitor signals stay separate from authorized private Insights. Missing data is shown as <b>Unavailable</b>, never zero.</p>

        <div style={fourGrid}>
          <Field label="Instagram account / URL"><input style={inputStyle} value={own.handle} onChange={e=>updateOwn('handle',e.target.value)} placeholder="@youraccount or Instagram URL"/></Field>
          <Field label="Date range"><select style={inputStyle} value={dateRange} onChange={e=>setDateRange(e.target.value)}><option>7 days</option><option>30 days</option></select></Field>
          <Field label="Posts analyzed"><input style={inputStyle} type="number" min="0" value={own.postsAnalyzed} onChange={e=>updateOwn('postsAnalyzed',e.target.value)} placeholder="e.g. 12"/></Field>
          <Field label="Followers"><input style={inputStyle} type="number" min="0" value={own.followers} onChange={e=>updateOwn('followers',e.target.value)} placeholder="e.g. 12500"/></Field>
          <Field label="Posts per week"><input style={inputStyle} type="number" min="0" step="0.1" value={own.postsPerWeek} onChange={e=>updateOwn('postsPerWeek',e.target.value)} placeholder="e.g. 4"/></Field>
          <Field label="Average likes / post"><input style={inputStyle} type="number" min="0" value={own.avgLikes} onChange={e=>updateOwn('avgLikes',e.target.value)} placeholder="e.g. 180"/></Field>
          <Field label="Average comments / post"><input style={inputStyle} type="number" min="0" value={own.avgComments} onChange={e=>updateOwn('avgComments',e.target.value)} placeholder="e.g. 12"/></Field>
          <Field label="Reels share %"><input style={inputStyle} type="number" min="0" max="100" value={own.reelsShare} onChange={e=>updateOwn('reelsShare',e.target.value)} placeholder="e.g. 40"/></Field>
          <Field label="Service keywords in bio"><input style={inputStyle} type="number" min="0" value={own.bioKeywords} onChange={e=>updateOwn('bioKeywords',e.target.value)} placeholder="e.g. 3"/></Field>
          <Field label="Creative Quality rubric"><select style={inputStyle} value={own.creativeScore} onChange={e=>updateOwn('creativeScore',e.target.value)}><option value="">Unavailable</option><option value="45">Needs work · 45</option><option value="70">Average · 70</option><option value="88">Strong · 88</option><option value="95">Excellent · 95</option></select></Field>
          <Field label="Content Relevance rubric"><select style={inputStyle} value={own.relevanceScore} onChange={e=>updateOwn('relevanceScore',e.target.value)}><option value="">Unavailable</option><option value="45">Needs work · 45</option><option value="70">Average · 70</option><option value="88">Strong · 88</option><option value="95">Excellent · 95</option></select></Field>
          <Field label="Top content format"><select style={inputStyle} value={own.topFormat} onChange={e=>updateOwn('topFormat',e.target.value)}><option value="">Unavailable</option><option>Reels</option><option>Carousel</option><option>Photo</option><option>Stories</option></select></Field>
        </div>

        <div style={{display:'flex',gap:18,flexWrap:'wrap',marginTop:16}}>
          <Check checked={own.hasLocation} onChange={value=>updateOwn('hasLocation',value)} label="Location shown in profile" />
          <Check checked={own.hasBooking} onChange={value=>updateOwn('hasBooking',value)} label="Booking link / CTA" />
          <Check checked={own.hasMessageCta} onChange={value=>updateOwn('hasMessageCta',value)} label="DM / message CTA" />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,marginTop:16}}><input style={inputStyle} value={own.bestPost} onChange={e=>updateOwn('bestPost',e.target.value)} placeholder="Best-performing post URL or note (optional)"/><button className="primary" type="button" onClick={calculate}>Calculate Instagram Score</button></div>
      </section>

      <section className="panel" style={{marginTop:18}}>
        <div className="panelHead"><div><small>COMPETITOR SETUP</small><h2>Add 3 Instagram competitors</h2></div><span className="pill">Public signals</span></div>
        <p className="muted">Enter the public metrics available for the same date range. Rubric scores are optional and clearly separated from measured engagement.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:14,marginTop:18}}>
          {competitors.map((competitor,index)=><article key={index} className="factorCard">
            <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><b>Competitor {index+1}</b><span className="pill">{formatScore(competitorResults[index].overall)}</span></div>
            <div style={{display:'grid',gap:9,marginTop:12}}>
              <input style={inputStyle} value={competitor.handle} onChange={e=>updateCompetitor(index,'handle',e.target.value)} placeholder="@competitor or Instagram URL"/>
              <input style={inputStyle} type="number" min="0" value={competitor.followers} onChange={e=>updateCompetitor(index,'followers',e.target.value)} placeholder="Followers"/>
              <input style={inputStyle} type="number" min="0" step="0.1" value={competitor.postsPerWeek} onChange={e=>updateCompetitor(index,'postsPerWeek',e.target.value)} placeholder="Posts / week"/>
              <input style={inputStyle} type="number" min="0" value={competitor.avgLikes} onChange={e=>updateCompetitor(index,'avgLikes',e.target.value)} placeholder="Avg likes / post"/>
              <input style={inputStyle} type="number" min="0" value={competitor.avgComments} onChange={e=>updateCompetitor(index,'avgComments',e.target.value)} placeholder="Avg comments / post"/>
              <input style={inputStyle} type="number" min="0" max="100" value={competitor.profileScore} onChange={e=>updateCompetitor(index,'profileScore',e.target.value)} placeholder="Profile score 0–100 · rubric"/>
              <input style={inputStyle} type="number" min="0" max="100" value={competitor.creativeScore} onChange={e=>updateCompetitor(index,'creativeScore',e.target.value)} placeholder="Creative score 0–100 · rubric"/>
              <input style={inputStyle} type="number" min="0" max="100" value={competitor.relevanceScore} onChange={e=>updateCompetitor(index,'relevanceScore',e.target.value)} placeholder="Relevance score 0–100 · rubric"/>
              <input style={inputStyle} type="number" min="0" max="100" value={competitor.offerScore} onChange={e=>updateCompetitor(index,'offerScore',e.target.value)} placeholder="Offer & CTA score 0–100 · rubric"/>
            </div>
            <p className="muted" style={{fontSize:11,marginBottom:0}}>Public engagement: <b>{formatPct(competitorResults[index].engagement)}</b></p>
          </article>)}
        </div>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginTop:18}}>
        <div className="panel">
          <div className="panelHead"><div><small>INSTAGRAM SCOUTIQ SCORE</small><h2>{formatScore(ownResult.overall)}</h2></div><span className="pill">Overall</span></div>
          <div style={{display:'grid',gap:10,marginTop:16}}>
            {Object.keys(weights).map(key=><div key={key} style={scoreRow}><div><b>{factorLabels[key]}</b><div className="muted" style={{fontSize:11}}>{weights[key]}% · {(key==='creative'||key==='relevance')?'AI / rubric-based assessment':'Public signal'}</div></div><strong>{formatScore(ownResult.factors[key])}</strong></div>)}
          </div>
        </div>

        <div className="panel">
          <div className="panelHead"><div><small>BEST-PERFORMING CONTENT</small><h2>Content snapshot</h2></div><span className="pill">{dateRange}</span></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:16}}>
            <MiniMetric label="Top format" value={own.topFormat || 'Unavailable'} />
            <MiniMetric label="Posts analyzed" value={own.postsAnalyzed || 'Unavailable'} />
            <MiniMetric label="Engagement / post" value={formatPct(ownResult.engagement)} />
          </div>
          <div className="notice"><b>Best post:</b> {own.bestPost || 'Unavailable'}<br/>Creative Quality and Content Relevance are rubric-based until automated content analysis is connected.</div>
        </div>
      </section>

      <section className="panel" style={{marginTop:18}}>
        <div className="panelHead"><div><small>YOU VS COMPETITOR AVERAGE</small><h2>Strengths & gaps</h2></div><span className="pill">Same date range</span></div>
        <div style={{overflowX:'auto',marginTop:12}}>
          <table style={tableStyle}><thead><tr><th style={thStyle}>Metric</th><th style={thStyle}>Your account</th><th style={thStyle}>Competitor average</th><th style={thStyle}>Gap</th></tr></thead><tbody>
            <BenchmarkRow label="Overall score" own={ownResult.overall} comp={competitorAvg.overall} unit="score" />
            <BenchmarkRow label="Engagement / post" own={ownResult.engagement} comp={competitorAvg.engagement} unit="percent" />
            <BenchmarkRow label="Posts / week" own={toNumber(own.postsPerWeek)} comp={competitorAvg.postsPerWeek} unit="number" />
            {Object.keys(weights).map(key=><BenchmarkRow key={key} label={factorLabels[key]} own={ownResult.factors[key]} comp={competitorAvg.factors[key]} unit="score" />)}
          </tbody></table>
        </div>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginTop:18}}>
        <div className="panel">
          <div className="panelHead"><div><small>CONNECTED ACCOUNT</small><h2>Private Insights</h2></div><span className="pill">Authorized only</span></div>
          <p className="muted">These metrics are separate from competitor scoring because competitors' private Insights are not available through public discovery.</p>
          <Check checked={connected} onChange={setConnected} label="Professional account connected / authorized" />
          {connected ? <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14}}>
            {Object.entries(privateInsights).map(([key,value])=><Field key={key} label={key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())}><input style={inputStyle} value={value} onChange={e=>setPrivateInsights(current=>({...current,[key]:e.target.value}))} placeholder="Enter authorized Insight"/></Field>)}
          </div> : <div className="notice"><b>Not connected.</b> Reach, views, saves, shares and follower trends require authorized Instagram Insights access.</div>}
        </div>

        <div className="panel">
          <div className="panelHead"><div><small>NEXT ACTIONS</small><h2>3 prioritized actions</h2></div><span className="pill">Evidence-based</span></div>
          {actions.map((action,index)=><article key={`${action.title}-${index}`} style={actionCard}><b>{index+1}. {action.title}</b><p className="muted" style={{fontSize:12,margin:'6px 0 0'}}>{action.evidence}</p></article>)}
        </div>
      </section>

      <section className="panel" style={{marginTop:18}}>
        <div className="panelHead"><div><small>DATA QUALITY</small><h2>Source · date range · last update</h2></div><span className="pill">Unavailable ≠ 0</span></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginTop:15}}>
          <MiniMetric label="Data source" value={connected ? 'Public + authorized' : 'Manual / public'} />
          <MiniMetric label="Date range" value={dateRange} />
          <MiniMetric label="Posts analyzed" value={own.postsAnalyzed || 'Unavailable'} />
          <MiniMetric label="Last update" value={lastUpdated} />
        </div>
        <div className="notice"><b>Public engagement formula:</b> (likes + comments) ÷ followers × 100. This v1 workspace does not auto-fetch Instagram or Meta API data yet.</div>
      </section>
    </main>
  </div>
}

function Field({label,children}) {
  return <label style={{display:'grid',gap:7}}><span style={{fontSize:12,fontWeight:750}}>{label}</span>{children}</label>
}

function Check({checked,onChange,label}) {
  return <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:700,cursor:'pointer'}}><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/>{label}</label>
}

function MiniMetric({label,value}) {
  return <div style={miniMetric}><strong style={{fontSize:16,wordBreak:'break-word'}}>{value}</strong><span className="muted" style={{fontSize:11,marginTop:5}}>{label}</span></div>
}

function BenchmarkRow({label,own,comp,unit}) {
  const available = own !== null && comp !== null
  const gap = available ? own - comp : null
  const render = value => {
    if (value === null) return 'Unavailable'
    if (unit === 'percent') return `${value.toFixed(2)}%`
    if (unit === 'score') return `${Math.round(value)}/100`
    return value.toFixed(1)
  }
  const gapText = gap === null ? 'Unavailable' : unit === 'percent' ? `${gap >= 0 ? '+' : ''}${gap.toFixed(2)} pp` : `${gap >= 0 ? '+' : ''}${gap.toFixed(1)}`
  return <tr><td style={tdStyle}><b>{label}</b></td><td style={tdStyle}>{render(own)}</td><td style={tdStyle}>{render(comp)}</td><td style={tdStyle}>{gapText}</td></tr>
}

const inputStyle = {border:'1px solid #E2E6F6',borderRadius:12,padding:'12px',font:'inherit',background:'#FBFCFF',color:'#0D1B3D',width:'100%'}
const fourGrid = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12,marginTop:18}
const scoreRow = {display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'center',padding:'10px 0',borderBottom:'1px solid #EEF0F5'}
const miniMetric = {border:'1px solid #E2E6F6',borderRadius:14,padding:14,background:'#FBFCFF',display:'grid'}
const actionCard = {border:'1px solid #E2E6F6',borderRadius:14,padding:14,background:'#FBFCFF',marginTop:10}
const tableStyle = {width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:700}
const thStyle = {textAlign:'left',padding:'10px',borderBottom:'1px solid #E2E6F6',color:'#667093',fontSize:10,textTransform:'uppercase',letterSpacing:'.04em'}
const tdStyle = {padding:'11px 10px',borderBottom:'1px solid #EEF0F5',verticalAlign:'top'}
