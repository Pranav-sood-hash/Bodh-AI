import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    logger.error('Gmail SMTP connection failed:', error);
  } else {
    logger.info('✅ Gmail SMTP ready to send emails');
  }
});
