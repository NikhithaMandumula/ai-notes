import express from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { generateText } from 'ai';
import { getGroq } from '../utils/groq.js';
import mammoth from 'mammoth';
import { YoutubeTranscript } from 'youtube-transcript';
import auth from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const youtubeSchema = z.object({
  url: z.string({ required_error: 'Please provide a YouTube URL.' }).min(1, 'Please provide a YouTube URL.'),
});

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const { parseOffice } = require('officeparser');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(auth);

function sanitizeFilename(name) {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.pptx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: PDF, DOCX, PPTX, TXT.'));
    }
  },
});

function generateNotePrompt(sourceText, sourceType) {
  return `You are an expert note-taking assistant. Generate well-structured, comprehensive study notes from the following ${sourceType} content.

Requirements:
- Use clear headings with ## and ### markers
- Use bullet points for key concepts
- Include a "Key Takeaways" section at the end
- Keep the notes concise but thorough
- Use bold for important terms
- Organize information logically by topic

Source content:
${sourceText}`;
}

async function extractText(filePath, ext) {
  switch (ext) {
    case '.pdf': {
      const buffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();
      await parser.destroy();
      return result.text || '';
    }
    case '.docx': {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    case '.pptx': {
      const text = await parseOffice(filePath);
      return text;
    }
    case '.txt': {
      return fs.readFileSync(filePath, 'utf-8');
    }
    default:
      throw new Error('Unsupported file type');
  }
}

// POST /api/resources/upload — Upload file and generate notes
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file.' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    const text = await extractText(filePath, ext);

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ message: 'The file contains too little text to generate meaningful notes (minimum 50 characters).' });
    }

    const truncated = text.trim().slice(0, 12000);

    const { text: notes } = await generateText({
      model: getGroq()('llama-3.1-8b-instant'),
      maxTokens: 2000,
      temperature: 0.4,
      prompt: generateNotePrompt(truncated, 'document'),
    });

    res.json({ notes: notes.trim() });
  } catch (error) {
    console.error('Resource upload error:', error);
    if (error.message?.includes('rate_limit') || error.status === 429) {
      return res.status(429).json({ message: 'AI rate limit reached. Please wait a moment and try again.' });
    }
    res.status(500).json({ message: 'Failed to generate notes from file. The file may be corrupted or unsupported.' });
  } finally {
    fs.unlink(filePath, () => {});
  }
});

// Fetch YouTube video title via oembed API
async function fetchVideoTitle(url) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const resp = await fetch(oembedUrl);
    if (resp.ok) {
      const data = await resp.json();
      return data.title || '';
    }
  } catch {
    // ignore
  }
  return '';
}

function generateNoteFromTopicPrompt(videoTitle, videoUrl) {
  return `You are an expert note-taking assistant. A user wants to study notes about a YouTube video but no transcript is available.

Video Title: "${videoTitle}"
Video URL: ${videoUrl}

Based on the video title, generate well-structured, comprehensive study notes about this topic.

Requirements:
- Use clear headings with ## and ### markers
- Use bullet points for key concepts
- Include a "Key Takeaways" section at the end
- Keep the notes concise but thorough
- Use bold for important terms
- Organize information logically by topic
- Cover the main concepts, definitions, and important details related to the topic
- Note at the top that these notes are generated based on the video topic since no transcript was available`;
}

// POST /api/resources/youtube — Generate notes from YouTube video
router.post('/youtube', validate(youtubeSchema), async (req, res) => {
  try {
    const { url } = req.body;

    const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(ytRegex);

    if (!match) {
      return res.status(400).json({ message: 'Please provide a valid YouTube video URL.' });
    }

    const videoId = match[1];
    let prompt;

    // Try to fetch transcript first
    let segments;
    try {
      segments = await YoutubeTranscript.fetchTranscript(videoId);
    } catch {
      segments = null;
    }

    if (segments && segments.length > 0) {
      const transcript = segments.map((s) => s.text).join(' ');
      const truncated = transcript.trim().slice(0, 12000);

      if (truncated.length >= 50) {
        prompt = generateNotePrompt(truncated, 'YouTube video');
      }
    }

    // Fallback: generate from video title/topic if no usable transcript
    if (!prompt) {
      const videoTitle = await fetchVideoTitle(url);
      if (!videoTitle) {
        return res.status(400).json({ message: 'Could not retrieve video information. Please check the URL and try again.' });
      }
      prompt = generateNoteFromTopicPrompt(videoTitle, url);
    }

    const { text: notes } = await generateText({
      model: getGroq()('llama-3.1-8b-instant'),
      maxTokens: 2000,
      temperature: 0.4,
      prompt,
    });

    res.json({ notes: notes.trim() });
  } catch (error) {
    console.error('YouTube resource error:', error.message);
    if (error.message?.includes('rate_limit') || error.status === 429) {
      return res.status(429).json({ message: 'AI rate limit reached. Please wait a moment and try again.' });
    }
    res.status(500).json({ message: 'Failed to generate notes from YouTube video. Please try again.' });
  }
});

// POST /api/resources/upload-image — Upload an image for embedding in notes
const imageDir = path.join(uploadsDir, 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`),
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

router.post('/upload-image', (req, res, next) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded.' });
  }
  const imageUrl = `/uploads/images/${req.file.filename}`;
  res.json({ url: imageUrl });
});

export default router;
