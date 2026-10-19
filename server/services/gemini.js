/**
 * AI service — Google Gemini REST API (direct HTTPS, no SDK dependency).
 * Supports both token types from GEMINI_API_KEY:
 *   AIza...  → permanent API key  → sent as ?key= query param
 *   AQ./ya29. → short-lived OAuth token → sent as Authorization: Bearer
 * Exported interface unchanged:
 *   generateProductData / generateCompetitorProfile / generateWithFallback / generateAccurate
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const https = require('https');
const sse   = require('../utils/sseEmitter');

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in server/.env');
  return key;
}

// Model priority — most capable first, fallback on quota / 503
const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

const MODELS_ACCURATE = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function callGemini(model, prompt, timeoutMs = 180000) {
  return new Promise((resolve, reject) => {
    const rawKey = getApiKey();
    const isOAuth = rawKey.startsWith('AQ.') || rawKey.startsWith('ya29.');

    // AIza keys → ?key=  |  AQ./ya29. → Authorization: Bearer
    const path = isOAuth
      ? `/v1beta/models/${model}:generateContent`
      : `/v1beta/models/${model}:generateContent?key=${rawKey}`;
    const authHeaders = isOAuth
      ? { 'Authorization': `Bearer ${rawKey}` }
      : {};

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 65536 },
    });

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path,
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...authHeaders,
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Gemini ${res.statusCode} (${model}): ${raw.slice(0, 400)}`));
        }
        try {
          const json = JSON.parse(raw);
          const candidate = json.candidates?.[0];
          if (!candidate) return reject(new Error('Gemini: no candidates. ' + raw.slice(0, 200)));
          const text = candidate.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('Gemini: empty text. ' + raw.slice(0, 200)));
          resolve(text);
        } catch (e) {
          reject(new Error('Gemini JSON parse error: ' + raw.slice(0, 200)));
        }
      });
    });

    req.on('error', reject);
    const timer = setTimeout(() => {
      req.destroy(new Error(`Gemini timeout after ${timeoutMs / 1000}s (${model})`));
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
        return await callGemini(model, prompt);
      } catch (err) {
        const msg = err.message || '';
        // If model suggests a redirect, add it to the front of the queue
        const redirect = msg.match(/use models\/([\w\d.\-]+)/i) || msg.match(/update.*to use models\/([\w\d.\-]+)/i);
        if (redirect) { const s = redirect[1]; if (!tried.has(s)) queue.unshift(s); }

        const isTransient = msg.includes('429') || msg.includes('503') || msg.includes('timeout') ||
          msg.includes('UNAVAILABLE') || msg.includes('overloaded') || msg.includes('RESOURCE_EXHAUSTED');
        const isNotFound  = msg.includes('404') || msg.includes('not found') ||
          msg.includes('MODEL_NOT_FOUND') || msg.includes('is not supported') || msg.includes('no longer available');

        lastErr = err;
        if (isNotFound) break;
        if (isTransient && attempt === 1) { await sleep(2000); continue; }
        if (isTransient) break;
        throw err;
      }
    }
  }
  throw lastErr || new Error('All Gemini models failed');
}

function parseAiJSON(text) {
  let cleaned = text.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim();
  }
  return JSON.parse(cleaned);
}

function buildProductPrompt(productName, practice, description, competitorNames, rawData) {
  const competitorList = competitorNames.length > 0
    ? competitorNames.join(', ')
    : `the 2 most well-known real competitors of ${productName} in the market (use real names, NOT "Competitor1")`;
  let rawSection = '';
  if (rawData) {
    const content = rawData.text || rawData.combined || (typeof rawData === 'string' ? rawData : JSON.stringify(rawData, null, 2));
    const truncated = content.length > 8000 ? content.slice(0, 8000) + '\n...[truncated]' : content;
    rawSection = `\n\nCONTEXT FROM FILES:\n${truncated}`;
  }
  return `You are a senior product intelligence analyst. Generate a comprehensive product intelligence document for a sales dashboard.

PRODUCT: ${productName}
PRACTICE/COMPANY: ${practice}
DESCRIPTION: ${description || 'Not provided — infer from product name and industry knowledge'}
COMPETITORS: ${competitorList}
${rawSection}

Return ONLY a valid JSON object (no markdown, no backticks, no explanation). Required structure:
{"overview":{"logo":"<emoji>","name":"${productName.toUpperCase()}","category":"<category>","deployment":"<SaaS/On-Prem/Hybrid>","targetUsers":"<users>","productLaunch":"<year>","marketPosition":"<position>","description":"<2-3 sentences>"},"keyFeatures":[{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"},{"icon":"<emoji>","name":"<name>","description":"<one line>"}],"discoveryQuestions":["<q1>","<q2>","<q3>","<q4>","<q5>"],"recommendedResponses":["<r1>","<r2>","<r3>","<r4>","<r5>"],"strengths":["<s1>","<s2>","<s3>","<s4>","<s5>","<s6>"],"weaknesses":["<w1>","<w2>","<w3>","<w4>"],"caseStudies":[{"icon":"🏢","customer":"Enterprise","type":"Finance","challenge":"<challenge>","result":"<result>"},{"icon":"🏥","customer":"Healthcare","type":"Healthcare","challenge":"<challenge>","result":"<result>"},{"icon":"🛒","customer":"Retail","type":"Retail","challenge":"<challenge>","result":"<result>"}],"keyCustomers":[{"logo":"🏢","name":"<company>","industry":"<industry>","color":"#3b82f6"},{"logo":"🏭","name":"<company>","industry":"<industry>","color":"#8b5cf6"},{"logo":"🏦","name":"<company>","industry":"<industry>","color":"#059669"},{"logo":"🛒","name":"<company>","industry":"<industry>","color":"#f59e0b"},{"logo":"🏥","name":"<company>","industry":"<industry>","color":"#ef4444"}],"competitorSummary":[{"name":"${competitorNames[0]||'Competitor1'}","logo":"<emoji>","color":"#ef4444","marketPosition":"Challenger","overview":"<2 sentences>","strengths":["<s1>","<s2>","<s3>"],"weaknesses":["<w1>","<w2>","<w3>"],"ourEdge":["<e1>","<e2>","<e3>","<e4>","<e5>"],"pricingSummary":"<pricing>"},{"name":"${competitorNames[1]||'Competitor2'}","logo":"<emoji>","color":"#8b5cf6","marketPosition":"Leader","overview":"<2 sentences>","strengths":["<s1>","<s2>","<s3>"],"weaknesses":["<w1>","<w2>","<w3>"],"ourEdge":["<e1>","<e2>","<e3>","<e4>","<e5>"],"pricingSummary":"<pricing>"}],"featureMatrix":{"labels":{"product":"${productName}","comp1":"${competitorNames[0]||'Competitor1'}","comp2":"${competitorNames[1]||'Competitor2'}"},"rows":[{"feature":"<feature>","product":"green","comp1":"yellow","comp2":"red"},{"feature":"<feature>","product":"green","comp1":"green","comp2":"yellow"},{"feature":"<feature>","product":"green","comp1":"red","comp2":"yellow"},{"feature":"<feature>","product":"green","comp1":"yellow","comp2":"red"},{"feature":"<feature>","product":"green","comp1":"red","comp2":"red"},{"feature":"<feature>","product":"green","comp1":"yellow","comp2":"yellow"},{"feature":"<feature>","product":"green","comp1":"red","comp2":"yellow"},{"feature":"<feature>","product":"green","comp1":"yellow","comp2":"red"}]},"tcoData":{"labels":{"product":"${productName}","comp1":"${competitorNames[0]||'Competitor1'}","comp2":"${competitorNames[1]||'Competitor2'}"},"maxValue":800,"totals":{"product":"$320K","comp1":"$650K","comp2":"$580K"},"rows":[{"category":"Licensing","product":"$120K","comp1":"$280K","comp2":"$240K"},{"category":"Implementation","product":"$80K","comp1":"$160K","comp2":"$140K"},{"category":"Operations","product":"$70K","comp1":"$130K","comp2":"$120K"},{"category":"Training","product":"$50K","comp1":"$80K","comp2":"$80K"}]},"objectionHandling":[{"objection":"<common objection>","response":"<strong response>"},{"objection":"<common objection>","response":"<strong response>"},{"objection":"<common objection>","response":"<strong response>"},{"objection":"<common objection>","response":"<strong response>"},{"objection":"<common objection>","response":"<strong response>"}],"winLoss":{"winRate":72,"totalDeals":50,"avgDealSize":"$180K","topWinReasons":["<reason1>","<reason2>","<reason3>"],"topLossReasons":["<reason1>","<reason2>"],"competitorWinRates":[{"competitor":"${competitorNames[0]||'Competitor1'}","winRate":68},{"competitor":"${competitorNames[1]||'Competitor2'}","winRate":75}]},"aiCoach":{"productSummary":"<2 sentences>","keyDifferentiators":["<d1>","<d2>","<d3>"],"idealCustomerProfile":"<description>","salesPlaybook":["<play1>","<play2>","<play3>"]}}`;
}

function buildCompetitorPrompt(competitorName, productName, practice) {
  return `You are a competitive intelligence analyst. Generate a competitor profile for ${competitorName} vs ${productName} (${practice}). Return ONLY valid JSON (no markdown, no backticks):
{"name":"${competitorName}","logo":"<emoji>","color":"<hex>","marketPosition":"<position>","overview":"<2-3 sentences>","strengths":["<s1>","<s2>","<s3>","<s4>"],"weaknesses":["<w1>","<w2>","<w3>"],"ourEdge":["<e1>","<e2>","<e3>","<e4>","<e5>"],"pricingSummary":"<pricing>"}`;
}

async function generateProductData(productName, practice, description, competitorNames, rawData, jobId) {
  const STAGES = [
    { percent: 10, stage: 'building_prompt',    message: 'Building AI prompt...' },
    { percent: 20, stage: 'calling_gemini',     message: 'Calling Gemini AI...' },
    { percent: 70, stage: 'parsing_response',   message: 'Parsing AI response...' },
    { percent: 90, stage: 'saving_to_database', message: 'Saving to database...' },
  ];
  if (jobId) sse.broadcast('ai_progress', { jobId, ...STAGES[0] });
  const prompt = buildProductPrompt(productName, practice, description, competitorNames, rawData);
  if (jobId) sse.broadcast('ai_progress', { jobId, ...STAGES[1] });
  let tickPercent = 20, tickTimer = null;
  if (jobId) {
    tickTimer = setInterval(() => {
      if (tickPercent < 65) { tickPercent += 5; sse.broadcast('ai_progress', { jobId, percent: tickPercent, stage: 'calling_gemini', message: 'Gemini is generating your product data...' }); }
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
