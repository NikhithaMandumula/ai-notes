import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { createTransporter } from '../utils/email.js';
import { setTokenCookie, clearTokenCookie } from '../utils/cookies.js';
import { validate } from '../middleware/validate.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

const signupSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  code: z.string({ required_error: 'Code is required' }).min(1, 'Code is required'),
  newPassword: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
});

const googleAuthSchema = z.object({
  credential: z.string({ required_error: 'Google credential is required' }).min(1, 'Google credential is required'),
});

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendOTPEmail(to, otp) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'AI Notes - Password Reset OTP',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; border-radius: 16px; border: 1px solid rgba(59,130,246,0.2);">
        <h2 style="color: #f1f5f9; margin: 0 0 8px 0; font-size: 22px;">Password Reset</h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0; font-size: 14px;">Use the OTP below to reset your password. It expires in 5 minutes.</p>
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #60a5fa; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture || '' },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google sign-in. Please use Continue with Google.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture || '' },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      const otp = generateOTP();
      user.resetToken = otp;
      user.resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
      user.resetAttempts = 0;
      await user.save();

      try {
        await sendOTPEmail(email, otp);
      } catch (emailErr) {
        console.error('Email send error:', emailErr.message);
      }
    }

    res.json({ message: 'If an account exists, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot-password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user || !user.resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    if (user.resetAttempts >= 5) {
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      user.resetAttempts = 0;
      await user.save();
      return res.status(429).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    if (user.resetToken !== code) {
      user.resetAttempts = (user.resetAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.resetAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset-password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/google
router.post('/google', validate(googleAuthSchema), async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify the JWT signature against Google's public keys
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google email not verified' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture || '' },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me — Verify session from cookie
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name email profilePicture');
    if (!user) {
      clearTokenCookie(res);
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture || '' },
    });
  } catch (error) {
    clearTokenCookie(res);
    res.status(401).json({ message: 'Invalid or expired session' });
  }
});

// POST /api/auth/logout — Clear session cookie
router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'Logged out' });
});

export default router;
