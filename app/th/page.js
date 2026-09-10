'use client'

import { useMemo, useState } from 'react'

const navItems = ['แดชบอร์ด', 'วิเคราะห์', 'คู่แข่ง', 'คอนเทนต์', 'คลังโฆษณา', 'รายงาน', 'ตั้งค่า']
const defaultCompetitors = ['inZ Hospital', 'Lovely Eye & Skin', 'Beproud Clinic']
const demoScores = [82, 79, 74]

const comparisonFactors = [
  { name: 'Facebook SEO', weight: 15, source: 'Facebook Page', description: 'ชื่อเพจ หมวดหมู่ Username/URL คีย์เวิร์ดใน About และโอกาสค้นหาเจอ' },
  { name: 'Content Activity', weight: 15, source: 'Metricool', description: 'ความถี่การโพสต์ สัดส่วน Reels/Video และความสม่ำเสมอในช่วง 7 วันล่าสุด' },
  { name: 'Engagement', weight: 20, source: 'Metricool', description: 'Reaction, Comment และ Share เมื่อเทียบกับปริมาณคอนเทนต์' },
  { name: 'Creative Quality', weight: 15, source: 'ScoutIQ AI', description: 'Hook, Visual, Proof, รูปแบบคอนเทนต์ และความชัดเจนของข้อความ' },
  { name: 'Offer Strength', weight: 15, source: 'ScoutIQ AI', description: 'ความชัดเจนของบริการ โปรโมชัน Value Proposition, Urgency และ CTA' },
  { name: 'Paid Ads Activity', weight: 10, source: 'Meta Ads Library', description: 'จำนวนโฆษณาที่เห็นได้ ความหลากหลายของ Creative และรูปแบบข้อเสนอ' },
  { name: 'Competitor Position', weight: 10, source: 'ScoutIQ', description: 'ความแข็งแรงโดยรวมเมื่อเทียบกับธุรกิจอื่นในชุดเดียวกัน' },
]

