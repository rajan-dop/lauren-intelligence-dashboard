/**
 * AI service — Ollama Cloud REST API (direct HTTPS, no SDK).
 * Permanent key, never expires.
 * Exported interface unchanged:
 *   generateProductData / generateCompetitorProfile / generateWithFallback / generateAccurate
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const https = require('https');
const sse   = require('../utils/sseEmitter');

function getApiKey() {
  const key = process.env.OLLAMA_API_KEY;
  if (!key) throw new Error('OLLAMA_API_KEY is not set in server/.env');
  return key;
}

const MODELS = ['gemma4:31b'];
const MODELS_ACCURATE = ['gemma4:31b'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function callAI(model, prompt, timeoutMs = 180000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    const req = https.request({
      hostname: 'ollama.com',
      path:     '/api/chat',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization':  `Bearer ${getApiKey()}`,
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Ollama ${res.statusCode} (${model}): ${raw.slice(0, 400)}`));
        }
        try {
          const json = JSON.parse(raw);
          const text = json.message?.content;
          if (!text) return reject(new Error('Ollama: empty response. ' + raw.slice(0, 200)));
          resolve(text.trim());
        } catch (e) {
          reject(new Error('Ollama JSON parse error: ' + raw.slice(0, 200)));
        }
      });
    });

    req.on('error', reject);
    const timer = setTimeout(() => {
      req.destroy(new Error(`HF timeout after ${timeoutMs / 1000}s`));
    }, timeoutMs);
    req.on('close', () => clearTimeout(timer));
    req.write(body);
    req.end();
  });
}

async function generateWithFallback(prompt, modelList) {
  const tried = new Set();
  const queue = [...(modelList || MODELS)];
  let lastErr;

  while (queue.length > 0) {
    const model = queue.shift();
    if (tried.has(model)) continue;
    tried.add(model);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await callAI(model, prompt);
      } catch (err) {
        const msg = err.message || '';
        const isTransient = msg.includes('503') || msg.includes('loading') ||
          msg.includes('timeout') || msg.includes('429') || msg.includes('overloaded');
        const isNotFound = msg.includes('404') || msg.includes('not found');
        lastErr = err;
        if (isNotFound) break;
        if (isTransient && attempt === 1) { await sleep(3000); continue; }
        if (isTransient) break;
        throw err;
      }
    }
  }
  throw lastErr || new Error('All HF models failed');
}

function parseAiJSON(text) {
  let cleaned = text.trim();
  // Extract JSON from the response (model may add explanation before/after)
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim();
  }
  return JSON.parse(cleaned);
}

function buildProductPrompt(productName, practice, description, competitorNames, rawData) {
  // If no competitors provided, ask AI to infer real ones from the product name
  const competitorList = competitorNames.length > 0
    ? competitorNames.join(', ')
    : `the 2 most well-known real competitors of ${productName} in the market (infer from your knowledge — use real company/product names, NOT "Competitor1" or "Competitor2")`;
  let rawSection = '';
  if (rawData) {
    const content = rawData.text || rawData.combined || (typeof rawData === 'string' ? rawData : JSON.stringify(rawData, null, 2));
    const truncated = content.length > 8000 ? content.slice(0, 8000) + '\n...[truncated]' : content;
    rawSection = `\n\nCONTEXT FROM FILES:\n${truncated}`;
  }
  return `<s>[INST] You are a product intelligence analyst. Generate data for a sales dashboard.

PRODUCT: ${productName}
PRACTICE: ${practice}
DESCRIPTION: ${description || 'Infer from product name'}
COMPETITORS: ${competitorList}
${rawSection}

Return ONLY a valid JSON object. No explanation, no markdown, no backticks. Start your response with { and end with }.

Required structure:
{"overview":{"logo":"<emoji>","name":"${productName.toUpperCase()}","category":"<category>","deployment":"<SaaS/On-Prem/Hybrid>","targetUsers":"<users>","productLaunch":"<year>","marketPosition":"<position>","description":"<2-3 sentences>"},"keyFeatures":[{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"}],"discoveryQuestions":["<q1>","<q2>","<q3>","<q4>","<q5>"],"recommendedResponses":["<r1>","<r2>","<r3>","<r4>","<r5>"],"strengths":["<s1>","<s2>","<s3>","<s4>","<s5>","<s6>"],"weaknesses":["<w1>","<w2>","<w3>","<w4>"],"caseStudies":[{"icon":"🏢","customer":"Enterprise","type":"Finance","challenge":"<challenge>","result":"<result>"},{"icon":"🏥","customer":"Healthcare","type":"Healthcare","challenge":"<challenge>","result":"<result>"},{"icon":"🛒","customer":"Retail","type":"Retail","challenge":"<challenge>","result":"<result>"}],"keyCustomers":[{"logo":"🏢","name":"<company>","industry":"<industry>","color":"#3b82f6"},{"logo":"🏭","name":"<company>","industry":"<industry>","color":"#8b5cf6"},{"logo":"🏦","name":"<company>","industry":"<industry>","color":"#059669"},{"logo":"🛒","name":"<company>","industry":"<industry>","color":"#f59e0b"},{"logo":"🏥","name":"<company>","industry":"<industry>","color":"#ef4444"}],"competitorSummary":[{"name":"${competitorNames[0]||'Competitor1'}","logo":"<emoji>","color":"#ef4444","marketPosition":"Challenger","overview":"<2 sentences>","strengths":["<s1>","<s2>","<s3>"],"weaknesses":["<w1>","<w2>","<w3>"],"ourEdge":["<e1>","<e2>","<e3>","<e4>","<e5>"],"pricingSummary":"<pricing>"},{"name":"${competitorNames[1]||'Competitor2'}","logo":"<emoji>","color":"#f59e0b","marketPosition":"Leader","overview":"<2 sentences>","strengths":["<s1>","<s2>","<s3>"],"weaknesses":["<w1>","<w2>","<w3>"],"ourEdge":["<e1>","<e2>","<e3>","<e4>","<e5>"],"pricingSummary":"<pricing>"}],"featureMatrix":{"labels":{"product":"${productName}","comp1":"${competitorNames[0]||'Competitor1'}","comp2":"${competitorNames[1]||'Competitor2'}"},"rows":[{"feature":"Ease of Use","product":"green","comp1":"yellow","comp2":"red"},{"feature":"Scalability","product":"green","comp1":"green","comp2":"yellow"},{"feature":"Cost","product":"green","comp1":"red","comp2":"yellow"},{"feature":"Integration","product":"green","comp1":"yellow","comp2":"red"},{"feature":"Support","product":"green","comp1":"yellow","comp2":"yellow"},{"feature":"Security","product":"green","comp1":"yellow","comp2":"red"},{"feature":"Performance","product":"green","comp1":"yellow","comp2":"green"},{"feature":"Analytics","product":"green","comp1":"red","comp2":"yellow"}]},"tcoData":{"labels":{"product":"${productName}","comp1":"${competitorNames[0]||'Competitor1'}","comp2":"${competitorNames[1]||'Competitor2'}"},"maxValue":800,"totals":{"product":"$320k","comp1":"$580k","comp2":"$490k"},"rows":[{"component":"Licensing","product":"$120k","comp1":"$250k","comp2":"$180k"},{"component":"Implementation","product":"$60k","comp1":"$120k","comp2":"$100k"},{"component":"Support","product":"$50k","comp1":"$90k","comp2":"$80k"},{"component":"Training","product":"$40k","comp1":"$70k","comp2":"$80k"},{"component":"Infrastructure","product":"$50k","comp1":"$50k","comp2":"$50k"}]},"objectionHandling":[{"objection":"\\"${competitorNames[0]||'Competitor'} is cheaper\\"","response":"<response>"},{"objection":"\\"We already use ${competitorNames[0]||'Competitor'}\\"","response":"<response>"},{"objection":"\\"Too complex to implement\\"","response":"<response>"},{"objection":"\\"Not enough ROI proof\\"","response":"<response>"}],"winLoss":{"total":40,"won":25,"lost":15,"winRate":63,"competitors":[{"label":"${competitorNames[0]||'Competitor1'}","wins":15,"pct":60,"color":"#a855f7"},{"label":"${competitorNames[1]||'Competitor2'}","wins":7,"pct":28,"color":"#3b82d4"},{"label":"Others","wins":3,"pct":12,"color":"#5a6478"}],"topMessages":["Superior TCO","Faster deployment","Better support","Stronger security"]},"aiCoach":{"customerSays":"\\"Why should we choose ${productName} over ${competitorNames[0]||'competitors'}?\\"","suggestedResponse":"<detailed response>","recommendedCaseStudy":"Enterprise – 40% cost reduction","winProbability":"HIGH","kvps":["<kvp1>","<kvp2>","<kvp3>","<kvp4>"]},"pricingTiers":[{"tier":"Starter","monthlyPrice":"$10/unit/mo","annualPrice":"$100K/yr","features":["<f1>","<f2>"]},{"tier":"Professional","monthlyPrice":"$25/unit/mo","annualPrice":"$250K/yr","features":["<f1>","<f2>","<f3>"]},{"tier":"Enterprise","monthlyPrice":"Custom","annualPrice":"$500K+/yr","features":["<f1>","<f2>","<f3>","<f4>"]}]} [/INST]`;
}

function buildCompetitorPrompt(competitorName, productName, practice) {
  return `<s>[INST] Generate a competitor profile. Return ONLY valid JSON starting with { and ending with }.
{"name":"${competitorName}","logo":"<emoji>","color":"<hex>","marketPosition":"<position>","overview":"<2-3 sentences>","strengths":["<s1>","<s2>","<s3>","<s4>"],"weaknesses":["<w1>","<w2>","<w3>"],"ourEdge":["<e1>","<e2>","<e3>","<e4>","<e5>"],"pricingSummary":"<pricing>"} [/INST]`;
}

async function generateProductData(productName, practice, description, competitorNames, rawData, jobId) {
  const STAGES = [
    { percent: 10, stage: 'building_prompt',    message: 'Building AI prompt...' },
    { percent: 20, stage: 'calling_gemini',     message: 'Calling Hugging Face AI...' },
    { percent: 70, stage: 'parsing_response',   message: 'Parsing AI response...' },
    { percent: 90, stage: 'saving_to_database', message: 'Saving to database...' },
  ];
  if (jobId) sse.broadcast('ai_progress', { jobId, ...STAGES[0] });
  const prompt = buildProductPrompt(productName, practice, description, competitorNames, rawData);
  if (jobId) sse.broadcast('ai_progress', { jobId, ...STAGES[1] });
  let tickPercent = 20, tickTimer = null;
  if (jobId) {
    tickTimer = setInterval(() => {
      if (tickPercent < 65) { tickPercent += 5; sse.broadcast('ai_progress', { jobId, percent: tickPercent, stage: 'calling_gemini', message: 'AI is generating your product data...' }); }
    }, 3000);
  }
  let text;
  try { text = await generateWithFallback(prompt); } finally { if (tickTimer) clearInterval(tickTimer); }
  if (jobId) sse.broadcast('ai_progress', { jobId, ...STAGES[2] });
  const parsed = parseAiJSON(text);
  if (jobId) sse.broadcast('ai_progress', { jobId, ...STAGES[3] });
  return parsed;
}

async function generateCompetitorProfile(competitorName, productName, practice) {
  const prompt = buildCompetitorPrompt(competitorName, productName, practice);
  const text = await generateWithFallback(prompt);
  return parseAiJSON(text);
}

async function generateAccurate(prompt) { return generateWithFallback(prompt, MODELS_ACCURATE); }

module.exports = { generateProductData, generateCompetitorProfile, generateWithFallback, generateAccurate };
