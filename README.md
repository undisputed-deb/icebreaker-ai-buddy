# ❄️ IceBrAIker – AI-Powered Conversation Starters  

**Generate warm, specific, and personalized icebreakers with AI.**  
Analyze public profiles or keywords to craft thoughtful, context-aware openers that help you connect meaningfully.  

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Gemini%20AI-blue)](/)  
[![License](https://img.shields.io/badge/License-MIT-green)](/)  
[![Status](https://img.shields.io/badge/Status-Active-success)](/)  
[![AI Powered](https://img.shields.io/badge/AI-Gemini%20Pro-orange)](/)  

> **Break the ice with confidence.** IceBrAIker combines real-time web search with Google Gemini AI to generate conversation starters tailored to your networking goals.  

---

## ✨ Features  

### 🧠 **Smart Context Analysis**  
- Fetches details from **GitHub, LinkedIn, Medium, Twitter/X, personal sites**  
- Uses **Tavily API** to extract recent and relevant information  
- Generates **vector embeddings** for semantic context  

### 💬 **AI-Powered Icebreakers**  
- **Gemini 1.5 Pro & Flash** for natural, human-like responses  
- **Retrieval-Augmented Generation (RAG)** ensures context-rich results  
- Avoids generic praise with **concrete, specific details**  

### 🎯 **Personalized Output**  
- Tone selection: **Professional, Friendly, Playful**  
- Goal-based prompts (network, research, job, collaboration)  
- Ends with a **thoughtful, natural question**  

### ❤️ **Favorites System**  
- Save your best icebreakers  
- Organize by tone and keywords  
- Reuse and copy instantly  

### 🎨 **Modern UI**  
- Animated **gradient background** and floating particles  
- Sleek **React + Tailwind design**  
- Responsive and mobile-friendly  

---

## 🏗️ Architecture  

```

IceBrAIker/
├── supabase/                     # Backend (Supabase + Edge Functions)
│   └── functions/
│       └── generate-icebreaker/  # AI RAG pipeline function
│
├── src/                          # Frontend (React + Vite)
│   ├── components/
│   │   └── IcebreakerForm.tsx    # Form component
│   ├── pages/
│   │   └── Index.tsx             # Landing page with form
│   ├── integrations/             # Supabase client setup
│   └── main.tsx                  # App entry
│
├── public/
│   └── icebreaker.png            # Logo / OG image
│
├── package.json
├── README.md
└── vite.config.ts

````

---

## 🚀 Quick Start  

### Prerequisites  
- **Node.js 18+**  
- **Supabase CLI** installed  
- **Gemini API Key** (from [Google AI Studio](https://makersuite.google.com/app/apikey))  
- **Tavily API Key** (from [Tavily Dashboard](https://tavily.com))  

### 1. Clone & Install  

```bash
git clone https://github.com/undisputed-deb/IceBrAIker.git
cd IceBrAIker
npm install
````

### 2. Supabase Setup

```bash
# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Add secrets
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set TAVILY_API_KEY=your_tavily_api_key
```

### 3. Deploy Function

```bash
supabase functions deploy generate-icebreaker
```

### 4. Run Frontend

```bash
npm run dev
```

🌐 Open in browser:

```
http://localhost:5173
```

---

## 🎯 Usage Guide

### Step 1: Enter Input

* Paste a **profile URL** (LinkedIn, GitHub, website, etc.) or **keywords**
* Select tone: **Professional / Friendly / Playful**
* (Optional) Add your networking **goal**

### Step 2: Generate

* Click **Generate Icebreaker**
* The AI retrieves relevant info → generates context → outputs a **3–4 sentence icebreaker**

### Step 3: Review & Save

* View generated result
* **Copy, Regenerate, or Save to Favorites**

---

## 📊 Example Prompt Template

```
Write a warm, specific 2–3 sentence icebreaker using the context.  
Rules: mention 1–2 concrete details, avoid clichés, match the requested tone, end with a gentle question.  

Context: {{CONTEXT}}  
User goal: {{GOAL}}  
Tone: {{TONE}}  
```

---

## 🛠️ Tech Stack

### Frontend

* **React + Vite + TypeScript**
* **Tailwind CSS**

### Backend

* **Supabase (Postgres + Edge Functions + pgvector)**

### AI Services

* **Google Gemini** (generation + embeddings)
* **Tavily API** (profile + web content search)

---

## 🚀 Deployment

IceBrAIker can be deployed on:

* **Vercel** – Zero-config React hosting
* **Netlify** – Auto-deploy via GitHub push
* **Supabase Edge Functions** – Backend logic

Example (Netlify):

1. Push repo to GitHub
2. Connect repo to Netlify
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy 🚀

---

## 🌟 Future Enhancements

* 🔄 **Bulk Icebreaker Generation** (multiple profiles at once)
* 🤝 **LinkedIn/Slack API Integration**
* 🎭 **Custom Tone Presets**
* 📊 **Analytics Dashboard** (track usage, success rates)
* 🌐 **Multi-language Support**

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Debashrestha Nandi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📞 Contact & Support

**Debashrestha Nandi**

* 📧 Email: [deb86011@gmail.com](mailto:deb86011@gmail.com)
* 💼 LinkedIn: [Debashrestha Nandi](https://www.linkedin.com/in/debashrestha-nandi-a7343b171/)
* 🐙 GitHub: [@undisputed-deb](https://github.com/undisputed-deb)
* 🌐 Portfolio: [debportfolio.vercel.app](https://debportfolio.vercel.app)

---

<div align="center">

⭐ **Star this repo if IceBrAIker helped you break the ice!** ⭐

*Connecting people through AI-powered conversation starters.*

[![GitHub stars](https://img.shields.io/github/stars/undisputed-deb/IceBrAIker?style=social)](https://github.com/undisputed-deb/IceBrAIker/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/undisputed-deb/IceBrAIker?style=social)](https://github.com/undisputed-deb/IceBrAIker/network/members)

</div>