const scoreMetrics = [
  ['Facebook SEO', 72], ['Content Activity', 88], ['Engagement', 69],
  ['Creative Quality', 82], ['Offer Strength', 80], ['Paid Ads Activity', 74], ['Competitor Position', 71],
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

export default function ThaiScoutIQ() {
  const [activePage, setActivePage] = useState('แดชบอร์ด')
  const [url, setUrl] = useState('https://www.facebook.com/share/1DdhEhqgRU/')
  const [competitorInputs, setCompetitorInputs] = useState(defaultCompetitors)
  const [competitors, setCompetitors] = useState(defaultCompetitors)
  const [hasCompared, setHasCompared] = useState(false)
  const [insights, setInsights] = useState([
    {id:'1',business:'Youngdo Clinic',topic:'Before / After transformation',insight:'คอนเทนต์ที่แสดงผลลัพธ์ชัดเจนตั้งแต่ช่วงต้นช่วยดึงความสนใจได้ดี',score:88},
    {id:'2',business:'inZ Hospital',topic:'รีวิว + ความน่าเชื่อถือของแพทย์',insight:'การใช้รีวิวร่วมกับความเชี่ยวชาญของแพทย์ช่วยเพิ่มความน่าเชื่อถือก่อนตัดสินใจ',score:82},
  ])

  const comparison = useMemo(() => [
    ['Youngdo Clinic', 76],
    ...competitors.map((name, index) => [displayBusinessName(name, `คู่แข่ง ${index + 1}`), demoScores[index]]),
  ].sort((a,b)=>b[1]-a[1]), [competitors])

  const updateCompetitor = (index, value) => setCompetitorInputs(current => current.map((item,i)=>i===index?value:item))
  const compareThree = () => {
    setCompetitors(competitorInputs.map((item,index)=>item.trim() || `คู่แข่ง ${index+1}`))
    setHasCompared(true)
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">◈</span><span>ScoutIQ</span></div>
        <nav>{navItems.map(item => <button key={item} type="button" className={activePage===item?'active':''} onClick={()=>setActivePage(item)}>{item}</button>)}</nav>
        <div className="sideCard"><strong>ScoutIQ ภาษาไทย</strong><p>ระบบวิเคราะห์ Social Intelligence และคู่แข่ง</p><span>Prototype mode</span></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><small>SOCIAL INTELLIGENCE</small><h1>{activePage==='แดชบอร์ด'?'สวัสดี AdsCraft 👋':activePage}</h1></div>
          <div className="account"><div className="avatar">A</div><div><b>AdsCraft Digital</b><span>ScoutIQ Workspace</span></div></div>
        </header>

        {activePage==='แดชบอร์ด' && <DashboardTH url={url} setUrl={setUrl} setActivePage={setActivePage} comparison={comparison}/>}        
        {activePage==='วิเคราะห์' && <AnalyzeTH url={url} setUrl={setUrl} setActivePage={setActivePage}/>}        
        {activePage==='คู่แข่ง' && <CompetitorsTH competitorInputs={competitorInputs} updateCompetitor={updateCompetitor} compareThree={compareThree} comparison={comparison} hasCompared={hasCompared}/>}        
        {activePage==='คอนเทนต์' && <ContentTH insights={insights} setInsights={setInsights}/>}        
        {['คลังโฆษณา','รายงาน','ตั้งค่า'].includes(activePage) && <PlaceholderTH title={activePage}/>}      
      </main>
    </div>
  )
}

function DashboardTH({url,setUrl,setActivePage,comparison}) {
  return <>
    <section className="hero panel">
      <h2>รู้ว่าคู่แข่งกำลังทำอะไร ก่อนวางแผนการตลาดครั้งต่อไป</h2>
      <p>วิเคราะห์ Facebook Page เปรียบเทียบคู่แข่ง ดูแนวโน้มคอนเทนต์ และเปลี่ยนข้อมูลให้เป็น Action ที่นำไปใช้ได้จริง</p>
      <div className="searchBox"><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="วาง Facebook Page URL"/><button type="button" onClick={()=>setActivePage('วิเคราะห์')}>วิเคราะห์</button></div>
    </section>
    <section className="featureGrid">
      <FeatureTH icon="⌕" title="วิเคราะห์เพจ" text="ใส่ Facebook URL เพื่อดู ScoutIQ Score และ Insight" onClick={()=>setActivePage('วิเคราะห์')}/>
      <FeatureTH icon="♙" title="เปรียบเทียบคู่แข่ง" text="เพิ่มคู่แข่ง 3 ธุรกิจแล้วเปรียบเทียบแบบเดียวกัน" onClick={()=>setActivePage('คู่แข่ง')}/>
      <FeatureTH icon="▤" title="ดูโฆษณาคู่แข่ง" text="เตรียมข้อมูลคู่แข่งจาก Meta Ads Library" onClick={()=>setActivePage('คลังโฆษณา')}/>
      <FeatureTH icon="✦" title="คำแนะนำที่นำไปใช้ได้" text="ดูจุดแข็ง จุดอ่อน และสิ่งที่ควรปรับต่อ" onClick={()=>setActivePage('วิเคราะห์')}/>
    </section>
    <section className="twoCol">
      <div className="panel"><div className="panelHead"><div><small>BENCHMARK</small><h2>เปรียบเทียบคู่แข่ง</h2></div><span className="pill">7 วันล่าสุด</span></div><ComparisonBarsTH comparison={comparison}/><button className="secondary" type="button" style={{marginTop:18}} onClick={()=>setActivePage('คู่แข่ง')}>ดูรายละเอียดการเปรียบเทียบ</button></div>
      <div className="panel"><div className="panelHead"><div><small>AI SIGNALS</small><h2>Opportunity Radar</h2></div><span className="pill">AI</span></div><InsightTH type="up" title="Reels กำลังเด่น" text="คอนเทนต์วิดีโอทำผลงานดีกว่าโพสต์ภาพนิ่ง"/><InsightTH type="up" title="รีวิวช่วยสร้าง Engagement" text="Before/After และรีวิวลูกค้าช่วยเพิ่มความน่าเชื่อถือ"/><InsightTH type="down" title="Facebook SEO ยังมีช่องว่าง" text="ชื่อเพจและคีย์เวิร์ดใน About ยังปรับได้อีก"/></div>
    </section>
  </>
}

function AnalyzeTH({url,setUrl,setActivePage}) {
  const followerTrend = [119800,120050,120220,120480,120710,120880,121200]
  const max = Math.max(...followerTrend), min = Math.min(...followerTrend)
  return <>
    <div className="searchBox topSearch"><input value={url} onChange={e=>setUrl(e.target.value)}/><button type="button">วิเคราะห์อีกครั้ง</button></div>
    <section className="identity panel">
      <div className="logoBubble">Y</div><div className="grow"><h2>Youngdo Clinic</h2><p>@youngdoclinic · Health / Beauty · Bangkok, Thailand</p><a href={url} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#6747f5',fontWeight:750}}>เปิด Facebook Page ↗</a></div>
      <button className="secondary" type="button" onClick={()=>setActivePage('คู่แข่ง')}>เปรียบเทียบคู่แข่ง</button>
    </section>
    <section className="featureGrid" style={{marginTop:18}}>
      <StatCard value="121.2K" label="Followers"/><StatCard value="+1.4K" label="ผู้ติดตามใหม่ 7 วัน"/><StatCard value="+1.17%" label="Follower Growth"/><StatCard value="11" label="โพสต์ 7 วัน"/>
    </section>
    <section className="twoCol">
      <div className="panel scorePanel"><small>SCOUTIQ SCORE</small><div className="scoreWrap"><div className="scoreRing"><div><strong>76</strong><span>/100</span></div></div><div className="metricList">{scoreMetrics.map(([m,s])=><div key={m}><span>{m}</span><b>{s}</b></div>)}</div></div></div>
      <div className="panel"><div className="panelHead"><div><small>FOLLOWER TREND</small><h2>แนวโน้มผู้ติดตาม 7 วัน</h2></div><span className="pill">Demo</span></div><div style={{display:'flex',alignItems:'end',gap:8,height:170,marginTop:22,borderBottom:'1px solid #e6e8f0',paddingBottom:6}}>{followerTrend.map((v,i)=>{const h=45+((v-min)/(max-min))*100;return <div key={i} style={{flex:1,display:'grid',gap:6,alignItems:'end'}}><div title={String(v)} style={{height:h,borderRadius:'7px 7px 2px 2px',background:'linear-gradient(180deg,#8068ff,#5b3fe8)'}}></div><span style={{fontSize:10,color:'#6d7485',textAlign:'center'}}>D{i+1}</span></div>})}</div><p className="muted" style={{fontSize:12}}>ผู้ติดตามเพิ่มขึ้นต่อเนื่องในช่วง 7 วันล่าสุด โดยเพิ่มประมาณ 1,400 คน</p></div>
    </section>
    <section className="twoCol">
      <div className="panel"><div className="panelHead"><div><small>PAGE DETAILS</small><h2>ข้อมูลเพจ</h2></div><span className="pill">Demo</span></div><div className="metricList" style={{marginTop:18}}><div><span>Category</span><b>Health / Beauty</b></div><div><span>Location</span><b>Bangkok</b></div><div><span>Avg. Engagement</span><b>3.8%</b></div><div><span>Top Format</span><b>Reels</b></div></div></div>
      <div className="panel"><div className="panelHead"><div><small>AI ANALYSIS</small><h2>Quick Insights</h2></div><span className="pill">AI</span></div><InsightTH type="up" title="Follower trend เป็นบวก" text="ฐานผู้ติดตามโตต่อเนื่องตลอด 7 วัน"/><InsightTH type="up" title="Reels ทำผลงานเด่น" text="วิดีโอเป็นรูปแบบคอนเทนต์ที่เด่นที่สุด"/><InsightTH type="down" title="SEO ยังปรับได้" text="เพิ่มคีย์เวิร์ดในชื่อและ About เพื่อช่วยการค้นหา"/></div>
    </section>
    <div className="notice"><b>หมายเหตุ:</b> ข้อมูล Followers และ Trend ในหน้านี้เป็น Demo จนกว่าจะเชื่อม Metricool/Facebook Data จริง</div>
  </>
}

function CompetitorsTH({competitorInputs,updateCompetitor,compareThree,comparison,hasCompared}) {
  return <>
    <section className="panel" style={{padding:28}}><div className="panelHead"><div><small>COMPETITOR SETUP</small><h2>เพิ่มคู่แข่ง 3 ธุรกิจ</h2></div><span className="pill">กรอกเอง</span></div><p className="muted"><b>ธุรกิจของคุณ:</b> Youngdo Clinic · ใส่ชื่อธุรกิจหรือ Facebook Page URL ของคู่แข่ง 3 ราย</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:22}}>{competitorInputs.map((value,index)=><label key={index} style={{display:'grid',gap:7}}><span style={{fontSize:12,fontWeight:750}}>คู่แข่ง {index+1}</span><input value={value} onChange={e=>updateCompetitor(index,e.target.value)} placeholder={`ชื่อธุรกิจหรือ Facebook URL`} style={{border:'1px solid #e6e8f0',borderRadius:10,padding:'13px 12px',outline:'none'}}/></label>)}</div><div style={{display:'flex',alignItems:'center',gap:12,marginTop:18,flexWrap:'wrap'}}><button className="primary" type="button" onClick={compareThree}>เปรียบเทียบ 3 ธุรกิจ</button><span className="muted" style={{fontSize:12}}>คะแนนจริงจะใช้งานเมื่อเชื่อมข้อมูล Live</span></div></section>
    <section className="panel" style={{marginTop:18}}><div className="panelHead"><div><small>BENCHMARK</small><h2>{hasCompared?'อัปเดตการเปรียบเทียบแล้ว':'เปรียบเทียบคู่แข่ง'}</h2></div><span className="pill">ScoutIQ Score /100</span></div><ComparisonBarsTH comparison={comparison}/></section>
    <section className="panel" style={{marginTop:18}}><div className="panelHead"><div><small>SCORING METHOD</small><h2>ScoutIQ คำนวณคะแนนอย่างไร</h2></div><span className="pill">ใช้คำนวณอะไร</span></div><p className="muted" style={{maxWidth:850}}>เปรียบเทียบธุรกิจของคุณกับคู่แข่ง 3 รายใน 7 ปัจจัย เพื่อดูจุดแข็ง จุดอ่อน ช่องว่างอันดับ และคำแนะนำที่ควรทำต่อ</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:18}}>{comparisonFactors.map(f=><article key={f.name} style={{border:'1px solid #e6e8f0',borderRadius:14,padding:16,background:'#fafbff'}}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><b>{f.name}</b><span className="pill">{f.weight}%</span></div><p className="muted" style={{fontSize:12,lineHeight:1.5,minHeight:54}}>{f.description}</p><span style={{fontSize:11,fontWeight:750,color:'#6747f5'}}>แหล่งข้อมูล: {f.source}</span></article>)}</div></section>
  </>
}

