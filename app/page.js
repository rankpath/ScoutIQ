'use client'

import { useEffect, useMemo, useState } from 'react'

const navItems = ['Dashboard', 'Analyze', 'Competitors', 'Content', 'Ads Library', 'Reports', 'Settings']
const defaultCompetitors = ['inZ Hospital', 'Lovely Eye & Skin', 'Beproud Clinic']
const demoScores = [82, 79, 74]

const comparisonFactors = [
  { name: 'Facebook SEO', weight: 15, source: 'Facebook Page', description: 'Page name, category, username/URL, About keywords and searchability.' },
  { name: 'Content Activity', weight: 15, source: 'Metricool', description: 'Posting frequency, Reels/video mix and consistency during the last 7 days.' },
  { name: 'Engagement', weight: 20, source: 'Metricool', description: 'Interactions relative to content activity, including reactions, comments and shares.' },
  { name: 'Creative Quality', weight: 15, source: 'ScoutIQ AI', description: 'Strength of hooks, visual clarity, proof, content format and message consistency.' },
  { name: 'Offer Strength', weight: 15, source: 'ScoutIQ AI', description: 'Clarity of service, promotion, value proposition, urgency and CTA.' },
  { name: 'Paid Ads Activity', weight: 10, source: 'Meta Ads Library', description: 'Visible active-ad activity, creative variety and offer/message patterns.' },
  { name: 'Competitor Position', weight: 10, source: 'ScoutIQ', description: 'Overall strength relative to the other businesses in the same comparison set.' },
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

export default function Home() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [url, setUrl] = useState('https://www.facebook.com/share/1DdhEhqgRU/')
  const [competitorInputs, setCompetitorInputs] = useState(defaultCompetitors)
  const [competitors, setCompetitors] = useState(defaultCompetitors)
  const [hasCompared, setHasCompared] = useState(false)
  const [insights, setInsights] = useState(starterInsights)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('scoutiq-content-insights')
      if (saved) setInsights(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('scoutiq-content-insights', JSON.stringify(insights)) } catch {}
  }, [insights])

  const comparison = useMemo(() => [
    ['Youngdo Clinic', 76],
    ...competitors.map((name, index) => [displayBusinessName(name, `Competitor ${index + 1}`), demoScores[index]]),
  ], [competitors])

  const updateCompetitor = (index, value) => setCompetitorInputs(current => current.map((item, i) => i === index ? value : item))
  const compareThree = () => {
    setCompetitors(competitorInputs.map((item, index) => item.trim() || `Competitor ${index + 1}`))
    setHasCompared(true)
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">◈</span><span>ScoutIQ</span></div>
        <nav>
          {navItems.map(item => (
            <button key={item} type="button" className={activePage === item ? 'active' : ''} onClick={() => setActivePage(item)}>{item}</button>
          ))}
        </nav>
        <div className="sideCard"><strong>ScoutIQ Beta</strong><p>Competitor intelligence workspace.</p><span>Prototype mode</span></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><small>SOCIAL INTELLIGENCE</small><h1>{activePage === 'Dashboard' ? 'Hello, AdsCraft 👋' : activePage}</h1></div>
          <div className="account"><div className="avatar">A</div><div><b>AdsCraft Digital</b><span>ScoutIQ Workspace</span></div></div>
        </header>

        {activePage === 'Dashboard' && <Dashboard url={url} setUrl={setUrl} setActivePage={setActivePage} comparison={comparison} />}
        {activePage === 'Analyze' && <AnalyzePage url={url} setUrl={setUrl} setActivePage={setActivePage} />}
        {activePage === 'Competitors' && <CompetitorsPage competitorInputs={competitorInputs} updateCompetitor={updateCompetitor} compareThree={compareThree} comparison={comparison} hasCompared={hasCompared} />}
        {activePage === 'Content' && <ContentPage insights={insights} setInsights={setInsights} />}
        {['Ads Library','Reports','Settings'].includes(activePage) && <Placeholder title={activePage} />}
      </main>
    </div>
  )
}

