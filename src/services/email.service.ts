import { transporter } from '../config/nodemailer';
import { logger } from '../utils/logger';

const baseTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BodhAI</title>
</head>
<body style="margin:0;padding:0; background-color:#F8FAFC; font-family:'Helvetica Neue', Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; border:1px solid #E2E8F0; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #1E3A5F 0%,#2563EB 100%); padding:32px 40px; text-align:center;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background:rgba(255,255,255,0.15); border-radius:12px; padding:10px 20px;">
                      <span style="color:#fff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">BodhAI</span>
                    </div>
                    <p style="color: rgba(255,255,255,0.7); font-size:13px; margin:8px 0 0;">Thinking Space</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #E2E8F0; padding:24px 40px; text-align:center; background:#F8FAFC;">
              <p style="color:#94A3B8; font-size:12px; line-height:1.6; margin:0;">
                © 2024 BodhAI Cognitive Systems<br/>
                Your API keys and data are never shared or sold.<br/>
                <a href="${process.env.CLIENT_URL}/privacy" style="color:#2563EB; text-decoration:none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="${process.env.CLIENT_URL}/terms" style="color:#2563EB; text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const otpBlock = (otp: string): string => `
  <div style="background:#F1F5F9; border:2px solid #E2E8F0; border-radius:14px; padding:32px 20px; text-align:center; margin:28px 0;">
    <p style="color:#64748B; font-size:13px; margin:0 0 16px; letter-spacing:0.5px; text-transform:uppercase;">
      Your verification code
    </p>
    <div style="display:inline-block; background:#fff; border:2px solid #2563EB; border-radius:12px; padding:16px 32px;">
      <span style="font-size:48px; font-weight:800; letter-spacing:16px; color:#1E3A5F; font-family:'Courier New',monospace;">
        ${otp}
      </span>
    </div>
    <p style="color:#94A3B8; font-size:12px; margin:16px 0 0;">
      Expires in 10 minutes
    </p>
  </div>
`;

const securityNote = (): string => `
  <div style="background:#FEF3C7; border-left:4px solid #F59E0B; border-radius:0 8px 8px 0; padding:12px 16px; margin-top:24px;">
    <p style="color:#92400E; font-size:12px; margin:0;">
      🔒 <strong>Security tip:</strong> BodhAI will never ask for this code via phone or chat. Do not share it with anyone.
    </p>
  </div>
`;

export const sendEmailVerification = async (email: string, otp: string, firstName: string) => {
  const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Verify your email ✉️</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      Welcome to BodhAI! Enter this code to verify your email address and activate your account.
    </p>
    ${otpBlock(otp)}
    <p style="color:#94A3B8; font-size:13px; line-height:1.6;">
      If you didn't create a BodhAI account, you can safely ignore this email.
    </p>
    ${securityNote()}
  `;

  try {
    await transporter.sendMail({
      from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
      to: email,
      subject: `✅ Verify your BodhAI account — Code: ${otp}`,
      html: baseTemplate(content)
    });
    logger.info(`Email verification OTP sent to ${email}`);
  } catch (err) {
    logger.error(`[DEV MOCK] Failed to send email to ${email} (SMTP not configured).`);
    logger.warn(`[DEV MOCK] YOUR VERIFICATION OTP IS: ${otp}`);
  }
};

