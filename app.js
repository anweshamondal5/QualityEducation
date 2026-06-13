/**
 * EduMentor AI — JavaScript Application
 * Powered by the Anthropic Claude API
 * Aligned with UN SDG 4: Quality Education
 */

// ============================================================
// CONFIGURATION — Replace with your API key or proxy endpoint
// ============================================================
const API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = 'YOUR_ANTHROPIC_API_KEY'; // Replace before deploying

// System prompts that define each AI agent's behaviour
const SYSTEM_PROMPTS = {
  tutor: `You are EduMentor AI, an expert educational tutor for university students aligned with UN SDG 4: Quality Education.

When answering questions:
- Give clear, structured explanations with numbered steps when appropriate
- Always use a concrete real-world example to illustrate abstract ideas
- Keep responses focused and under 300 words
- Use simple language without sacrificing accuracy
- End each response with one thoughtful follow-up question to deepen learning
- Format key terms in *asterisks* to emphasise them
- Be encouraging and patient`,

  quiz: `You are an expert university quiz generator. Your output must be ONLY a valid JSON array — no markdown fences, no preamble, no explanation.

Each question object must have exactly these fields:
- "question": string (the full question text)
- "options": array of exactly 4 strings, each starting with "A) ", "B) ", "C) ", or "D) "
- "answer": string (the full correct option string, e.g. "B) Mitochondria")
- "explanation": string (one sentence explaining why that answer is correct)

Generate questions that are clear, unambiguous, and educationally valuable.`,

  planner: `You are an expert study planner for university students. Create a realistic, structured study plan.

Your output must be ONLY valid JSON — no markdown, no preamble. Use this exact structure:
{
  "summary": "Brief 1-sentence overview of the plan",
  "totalDays": number,
  "days": [
    {
      "day": "Day 1 — [day name or date description]",
      "focus": "Main topic for the day (short)",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ]
}

Apply spaced repetition: revisit earlier topics on later days. Keep daily sessions realistic based on the student's available hours. Maximum 10 days.`
};

// ============================================================
// STATE
// ============================================================
let chatHistory = [];
let correctCount = 0;
let totalAnswered = 0;
let totalQuestions = 0;

// ============================================================
// TAB SWITCHING
// ============================================================
function switchTab(panelName, clickedTab) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  clickedTab.classList.add('active');
  clickedTab.setAttribute('aria-selected', 'true');
  document.getElementById('panel-' + panelName).classList.add('active');
}

// ============================================================
// UTILITY: Anthropic API call
// ============================================================
async function callClaude({ systemPrompt, messages, maxTokens = 1024 }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.find(b => b.type === 'text')?.text || '';
}

// ============================================================
// AI TUTOR
// ============================================================
function setTopic(topic) {
  const input = document.getElementById('tutor-input');
  input.value = `Explain ${topic} to me with a clear example.`;
  input.focus();
}

function appendMessage(role, text) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;

  if (role === 'ai') {
    div.innerHTML = `
      <div class="msg-header"><i class="ti ti-brain"></i> EduMentor AI</div>
      <div class="msg-body">${escapeHtml(text)}</div>`;
  } else {
    div.innerHTML = `<div class="msg-body">${escapeHtml(text)}</div>`;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function showLoadingDots() {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'msg ai loading';
  div.id = 'loading-indicator';
  div.innerHTML = `
    <div class="msg-header"><i class="ti ti-brain"></i> EduMentor AI</div>
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeLoadingDots() {
  const el = document.getElementById('loading-indicator');
  if (el) el.remove();
}

async function sendTutorMsg() {
  const input = document.getElementById('tutor-input');
  const btn = document.getElementById('send-btn');
  const text = input.value.trim();
  if (!text || btn.disabled) return;

  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });
  input.value = '';
  btn.disabled = true;
  showLoadingDots();

  try {
    const reply = await callClaude({
      systemPrompt: SYSTEM_PROMPTS.tutor,
      messages: chatHistory,
      maxTokens: 800
    });

    chatHistory.push({ role: 'assistant', content: reply });
    removeLoadingDots();
    appendMessage('ai', reply);
  } catch (err) {
    removeLoadingDots();
    appendMessage('ai', `⚠️ Could not reach the AI. Error: ${err.message}`);
  }

  btn.disabled = false;
  input.focus();
}

// ============================================================
// QUIZ MAKER
// ============================================================
async function generateQuiz() {
  const topic = document.getElementById('quiz-topic').value.trim();
  if (!topic) {
    alert('Please enter a topic to generate a quiz.');
    return;
  }

  const count = document.getElementById('quiz-count').value;
  const difficulty = document.getElementById('quiz-diff').value;
  const btn = document.getElementById('gen-btn');
  const area = document.getElementById('quiz-area');

  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader"></i> Generating...';
  area.innerHTML = `
    <div class="empty-state">
      <div class="dots" style="flex-direction:row">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <p style="margin-top:10px">Building your ${count}-question ${difficulty} quiz on <strong>${escapeHtml(topic)}</strong>...</p>
    </div>`;

  try {
    const raw = await callClaude({
      systemPrompt: SYSTEM_PROMPTS.quiz,
      messages: [{
        role: 'user',
        content: `Topic: ${topic}\nDifficulty: ${difficulty}\nNumber of questions: ${count}`
      }],
      maxTokens: 1800
    });

    const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
    const questions = JSON.parse(clean);

    // Reset state
    correctCount = 0;
    totalAnswered = 0;
    totalQuestions = questions.length;

    renderQuiz(questions);
  } catch (err) {
    area.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-alert-triangle" style="color:#E24B4A"></i>
        <p>Could not generate quiz. ${err.message}. Please try again.</p>
      </div>`;
  }

  btn.disabled = false;
  btn.innerHTML = 'Generate <i class="ti ti-arrow-right"></i>';
}