function ContentTH({insights,setInsights}) {
  const [form,setForm]=useState({business:'Youngdo Clinic',topic:'',insight:''})
  const save=e=>{e.preventDefault();if(!form.business.trim()||!form.topic.trim()||!form.insight.trim())return;setInsights(current=>[{id:String(Date.now()),score:80,...form},...current]);setForm({...form,topic:'',insight:''})}
  return <section className="panel"><div className="panelHead"><div><small>CONTENT INTELLIGENCE</small><h2>คลัง Content Insight</h2></div><span className="pill">บันทึกใน Browser</span></div><form onSubmit={save} style={{display:'grid',gap:10,margin:'18px 0'}}><input style={inputStyle} value={form.business} onChange={e=>setForm({...form,business:e.target.value})} placeholder="ชื่อธุรกิจ"/><input style={inputStyle} value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="หัวข้อ / Hook ของคอนเทนต์"/><textarea style={{...inputStyle,minHeight:80}} value={form.insight} onChange={e=>setForm({...form,insight:e.target.value})} placeholder="Insight ที่พบ"/><button className="primary" type="submit" style={{width:'fit-content'}}>+ บันทึก Insight</button></form>{insights.map(item=><div key={item.id} style={{borderTop:'1px solid #e6e8f0',padding:'14px 0'}}><b>{item.business} · {item.topic}</b><p className="muted" style={{marginBottom:0}}>{item.insight}</p></div>)}</section>
}