export const sendPasswordReset = async (email: string, otp: string, firstName: string) => {
  const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Reset your password 🔑</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      We received a request to reset your BodhAI password. Use the code below to proceed.
    </p>
    ${otpBlock(otp)}
    <p style="color:#64748B; font-size:14px; line-height:1.6;">
      If you didn't request a password reset, your account is safe and you can ignore this email. No changes have been made.
    </p>
    <div style="background:#FEE2E2; border-left:4px solid #EF4444; border-radius:0 8px 8px 0; padding:12px 16px; margin-top:16px;">
      <p style="color:#991B1B; font-size:12px;margin:0;">
        ⚠️ If you didn't request this, please secure your account immediately by changing your password.
      </p>
    </div>
    ${securityNote()}
  `;

  try {
    await transporter.sendMail({
      from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
      to: email,
      subject: `🔑 BodhAI Password Reset Code — Expires in 10 min`,
      html: baseTemplate(content)
    });
    logger.info(`Password reset OTP sent to ${email}`);
  } catch (err) {
    logger.error(`[DEV MOCK] Failed to send email to ${email} (SMTP not configured).`);
    logger.warn(`[DEV MOCK] YOUR PASSWORD RESET OTP IS: ${otp}`);
  }
};

export const sendEmailChangeVerification = async (newEmail: string, otp: string, firstName: string) => {
  const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Confirm your new email 📧</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      You requested to change your BodhAI email address to <strong>${newEmail}</strong>. Enter this code to confirm.
    </p>
    ${otpBlock(otp)}
    <p style="color:#94A3B8; font-size:13px; line-height:1.6;">
      If you didn't request this change, please log in and secure your account.
    </p>
    ${securityNote()}
  `;

  try {
    await transporter.sendMail({
      from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
      to: newEmail,
      subject: `📧 Confirm your new BodhAI email — Code: ${otp}`,
      html: baseTemplate(content)
    });
    logger.info(`Email change OTP sent to ${newEmail}`);
  } catch (err) {
    logger.error(`[DEV MOCK] Failed to send email to ${newEmail} (SMTP not configured).`);
    logger.warn(`[DEV MOCK] YOUR EMAIL CHANGE OTP IS: ${otp}`);
  }
};

export const sendLoginVerification = async (email: string, otp: string, firstName: string, deviceInfo: string) => {
  const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Login verification code 🛡️</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      A login attempt was made from <strong>${deviceInfo}</strong>. Enter this code to complete sign in.
    </p>
    ${otpBlock(otp)}
    <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:16px; margin:20px 0;">
      <p style="color:#1E40AF; font-size:13px; margin:0;">
        📱 Not you? 
        <a href="${process.env.CLIENT_URL}/forgot-password" style="color:#2563EB; font-weight:600;">
          Reset your password immediately
        </a>
      </p>
    </div>
    ${securityNote()}
  `;

  try {
    await transporter.sendMail({
      from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
      to: email,
      subject: `🛡️ BodhAI Login Code: ${otp}`,
      html: baseTemplate(content)
    });
    logger.info(`Login verification OTP sent to ${email}`);
  } catch (err) {
    logger.error(`[DEV MOCK] Failed to send email to ${email} (SMTP not configured).`);
    logger.warn(`[DEV MOCK] YOUR LOGIN OTP IS: ${otp}`);
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  const content = `
    <h2 style="color:#0F172A; font-size:26px; font-weight:700; margin:0 0 8px;">Welcome to BodhAI, ${firstName}! 🎉</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 20px;">
      Your account is verified and ready. Here's what you can do next:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px; background:#F0F9FF; border-radius:10px; border:1px solid #BAE6FD; margin-bottom:12px;">
          <p style="margin:0; font-size:14px; color:#0369A1;">
            <strong>1.</strong> Add your AI API key in Settings → AI Configuration
          </p>
        </td>
      </tr>
      <tr><td style="height:10px;"></td></tr>
      <tr>
        <td style="padding:12px; background:#F0FDF4; border-radius:10px; border:1px solid #BBF7D0;">
          <p style="margin:0; font-size:14px; color:#15803D;">
            <strong>2.</strong> Complete onboarding to get your personalized roadmap
          </p>
        </td>
      </tr>
      <tr><td style="height:10px;"></td></tr>
      <tr>
        <td style="padding:12px; background:#FFF7ED; border-radius:10px; border:1px solid #FED7AA;">
          <p style="margin:0; font-size:14px; color:#C2410C;">
            <strong>3.</strong> Start your first AI-powered learning session
          </p>
        </td>
      </tr>
    </table>

    <div style="text-align:center; margin-top:32px;">
      <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block; background:linear-gradient(135deg, #1E3A5F,#2563EB); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:12px; font-weight:600; font-size:15px;">
        Go to Dashboard →
      </a>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
      to: email,
      subject: `🎉 Welcome to BodhAI, ${firstName}!`,
      html: baseTemplate(content)
    });
    logger.info(`Welcome email sent to ${email}`);
  } catch (err) {
    logger.error(`[DEV MOCK] Failed to send welcome email to ${email} (SMTP not configured).`);
  }
};
