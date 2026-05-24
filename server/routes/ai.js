import express from 'express';
import { z } from 'zod';
import { generateText } from 'ai';
import { getGroq } from '../utils/groq.js';
import auth from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
router.use(auth);

const summarySchema = z.object({
  content: z.string().min(20, 'Note content is too short to summarize. Please write more content first.'),
});

router.post('/autocomplete', async (req, res) => {
  try {
    const { context, title } = req.body;

    if (!context || context.trim().length < 5) {
      return res.json({ suggestion: '' });
    }

    const { text } = await generateText({
      model: getGroq()('llama-3.1-8b-instant'),
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

router.post('/summary', validate(summarySchema), async (req, res) => {
  try {
    const { content } = req.body;

    const { text } = await generateText({
      model: getGroq()('llama-3.1-8b-instant'),
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
