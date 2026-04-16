import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { sendResetEmail, sendVerificationEmail } from '../utils/email.js';
import crypto from 'crypto';
const router = Router();
// Step 1: Registration - Send verification code
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const normalizedEmail = email.toLowerCase();
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return res.status(400).json({ error: 'This email is already registered. Please login.' });
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await hashPassword(password);
        // Store temporary user with code
        await prisma.user.upsert({
            where: { email: normalizedEmail },
            update: {
                password: hashedPassword,
                name,
                verificationCode,
                isVerified: false
            },
            create: {
                email: normalizedEmail,
                password: hashedPassword,
                name,
                verificationCode,
                isVerified: false
            }
        });
        await sendVerificationEmail(normalizedEmail, verificationCode);
        res.status(200).json({ success: true, message: 'Verification code sent to email.' });
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Step 2: Verify Email
router.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user || user.verificationCode !== code) {
            return res.status(400).json({ error: 'Invalid verification code.' });
        }
        const updatedUser = await prisma.user.update({
            where: { email: normalizedEmail },
            data: { isVerified: true, verificationCode: null }
        });
        const token = generateToken(updatedUser.id);
        res.json({ token, user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name } });
    }
    catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!user.isVerified) {
            return res.status(401).json({ error: 'Please verify your email first.', unverified: true });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});
// Forgot Password - Send Email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        await prisma.user.update({
            where: { email: normalizedEmail },
            data: { resetToken, resetTokenExpiry }
        });
        await sendResetEmail(normalizedEmail, resetToken);
        res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});
// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                isVerified: true // Also verify if they reset via email
            }
        });
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Reset failed' });
    }
});
// Search users
router.get('/search', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email)
            return res.status(400).json({ error: 'Email query required' });
        const users = await prisma.user.findMany({
            where: {
                email: { contains: String(email).toLowerCase(), mode: 'insensitive' },
                isVerified: true
            },
            select: { id: true, name: true, email: true }
        });
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});
export default router;
//# sourceMappingURL=auth.js.map