'use client'

import { useEffect, useMemo, useState } from 'react'

const navItems = ['Dashboard', 'Analyze', 'Competitors', 'Content', 'Ads Library', 'Reports', 'Settings']
const navIcons = { Dashboard:'⌂', Analyze:'◉', Competitors:'♙', Content:'▤', 'Ads Library':'✦', Reports:'◔', Settings:'⚙' }
const defaultCompetitors = ['', '', '']
const demoScores = [82, 79, 74]

const comparisonFactors = [
  { name: 'Facebook SEO', weight: 15, source: 'Facebook Page', description: 'Page name, category, username/URL, About keywords and searchability.' },
  { name: 'Content Activity', weight: 15, source: 'Metricool', description: 'Posting frequency, Reels/video mix and consistency during the last 7 days.' },
  { name: 'Engagement', weight: 20, source: 'Metricool', description: 'Reactions, comments and shares relative to content activity.' },
  { name: 'Creative Quality', weight: 15, source: 'ScoutIQ AI', description: 'Hooks, visual clarity, proof, format and message consistency.' },
  { name: 'Offer Strength', weight: 15, source: 'ScoutIQ AI', description: 'Service clarity, promotion, value proposition, urgency and CTA.' },
  { name: 'Paid Ads Activity', weight: 10, source: 'Meta Ads Library', description: 'Visible active ads, creative variety and offer/message patterns.' },
  { name: 'Competitor Position', weight: 10, source: 'ScoutIQ', description: 'Overall strength relative to businesses in the same comparison set.' },
]

const scoreMetrics = [
  ['Facebook SEO', 72], ['Content Activity', 88], ['Engagement', 69],
  ['Creative Quality', 82], ['Offer Strength', 80], ['Paid Ads Activity', 74], ['Competitor Position', 71],
]

const starterInsights = [
  { id:'1', business:'Youngdo Clinic', type:'Reel', topic:'Before / After transformation', insight:'Visual proof and a clear transformation hook can stop the scroll faster than generic service posts.', action:'Create 3 proof-led Reels with the result visible in the first 2 seconds.', score:88 },
  { id:'2', business:'inZ Hospital', type:'Review', topic:'Patient review + doctor credibility', insight:'Trust-led content combines customer proof with expert authority.', action:'Pair testimonial clips with one concise doctor explanation and one CTA.', score:82 },
]

function displayBusinessName(value, fallback) {
  const clean = (value || '').trim()
  if (!clean) return fallback
  try {
    if (clean.startsWith('http')) {
      const parsed = new URL(clean)
      const parts = parsed.pathname.split('/').filter(Boolean)
      return parts[parts.length - 1] || parsed.hostname
    }
  } catch {}
  return clean.length > 34 ? `${clean.slice(0, 31)}…` : clean
}

function ScoutLogo() {
  return <div className="brandLockup">
    <svg className="scoutLogoMark" viewBox="0 0 64 64" role="img" aria-label="ScoutIQ logo">
      <defs><linearGradient id="scoutGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient></defs>
      <circle cx="31" cy="33" r="7" fill="url(#scoutGradient)"/>
      <path d="M31 16a17 17 0 1 0 17 17" fill="none" stroke="url(#scoutGradient)" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M31 7A26 26 0 1 0 57 33" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" opacity=".96"/>
      <path d="M36 5c12 2 21 12 23 24" fill="none" stroke="url(#scoutGradient)" strokeWidth="5.5" strokeLinecap="round"/>
    </svg>
    <div className="brandText"><strong>Scout<span>IQ</span></strong><small>From Data to Next Move.</small></div>
  </div>
}

