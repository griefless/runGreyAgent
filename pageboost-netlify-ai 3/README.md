# PageBoost AI — Facebook Marketing Automation
### Powered by Netlify AI Gateway (no Anthropic account needed)

---

## 🚀 Deploy in 3 Steps — No API Key Required

### Step 1 — Push to GitHub

```bash
unzip pageboost.zip
cd pageboost
git init && git add . && git commit -m "init"
# push to a new GitHub repo
```

### Step 2 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and create a free account
2. Click **"Add new site" → "Import an existing project"**
3. Connect your GitHub repo
4. Build settings are auto-detected from `netlify.toml`
5. Click **Deploy site** ✅

### Step 3 — That's it! 🎉

No API keys. No Anthropic account. No environment variables to configure.

Netlify's **AI Gateway** automatically injects credentials for Claude (Anthropic) into your serverless functions. AI usage is billed directly to your Netlify account alongside your hosting.

---

## 💡 How Netlify AI Gateway Works

```
Your App  →  Netlify Function  →  Netlify AI Gateway  →  Claude (Anthropic)
                                         ↑
                          Netlify injects API key automatically
                          Bills to your Netlify account
                          No Anthropic account needed
```

Netlify automatically sets these environment variables in your functions:
- `ANTHROPIC_API_KEY` — a Netlify-managed key (never your own)
- `ANTHROPIC_BASE_URL` — routes requests through Netlify's AI Gateway

---

## 💰 Pricing

Netlify AI Gateway uses **Netlify Credits**:

| Plan     | Monthly Credits | Cost     |
|----------|----------------|----------|
| Free     | 500 credits    | $0/month |
| Pro      | 3,000 credits  | $19/month|

Each AI caption generation costs roughly **1–3 credits**, so the free tier covers **150–500 caption generations/month** — more than enough for daily posting.

Check current credit pricing at [netlify.com/pricing](https://netlify.com/pricing).

---

## 📁 Project Structure

```
pageboost/
├── netlify/
│   └── functions/
│       ├── generate-caption.js    ← Uses Netlify AI Gateway (no key needed)
│       └── generate-strategy.js   ← Uses Netlify AI Gateway (no key needed)
├── src/
│   ├── main.jsx
│   └── App.jsx                    ← Full dashboard UI
├── index.html
├── vite.config.js
├── netlify.toml                   ← AI Gateway enabled here
└── package.json
```

---

## ✨ Features

- **AI Post Generator** — Facebook captions via Claude (tone, hashtags, post type)
- **AI Strategy Generator** — 5-point custom growth plan for your niche
- **Optimal Posting Times** — day-by-day schedule with engagement scores
- **Viral Trends Tracker** — top hashtags with growth percentages
- **Content Calendar** — monthly view with post scheduling
- **Photo & Media Manager** — upload zone + best practices
- **Analytics Dashboard** — reach, engagement, followers, page views

---

## 🔧 Local Development

```bash
npm install
npm install -g netlify-cli
netlify login
netlify link   # link to your deployed Netlify site
netlify dev    # AI Gateway works locally via Netlify CLI
```

> ⚠️ AI Gateway requires at least one production deploy on Netlify to activate.
> Run `netlify deploy --prod` first, then `netlify dev` for local development.
