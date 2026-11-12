import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.log('OPENAI_API_KEY not configured. Skipping optional AI drafting.');
  process.exit(0);
}
const queue = JSON.parse(readFileSync('content-pipeline/drafts.json', 'utf8'));
if (queue.publishing_enabled !== false) throw new Error('Publishing must remain disabled');
if (!Array.isArray(queue.items)) throw new Error('Invalid queue');

const drafts = [];
for (const item of queue.items) {
  if (item.status !== 'idea') continue;
  if (!['ok-ok', 'personal'].includes(item.channel)) throw new Error('Invalid channel');
  const instructions = [
    'Write one useful social media draft, not a published post.',
    'Do not invent news, current exchange rates, rankings, prices, business hours, testimonials, statistics or citations.',
    'If timely facts are needed, explicitly mark SOURCE CHECK REQUIRED.',
    'Never remove or modify existing affiliate URLs or codes.',
    'For OK-OK travel posts, write Russian copy and include https://ok-ok.click.',
    'For personal blog posts, write Russian copy about practical business websites and automation; the starting price is from $199, scope dependent.',
    'If the topic concerns Oki video, produce a script ONLY. Approved Oki reference is mandatory; never change mascot appearance. Every visible on-screen word must be English, including the phone screen. Exact ok-ok.click must be visible.',
    'Output draft text only, no claims of publishing.'
  ].join(' ');
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions,
      input: 'Channel: ' + item.channel + '\nTopic: ' + item.topic + '\nRequires approved Oki visual reference: ' + Boolean(item.requires_visual_reference),
      max_output_tokens: 900
    }),
    signal: AbortSignal.timeout(45000)
  });
  if (!response.ok) throw new Error('AI API request failed with HTTP ' + response.status);
  const data = await response.json();
  const text = (data.output || []).flatMap(o => o.content || []).filter(c => c.type === 'output_text').map(c => c.text).join('\n').trim();
  if (!text) throw new Error('AI response contained no text');
  if (item.requires_visual_reference && !text.includes('ok-ok.click')) throw new Error('Oki draft missing required domain');
  drafts.push('## ' + item.id + ' — ' + item.topic + '\n\n' + text + '\n\nApproval: pending');
}
mkdirSync('content-pipeline/generated', { recursive: true });
writeFileSync('content-pipeline/generated/ai-latest.md', '# AI editorial drafts\n\nSTATUS: DRAFT ONLY. No publication or deployment.\n\n' + drafts.join('\n\n---\n\n') + '\n');
console.log('AI draft generation completed for ' + drafts.length + ' items (review required)');
