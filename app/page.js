'use client'

import { useState } from 'react'

const defaultCompetitors = ['inZ Hospital', 'Lovely Eye & Skin', 'Beproud Clinic']
const demoCompetitorScores = [82, 79, 74]

const metrics = [
  ['Facebook SEO', 72],
  ['Content Activity', 88],
  ['Engagement', 69],
  ['Creative Quality', 82],
  ['Offer Strength', 80],
  ['Paid Ads Activity', 74],
  ['Competitor Position', 71],
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
  return clean.length > 28 ? `${clean.slice(0, 25)}…` : clean
}

export default function Home() {
  const [url, setUrl] = useState('https://www.facebook.com/share/1DdhEhqgRU/')
  const [showResult, setShowResult] = useState(false)
  const [competitorInputs, setCompetitorInputs] = useState(defaultCompetitors)
  const [competitors, setCompetitors] = useState(defaultCompetitors)

  const comparison = [
    ['Youngdo Clinic', 76],
    ...competitors.map((name, index) => [displayBusinessName(name, `Competitor ${index + 1}`), demoCompetitorScores[index]]),
  ]

  const updateCompetitor = (index, value) => {
    setCompetitorInputs(current => current.map((item, i) => i === index ? value : item))
  }

  const compareThree = () => {
    setCompetitors([...competitorInputs])
    document.getElementById('benchmark')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const openCompetitors = () => {
    setShowResult(false)
    setTimeout(() => document.getElementById('competitors')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">◈</span><span>ScoutIQ</span></div>
        <nav>
          {['Dashboard','Analyze','Competitors','Content','Ads Library','Reports','Settings'].map((item, i) => (
            <button key={item} className={i===0 ? 'active' : ''} onClick={item === 'Competitors' ? openCompetitors : undefined}>{item}</button>
          ))}
        </nav>
        <div className="sideCard">
          <strong>ScoutIQ v0.1</strong>
          <p>Prototype workspace. Metricool MCP connection comes next.</p>
          <span>Demo mode</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <small>SOCIAL INTELLIGENCE</small>
            <h1>{showResult ? 'Analyze Page' : 'Hello, AdsCraft 👋'}</h1>
          </div>
          <div className="account"><div className="avatar">A</div><div><b>AdsCraft Digital</b><span>Prototype Workspace</span></div></div>
        </header>

        {!showResult ? (
          <>
            <section className="hero panel">
              <h2>Know what competitors are doing before your next move.</h2>
              <p>Analyze Facebook pages, compare activity, identify opportunities and turn social data into clear actions.</p>
              <div className="searchBox">
                <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="Paste Facebook Page URL" />
                <button onClick={()=>setShowResult(true)}>Analyze</button>
              </div>
            </section>

            <section className="featureGrid">
              {[
                ['⌕','Analyze Any Page','Turn a Facebook URL into a quick score.'],
                ['♙','Find Competitors','Compare similar businesses in one view.'],
                ['▤','Track Ads','Prepare competitor ad intelligence.'],
                ['✦','Get Actionable Tips','See what to improve next.'],
              ].map(([icon,title,text]) => (
                <article className="featureCard" key={title}><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article>
              ))}
            </section>

            <section id="competitors" className="panel competitorPanel">
              <div className="panelHead">
                <div><small>COMPETITORS</small><h2>Input 3 businesses</h2></div>
                <span className="pill">Manual input</span>
              </div>
              <p className="competitorIntro"><b>Your business:</b> Youngdo Clinic · Add three competitors by business name or Facebook Page URL.</p>
              <div className="competitorInputs">
                {competitorInputs.map((value, index) => (
                  <label className="fieldGroup" key={index}>
                    <span>Competitor {index + 1}</span>
                    <input
                      value={value}
                      onChange={(e) => updateCompetitor(index, e.target.value)}
                      placeholder={`Business ${index + 1} name or Facebook URL`}
                    />
                  </label>
                ))}
                <div className="compareActions">
                  <button className="primary" onClick={compareThree}>Compare 3</button>
                  <span>Demo scores stay fixed until live data is connected.</span>
                </div>
              </div>
            </section>

            <section className="twoCol" id="benchmark">
              <div className="panel">
                <div className="panelHead"><div><small>BENCHMARK</small><h2>Competitor comparison</h2></div><span className="pill">Last 7 days</span></div>
                <div className="bars">
                  {comparison.map(([name,score]) => <div className="barRow" key={`${name}-${score}`}><span>{name}</span><div className="track"><i style={{width:`${score}%`}} /></div><b>{score}</b></div>)}
                </div>
              </div>
              <div className="panel">
                <div className="panelHead"><div><small>AI SIGNALS</small><h2>Opportunity radar</h2></div><span className="pill">AI</span></div>
                <Insight type="up" title="Reels momentum" text="Video-first content is outperforming static posts." />
                <Insight type="up" title="Review content" text="Before/after and customer stories drive response." />
                <Insight type="down" title="Page SEO gap" text="Page naming and keyword coverage can improve." />
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="searchBox topSearch">
              <input value={url} onChange={(e)=>setUrl(e.target.value)} />
              <button onClick={()=>setShowResult(true)}>Analyze Again</button>
            </div>

            <section className="identity panel">
              <div className="logoBubble">Y</div>
              <div className="grow"><h2>Youngdo Clinic</h2><p>@youngdoclinic · Health / Beauty · Bangkok, Thailand</p></div>
              <button className="secondary" onClick={openCompetitors}>Add to competitors</button>
            </section>

            <section className="twoCol">
              <div className="panel scorePanel">
                <small>SCOUTIQ SCORE</small>
                <div className="scoreWrap">
                  <div className="scoreRing"><div><strong>76</strong><span>/100</span></div></div>
                  <div className="metricList">{metrics.map(([m,s]) => <div key={m}><span>{m}</span><b>{s}</b></div>)}</div>
                </div>
              </div>
              <div className="panel">
                <div className="panelHead"><div><small>AI ANALYSIS</small><h2>Quick insights</h2></div><span className="pill">AI</span></div>
                <Insight type="up" title="Reels performing strongly" text="Video content is the clearest growth signal." />
                <Insight type="up" title="Review content generates engagement" text="Customer proof strengthens trust and response." />
                <Insight type="down" title="Facebook Page SEO can improve" text="Improve keyword coverage in naming and About." />
                <Insight type="down" title="CTA consistency is weak" text="Use one primary action across high-intent content." />
              </div>
            </section>

            <section className="twoCol">
              <div className="panel">
                <div className="panelHead"><div><small>CONTENT MIX</small><h2>Last 7 days</h2></div><span className="pill">Demo data</span></div>
                <div className="stats">
                  <Stat value="11" label="Posts" />
                  <Stat value="7" label="Reels" />
                  <Stat value="3.8%" label="Avg engagement" />
                  <Stat value="320K" label="Reach" />
                </div>
              </div>
              <div className="panel">
                <small>NEXT ACTION</small>
                <h2>Recommended focus</h2>
                <p className="muted">Double down on proof-led Reels, then tighten CTA consistency and Facebook Page keyword coverage.</p>
                <button className="primary">Build action plan</button>
              </div>
            </section>
            <div className="notice"><b>Prototype:</b> this version uses mock data. Live Metricool MCP is the next integration.</div>
          </>
        )}
      </main>
    </div>
  )
}

function Insight({type,title,text}) {
  return <div className="insight"><span className={type==='up'?'signal up':'signal down'}>{type==='up'?'↗':'↘'}</span><div><b>{title}</b><p>{text}</p></div></div>
}

function Stat({value,label}) {
  return <div className="stat"><strong>{value}</strong><span>{label}</span></div>
}
