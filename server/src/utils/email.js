import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporterConfig = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};
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
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This link will expire in 1 hour.</p>
      </div>
    `,
    };
    if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
    }
};
export const sendVerificationEmail = async (email, code) => {
    const sender = process.env.SMTP_FROM || '"ResearchTrack" <noreply@researchtrack.app>';
    const mailOptions = {
        from: sender,
        to: email,
        subject: 'Verify your ResearchTrack account',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
        <h2 style="color: #0059bb; text-align: center;">Welcome to ResearchTrack</h2>
        <p>Your laboratory verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <h1 style="font-size: 48px; letter-spacing: 10px; color: #0059bb; background: #f0f7ff; padding: 20px; border-radius: 12px; display: inline-block; margin: 0;">${code}</h1>
        </div>
        <p>Please enter this code on the registration page to activate your account.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This code will expire in 10 minutes.</p>
      </div>
    `,
    };
    if (!process.env.SMTP_USER) {
        console.log('--- VERIFICATION CODE ---');
        console.log('To:', email);
        console.log('Code:', code);
        console.log('-------------------------');
        return true;
    }
    await transporter.sendMail(mailOptions);
};
//# sourceMappingURL=email.js.map