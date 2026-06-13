# 🎓 EduMentor AI — Quality Education Assistant

> An AI-powered educational tool aligned with **UN Sustainable Development Goal 4: Quality Education**

EduMentor AI uses the **Anthropic Claude API** to give students access to three intelligent study tools — a 24/7 AI tutor, an automatic quiz generator, and a personalised study planner — all in one clean, accessible web interface.

---

## 🌟 Features

| Tool | Description |
|------|-------------|
| 🤖 **AI Tutor** | Ask questions across any subject. Get step-by-step explanations with examples, in a multi-turn conversational format. |
| 📝 **Quiz Maker** | Generate custom multiple-choice quizzes on any topic, difficulty, and length — with instant answer explanations. |
| 📅 **Study Planner** | Describe your exam schedule and get a structured day-by-day study plan built on spaced repetition principles. |

---

## 🔗 SDG 4 Connection

This project directly supports **UN SDG 4 — Quality Education** by:
- Making intelligent, personalized tutoring accessible to anyone
- Removing barriers to study resources (no expensive tutors required)
- Enabling self-directed learning across all subjects and levels
- Supporting equity in education through free, open-source tooling

---

## 🏗️ Architecture

```
edumentor-ai/
├── index.html          # Main HTML — hero, features, app, about sections
├── css/
│   └── style.css       # All styling — responsive, accessible
├── js/
│   └── app.js          # AI logic — Claude API calls, UI rendering
└── README.md
```

### How each tool works

```
User Input
    │
    ▼
System Prompt (role-specific: tutor / quiz / planner)
    │
    ▼
Anthropic Claude API (claude-sonnet-4-6)
    │
    ▼
Parsed Response (text / JSON)
    │
    ▼
Dynamic UI Render
```

**AI Tutor**: Maintains a `chatHistory` array across turns for multi-turn conversation memory.

**Quiz Maker**: Prompts Claude to return structured JSON. Parses into interactive question cards with answer checking.

**Study Planner**: Prompts Claude to return a day-by-day JSON schedule. Renders as a visual plan.

---

## 🚀 Deploying to GitHub Pages

### Step 1: Clone or fork this repository

```bash
git clone https://github.com/YOUR_USERNAME/edumentor-ai.git
cd edumentor-ai
```

### Step 2: Add your Anthropic API key

Open `js/app.js` and replace the placeholder:

```js
const API_KEY = 'YOUR_ANTHROPIC_API_KEY';
```

⚠️ **Security note**: For a production deployment, never expose your API key in client-side code. Use a serverless backend (Cloudflare Workers, Vercel Edge Functions, etc.) to proxy requests. For a university assignment demo, the direct key approach is acceptable with a restricted test key.

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Deploy EduMentor AI"
git push origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose `main` branch, `/ (root)` folder
4. Click **Save**

Your site will be live at: `https://YOUR_USERNAME.github.io/edumentor-ai`

---

## 🔒 API Key Security (Production)

For a production or public-facing deployment, proxy API calls through a backend:

**Example with Vercel Edge Functions:**

```js
// api/claude.js (Vercel serverless function)
export default async function handler(req, res) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY, // stored in Vercel env vars
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: req.body
  });
  const data = await response.json();
  res.json(data);
}
```

Then update `API_URL` in `app.js` to point to `/api/claude`.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **AI Engine**: [Anthropic Claude API](https://www.anthropic.com) (`claude-sonnet-4-6`)
- **Icons**: [Tabler Icons](https://tabler.io/icons) (webfont)
- **Fonts**: Inter (Google Fonts)
- **Hosting**: GitHub Pages

---

## 📚 Educational Design Principles

EduMentor AI is built on established pedagogical research:

- **Socratic Method**: The AI tutor always ends with a follow-up question to encourage deeper thinking
- **Spaced Repetition**: Study plans revisit earlier topics on later days
- **Active Recall**: Quiz generation tests knowledge rather than passive reading
- **Scaffolded Learning**: Difficulty levels (beginner → intermediate → advanced) support gradual progression
- **Immediate Feedback**: Quiz explanations are shown instantly after each answer

---

## 🎓 University Assignment Notes

This project demonstrates:

1. **AI Agent Design** — Each tool uses a tailored system prompt that defines the AI's role, output format, and constraints
2. **Structured Outputs** — Quiz and Planner use JSON output prompting and client-side parsing
3. **Multi-turn Conversation** — The tutor maintains chat history across API calls
4. **SDG Alignment** — The tool directly addresses a global challenge (access to quality education)
5. **Responsible AI** — System prompts constrain the AI to educational use cases

---

## 📄 License

MIT License — free to use, modify, and distribute for educational purposes.

---

*Built with ❤️ for UN SDG 4 — Quality Education*
