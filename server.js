const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/scan', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not set' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log('Anthropic response status:', response.status);
    console.log('Anthropic response type:', data.type);

    if (data.error) {
      console.error('Anthropic error:', JSON.stringify(data.error));
      return res.status(500).json({ error: `Anthropic error: ${data.error.type} - ${data.error.message}` });
    }

    if (!data.content) {
      return res.status(500).json({ error: `Unexpected response: ${JSON.stringify(data)}` });
    }

    let raw = '';
    for (const block of data.content) {
      if (block.type === 'text') raw += block.text;
    }

    raw = raw.replace(/```json|```/g, '').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON returned from Claude. Raw: ' + raw.slice(0, 200));

    const parsed = JSON.parse(match[0]);
    return res.json(parsed);

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Maxima tracker running on port ${PORT}`);
});