export default function Home() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [url, setUrl] = useState('https://www.facebook.com/share/1DdhEhqgRU/')
  const [competitorInputs, setCompetitorInputs] = useState(defaultCompetitors)
  const [competitors, setCompetitors] = useState([])
  const [hasCompared, setHasCompared] = useState(false)
  const [insights, setInsights] = useState(starterInsights)
  const [analysisRuns, setAnalysisRuns] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('scoutiq-content-insights')
      if (saved) setInsights(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('scoutiq-content-insights', JSON.stringify(insights)) } catch {}
  }, [insights])

  const comparison = useMemo(() => {
    const entered = competitors.filter(name => name && name.trim())
    if (!hasCompared || entered.length === 0) return []
    return [
      ['Youngdo Clinic', 76],
      ...entered.map((name, index) => [displayBusinessName(name, ''), demoScores[index] ?? 70]),
    ]
  }, [competitors, hasCompared])

  const updateCompetitor = (index, value) => setCompetitorInputs(current => current.map((item, i) => i === index ? value : item))
  const compareThree = () => {
    const entered = competitorInputs.map(item => item.trim()).filter(Boolean)
    setCompetitors(entered)
    setHasCompared(entered.length > 0)
  }
  const runAnalysis = () => {
    setAnalysisRuns(current => current + 1)
    setActivePage('Analyze')
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <ScoutLogo />
        <nav>{navItems.map(item => <button key={item} type="button" className={activePage === item ? 'active' : ''} onClick={() => setActivePage(item)}><span className="navIcon">{navIcons[item]}</span><span className="navLabel">{item}</span></button>)}</nav>
        <div className="sideCard"><small>FIND THE SIGNAL. MAKE THE MOVE.</small><strong>Smarter Decisions.<br/>Brighter Tomorrow.</strong><p>Turn scattered social data into clear opportunities and next actions.</p><span>ScoutIQ Beta</span></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><small>SOCIAL & BUSINESS INTELLIGENCE</small><h1>{activePage === 'Dashboard' ? 'Good morning, AdsCraft!' : activePage}</h1></div>
          <div className="account"><div className="avatar">A</div><div><b>AdsCraft Digital</b><span>ScoutIQ Workspace</span></div></div>
        </header>

        {activePage === 'Dashboard' && <Dashboard url={url} setUrl={setUrl} runAnalysis={runAnalysis} setActivePage={setActivePage} comparison={comparison} />}
        {activePage === 'Analyze' && <AnalyzePage url={url} setUrl={setUrl} setActivePage={setActivePage} runAnalysis={runAnalysis} analysisRuns={analysisRuns} />}
        {activePage === 'Competitors' && <CompetitorsPage competitorInputs={competitorInputs} updateCompetitor={updateCompetitor} compareThree={compareThree} comparison={comparison} hasCompared={hasCompared} />}
        {activePage === 'Content' && <ContentPage insights={insights} setInsights={setInsights} />}
        {['Ads Library','Reports','Settings'].includes(activePage) && <Placeholder title={activePage} />}
      </main>
    </div>
  )
}

function Dashboard({ url, setUrl, runAnalysis, setActivePage, comparison }) {
  return <>
    <section className="hero panel">
      <div className="heroGlow heroGlowOne"/><div className="heroGlow heroGlowTwo"/>
      <div className="heroContent">
        <small>FIND THE SIGNAL. MAKE THE MOVE.</small>
        <h2>Turn signals into <span>opportunities.</span></h2>
        <p className="heroPromise">See the opportunities others miss.</p>
        <p>Analyze Facebook pages, compare competitors and turn social data into clear next actions.</p>
        <div className="searchBox"><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Paste Facebook Page URL"/><button type="button" onClick={runAnalysis}>Analyze</button></div>
      </div>
    </section>

    <section className="featureGrid">
      <Feature icon="◎" title="Analyze Any Page" text="Turn a Facebook URL into a quick score." onClick={runAnalysis} />
      <Feature icon="♙" title="Compare Competitors" text="Input three businesses and compare them." onClick={()=>setActivePage('Competitors')} />
      <Feature icon="◫" title="Track Ads" text="Open the Ads Library module status." onClick={()=>setActivePage('Ads Library')} />
      <Feature icon="✦" title="Get Actionable Tips" text="Open analysis to see recommendations." onClick={runAnalysis} />
    </section>

    <section className="twoCol">
      <div className="panel">
        <div className="panelHead"><div><small>BENCHMARK</small><h2>Competitor comparison</h2></div><span className="pill">Best score first</span></div>
        <ComparisonBars comparison={comparison}/>
        <button className="secondary" type="button" style={{marginTop:18}} onClick={()=>setActivePage('Competitors')}>View comparison details</button>
      </div>
      <div className="panel">
        <div className="panelHead"><div><small>AI SIGNALS</small><h2>Opportunity radar</h2></div><span className="pill">AI</span></div>
        <Insight type="up" title="Reels momentum" text="Video-first content is outperforming static posts."/>
        <Insight type="up" title="Review content" text="Before/after and customer stories drive response."/>
        <Insight type="down" title="Page SEO gap" text="Page naming and keyword coverage can improve."/>
      </div>
    </section>
  </>
}