const inputStyle={border:'1px solid #e6e8f0',borderRadius:10,padding:'12px',font:'inherit'}
function PlaceholderTH({title}){return <section className="panel"><small>SCOUTIQ MODULE</small><h2>{title}</h2><span className="pill">Coming soon</span><p className="muted">เมนูนี้เปิดใช้งานได้ แต่ยังไม่ได้เชื่อมข้อมูล Live</p></section>}
function FeatureTH({icon,title,text,onClick}){return <article className="featureCard" onClick={onClick} role="button" tabIndex={0} style={{cursor:'pointer'}}><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article>}
function ComparisonBarsTH({comparison}){return <div className="bars">{comparison.map(([name,score],index)=><div className="barRow" key={`${name}-${score}`}><span><b>#{index+1}</b> {name}</span><div className="track"><i style={{width:`${score}%`}}/></div><b>{score}</b></div>)}</div>}
function InsightTH({type,title,text}){return <div className="insight"><span className={type==='up'?'signal up':'signal down'}>{type==='up'?'↗':'↘'}</span><div><b>{title}</b><p>{text}</p></div></div>}
function StatCard({value,label}){return <article className="featureCard"><h3 style={{fontSize:24,margin:'0 0 6px'}}>{value}</h3><p>{label}</p></article>}
