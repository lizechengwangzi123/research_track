import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { sendResetEmail } from '../utils/email.js';
import crypto from 'crypto';
const router = Router();
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const normalizedEmail = email.toLowerCase();
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email: normalizedEmail, password: hashedPassword, name }
        });
        const token = generateToken(user.id);
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed', details: err.message });
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
            // Don't reveal if user exists or not for security
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
// Reset Password - Verify Token & Update
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Missing token or new password' });
        }
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
                resetTokenExpiry: null
            }
        });
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (err) {
        console.error(err);
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
                email: { contains: String(email).toLowerCase(), mode: 'insensitive' }
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