function renderQuiz(questions) {
  const area = document.getElementById('quiz-area');
  let html = `
    <div class="score-banner" id="score-banner" style="display:none">
      <span class="score-num" id="score-num">0/${questions.length}</span>
      <div class="score-info">
        <p>Your score</p>
        <small>Answer all questions to see your final result</small>
      </div>
    </div>
    <div class="quiz-questions">`;

  questions.forEach((q, i) => {
    html += `
      <div class="q-card" id="qcard-${i}">
        <div class="q-num">Question ${i + 1} of ${questions.length}</div>
        <div class="q-text">${escapeHtml(q.question)}</div>
        <div class="options" id="opts-${i}">`;

    q.options.forEach((opt, j) => {
      const safeOpt = opt.replace(/"/g, '&quot;').replace(/'/g, "\\'");
      const safeAnswer = q.answer.replace(/"/g, '&quot;').replace(/'/g, "\\'");
      const safeExp = q.explanation.replace(/"/g, '&quot;').replace(/'/g, "\\'");
      html += `
          <button class="opt" id="opt-${i}-${j}"
            onclick="checkAnswer(${i}, this, '${safeOpt}', '${safeAnswer}', '${safeExp}')">
            ${escapeHtml(opt)}
          </button>`;
    });

    html += `
        </div>
        <div class="q-explanation" id="exp-${i}"></div>
      </div>`;
  });

  html += '</div>';
  area.innerHTML = html;
}

function checkAnswer(questionIndex, btn, selected, correct, explanation) {
  // Disable all options for this question
  const opts = document.querySelectorAll(`#opts-${questionIndex} .opt`);
  opts.forEach(o => {
    o.disabled = true;
    if (o.textContent.trim() === correct) o.classList.add('correct');
  });

  if (selected === correct) {
    btn.classList.remove('correct'); // avoid double-adding
    btn.classList.add('correct');
    correctCount++;
  } else {
    btn.classList.add('wrong');
  }

  // Show explanation
  const expEl = document.getElementById(`exp-${questionIndex}`);
  expEl.style.display = 'block';
  expEl.textContent = '💡 ' + explanation;

  // Update score
  totalAnswered++;
  const banner = document.getElementById('score-banner');
  const scoreNum = document.getElementById('score-num');
  banner.style.display = 'flex';
  scoreNum.textContent = `${correctCount}/${totalQuestions}`;

  if (totalAnswered === totalQuestions) {
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================================
// STUDY PLANNER
// ============================================================
async function generatePlan() {
  const input = document.getElementById('plan-input').value.trim();
  if (!input) {
    alert('Please describe your study situation first.');
    return;
  }

  const btn = document.getElementById('plan-btn');
  const resultEl = document.getElementById('plan-result');

  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader"></i> Planning...';
  resultEl.innerHTML = `
    <div style="padding:1rem;text-align:center;color:#6C757D">
      <div class="dots" style="display:inline-flex;gap:5px;margin-bottom:8px">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <p style="font-size:14px">Generating your personalised study plan...</p>
    </div>`;

  try {
    const raw = await callClaude({
      systemPrompt: SYSTEM_PROMPTS.planner,
      messages: [{ role: 'user', content: input }],
      maxTokens: 1200
    });

    const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
    const plan = JSON.parse(clean);
    renderPlan(plan);
  } catch (err) {
    resultEl.innerHTML = `
      <div style="padding:1rem;color:#A32D2D;font-size:14px">
        <i class="ti ti-alert-triangle"></i> Could not generate plan. ${err.message}
      </div>`;
  }

  btn.disabled = false;
  btn.innerHTML = 'Create My Plan <i class="ti ti-arrow-right"></i>';
}

function renderPlan(plan) {
  const resultEl = document.getElementById('plan-result');
  let html = `
    <div class="plan-result">
      <div class="plan-summary">
        <i class="ti ti-calendar-check"></i> ${escapeHtml(plan.summary || 'Your Personalised Study Plan')}
      </div>`;

  (plan.days || []).forEach(d => {
    html += `
      <div class="plan-day">
        <div class="plan-day-header">
          <i class="ti ti-sun" style="font-size:14px;color:#1D9E75"></i>
          ${escapeHtml(d.day)}
        </div>
        <div class="plan-day-focus">Focus: ${escapeHtml(d.focus)}</div>`;

    (d.tasks || []).forEach(t => {
      html += `<div class="plan-task">${escapeHtml(t)}</div>`;
    });

    html += '</div>';
  });

  html += '</div>';
  resultEl.innerHTML = html;
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================
// UTILITY
// ============================================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
