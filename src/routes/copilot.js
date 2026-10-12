/**
 * AI Copilot chat routes.
 *
 * Handles chat interactions with safety checks and conversation history.
 */

import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validate, aiMessageSchema } from '../validation/schemas.js';
import { generateAIResponse } from '../services/aiService.js';

const router = Router();

// POST /api/copilot/chat
router.post('/chat', requireAuth, aiLimiter, validate(aiMessageSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { message, conversation_id, language = 'en' } = req.body;
    let activeConversationId = conversation_id;

    // 1. If no conversation_id provided, create a new conversation
    if (!activeConversationId) {
      const title = message.length > 30 ? message.slice(0, 30) + '...' : message;
      const { data: convData, error: convErr } = await db
        .from('conversations')
        .insert([{ user_id: req.user.id, title }])
        .select()
        .single();

      if (convErr) throw convErr;
      activeConversationId = convData.id;
    }

    // 2. Fetch past messages for context if conversation exists
    let history = [];
    const { data: pastMsgs } = await db
      .from('messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (pastMsgs) {
      history = pastMsgs;
    }

    // 3. Save user message to database
    await db.from('messages').insert([
      { conversation_id: activeConversationId, role: 'user', content: message }
    ]);

    // 4. Generate AI response
    const assistantReply = await generateAIResponse({
      prompt: message,
      conversationHistory: history,
      language,
    });

    // 5. Save assistant reply to database
    await db.from('messages').insert([
      { conversation_id: activeConversationId, role: 'assistant', content: assistantReply }
    ]);

    res.json({
      conversation_id: activeConversationId,
      reply: assistantReply,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/copilot/conversations
router.get('/conversations', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { data, error } = await db
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ conversations: data || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/copilot/conversations/:id
router.get('/conversations/:id', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { data: conv, error: convErr } = await db
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (convErr || !conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const { data: messages, error: msgErr } = await db
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgErr) throw msgErr;

    res.json({ conversation: conv, messages: messages || [] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/copilot/conversations/:id
router.delete('/conversations/:id', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { error } = await db.from('conversations').delete().eq('id', id);

    if (error) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    res.json({ message: 'Conversation deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
