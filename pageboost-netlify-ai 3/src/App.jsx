import { useState, useEffect } from 'react'

const OPTIMAL_TIMES = [
  { day: 'Monday',    slots: ['9:00 AM', '1:00 PM', '7:00 PM'], engagement: 87 },
  { day: 'Tuesday',  slots: ['8:00 AM', '2:00 PM', '9:00 PM'], engagement: 92 },
  { day: 'Wednesday',slots: ['11:00 AM','3:00 PM', '8:00 PM'], engagement: 95 },
  { day: 'Thursday', slots: ['10:00 AM','2:00 PM', '7:00 PM'], engagement: 89 },
  { day: 'Friday',   slots: ['9:00 AM', '12:00 PM','6:00 PM'], engagement: 91 },
  { day: 'Saturday', slots: ['10:00 AM','1:00 PM', '5:00 PM'], engagement: 88 },
  { day: 'Sunday',   slots: ['11:00 AM','3:00 PM', '7:00 PM'], engagement: 84 },
]
const VIRAL_TRENDS = [
  { tag: '#MondayMotivation', score: 98, growth: '+340%', category: 'Lifestyle' },
  { tag: '#ThrowbackThursday', score: 95, growth: '+210%', category: 'Nostalgia' },
  { tag: '#BehindTheScenes',  score: 93, growth: '+185%', category: 'Brand' },
  { tag: '#CustomerStories',  score: 91, growth: '+162%', category: 'Social Proof' },
  { tag: '#TipOfTheDay',      score: 89, growth: '+148%', category: 'Educational' },
  { tag: '#FlashSale',        score: 87, growth: '+130%', category: 'Promotions' },
  { tag: '#UserGenerated',    score: 85, growth: '+112%', category: 'Community' },
  { tag: '#LiveVideo',        score: 94, growth: '+290%', category: 'Engagement' },
]
const CONTENT_STRATEGIES = [
  { icon: '🎯', title: 'Hook in 3 Seconds',  desc: 'Start every post with a bold statement or question to stop the scroll.' },
  { icon: '🖼️', title: 'Visual-First',        desc: 'Posts with images get 2.3× more engagement. Use bright, high-contrast photos.' },
  { icon: '💬', title: 'Ask Questions',       desc: 'Questions in captions increase comments by 162%. End every post with one.' },
  { icon: '⏰', title: 'Post Consistently',   desc: 'Pages that post 1–2× daily see 3× more reach than weekly posters.' },
  { icon: '🔥', title: 'Ride Trends Fast',    desc: 'Engage with viral topics within 2 hours for maximum algorithm boost.' },
  { icon: '📊', title: 'Use Facebook Reels', desc: 'Reels get 67% more reach than static posts in 2025.' },
]
const SAMPLE_POSTS = [
  { id: 1, type: 'photo', content: '🌟 Big things are coming! Stay tuned for an exciting announcement. Double tap if you\'re ready! 👇 #ComingSoon #StayTuned', scheduled: 'Today, 9:00 AM', status: 'scheduled', engagement_pred: 'High' },
  { id: 2, type: 'text',  content: '💡 The secret to success isn\'t working harder — it\'s working smarter. What\'s one intentional thing you did today? Tell us below! 👇 #MondayMotivation', scheduled: 'Today, 1:00 PM', status: 'scheduled', engagement_pred: 'Very High' },
  { id: 3, type: 'photo', content: '📸 Behind the scenes — how we craft our products with love and care. Every detail matters because YOU matter. ❤️ #BehindTheScenes #Quality', scheduled: 'Today, 7:00 PM', status: 'scheduled', engagement_pred: 'High' },
  { id: 4, type: 'reel',  content: '🎬 REEL: 5 things our customers say changed their lives — you won\'t believe #3! Watch till the end 👀 #CustomerStories #Viral', scheduled: 'Tomorrow, 9:00 AM', status: 'draft', engagement_pred: 'Viral' },
]

