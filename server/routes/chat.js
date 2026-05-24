import express from 'express';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import auth from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Note from '../models/Note.js';

const router = express.Router();
router.use(auth);

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/chat - Send message and get streaming AI response
router.post('/', async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.length > 10000) {
      return res.status(400).json({ message: 'Message is too long (max 10,000 characters)' });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.user.id,
      });
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      conversation = new Conversation({
        userId: req.user.id,
        title: message.slice(0, 60),
      });
    }

    // Save user message
    conversation.messages.push({ role: 'user', content: message.trim() });
    await conversation.save();

    // Fetch user's recent notes for context
    const recentNotes = await Note.find({
      userId: req.user.id,
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title body')
      .lean();

    const notesContext = recentNotes.length
      ? recentNotes
          .map((n) => `Title: ${n.title}\nContent: ${n.body?.slice(0, 500) || '(empty)'}`)
          .join('\n---\n')
      : 'No notes yet.';

    // Build message history for the AI (last 20 messages for context)
    const historyMessages = conversation.messages
      .slice(-21, -1) // Exclude the latest user message (we'll add it separately)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', conversation._id.toString());
    res.flushHeaders();

    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      maxTokens: 1024,
      temperature: 0.7,
      system: `You are a helpful AI assistant for a note-taking application called AI Notes. You help users with their notes, writing, ideas, and general questions. Be concise, friendly, and helpful.

Here are the user's recent notes for context:
${notesContext}

Use the notes context to give personalized, relevant responses when the user asks about their notes or related topics.`,
      messages: [
        ...historyMessages,
        { role: 'user', content: message.trim() },
      ],
    });

    // Stream the response
    let fullResponse = '';
    const reader = result.textStream;

    for await (const chunk of reader) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    // Save assistant response
    conversation.messages.push({ role: 'assistant', content: fullResponse });
    await conversation.save();

    res.write(`data: ${JSON.stringify({ done: true, conversationId: conversation._id })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    // If headers already sent (streaming started), end the stream
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  }
});

// GET /api/chat/conversations - List user's conversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select('title messages updatedAt')
      .lean();

    const result = conversations.map((c) => ({
      _id: c._id,
      title: c.title,
      lastMessage: c.messages.length
        ? c.messages[c.messages.length - 1].content.slice(0, 80)
        : '',
      messageCount: c.messages.length,
      updatedAt: c.updatedAt,
    }));

    res.json(result);
  } catch (error) {
    console.error('Fetch conversations error:', error.message);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// GET /api/chat/conversations/:id - Get full conversation
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Fetch conversation error:', error.message);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

// DELETE /api/chat/conversations/:id - Delete a conversation
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error.message);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
});

export default router;
