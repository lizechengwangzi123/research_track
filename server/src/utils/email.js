import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
const transporterConfig = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};
// Optimization for Gmail
if (process.env.SMTP_HOST === 'smtp.gmail.com') {
    delete transporterConfig.host;
    delete transporterConfig.port;
    transporterConfig.service = 'gmail';
}
const transporter = nodemailer.createTransport(transporterConfig);
export const sendResetEmail = async (email, token) => {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const sender = process.env.SMTP_FROM || '"ResearchTrack" <noreply@researchtrack.app>';
    const mailOptions = {
        from: sender,
        to: email,
        subject: 'Password Reset Request',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
        <h2 style="color: #0059bb; text-align: center;">ResearchTrack</h2>
        <p>You requested to reset your laboratory access key. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0059bb; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset Access Key
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
    };
    if (!process.env.SMTP_USER) {
        console.log('--- SMTP_USER NOT SET: MOCK EMAIL SENT ---');
        console.log('To:', email);
        console.log('Link:', resetUrl);
        console.log('-----------------------------------------');
        return true;
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset email sent successfully to: ${email}`);
    }
    catch (err) {
        console.error('SMTP Error:', err);
        throw new Error('Failed to send email');
    }
};
//# sourceMappingURL=email.js.map