function Dashboard({ url, setUrl, setActivePage, comparison }) {
  return <>
    <section className="hero panel">
      <h2>Know what competitors are doing before your next move.</h2>
      <p>Analyze Facebook pages, compare activity and turn social data into clear actions.</p>
      <div className="searchBox"><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Paste Facebook Page URL"/><button onClick={()=>setActivePage('Analyze')}>Analyze</button></div>
    </section>
    <section className="featureGrid">
      <Feature icon="⌕" title="Analyze Any Page" text="Turn a Facebook URL into a quick score." onClick={()=>setActivePage('Analyze')} />
      <Feature icon="♙" title="Compare Competitors" text="Input three businesses and compare them." onClick={()=>setActivePage('Competitors')} />
      <Feature icon="▤" title="Track Ads" text="Prepare competitor ad intelligence." onClick={()=>setActivePage('Ads Library')} />
      <Feature icon="✦" title="Get Actionable Tips" text="See what to improve next." />
    </section>
    <section className="twoCol">
      <div className="panel"><div className="panelHead"><div><small>BENCHMARK</small><h2>Competitor comparison</h2></div><span className="pill">Last 7 days</span></div><ComparisonBars comparison={comparison}/><button className="secondary" style={{marginTop:18}} onClick={()=>setActivePage('Competitors')}>View comparison details</button></div>
      <div className="panel"><div className="panelHead"><div><small>AI SIGNALS</small><h2>Opportunity radar</h2></div><span className="pill">AI</span></div><Insight type="up" title="Reels momentum" text="Video-first content is outperforming static posts."/><Insight type="up" title="Review content" text="Before/after and customer stories drive response."/><Insight type="down" title="Page SEO gap" text="Page naming and keyword coverage can improve."/></div>
    </section>
  </>
}

