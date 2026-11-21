const API = 'https://graph.threads.net/v1.0';
const ID = /^\d+$/;
const visible = r => ['NOT_HUSHED', 'UNHUSHED'].includes(r.hide_status);

// An allowlist, not a keyword sentiment classifier. Everything else is reviewed.
export function draftReply(text, postText = '', id = '0') {
  const t = String(text || '').normalize('NFKC').trim().toLowerCase();
  const clean = t.replace(/[!.,\s👍🙏❤️🔥😊🙂😎🤙🏽]+/gu, ' ').trim();
  const pick = list => list[Number(String(id).slice(-3)) % list.length];
  if (/^(спасибо|спасибо большое|благодарю|thanks|thank you|thank you so much)$/.test(clean)) {
    return /[а-яё]/.test(t) ? pick(['Рад, что пригодилось 🤙', 'На здоровье! 😎', 'Спасибо за отклик 🤙'])
      : pick(['Glad it helped! 🤙', 'Thanks for the feedback! 😎']);
  }
  if (/^(круто|класс|огонь|супер|полезно|очень полезно|отлично|красота|awesome|great|nice)$/.test(clean)) {
    return /[а-яё]/.test(t) ? pick(['Спасибо! 😎🤙', 'Рад, что зашло 🤙', 'Спасибо за отклик! 😎'])
      : pick(['Thank you! 😎', 'Glad you liked it! 🤙']);
  }
  // FAQ answers require both the exact question and the relevant owned post.
  if (/^(где почитать|где читать|где почитать книгу|где найти книги|where can i read it)\??$/.test(t)
      && /книг|детектив|попутчик|book|detective/i.test(postText)) {
    const urls = postText.match(/https:\/\/ok-ok\.click\/[^\s)]+/g) || [];
    const book = urls.find(url => /^https:\/\/ok-ok\.click\/travel-reads\.html(?:[?#][^\s]*)?$/.test(url));
    if (book) return /[а-яё]/.test(t) ? `Вот ссылка на чтение: ${book}` : `You can read it here: ${book}`;
  }
  return null;
}

export class ThreadsReplies {
  constructor(state, env) {
    this.storage = state.storage;
    this.env = env;
    this.tail = Promise.resolve();
  }

  fetch(request) {
    // Serialize tick, moderation and status within this dedicated object.
    const next = this.tail.then(() => this.handle(request));
    this.tail = next.catch(() => {});
    return next;
  }

  async meta(path, method = 'GET', data) {
    const response = await fetch(API + path, {
      method, headers: { Authorization: `Bearer ${this.env.THREADS_ACCESS_TOKEN}` },
      body: data ? new URLSearchParams(data) : undefined,
      signal: AbortSignal.timeout(12000),
    }).catch(() => { throw new Error('Threads request failed'); });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(`Threads HTTP ${response.status}, code ${result.error?.code ?? 'unknown'}`);
    return result;
  }

  async telegram(method, body) {
    const response = await fetch(`https://api.telegram.org/bot${this.env.THREADS_REVIEW_BOT_TOKEN}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    }).catch(() => { throw new Error('Telegram request failed'); });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(`Telegram HTTP ${response.status}, code ${result.error_code ?? 'unknown'}`);
    return result.result;
  }

  configured() {
    return Boolean(this.env.THREADS_ACCESS_TOKEN && this.env.THREADS_REVIEW_BOT_TOKEN
      && this.env.THREADS_REVIEW_WEBHOOK_SECRET
      && ID.test(String(this.env.THREADS_REVIEW_OWNER_ID || '')));
  }

  async enabled() {
    return this.configured() && (await this.storage.get('enabled')) === true;
  }

  async handle(request) {
    const path = new URL(request.url).pathname;
    if (path === '/status') {
      const stats = await this.storage.get('stats');
      return Response.json({ configured: this.configured(), enabled: await this.enabled(),
        schedule: { timezone: 'Asia/Bangkok', times: ['09:00', '15:00', '21:00'] },
        startedAt: await this.storage.get('startedAt') || null,
        moderationErrorAt: await this.storage.get('moderationErrorAt') || null, ...stats });
    }
    if (path === '/activate' && request.method === 'POST') {
      if (!this.configured()) return Response.json({ ok: false }, { status: 503 });
      try { await this.readiness(); }
      catch { return Response.json({ ok: false, reason: 'Threads reply reading unconfirmed' }, { status: 502 }); }
      // Provisioning can initialize once; redeploys must preserve the owner's stop.
      if (await this.storage.get('enabled') === undefined) {
        await this.storage.put('startedAt', new Date().toISOString());
        await this.storage.put('enabled', true);
      }
      return Response.json({ ok: true, enabled: await this.enabled() });
    }
    if (path === '/update' && request.method === 'POST') {
      if (!this.configured()) return new Response('Unavailable', { status: 503 });
      const update = await request.json();
      const previous = await this.storage.get('telegramLastUpdate') ?? -1;
      if (!Number.isInteger(update.update_id) || update.update_id <= previous) return Response.json({ ok: true });
      // One delivery connection + durable claim prevents duplicated moderation actions.
      await this.storage.put('telegramLastUpdate', update.update_id);
      try { await this.command(update); }
      catch { await this.storage.put('moderationErrorAt', new Date().toISOString()); }
      return Response.json({ ok: true });
    }
    if (path !== '/tick' || request.method !== 'POST') return new Response('Not found', { status: 404 });
    if (!this.configured()) return Response.json({ configured: false, enabled: false });
    try {
      if (!await this.enabled()) return Response.json({ enabled: false });
      const stats = await this.scan();
      await this.storage.put('stats', { ...stats, checkedAt: new Date().toISOString(), ok: true });
      return Response.json({ enabled: true, ...stats });
    } catch (error) {
      // Do not log request objects, Telegram URLs, tokens, or private comments.
      await this.storage.put('stats', { checkedAt: new Date().toISOString(), ok: false, reason: error.message });
      return Response.json({ ok: false, reason: error.message }, { status: 502 });
    }
  }

  async readiness() {
    const posts = await this.meta('/me/threads?fields=id,text,is_reply,has_replies&limit=50');
    if (!Array.isArray(posts.data)) throw new Error('Invalid owned posts response');
    const root = posts.data.find(p => !p.is_reply && p.has_replies);
    if (!root) return;
    const replies = await this.meta(`/${root.id}/conversation?fields=id,text,username,timestamp,root_post,replied_to,is_reply,is_reply_owned_by_me,hide_status&limit=10`);
    if (!Array.isArray(replies.data)) throw new Error('Invalid conversation response');
    const target = replies.data.find(r => r.is_reply_owned_by_me === false);
    if (target) {
      await this.meta(`/${target.id}?fields=id,text,root_post,is_reply,is_reply_owned_by_me,hide_status`);
      await this.meta(`/${target.id}/replies?fields=id,is_reply_owned_by_me&limit=1`);
    }
  }

  async notify(text, reply_markup) {
    return this.telegram('sendMessage', { chat_id: this.env.THREADS_REVIEW_OWNER_ID,
      text, link_preview_options: { is_disabled: true }, ...(reply_markup ? { reply_markup } : {}) });
  }

  async command(update) {
    const cb = update.callback_query;
    const message = cb?.message || update.message;
    const from = cb?.from || message?.from;
    if (!message || message.chat?.type !== 'private'
        || String(message.chat.id) !== String(this.env.THREADS_REVIEW_OWNER_ID)
        || String(from?.id) !== String(this.env.THREADS_REVIEW_OWNER_ID)) return;
    const text = message.text || '';
    // Only fresh, explicit owner commands; no replay of historical /start.
    if (!cb && Date.now() / 1000 - message.date > 86400) return;
    if (!cb && /^\/threads_(on|off|status)(?:@workforwriters1_bot)?$/.test(text)) {
      if (text.startsWith('/threads_on')) {
        if (!await this.storage.get('startedAt')) await this.storage.put('startedAt', new Date().toISOString());
        await this.storage.put('enabled', true);
      }
      if (text.startsWith('/threads_off')) await this.storage.put('enabled', false);
      await this.notify(`Threads: ${await this.enabled() ? 'автоответы включены' : 'автоответы выключены'}. Проверка в 09:00, 15:00, 21:00 по Бангкоку.\n/threads_on — включить\n/threads_off — остановить\n/threads_status — статус\nСпорный комментарий: /reply ID текст ответа, затем кнопка подтверждения.`);
      return;
    }
    const manual = !cb && text.match(/^\/reply\s+(\d+)\s+([\s\S]+)$/);
    if (manual) {
      const record = await this.storage.get('reply:' + manual[1]);
      if (!record || record.state !== 'review') return;
      const draft = manual[2].trim();
      if (!draft || new TextEncoder().encode(draft).length > 500) {
        await this.notify('Ответ слишком длинный: сократи до 500 байт.'); return;
      }
      record.draft = draft;
      record.revision = (record.revision || 0) + 1;
      await this.storage.put('reply:' + manual[1], record);
      await this.notify(`Ответ для ${manual[1]}:\n${draft}`, { inline_keyboard: [[
        { text: 'Опубликовать', callback_data: `tr:approve:${manual[1]}:${record.revision}` },
        { text: 'Пропустить', callback_data: `tr:skip:${manual[1]}:${record.revision}` },
      ]] });
      return;
    }
    const action = cb?.data?.match(/^tr:(approve|skip):(\d+):(\d+)$/);
    if (!action) return;
    // Acknowledge while Telegram's callback is fresh; report delivery separately.
    await this.telegram('answerCallbackQuery', { callback_query_id: cb.id, text: 'Проверяю…' }).catch(() => {});
    const [, verb, id, revision] = action;
    const record = await this.storage.get('reply:' + id);
    if (!record || record.state !== 'review' || record.revision !== Number(revision)) {
      await this.notify('Уже обработано или черновик изменился.'); return;
    }
    if (verb === 'skip') {
      await this.storage.put('reply:' + id, { ...record, state: 'skipped' });
    } else {
      if (!await this.enabled() || !record.draft) {
        await this.notify('Сначала /threads_on; ответ не отправлен.'); return;
      }
      const receipt = await this.publish(record);
      if (!receipt) {
        await this.notify('Не отправлен: комментарий изменён, уже обработан или достигнут дневной лимит.'); return;
      }
    }
    await this.notify(verb === 'skip' ? 'Пропущено.' : 'Ответ отправлен в Threads.');
  }

  async publish(record) {
    const key = 'reply:' + record.id;
    const claimed = await this.storage.transaction(async txn => {
      const previous = await txn.get(key);
      if (previous && !['review', 'ready'].includes(previous.state)) return false;
      const day = new Date().toISOString().slice(0, 10);
      const count = await txn.get('count:' + day) || 0;
      if (count >= 20) return false;
      await txn.put(key, { ...record, state: 'uncertain', attemptedAt: new Date().toISOString() });
      await txn.put('count:' + day, count + 1);
      return true;
    });
    if (!claimed) return;
    // Validate live target again; never accidentally create a root-level post.
    const target = await this.meta(`/${record.id}?fields=id,text,root_post,is_reply,is_reply_owned_by_me,hide_status`);
    if (target.id !== record.id || !target.is_reply || target.is_reply_owned_by_me !== false
        || target.root_post?.id !== record.rootId || !visible(target) || target.text !== record.original) {
      await this.storage.put(key, { ...record, state: 'skipped', reason: 'target_changed' }); return;
    }
    // Cross-check actual children, including manual replies made in the app.
    let cursor = '';
    for (let page = 0; page < 3; page++) {
      const children = await this.meta(`/${record.id}/replies?fields=id,is_reply_owned_by_me&limit=100${cursor ? '&after=' + encodeURIComponent(cursor) : ''}`);
      if (!Array.isArray(children.data)) throw new Error('Invalid reply children');
      if (children.data.some(r => r.is_reply_owned_by_me === true)) {
        await this.storage.put(key, { ...record, state: 'skipped', reason: 'already_answered' }); return;
      }
      cursor = children.paging?.next ? children.paging?.cursors?.after : '';
      if (!cursor) break;
    }
    if (cursor) throw new Error('Reply children incomplete; reconciliation required');
    const params = { media_type: 'TEXT', text: record.draft, reply_to_id: record.id, auto_publish_text: 'true' };
    const receipt = await this.meta('/me/threads', 'POST', params);
    if (!ID.test(String(receipt.id || ''))) throw new Error('Missing reply receipt; reconciliation required');
    await this.storage.put(key, { ...record, state: 'sent', mediaId: receipt.id, sentAt: new Date().toISOString() });
    return receipt;
  }

  async scan() {
    const started = Date.parse(await this.storage.get('startedAt'));
    if (!Number.isFinite(started)) throw new Error('Missing activation time');
    const stats = { scanned: 0, sent: 0, review: 0, skipped: 0 };
    const profile = await this.meta('/me?fields=id,username');
    const roots = await this.meta('/me/threads?fields=id,text,is_reply,has_replies&limit=50');
    if (!Array.isArray(roots.data)) throw new Error('Invalid owned posts response');
    for (const root of roots.data.filter(p => !p.is_reply && p.has_replies)) {
      let after = await this.storage.get('cursor:' + root.id) || '';
      for (let page = 0; page < 3; page++) {
        const query = new URLSearchParams({ fields: 'id,text,username,timestamp,root_post,replied_to,is_reply,is_reply_owned_by_me,hide_status', reverse: 'true', limit: '100', ...(after ? { after } : {}) });
        const data = await this.meta(`/${root.id}/conversation?${query}`);
        if (!Array.isArray(data.data)) throw new Error('Invalid conversation response');
        const repliedByOwner = new Set(data.data.filter(r => r.is_reply_owned_by_me === true).map(r => r.replied_to?.id));
        for (const reply of data.data) {
          stats.scanned++;
          const key = 'reply:' + reply.id;
          if (!ID.test(String(reply.id))) continue;
          const previous = await this.storage.get(key);
          if (previous) {
            // Reconcile ambiguous sends from visible owner replies, never recreate them.
            if (previous.state === 'uncertain') {
              const found = data.data.find(r => r.is_reply_owned_by_me === true && r.replied_to?.id === reply.id && r.text === previous.draft);
              if (found) await this.storage.put(key, { ...previous, state: 'sent', mediaId: found.id, reconciled: true });
            }
            continue;
          }
          // Old, hidden, owner-authored, nested-to-other-user and unknown-ownership items are ignored.
          const timestamp = Date.parse(reply.timestamp);
          const to = reply.replied_to?.id;
          if (!reply.is_reply || reply.is_reply_owned_by_me !== false || !visible(reply)
              || !Number.isFinite(timestamp) || timestamp < started || Date.now() - timestamp > 86400000
              || timestamp > Date.now() + 300000 || reply.root_post?.id !== root.id
              || (to !== root.id && !data.data.some(r => r.id === to && r.is_reply_owned_by_me === true))
              || reply.username === profile.username || repliedByOwner.has(reply.id)) { stats.skipped++; continue; }
          const day = new Date().toISOString().slice(0, 10);
          if ((await this.storage.get('count:' + day) || 0) >= 20 || stats.sent >= 3 || stats.review >= 5) return stats;
          const draft = draftReply(reply.text, root.text, reply.id);
          const record = { id: reply.id, rootId: root.id, original: reply.text || '', draft,
            state: draft ? 'ready' : 'review', revision: 0, createdAt: new Date().toISOString() };
          await this.storage.put(key, record);
          if (draft) {
            if (await this.publish(record)) stats.sent++;
          } else {
            // Reserve before sending: a timeout never generates repeated private notifications.
            record.notification = 'uncertain';
            await this.storage.put(key, record);
            const message = await this.notify(`Threads — нужен твой ответ\nПост: ${(root.text || '').slice(0, 600)}\nКомментарий: ${(reply.text || '[без текста]').slice(0, 900)}\n\nОтветь командой:\n/reply ${reply.id} текст ответа\nИли пропусти кнопкой.`, { inline_keyboard: [[{ text: 'Пропустить', callback_data: `tr:skip:${reply.id}:0` }]] });
            await this.storage.put(key, { ...record, notification: 'sent', notificationId: message.message_id });
            stats.review++;
          }
        }
        after = data.paging?.next ? data.paging?.cursors?.after : '';
        await this.storage.put('cursor:' + root.id, after || '');
        if (!after) break;
      }
    }
    return stats;
  }
}
