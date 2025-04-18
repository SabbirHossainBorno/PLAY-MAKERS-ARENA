// lib/email.js
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 20000      // 20 seconds
  });

export const generateToken = () => crypto.randomBytes(32).toString('hex');

export const sendConfirmationEmail = async (email, token) => {
    try {
  const confirmationLink = `${process.env.BASE_URL}/api/confirm-subscription?token=${token}`;
  
  const mailOptions = {
    from: `"Play Makers Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirm Your Subscription',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Almost There! Confirm Your Email</h2>
        <p>Please click the button below to confirm your subscription:</p>
        <a href="${confirmationLink}" 
          style="display: inline-block; padding: 12px 24px; 
          background-color: #2563eb; color: white; 
          text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Confirm Subscription
        </a>
        <p>This link will expire in 5 minutes.</p>
        <hr style="border: 1px solid #e5e7eb;">
        <p style="font-size: 0.875rem; color: #6b7280;">
          If you didn't request this subscription, please ignore this email.
        </p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send confirmation email');
  }
};