function CompetitorsPage({ competitorInputs, updateCompetitor, compareThree, comparison, hasCompared }) {
  return <>
    <section className="panel" style={{padding:28}}>
      <div className="panelHead"><div><small>COMPETITOR SETUP</small><h2>Input 3 businesses</h2></div><span className="pill">Manual input</span></div>
      <p className="muted"><b>Your business:</b> Youngdo Clinic · Enter three competitor business names or Facebook Page URLs.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:22}}>
        {competitorInputs.map((value,index)=><label key={index} style={{display:'grid',gap:7}}><span style={{fontSize:12,fontWeight:750}}>Competitor {index+1}</span><input value={value} onChange={e=>updateCompetitor(index,e.target.value)} placeholder={`Business ${index+1} name or Facebook URL`} style={{border:'1px solid #e6e8f0',borderRadius:10,padding:'13px 12px',outline:'none'}}/></label>)}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginTop:18,flexWrap:'wrap'}}><button className="primary" onClick={compareThree}>Compare 3 Businesses</button><span className="muted" style={{fontSize:12}}>Names update now; live scores come after data integration.</span></div>
    </section>

    <section className="panel" style={{marginTop:18}}>
      <div className="panelHead"><div><small>BENCHMARK</small><h2>{hasCompared ? 'Comparison updated' : 'Competitor comparison'}</h2></div><span className="pill">ScoutIQ Score /100</span></div>
      <ComparisonBars comparison={comparison}/>
    </section>

    <section className="panel" style={{marginTop:18}}>
      <div className="panelHead"><div><small>SCORING METHOD</small><h2>What ScoutIQ compares</h2></div><span className="pill">Total weight 100%</span></div>
      <p className="muted" style={{maxWidth:850}}>Each business is scored across the same 7 factors. The planned live version uses the most recent 7-day social data where available, then ScoutIQ applies the weights below to produce the overall score.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:18}}>
        {comparisonFactors.map(factor => <article key={factor.name} style={{border:'1px solid #e6e8f0',borderRadius:14,padding:16,background:'#fafbff'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><b style={{fontSize:14}}>{factor.name}</b><span className="pill">{factor.weight}%</span></div>
          <p className="muted" style={{fontSize:12,lineHeight:1.5,minHeight:54}}>{factor.description}</p>
          <span style={{fontSize:11,fontWeight:750,color:'#6747f5'}}>Source: {factor.source}</span>
        </article>)}
      </div>
      <div className="notice"><b>Prototype note:</b> the current competitor scores are demo values. When Metricool + Meta Ads Library are connected, the score will use real inputs instead of fixed demo scores.</div>
    </section>
  </>
}

function AnalyzePage({ url, setUrl, setActivePage }) {
  return <>
    <div className="searchBox topSearch"><input value={url} onChange={e=>setUrl(e.target.value)}/><button>Analyze Again</button></div>
    <section className="identity panel"><div className="logoBubble">Y</div><div className="grow"><h2>Youngdo Clinic</h2><p>@youngdoclinic · Health / Beauty · Bangkok, Thailand</p></div><button className="secondary" onClick={()=>setActivePage('Competitors')}>Compare competitors</button></section>
    <section className="twoCol">
      <div className="panel scorePanel"><small>SCOUTIQ SCORE</small><div className="scoreWrap"><div className="scoreRing"><div><strong>76</strong><span>/100</span></div></div><div className="metricList">{scoreMetrics.map(([m,s])=><div key={m}><span>{m}</span><b>{s}</b></div>)}</div></div></div>
      <div className="panel"><div className="panelHead"><div><small>AI ANALYSIS</small><h2>Quick insights</h2></div><span className="pill">AI</span></div><Insight type="up" title="Reels performing strongly" text="Video content is the clearest growth signal."/><Insight type="up" title="Review content generates engagement" text="Customer proof strengthens trust and response."/><Insight type="down" title="Facebook Page SEO can improve" text="Improve keyword coverage in naming and About."/></div>
    </section>
  </>
}

function ContentPage({ insights, setInsights }) {
  const [form,setForm] = useState({business:'Youngdo Clinic',topic:'',insight:''})
  const save = e => { e.preventDefault(); if(!form.business.trim()||!form.topic.trim()||!form.insight.trim()) return; setInsights(current=>[{id:String(Date.now()),type:'Observation',score:80,action:'Review and test this finding.',...form},...current]); setForm({...form,topic:'',insight:''}) }
  return <section className="panel"><div className="panelHead"><div><small>CONTENT INTELLIGENCE</small><h2>Content Insight Vault</h2></div><span className="pill">Saved in browser</span></div><form onSubmit={save} style={{display:'grid',gap:10,margin:'18px 0'}}><input style={inputStyle} value={form.business} onChange={e=>setForm({...form,business:e.target.value})} placeholder="Business"/><input style={inputStyle} value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="Content topic / hook"/><textarea style={{...inputStyle,minHeight:80}} value={form.insight} onChange={e=>setForm({...form,insight:e.target.value})} placeholder="Insight"/><button className="primary" style={{width:'fit-content'}}>+ Save Insight</button></form>{insights.map(item=><div key={item.id} style={{borderTop:'1px solid #e6e8f0',padding:'14px 0'}}><b>{item.business} · {item.topic}</b><p className="muted" style={{marginBottom:0}}>{item.insight}</p></div>)}</section>
}

const inputStyle = {border:'1px solid #e6e8f0',borderRadius:10,padding:'12px',font:'inherit'}

function Placeholder({ title }) { return <section className="panel"><small>SCOUTIQ MODULE</small><h2>{title}</h2><p className="muted">This module is ready for the next development step.</p></section> }
function Feature({icon,title,text,onClick}) { return <article className="featureCard" onClick={onClick} style={{cursor:onClick?'pointer':'default'}}><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article> }
function ComparisonBars({comparison}) { return <div className="bars">{comparison.map(([name,score])=><div className="barRow" key={`${name}-${score}`}><span>{name}</span><div className="track"><i style={{width:`${score}%`}}/></div><b>{score}</b></div>)}</div> }
function Insight({type,title,text}) { return <div className="insight"><span className={type==='up'?'signal up':'signal down'}>{type==='up'?'↗':'↘'}</span><div><b>{title}</b><p>{text}</p></div></div> }