function CompetitorsPage({ competitorInputs, updateCompetitor, compareThree, comparison, hasCompared }) {
  return <>
    <section className="panel" style={{padding:28}}>
      <div className="panelHead"><div><small>COMPETITOR SETUP</small><h2>Input 3 businesses</h2></div><span className="pill">Manual input</span></div>
      <p className="muted"><b>Your business:</b> Youngdo Clinic · Enter three competitor business names or Facebook Page URLs.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:22}}>
        {competitorInputs.map((value,index)=><label key={index} style={{display:'grid',gap:7}}><span style={{fontSize:12,fontWeight:750}}>Competitor {index+1}</span><input value={value} onChange={e=>updateCompetitor(index,e.target.value)} placeholder={`Business ${index+1} name or Facebook URL`} style={inputStyle}/></label>)}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginTop:18,flexWrap:'wrap'}}><button className="primary" type="button" onClick={compareThree}>Compare 3 Businesses</button><span className="muted" style={{fontSize:12}}>Results are automatically ranked from highest to lowest score.</span></div>
    </section>

    <section className="panel" style={{marginTop:18}}>
      <div className="panelHead"><div><small>BENCHMARK</small><h2>{hasCompared ? 'Comparison updated' : 'Competitor comparison'}</h2></div><span className="pill">Best score first</span></div>
      <ComparisonBars comparison={comparison}/>
    </section>

    <section className="panel" style={{marginTop:18}}>
      <div className="panelHead"><div><small>SCORING METHOD</small><h2>How ScoutIQ Calculates Your Score</h2></div><span className="pill">What to calculate</span></div>
      <p className="muted" style={{maxWidth:850}}>Compare your business with three competitors across seven factors to reveal strengths, weaknesses, ranking gaps, and recommended actions for improvement.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:18}}>
        {comparisonFactors.map(factor => <article key={factor.name} className="factorCard">
          <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><b style={{fontSize:14}}>{factor.name}</b><span className="pill">{factor.weight}%</span></div>
          <p className="muted" style={{fontSize:12,lineHeight:1.5,minHeight:54}}>{factor.description}</p>
          <span className="sourceText">Source: {factor.source}</span>
        </article>)}
      </div>
      <div className="notice"><b>Prototype note:</b> current competitor scores are demo values. Live data will replace them after Metricool + Meta Ads Library integration.</div>
    </section>
  </>
}

