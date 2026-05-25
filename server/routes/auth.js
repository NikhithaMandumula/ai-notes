import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { createTransporter } from '../utils/email.js';
import { setTokenCookie, clearTokenCookie } from '../utils/cookies.js';
import { validate } from '../middleware/validate.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many requests, please try again later.' },
});

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

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendVerificationEmail(to, token) {
  const transporter = createTransporter();
  const baseUrl = process.env.BASE_URL || 'http://localhost:5002';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'AI Notes - Verify Your Email',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; border-radius: 16px; border: 1px solid rgba(59,130,246,0.2);">
        <h2 style="color: #f1f5f9; margin: 0 0 8px 0; font-size: 22px;">Verify Your Email</h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0; font-size: 14px;">Click the button below to verify your email address and activate your account. This link expires in 24 hours.</p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #22d3ee, #3b82f6); color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px;">Verify Email</a>
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 0;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

async function sendAlreadyRegisteredEmail(to) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'AI Notes - Sign-up Attempt',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; border-radius: 16px; border: 1px solid rgba(59,130,246,0.2);">
        <h2 style="color: #f1f5f9; margin: 0 0 8px 0; font-size: 22px;">Sign-up Attempt</h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0; font-size: 14px;">Someone tried to create an account using your email address. If this was you, you already have an account — just log in instead.</p>
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">If you didn't request this, no action is needed. Your account is safe.</p>
        <p style="color: #64748b; font-size: 12px; margin: 0;">This is an automated notification from AI Notes.</p>
      </div>
    `,
  });
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
router.post('/signup', authLimiter, validate(signupSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      // Already registered — send informational email, don't reveal to the caller
      try {
        await sendAlreadyRegisteredEmail(email);
      } catch (emailErr) {
        console.error('Already-registered email error:', emailErr.message);
      }
    } else if (existingUser && !existingUser.isVerified) {
      // Pending verification — overwrite with new details and resend
      existingUser.name = name;
      existingUser.password = password;
      existingUser.verificationToken = verificationToken;
      existingUser.verificationTokenExpiry = verificationTokenExpiry;
      await existingUser.save();

      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailErr) {
        console.error('Verification email error:', emailErr.message);
      }
    } else {
      // New user
      const user = await User.create({
        name,
        email,
        password,
        verificationToken,
        verificationTokenExpiry,
      });

      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailErr) {
        console.error('Verification email error:', emailErr.message);
      }
    }

    // Always return the same response
    res.json({ message: 'Check your email to verify your account.' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.redirect('/login?verified=error');
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect('/login?verified=error');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.redirect('/login?verified=true');
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect('/login?verified=error');
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first. Check your inbox.' });
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
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res) => {
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
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
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
router.post('/google', authLimiter, validate(googleAuthSchema), async (req, res) => {
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
      // Link Google ID and ensure verified
      if (!user.googleId || !user.isVerified) {
        user.googleId = user.googleId || googleId;
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
      }
    } else {
      // Create new user (Google-verified)
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        isVerified: true,
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
