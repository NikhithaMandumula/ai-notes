import express from 'express';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post('/autocomplete', async (req, res) => {
  try {
    const { context, title } = req.body;

    if (!context || context.trim().length < 5) {
      return res.json({ suggestion: '' });
    }

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      maxTokens: 60,
      temperature: 0.3,
      prompt: `You are an autocomplete engine for a note-taking app. The user is writing a note${title ? ` titled "${title}"` : ''}. Continue their text naturally with 1-2 short sentences or a few words. Only output the completion text, nothing else. Do not repeat what they already wrote. Do not add quotes or explanations.

Current text:
${context}`,
    });

    res.json({ suggestion: text.trim() });
  } catch (error) {
    console.error('Autocomplete error:', error.message);
    res.json({ suggestion: '' });
  }
});

router.post('/summary', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ message: 'Note content is too short to summarize. Please write more content first.' });
    }

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      maxTokens: 250,
      temperature: 0.4,
      prompt: `You are a concise summarizer. Summarize the following note content into a clear, well-structured summary. Use 2-4 sentences. Focus on the key points and main ideas. Only output the summary, nothing else.

Note content:
${content}`,
    });

    res.json({ summary: text.trim() });
  } catch (error) {
    console.error('Summary error:', error.message);
    res.status(500).json({ message: 'Failed to generate summary. Please try again.' });
  }
});

export default router;