function AnalyzePage({ url, setUrl, setActivePage, runAnalysis, analysisRuns }) {
  const safeUrl = url && url.startsWith('http') ? url : 'https://www.facebook.com/'
  const followerPoints = '0,76 45,70 90,62 135,66 180,48 225,40 270,31 315,24 360,12'
  return <>
    <div className="searchBox topSearch"><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Paste Facebook Page URL"/><button type="button" onClick={runAnalysis}>Analyze Again</button></div>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><span className="pill">{analysisRuns > 0 ? `Demo analysis run ${analysisRuns}` : 'Demo analysis'}</span></div>

    <section className="panel pageIdentity">
      <div className="pageAvatar">Y</div>
      <div><small>FACEBOOK PAGE</small><h2 style={{margin:'5px 0'}}>Youngdo Clinic</h2><p className="muted" style={{margin:0}}>@youngdoclinic · Health / Beauty · Bangkok, Thailand</p><div className="pageUrl">{safeUrl}</div></div>
      <div className="pageActions"><a className="secondary" href={safeUrl} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>Open Facebook ↗</a><button className="secondary" type="button" onClick={()=>setActivePage('Competitors')}>Compare competitors</button></div>
    </section>

    <section className="metricGrid">
      <MetricCard label="Followers" value="52.4K" change="+3.6%" />
      <MetricCard label="New followers · 7d" value="+1,820" change="+420 vs prior" />
      <MetricCard label="Posts · 7d" value="11" change="7 Reels" />
      <MetricCard label="Avg. engagement" value="3.8%" change="+0.7 pts" />
    </section>

    <section className="twoCol">
      <div className="panel">
        <div className="panelHead"><div><small>FOLLOWER TREND</small><h2>Follower growth · 7 days</h2></div><span className="pill">+3.6%</span></div>
        <svg viewBox="0 0 360 90" className="trendChart" role="img" aria-label="Demo follower trend over seven days">
          <line x1="0" y1="76" x2="360" y2="76" stroke="#E9E8FF" strokeWidth="1" />
          <line x1="0" y1="44" x2="360" y2="44" stroke="#F1F3FF" strokeWidth="1" />
          <polyline points={followerPoints} fill="none" stroke="url(#trendGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <defs><linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient></defs>
          {[[0,76],[90,62],[180,48],[270,31],[360,12]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#5B55F6" strokeWidth="3"/>)}
        </svg>
        <div className="chartLabels"><span>Day 1</span><span>Day 2</span><span>Day 3</span><span>Day 4</span><span>Day 5</span><span>Day 6</span><span>Today</span></div>
        <p className="muted" style={{fontSize:12,marginTop:14}}>Demo trend. Live version will use available follower history from connected social data.</p>
      </div>
      <div className="panel scorePanel"><small>SCOUTIQ SCORE</small><div className="scoreWrap"><div className="scoreRing"><div><strong>76</strong><span>/100</span></div></div><div className="metricList">{scoreMetrics.map(([m,s])=><div key={m}><span>{m}</span><b>{s}</b></div>)}</div></div></div>
    </section>

    <section className="twoCol">
      <div className="panel">
        <div className="panelHead"><div><small>AI ANALYSIS</small><h2>Quick insights</h2></div><span className="pill">AI</span></div>
        <Insight type="up" title="Follower growth is positive" text="Follower trend is moving upward across the 7-day demo period."/>
        <Insight type="up" title="Reels performing strongly" text="Video content is the clearest growth signal."/>
        <Insight type="up" title="Review content generates engagement" text="Customer proof strengthens trust and response."/>
        <Insight type="down" title="Facebook Page SEO can improve" text="Improve keyword coverage in naming and About."/>
      </div>
      <div className="panel">
        <div className="panelHead"><div><small>PAGE DETAILS</small><h2>Profile signals</h2></div><span className="pill">Demo</span></div>
        <Detail label="Page name" value="Youngdo Clinic" />
        <Detail label="Username" value="@youngdoclinic" />
        <Detail label="Category" value="Health / Beauty" />
        <Detail label="Location" value="Bangkok, Thailand" />
        <Detail label="Page link" value={safeUrl} />
      </div>
    </section>
  </>
}

function ContentPage({ insights, setInsights }) {
  const [form,setForm] = useState({business:'Youngdo Clinic',topic:'',insight:''})
  const save = e => {
    e.preventDefault()
    if(!form.business.trim()||!form.topic.trim()||!form.insight.trim()) return
    setInsights(current=>[{id:String(Date.now()),type:'Observation',score:80,action:'Review and test this finding.',...form},...current])
    setForm({...form,topic:'',insight:''})
  }

  return <section className="panel">
    <div className="panelHead"><div><small>CONTENT INTELLIGENCE</small><h2>Content Insight Vault</h2></div><span className="pill">1 Brand + 3 Competitors · 7 days</span></div>
    <p className="muted" style={{maxWidth:820,marginTop:10}}>ScoutIQ analyzes <b>7 days of content</b> from your brand and 3 competitors, comparing engagement, formats, offers, and winning patterns.</p>
    <form onSubmit={save} className="insightForm">
      <input style={inputStyle} value={form.business} onChange={e=>setForm({...form,business:e.target.value})} placeholder="Business"/>
      <input style={inputStyle} value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="Content topic / hook"/>
      <textarea style={{...inputStyle,minHeight:80}} value={form.insight} onChange={e=>setForm({...form,insight:e.target.value})} placeholder="Insight"/>
      <button className="primary" type="submit" style={{width:'fit-content'}}>+ Save Insight</button>
    </form>
    {insights.map(item=><div key={item.id} className="savedInsight"><b>{item.business} · {item.topic}</b><p className="muted" style={{marginBottom:0}}>{item.insight}</p></div>)}
  </section>
}

const inputStyle = {border:'1px solid #E2E6F6',borderRadius:12,padding:'12px',font:'inherit'}

function Placeholder({ title }) {
  return <section className="panel"><small>SCOUTIQ MODULE</small><h2>{title}</h2><span className="pill">Coming soon</span><p className="muted">Navigation works, but this module is not connected to live data yet.</p></section>
}

function Feature({icon,title,text,onClick}) {
  return <article className="featureCard" onClick={onClick} role={onClick?'button':undefined} tabIndex={onClick?0:undefined} onKeyDown={e=>{if(onClick&&(e.key==='Enter'||e.key===' '))onClick()}} style={{cursor:onClick?'pointer':'default'}}><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article>
}

function ComparisonBars({comparison}) {
  const ranked = [...comparison].sort((a,b)=>Number(b[1])-Number(a[1]))
  return <div className="bars">{ranked.map(([name,score],index)=><div className="barRow" key={`${name}-${score}`}><span><b className={index===0?'rankTop':'rankMuted'}>#{index+1}</b>{name}</span><div className="track"><i style={{width:`${score}%`}}/></div><b>{score}</b></div>)}</div>
}

function MetricCard({label,value,change}) {
  return <div className="panel metricCard"><small>{label.toUpperCase()}</small><strong>{value}</strong><span>{change}</span></div>
}
function Detail({label,value}) {
  return <div className="detailRow"><span className="muted">{label}</span><b>{value}</b></div>
}
function Insight({type,title,text}) {
  return <div className="insight"><span className={type==='up'?'signal up':'signal down'}>{type==='up'?'↗':'↘'}</span><div><b>{title}</b><p>{text}</p></div></div>
}