'use client'

import { useEffect, useMemo, useState } from 'react'

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

const starterInsights = [
  {
    id: 'demo-1',
    business: 'Youngdo Clinic',
    type: 'Reel',
    topic: 'Before / After transformation',
    insight: 'Visual proof and a clear transformation hook are likely to stop the scroll faster than generic service posts.',
    action: 'Create 3 proof-led Reels with the result visible in the first 2 seconds.',
    score: 88,
    createdAt: '2026-09-10T12:00:00+07:00',
  },
  {
    id: 'demo-2',
    business: 'inZ Hospital',
    type: 'Review',
    topic: 'Patient review + doctor credibility',
    insight: 'Trust-led content combines customer proof with expert authority and is useful near the decision stage.',
    action: 'Pair testimonial clips with one concise doctor explanation and a single CTA.',
    score: 82,
    createdAt: '2026-09-10T12:02:00+07:00',
  },
  {
    id: 'demo-3',
    business: 'Lovely Eye & Skin',
    type: 'Static Post',
    topic: 'Promotion / offer',
    insight: 'Offer content is easy to understand but needs a stronger reason-to-believe to avoid competing only on price.',
    action: 'Add proof, limited availability and a clearer treatment outcome to the creative.',
    score: 74,
    createdAt: '2026-09-10T12:04:00+07:00',
  },
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

function formatSavedDate(value) {
  try {
    return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  } catch {
    return 'Saved'
  }
}

export default function Home() {
  const [url, setUrl] = useState('https://www.facebook.com/share/1DdhEhqgRU/')
  const [showResult, setShowResult] = useState(false)
  const [competitorInputs, setCompetitorInputs] = useState(defaultCompetitors)
  const [competitors, setCompetitors] = useState(defaultCompetitors)
  const [contentInsights, setContentInsights] = useState([])
  const [insightsLoaded, setInsightsLoaded] = useState(false)
  const [contentSearch, setContentSearch] = useState('')
  const [contentForm, setContentForm] = useState({
    business: 'Youngdo Clinic',
    type: 'Reel',
    topic: '',
    insight: '',
    action: '',
    score: 80,
  })

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('scoutiq-content-insights')
      setContentInsights(saved ? JSON.parse(saved) : starterInsights)
    } catch {
      setContentInsights(starterInsights)
    }
    setInsightsLoaded(true)
  }, [])

  useEffect(() => {
    if (!insightsLoaded) return
    try {
      window.localStorage.setItem('scoutiq-content-insights', JSON.stringify(contentInsights))
    } catch {}
  }, [contentInsights, insightsLoaded])

  const comparison = [
    ['Youngdo Clinic', 76],
    ...competitors.map((name, index) => [displayBusinessName(name, `Competitor ${index + 1}`), demoCompetitorScores[index]]),
  ]

  const filteredInsights = useMemo(() => {
    const q = contentSearch.trim().toLowerCase()
    if (!q) return contentInsights
    return contentInsights.filter(item => [item.business, item.type, item.topic, item.insight, item.action].join(' ').toLowerCase().includes(q))
  }, [contentInsights, contentSearch])

  const averageInsightScore = contentInsights.length
    ? Math.round(contentInsights.reduce((sum, item) => sum + Number(item.score || 0), 0) / contentInsights.length)
    : 0

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

  const openContent = () => {
    setShowResult(false)
    setTimeout(() => document.getElementById('content-vault')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const updateContentForm = (field, value) => {
    setContentForm(current => ({ ...current, [field]: value }))
  }

  const saveContentInsight = (event) => {
    event.preventDefault()
    if (!contentForm.business.trim() || !contentForm.topic.trim() || !contentForm.insight.trim()) return

    const newInsight = {
      id: `insight-${Date.now()}`,
      business: contentForm.business.trim(),
      type: contentForm.type,
      topic: contentForm.topic.trim(),
      insight: contentForm.insight.trim(),
      action: contentForm.action.trim(),
      score: Math.max(0, Math.min(100, Number(contentForm.score) || 0)),
      createdAt: new Date().toISOString(),
    }

    setContentInsights(current => [newInsight, ...current])
    setContentForm(current => ({ ...current, topic: '', insight: '', action: '' }))
  }

  const deleteContentInsight = (id) => {
    setContentInsights(current => current.filter(item => item.id !== id))
  }

  const captureQuickInsight = (title, text, score = 80) => {
    const newInsight = {
      id: `insight-${Date.now()}`,
      business: 'Youngdo Clinic',
      type: title.toLowerCase().includes('reel') ? 'Reel' : 'Observation',
      topic: title,
      insight: text,
      action: title.toLowerCase().includes('seo')
        ? 'Improve keyword coverage in Page name, About and supporting content.'
        : 'Turn this signal into a repeatable content test for the next 7 days.',
      score,
      createdAt: new Date().toISOString(),
    }
    setContentInsights(current => [newInsight, ...current])
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">◈</span><span>ScoutIQ</span></div>
        <nav>
          {['Dashboard','Analyze','Competitors','Content','Ads Library','Reports','Settings'].map((item, i) => (
            <button
              key={item}
              className={i===0 ? 'active' : ''}
              onClick={item === 'Competitors' ? openCompetitors : item === 'Content' ? openContent : undefined}
            >{item}</button>
          ))}
        </nav>
        <div className="sideCard">
          <strong>ScoutIQ Beta</strong>
          <p>Save competitor content observations now. Live social-data connections can be added later.</p>
          <span>Content Vault active</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <small>SOCIAL INTELLIGENCE</small>
            <h1>{showResult ? 'Analyze Page' : 'Hello, AdsCraft 👋'}</h1>
          </div>
          <div className="account"><div className="avatar">A</div><div><b>AdsCraft Digital</b><span>ScoutIQ Workspace</span></div></div>
        </header>

        {!showResult ? (
          <>
            <section className="hero panel">
              <h2>Know what competitors are doing before your next move.</h2>
              <p>Analyze Facebook pages, compare activity, save content insights and turn observations into clear actions.</p>
              <div className="searchBox">
                <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="Paste Facebook Page URL" />
                <button onClick={()=>setShowResult(true)}>Analyze</button>
              </div>
            </section>

            <section className="featureGrid">
              {[
                ['⌕','Analyze Any Page','Turn a Facebook URL into a quick score.'],
                ['♙','Find Competitors','Compare similar businesses in one view.'],
                ['▣','Save Content Insights','Build your own competitor content intelligence library.'],
                ['✦','Get Actionable Tips','See what to improve next.'],
              ].map(([icon,title,text]) => (
                <article className="featureCard" key={title}><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article>
              ))}
            </section>

            <section id="content-vault" className="panel contentVault">
              <div className="panelHead contentVaultHead">
                <div><small>CONTENT INTELLIGENCE</small><h2>Content Insight Vault</h2></div>
                <span className="pill">Saved in this browser</span>
              </div>
              <p className="competitorIntro">Store what you notice from competitor posts before connecting Metricool. Your saved insights stay on this browser/device.</p>

              <div className="contentSummary">
                <div><strong>{contentInsights.length}</strong><span>Saved insights</span></div>
                <div><strong>{averageInsightScore || '—'}</strong><span>Average score</span></div>
                <div><strong>{new Set(contentInsights.map(item => item.business)).size}</strong><span>Businesses tracked</span></div>
              </div>

              <form className="contentForm" onSubmit={saveContentInsight}>
                <label className="fieldGroup">
                  <span>Business / Page</span>
                  <input value={contentForm.business} onChange={(e)=>updateContentForm('business', e.target.value)} placeholder="Youngdo Clinic" />
                </label>
                <label className="fieldGroup">
                  <span>Content type</span>
                  <select value={contentForm.type} onChange={(e)=>updateContentForm('type', e.target.value)}>
                    <option>Reel</option><option>Video</option><option>Static Post</option><option>Carousel</option><option>Review</option><option>Promotion</option><option>Observation</option>
                  </select>
                </label>
                <label className="fieldGroup scoreField">
                  <span>Insight score /100</span>
                  <input type="number" min="0" max="100" value={contentForm.score} onChange={(e)=>updateContentForm('score', e.target.value)} />
                </label>
                <label className="fieldGroup span2">
                  <span>Hook / Topic</span>
                  <input value={contentForm.topic} onChange={(e)=>updateContentForm('topic', e.target.value)} placeholder="e.g. Before/after transformation in first 2 seconds" />
                </label>
                <label className="fieldGroup span2">
                  <span>Insight</span>
                  <textarea value={contentForm.insight} onChange={(e)=>updateContentForm('insight', e.target.value)} placeholder="What is working, weak, different or worth testing?" />
                </label>
                <label className="fieldGroup span2">
                  <span>Recommended action</span>
                  <textarea value={contentForm.action} onChange={(e)=>updateContentForm('action', e.target.value)} placeholder="What should we do with this insight?" />
                </label>
                <div className="contentFormAction"><button className="primary" type="submit">+ Save Insight</button><span>No Metricool installation required.</span></div>
              </form>

              <div className="vaultToolbar">
                <div><b>Saved Content Insights</b><span>{filteredInsights.length} shown</span></div>
                <input value={contentSearch} onChange={(e)=>setContentSearch(e.target.value)} placeholder="Search business, topic or insight…" />
              </div>

              <div className="insightTableWrap">
                <table className="insightTable">
                  <thead><tr><th>Business</th><th>Type / Topic</th><th>Insight</th><th>Action</th><th>Score</th><th></th></tr></thead>
                  <tbody>
                    {filteredInsights.length ? filteredInsights.map(item => (
                      <tr key={item.id}>
                        <td><b>{item.business}</b><small>{formatSavedDate(item.createdAt)}</small></td>
                        <td><span className="contentType">{item.type}</span><b className="topicText">{item.topic}</b></td>
                        <td>{item.insight}</td>
                        <td>{item.action || '—'}</td>
                        <td><span className={`scoreBadge ${Number(item.score) >= 80 ? 'high' : Number(item.score) >= 60 ? 'mid' : 'low'}`}>{item.score}</span></td>
                        <td><button className="deleteBtn" type="button" onClick={()=>deleteContentInsight(item.id)} aria-label="Delete insight">×</button></td>
                      </tr>
                    )) : <tr><td colSpan="6" className="emptyState">No saved insights match this search.</td></tr>}
                  </tbody>
                </table>
              </div>
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
              <button className="secondary" onClick={openContent}>Open Content Vault</button>
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
                <div className="panelHead"><div><small>AI ANALYSIS</small><h2>Quick insights</h2></div><span className="pill">Saveable</span></div>
                <Insight type="up" title="Reels performing strongly" text="Video content is the clearest growth signal." onSave={()=>captureQuickInsight('Reels performing strongly','Video content is the clearest growth signal.',88)} />
                <Insight type="up" title="Review content generates engagement" text="Customer proof strengthens trust and response." onSave={()=>captureQuickInsight('Review content generates engagement','Customer proof strengthens trust and response.',84)} />
                <Insight type="down" title="Facebook Page SEO can improve" text="Improve keyword coverage in naming and About." onSave={()=>captureQuickInsight('Facebook Page SEO can improve','Improve keyword coverage in naming and About.',68)} />
                <Insight type="down" title="CTA consistency is weak" text="Use one primary action across high-intent content." onSave={()=>captureQuickInsight('CTA consistency is weak','Use one primary action across high-intent content.',65)} />
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
                <button className="primary" onClick={()=>captureQuickInsight('Recommended focus','Double down on proof-led Reels, then tighten CTA consistency and Facebook Page keyword coverage.',86)}>Save to Content Vault</button>
              </div>
            </section>
            <div className="notice"><b>ScoutIQ Beta:</b> analysis metrics are still demo data, but Content Insight Vault entries are saved in your browser now.</div>
          </>
        )}
      </main>
    </div>
  )
}

function Insight({type,title,text,onSave}) {
  return <div className="insight"><span className={type==='up'?'signal up':'signal down'}>{type==='up'?'↗':'↘'}</span><div className="grow"><b>{title}</b><p>{text}</p></div>{onSave && <button className="miniSave" type="button" onClick={onSave}>Save</button>}</div>
}

function Stat({value,label}) {
  return <div className="stat"><strong>{value}</strong><span>{label}</span></div>
}
