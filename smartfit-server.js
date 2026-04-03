require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const AI_PROVIDER = String(process.env.AI_PROVIDER || 'anthropic').toLowerCase();
const AI_MODEL = process.env.AI_MODEL ||
  (AI_PROVIDER === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini');

function readApiKey(provider) {
  if (provider === 'anthropic') {
    return process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
  }

  if (provider === 'openrouter') {
    return process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
  }

  return process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
}

function extractOpenAIText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(part => part?.type === 'text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('\n')
      .trim();
  }
  return '';
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'smartfit-chat-api' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = readApiKey(AI_PROVIDER);
    if (!apiKey) {
      return res.status(500).json({
        error: `API key is missing for provider "${AI_PROVIDER}". Check your .env settings.`
      });
    }

    const { userText, systemPrompt } = req.body || {};

    if (!userText || !String(userText).trim()) {
      return res.status(400).json({ error: 'userText is required.' });
    }

    if (AI_PROVIDER === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 1000,
          system: systemPrompt || 'You are a helpful fitness coach.',
          messages: [{ role: 'user', content: String(userText) }]
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.error?.message || `Anthropic API error (${response.status}).`
        });
      }

      const reply = data?.content?.[0]?.text || '';
      return res.json({ reply });
    }

    const baseUrl = process.env.OPENAI_BASE_URL ||
      (AI_PROVIDER === 'openrouter'
        ? 'https://openrouter.ai/api/v1'
        : 'https://api.openai.com/v1');

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(AI_PROVIDER === 'openrouter' && process.env.OPENROUTER_APP_NAME
          ? { 'X-Title': process.env.OPENROUTER_APP_NAME }
          : {})
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful fitness coach.' },
          { role: 'user', content: String(userText) }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `AI provider error (${response.status}).`
      });
    }

    const reply = extractOpenAIText(data);
    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`SmartFit API running on http://localhost:${PORT}`);
});