// API helpers
async function generateCaption(topic, tone, hashtags, postType) {
  const res = await fetch('/api/generate-caption', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ topic, tone, hashtags, postType }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.result
}
async function generateStrategy(niche) {
  const res = await fetch('/api/generate-strategy', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ niche }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.result
}
async function checkFbStatus() {
  try { const res = await fetch('/api/fb-status'); return await res.json() }
  catch { return { connected: false } }
}
async function postToFacebook(message, imageUrl) {
  const res = await fetch('/api/post-to-facebook', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message, imageUrl }) })
  return await res.json()
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0d14;--surface:#111520;--card:#161c2e;--border:#1f2a45;--blue:#1877f2;--blue-g:rgba(24,119,242,.22);--accent:#00d4ff;--green:#00e676;--gold:#ffd740;--red:#ff5252;--purple:#b388ff;--text:#e8edf5;--muted:#6b7a99;--ff:'Syne',sans-serif;--fb:'DM Sans',sans-serif}
body{background:var(--bg);color:var(--text);font-family:var(--fb)}
.app{min-height:100vh;background:var(--bg);background-image:radial-gradient(ellipse at 20% 0%,rgba(24,119,242,.08) 0%,transparent 55%),radial-gradient(ellipse at 80% 100%,rgba(0,212,255,.05) 0%,transparent 55%)}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:18px 32px;background:rgba(17,21,32,.96);border-bottom:1px solid var(--border);backdrop-filter:blur(20px);position:sticky;top:0;z-index:100}
.logo{display:flex;align-items:center;gap:12px}
.logo-icon{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1877f2,#0a52c4);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;font-family:var(--ff);box-shadow:0 0 24px var(--blue-g)}
.logo-name{font-family:var(--ff);font-size:18px;font-weight:800;letter-spacing:-.3px}
.logo-sub{font-size:11px;color:var(--muted);margin-top:-2px}
.hdr-r{display:flex;align-items:center;gap:10px}
.live{display:flex;align-items:center;gap:6px;padding:5px 13px;border-radius:20px;background:rgba(0,230,118,.1);border:1px solid rgba(0,230,118,.3);font-size:12px;color:var(--green);font-weight:600}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 1.5s infinite}
.fb-badge{display:flex;align-items:center;gap:6px;padding:5px 13px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid;cursor:pointer;transition:all .2s}
.fb-badge.on{background:rgba(24,119,242,.15);border-color:rgba(24,119,242,.4);color:#60a5fa}
.fb-badge.off{background:rgba(255,82,82,.1);border-color:rgba(255,82,82,.3);color:var(--red)}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
.nav{display:flex;gap:2px;padding:0 32px;border-bottom:1px solid var(--border);background:var(--surface);overflow-x:auto}
.nav::-webkit-scrollbar{display:none}
.tab{padding:14px 18px;font-size:13px;font-weight:600;color:var(--muted);border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;font-family:var(--fb)}
.tab:hover{color:var(--text)}
.tab.on{color:var(--blue);border-bottom-color:var(--blue)}
.main{padding:28px 32px;max-width:1400px;margin:0 auto}
.col{display:flex;flex-direction:column;gap:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;transition:border-color .2s,box-shadow .2s}
.card:hover{border-color:rgba(24,119,242,.3);box-shadow:0 0 28px rgba(24,119,242,.05)}
.card-title{font-family:var(--ff);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:18px}
.stat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--blue),var(--accent))}
.stat-label{font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.stat-val{font-family:var(--ff);font-size:32px;font-weight:800;margin:6px 0 4px;letter-spacing:-1px}
.stat-ch{font-size:12px;font-weight:600;color:var(--green)}
.btn{padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:var(--fb);transition:all .2s;display:inline-flex;align-items:center;gap:7px}
.btn-p{background:var(--blue);color:#fff}
.btn-p:hover:not(:disabled){background:#1565d8;box-shadow:0 0 20px var(--blue-g);transform:translateY(-1px)}
.btn-p:disabled{opacity:.5;cursor:not-allowed}
.btn-g{background:rgba(255,255,255,.05);color:var(--text);border:1px solid var(--border)}
.btn-g:hover{background:rgba(255,255,255,.09)}
.btn-d{background:rgba(255,82,82,.15);color:var(--red);border:1px solid rgba(255,82,82,.3)}
.btn-s{background:rgba(0,230,118,.15);color:var(--green);border:1px solid rgba(0,230,118,.3)}
.btn-fb{background:var(--blue);color:#fff;width:100%;justify-content:center;padding:14px 20px;font-size:14px;border-radius:12px}
.btn-fb:hover:not(:disabled){background:#1565d8;box-shadow:0 0 24px var(--blue-g);transform:translateY(-1px)}
.btn-fb:disabled{opacity:.5;cursor:not-allowed}
.inp,.sel,.ta{width:100%;padding:11px 14px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);font-family:var(--fb);font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus,.sel:focus,.ta:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-g)}
.ta{resize:vertical;min-height:130px;line-height:1.6}
.sel option{background:var(--card)}
.frow{display:flex;gap:12px}
.frow>*{flex:1}
label{font-size:12px;color:var(--muted);font-weight:600;margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:.5px}
.post-item{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;gap:14px;align-items:flex-start;transition:all .2s}
.post-item:hover{border-color:rgba(24,119,242,.3);background:rgba(24,119,242,.04)}
.ptype{width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px}
.pcontent{font-size:13px;line-height:1.6;color:var(--text);margin-bottom:10px}
.pmeta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tag{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.t-blue{background:rgba(24,119,242,.15);color:#60a5fa;border:1px solid rgba(24,119,242,.2)}
.t-green{background:rgba(0,230,118,.15);color:var(--green);border:1px solid rgba(0,230,118,.2)}
.t-gold{background:rgba(255,215,64,.15);color:var(--gold);border:1px solid rgba(255,215,64,.2)}
.t-red{background:rgba(255,82,82,.15);color:var(--red);border:1px solid rgba(255,82,82,.2)}
.t-purple{background:rgba(179,136,255,.15);color:var(--purple);border:1px solid rgba(179,136,255,.2)}
.ai-box{background:rgba(24,119,242,.06);border:1px solid rgba(24,119,242,.2);border-radius:12px;padding:16px;font-size:13px;line-height:1.8;white-space:pre-wrap}
.err-box{background:rgba(255,82,82,.08);border:1px solid rgba(255,82,82,.25);border-radius:12px;padding:14px;font-size:13px;color:var(--red)}
.ok-box{background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.25);border-radius:12px;padding:14px;font-size:13px;color:var(--green);line-height:1.6}
.info-box{background:rgba(255,215,64,.06);border:1px solid rgba(255,215,64,.2);border-radius:12px;padding:16px;font-size:13px;line-height:1.7}
.dot-anim::after{content:'...';animation:dots 1.4s infinite}
@keyframes dots{0%{content:'.'}33%{content:'..'}66%{content:'...'}}
.step{display:flex;gap:16px;align-items:flex-start;padding:18px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:12px;margin-bottom:12px}
.step-num{width:34px;height:34px;border-radius:50%;background:var(--blue);color:#fff;font-family:var(--ff);font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 16px var(--blue-g)}
.step-title{font-family:var(--ff);font-size:15px;font-weight:700;margin-bottom:6px}
.step-desc{font-size:13px;color:var(--muted);line-height:1.7}
.step-desc a{color:#60a5fa;text-decoration:none}
.step-desc a:hover{text-decoration:underline}
.step-code{background:rgba(0,0,0,.5);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-family:monospace;font-size:12px;color:var(--accent);margin-top:8px;word-break:break-all;line-height:1.6}
.fb-page-card{display:flex;align-items:center;gap:16px;padding:20px;background:rgba(24,119,242,.08);border:1px solid rgba(24,119,242,.25);border-radius:14px}
.fb-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0a52c4);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;overflow:hidden;box-shadow:0 0 20px var(--blue-g)}
.fb-avatar img{width:100%;height:100%;object-fit:cover}
.fb-name{font-family:var(--ff);font-size:20px;font-weight:800}
.fb-fans{font-size:13px;color:var(--muted);margin-top:3px}
.trend{display:flex;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)}
.trend:last-child{border-bottom:none}
.t-bar{height:3px;border-radius:2px;background:rgba(255,255,255,.06);margin-top:6px;width:100%}
.t-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--blue),var(--accent))}
.tgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
.tcol{display:flex;flex-direction:column;align-items:center;gap:5px}
.tday{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase}
.tslot{padding:5px 6px;border-radius:7px;font-size:10px;font-weight:600;background:rgba(24,119,242,.12);border:1px solid rgba(24,119,242,.2);color:#60a5fa;text-align:center;width:100%}
.tslot.best{background:rgba(0,230,118,.15);border-color:rgba(0,230,118,.3);color:var(--green)}
.ebar{height:4px;width:100%;border-radius:2px;background:rgba(255,255,255,.06);margin-top:3px}
.efill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--green),#69f0ae)}
.strat{background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:12px;padding:18px;transition:all .2s}
.strat:hover{border-color:rgba(24,119,242,.3);transform:translateY(-2px)}
.prog-wrap{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.prog-bar{flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.prog-fill{height:100%;border-radius:3px}
.prog-label{font-size:12px;color:var(--muted);min-width:88px}
.prog-val{font-size:12px;font-weight:700;min-width:34px;text-align:right}
.cgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.chead{text-align:center;font-size:11px;font-weight:700;color:var(--muted);padding:6px 0;text-transform:uppercase}
.ccell{aspect-ratio:1;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 4px;font-size:11px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .15s;background:rgba(255,255,255,.02);border:1px solid transparent}
.ccell:hover{background:rgba(24,119,242,.1);border-color:rgba(24,119,242,.2);color:var(--text)}
.ccell.has{background:rgba(24,119,242,.1);border-color:rgba(24,119,242,.25);color:var(--text)}
.ccell.today{background:var(--blue);color:#fff;border-color:var(--blue)}
.cdot{width:4px;height:4px;border-radius:50%;background:var(--accent);margin-top:2px}
.shdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.stitle{font-family:var(--ff);font-size:20px;font-weight:800}
.ssub{font-size:13px;color:var(--muted);margin-top:3px}
.toast{position:fixed;bottom:24px;right:24px;padding:14px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:9999;animation:slideIn .3s ease;max-width:340px;line-height:1.5;cursor:pointer}
.toast.success{background:#00e676;color:#000}
.toast.error{background:var(--red);color:#fff}
@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@media(max-width:900px){.main{padding:16px}.g2,.g3,.g4{grid-template-columns:1fr}.tgrid{grid-template-columns:repeat(4,1fr)}.hdr{padding:14px 16px}.nav{padding:0 16px}.frow{flex-direction:column}}
`

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t) }, [])
  return <div className={`toast ${type}`} onClick={onClose}>{msg}</div>
}

function FacebookSetup({ onDone }) {
  return (
    <div className="col">
      <div className="card">
        <div className="card-title">🔌 Connect Your Facebook Page — 4 Easy Steps</div>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:24, lineHeight:1.7 }}>
          This takes about 10 minutes and is completely free. Once connected, you can publish posts directly from this app to your Facebook Page.
        </p>

        <div className="step">
          <div className="step-num">1</div>
          <div>
            <div className="step-title">Create a Facebook Developer Account</div>
            <div className="step-desc">
              Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer">developers.facebook.com</a> → click <strong>"Get Started"</strong>.
              Log in with your Facebook account (the one that manages your Page). Accept the developer terms — it's free.
            </div>
          </div>
        </div>

        <div className="step">
          <div className="step-num">2</div>
          <div>
            <div className="step-title">Create a New App</div>
            <div className="step-desc">
              Click <strong>"My Apps" → "Create App"</strong>.<br />
              • Use case: choose <strong>"Other"</strong><br />
              • Type: choose <strong>"Business"</strong><br />
              • Give it any name (e.g. "PageBoost")<br />
              • Click <strong>"Create App"</strong>
            </div>
          </div>
        </div>

        <div className="step">
          <div className="step-num">3</div>
          <div>
            <div className="step-title">Get Your Page Access Token</div>
            <div className="step-desc">
              In your app dashboard, go to <strong>Tools → Graph API Explorer</strong>:
            </div>
            <div className="step-code">https://developers.facebook.com/tools/explorer/</div>
            <div className="step-desc" style={{ marginTop:10 }}>
              • Under <strong>"Meta App"</strong> — select your app<br />
              • Under <strong>"User or Page"</strong> — click <strong>"Get Page Access Token"</strong><br />
              • Select your Facebook Page from the dropdown<br />
              • Tick these permissions: <strong>pages_manage_posts</strong>, <strong>pages_read_engagement</strong>, <strong>pages_show_list</strong><br />
              • Click <strong>"Generate Access Token"</strong> → approve in the popup<br />
              • Copy the long token that appears (starts with EAA...)
            </div>
          </div>
        </div>

        <div className="step">
          <div className="step-num">4</div>
          <div>
            <div className="step-title">Add to Netlify Environment Variables</div>
            <div className="step-desc">
              Go to <strong>Netlify → your site → Site Configuration → Environment Variables → Add variable</strong>:
            </div>
            <div className="step-code">Variable name: FB_PAGE_ACCESS_TOKEN{'\n'}Value: EAAxxxxx... (paste the token you copied)</div>
            <div className="step-code" style={{ marginTop:8 }}>Variable name: FB_PAGE_ID{'\n'}Value: 123456789012345 (your Page's numeric ID)</div>
            <div className="step-desc" style={{ marginTop:12 }}>
              💡 <strong>Find your Page ID:</strong> Go to your Facebook Page → About → scroll to bottom → copy the number under "Page ID".<br /><br />
              After adding both variables → go to <strong>Netlify Deploys → Trigger deploy</strong> → wait ~1 min → refresh this page. ✅
            </div>
          </div>
        </div>
      </div>

      <div className="info-box" style={{ background:'rgba(0,230,118,.05)', borderColor:'rgba(0,230,118,.2)' }}>
        <strong>✅ After deploying</strong> — refresh this page and your Facebook page will appear here automatically. No extra login needed!
      </div>
    </div>
  )
}

function FacebookTab({ fbStatus, posts, onToast }) {
  const [content, setContent]   = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [posting, setPosting]   = useState(false)
  const [lastPost, setLastPost] = useState(null)

  const publish = async () => {
    if (!content.trim()) return
    setPosting(true); setLastPost(null)
    const result = await postToFacebook(content, imageUrl || undefined)
    setPosting(false)
    if (result.success) {
      setLastPost(result); setContent(''); setImageUrl('')
      onToast('✅ Post published to Facebook!', 'success')
    } else {
      onToast(`❌ ${result.error || 'Failed to post'}`, 'error')
    }
  }

  if (!fbStatus.connected) return <FacebookSetup />

  const { page } = fbStatus
  return (
    <div className="col">
      <div className="card">
        <div className="card-title">📄 Connected Page</div>
        <div className="fb-page-card">
          <div className="fb-avatar">
            {page.picture ? <img src={page.picture} alt={page.name} /> : '📘'}
          </div>
          <div style={{ flex:1 }}>
            <div className="fb-name">{page.name}</div>
            <div className="fb-fans">
              {page.fans?.toLocaleString() || '—'} followers
              {page.link && <> · <a href={page.link} target="_blank" rel="noreferrer" style={{ color:'#60a5fa' }}>View Page ↗</a></>}
            </div>
          </div>
          <span className="tag t-green" style={{ fontSize:12 }}>✓ Live</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🚀 Publish a Post Now</div>
        <div className="col" style={{ gap:14 }}>
          <div>
            <label>Post Content</label>
            <textarea className="ta" placeholder="Write your post here — or generate one in the ✨ Create tab and paste it here..." value={content} onChange={e => setContent(e.target.value)} />
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:5, textAlign:'right' }}>{content.length} characters</div>
          </div>
          <div>
            <label>Image URL (optional)</label>
            <input className="inp" placeholder="https://example.com/photo.jpg — leave blank for text-only post" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
          <button className="btn btn-fb" onClick={publish} disabled={posting || !content.trim()}>
            {posting ? '📤 Publishing to Facebook...' : '📤 Publish to Facebook Now'}
          </button>
          {lastPost && (
            <div className="ok-box">
              🎉 Post is live! <a href={lastPost.postUrl} target="_blank" rel="noreferrer" style={{ color:'var(--green)', fontWeight:700 }}>View on Facebook ↗</a>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Publish from Queue</div>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:14 }}>Click "Use this post" to load it into the publisher above.</p>
        <div className="col" style={{ gap:8 }}>
          {posts.map(p => (
            <div key={p.id} className="post-item">
              <div style={{ width:36, height:36, borderRadius:8, background:'rgba(24,119,242,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {p.type === 'reel' ? '🎬' : p.type === 'photo' ? '🖼️' : '💬'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:'var(--text)', marginBottom:8, lineHeight:1.5 }}>{p.content.slice(0,100)}...</div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span className="tag t-blue">⏰ {p.scheduled}</span>
                  <button className="btn btn-p" style={{ padding:'3px 12px', fontSize:11 }}
                    onClick={() => { setContent(p.content); window.scrollTo({ top:0, behavior:'smooth' }) }}>
                    Use this post ↑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCards() {
  return (
    <div className="g4">
      {[
        { label:'Weekly Reach',    value:'24.7K', change:'+18%',  icon:'📡' },
        { label:'Engagement Rate', value:'8.4%',  change:'+6.2%', icon:'💬' },
        { label:'Page Followers',  value:'12.3K', change:'+234',  icon:'👥' },
        { label:'Page Views',      value:'5.2K',  change:'+12%',  icon:'👁️' },
      ].map(s => (
        <div key={s.label} className="stat">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span className="stat-label">{s.label}</span>
            <span style={{ fontSize:22 }}>{s.icon}</span>
          </div>
          <div className="stat-val">{s.value}</div>
          <div className="stat-ch">↑ {s.change} this week</div>
        </div>
      ))}
    </div>
  )
}

function PostQueue({ posts, onDelete }) {
  const ibg = { photo:'rgba(24,119,242,.15)', reel:'rgba(179,136,255,.15)', text:'rgba(0,230,118,.15)' }
  const ico  = { photo:'🖼️', reel:'🎬', text:'💬' }
  return (
    <div className="card">
      <div className="card-title">📅 Scheduled Posts Queue</div>
      <div className="col" style={{ gap:10 }}>
        {posts.map(p => (
          <div key={p.id} className="post-item">
            <div className="ptype" style={{ background: ibg[p.type]||ibg.text }}>{ico[p.type]}</div>
            <div style={{ flex:1 }}>
              <div className="pcontent">{p.content}</div>
              <div className="pmeta">
                <span className="tag t-blue">⏰ {p.scheduled}</span>
                <span className={`tag ${p.status==='scheduled'?'t-green':'t-gold'}`}>{p.status==='scheduled'?'✓ Scheduled':'✏️ Draft'}</span>
                <span className={`tag ${p.engagement_pred==='Viral'?'t-red':p.engagement_pred==='Very High'?'t-gold':'t-purple'}`}>
                  {p.engagement_pred==='Viral'?'🔥':'📈'} {p.engagement_pred}
                </span>
                <button className="btn btn-d" style={{ padding:'2px 10px', fontSize:11 }} onClick={() => onDelete(p.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        {posts.length===0 && <p style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:'20px 0' }}>No posts queued.</p>}
      </div>
    </div>
  )
}

function AICreator({ onAdd }) {
  const [topic, setTopic]       = useState('')
  const [tone, setTone]         = useState('enthusiastic')
  const [postType, setPostType] = useState('Text Post')
  const [hashtags, setHashtags] = useState(true)
  const [date, setDate]         = useState('')
  const [time, setTime]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState('')
  const [error, setError]       = useState('')
  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true); setResult(''); setError('')
    try { setResult(await generateCaption(topic, tone, hashtags, postType)) }
    catch (e) { setError(e.message) }
    setLoading(false)
  }
  const schedule = () => {
    if (!result) return
    onAdd({ id:Date.now(), type:postType==='Reel Caption'?'reel':postType==='Photo Post'?'photo':'text',
      content:result, scheduled:date&&time?`${date} ${time}`:'Tomorrow, 9:00 AM', status:'scheduled', engagement_pred:'High' })
    setResult(''); setTopic('')
  }
  return (
    <div className="card">
      <div className="card-title">🤖 AI Post Generator</div>
      <div className="col" style={{ gap:14 }}>
        <div>
          <label>Post Topic or Idea</label>
          <input className="inp" placeholder="e.g. Monday motivation, Flash sale 50% off, new product launch..." value={topic} onChange={e => setTopic(e.target.value)} />
        </div>
        <div className="frow">
          <div><label>Tone</label>
            <select className="sel" value={tone} onChange={e => setTone(e.target.value)}>
              <option value="enthusiastic">Enthusiastic 🎉</option>
              <option value="professional">Professional 💼</option>
              <option value="humorous">Humorous 😂</option>
              <option value="inspirational">Inspirational ✨</option>
              <option value="urgent">Urgent ⚡</option>
              <option value="storytelling">Storytelling 📖</option>
            </select>
          </div>
          <div><label>Post Type</label>
            <select className="sel" value={postType} onChange={e => setPostType(e.target.value)}>
              <option>Text Post</option><option>Photo Post</option><option>Reel Caption</option><option>Story</option>
            </select>
          </div>
        </div>
        <div className="frow">
          <div><label>Schedule Date</label><input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label>Schedule Time</label>
            <select className="sel" value={time} onChange={e => setTime(e.target.value)}>
              <option value="">Choose time...</option>
              {['8:00 AM','9:00 AM ⭐','11:00 AM ⭐⭐','1:00 PM','3:00 PM ⭐⭐','6:00 PM','7:00 PM ⭐⭐⭐','9:00 PM'].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input type="checkbox" id="ht" checked={hashtags} onChange={e => setHashtags(e.target.checked)} style={{ width:16, height:16, cursor:'pointer' }} />
          <label htmlFor="ht" style={{ margin:0, cursor:'pointer', color:'var(--text)', textTransform:'none', letterSpacing:0, fontSize:13 }}>Auto-add trending hashtags</label>
        </div>
        <button className="btn btn-p" onClick={generate} disabled={loading||!topic.trim()}>
          {loading ? '✨ Generating' : '✨ Generate with AI'}
        </button>
        {loading && <p style={{ color:'var(--muted)', fontSize:13 }}>Crafting the perfect post<span className="dot-anim" /></p>}
        {error  && <div className="err-box">⚠️ {error}</div>}
        {result && (
          <>
            <div className="ai-box">{result}</div>
            <div className="frow">
              <button className="btn btn-s" onClick={schedule}>📅 Add to Queue</button>
              <button className="btn btn-g" onClick={generate}>🔄 Regenerate</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function OptimalTimes() {
  return (
    <div className="card">
      <div className="card-title">⏰ Optimal Posting Times</div>
      <p style={{ fontSize:12, color:'var(--muted)', marginBottom:16 }}>Best times based on audience activity & algorithm patterns</p>
      <div className="tgrid">
        {OPTIMAL_TIMES.map(d => (
          <div key={d.day} className="tcol">
            <div className="tday">{d.day.slice(0,3)}</div>
            {d.slots.map((s,j) => <div key={s} className={`tslot ${j===1?'best':''}`}>{s}</div>)}
            <div className="ebar"><div className="efill" style={{ width:`${d.engagement}%` }} /></div>
            <div style={{ fontSize:10, color:'var(--muted)' }}>{d.engagement}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ViralTrends() {
  return (
    <div className="card">
      <div className="card-title">🔥 Viral Trends & Hashtags</div>
      {VIRAL_TRENDS.map(t => (
        <div key={t.tag} className="trend">
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:700 }}>{t.tag}</span>
              <div style={{ display:'flex', gap:6 }}>
                <span className="tag t-green" style={{ fontSize:10 }}>{t.growth}</span>
                <span className="tag t-blue" style={{ fontSize:10 }}>{t.category}</span>
              </div>
            </div>
            <div className="t-bar"><div className="t-fill" style={{ width:`${t.score}%` }} /></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StrategyTab() {
  const [niche, setNiche]     = useState('')
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const run = async () => {
    if (!niche.trim()) return
    setLoading(true); setResult(''); setError('')
    try { setResult(await generateStrategy(niche)) }
    catch (e) { setError(e.message) }
    setLoading(false)
  }
  return (
    <div className="col">
      <div className="g3">{CONTENT_STRATEGIES.map(s => (
        <div key={s.title} className="strat">
          <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
          <div style={{ fontFamily:'var(--ff)', fontSize:14, fontWeight:700, marginBottom:6 }}>{s.title}</div>
          <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>{s.desc}</div>
        </div>
      ))}</div>
      <div className="card">
        <div className="card-title">🧠 AI Strategy Generator</div>
        <div className="col" style={{ gap:14 }}>
          <div><label>Your Page Niche / Industry</label>
            <input className="inp" placeholder="e.g. fitness coaching, e-commerce fashion, local restaurant..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <button className="btn btn-p" onClick={run} disabled={loading||!niche.trim()}>
            {loading ? '🧠 Analysing...' : '🧠 Generate Custom Strategy'}
          </button>
          {error  && <div className="err-box">⚠️ {error}</div>}
          {result && <div className="ai-box">{result}</div>}
        </div>
      </div>
      <div className="card">
        <div className="card-title">📊 Engagement by Content Type</div>
        {[{label:'Reels / Video',pct:94,color:'#b388ff'},{label:'Live Videos',pct:88,color:'#ff5252'},{label:'Photo Posts',pct:78,color:'#1877f2'},{label:'Carousel',pct:72,color:'#00d4ff'},{label:'Stories',pct:65,color:'#00e676'},{label:'Text Posts',pct:48,color:'#ffd740'}].map(r => (
          <div key={r.label} className="prog-wrap">
            <span className="prog-label">{r.label}</span>
            <div className="prog-bar"><div className="prog-fill" style={{ width:`${r.pct}%`, background:r.color }} /></div>
            <span className="prog-val" style={{ color:r.color }}>{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarTab({ posts }) {
  const today=new Date(), firstDay=new Date(today.getFullYear(),today.getMonth(),1).getDay()
  const daysInMonth=new Date(today.getFullYear(),today.getMonth()+1,0).getDate()
  const cells=Array(firstDay).fill(null).concat([...Array(daysInMonth)].map((_,i)=>i+1))
  const hasDays=[5,10,15,20,25,28]
  return (
    <div className="col">
      <div className="card">
        <div className="shdr">
          <div><div className="stitle">{today.toLocaleString('default',{month:'long'})} {today.getFullYear()}</div><div className="ssub">{posts.length} posts scheduled</div></div>
          <button className="btn btn-p">+ Add Post</button>
        </div>
        <div className="cgrid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="chead">{d}</div>)}
          {cells.map((c,i)=>(
            <div key={i} className={`ccell ${c===today.getDate()?'today':c&&hasDays.includes(c)?'has':''}`}>
              {c||''}{c&&hasDays.includes(c)&&<div className="cdot" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const TABS = [
  { id:'dashboard', label:'📊 Dashboard' },
  { id:'facebook',  label:'📘 Facebook' },
  { id:'create',    label:'✨ Create & Schedule' },
  { id:'calendar',  label:'📅 Calendar' },
  { id:'trends',    label:'🔥 Trends' },
  { id:'strategy',  label:'🧠 Strategy' },
]

export default function App() {
  const [tab, setTab]         = useState('dashboard')
  const [posts, setPosts]     = useState(SAMPLE_POSTS)
  const [fbStatus, setFbStatus] = useState({ connected: false })
  const [toast, setToast]     = useState(null)

  useEffect(() => { checkFbStatus().then(setFbStatus) }, [])

  const delPost   = id => setPosts(p => p.filter(x => x.id !== id))
  const addPost   = p  => setPosts(prev => [p, ...prev])
  const showToast = (msg, type='success') => setToast({ msg, type })

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="hdr">
          <div className="logo">
            <div className="logo-icon">f</div>
            <div>
              <div className="logo-name">PageBoost AI</div>
              <div className="logo-sub">Facebook Marketing Automation</div>
            </div>
          </div>
          <div className="hdr-r">
            <div className={`fb-badge ${fbStatus.connected?'on':'off'}`} onClick={() => setTab('facebook')}>
              {fbStatus.connected ? `✓ ${fbStatus.page?.name||'Facebook Connected'}` : '⚠ Connect Facebook →'}
            </div>
            <div className="live"><div className="live-dot" />Live</div>
          </div>
        </header>

        <nav className="nav">
          {TABS.map(t => <button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}
        </nav>

        <main className="main">
          {tab==='dashboard' && (
            <div className="col">
              <div className="shdr">
                <div><div className="stitle">Marketing Dashboard</div>
                  <div className="ssub">{new Date().toLocaleDateString('en-ZA',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                </div>
              </div>
              {!fbStatus.connected && (
                <div className="info-box" style={{ cursor:'pointer' }} onClick={()=>setTab('facebook')}>
                  ⚠️ <strong>Facebook not connected yet.</strong> Click here to go to the <strong>📘 Facebook</strong> tab and follow the 4-step setup guide. →
                </div>
              )}
              {fbStatus.connected && (
                <div className="ok-box">
                  🎉 Connected to <strong>{fbStatus.page?.name}</strong> · {fbStatus.page?.fans?.toLocaleString()} followers ·{' '}
                  <span style={{ cursor:'pointer', fontWeight:700, textDecoration:'underline' }} onClick={()=>setTab('facebook')}>Publish a post now →</span>
                </div>
              )}
              <StatCards />
              <div className="g2"><PostQueue posts={posts} onDelete={delPost} /><OptimalTimes /></div>
              <ViralTrends />
            </div>
          )}
          {tab==='facebook'  && <FacebookTab fbStatus={fbStatus} posts={posts} onToast={showToast} />}
          {tab==='create'    && (
            <div className="col">
              <div className="shdr"><div><div className="stitle">Create & Schedule Posts</div><div className="ssub">AI-powered captions · optimal timing · queue management</div></div></div>
              <div className="g2"><AICreator onAdd={addPost} /><PostQueue posts={posts} onDelete={delPost} /></div>
            </div>
          )}
          {tab==='calendar'  && <CalendarTab posts={posts} />}
          {tab==='trends'    && <div className="g2"><OptimalTimes /><ViralTrends /></div>}
          {tab==='strategy'  && <StrategyTab />}
        </main>

        {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      </div>
    </>
  )
}
