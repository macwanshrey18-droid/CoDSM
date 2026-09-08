const nodemailer = require('nodemailer');

// Transporter initialization
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Configured SMTP Transporter (e.g., Gmail, SendGrid, Mailgun)
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback: Create Ethereal test account for dev & console log
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Ethereal Email Test Account Created:', testAccount.user);
    } catch (err) {
      console.log('Falling back to console email logger');
      transporter = null;
    }
  }

  return transporter;
}

exports.sendOtpEmail = async (toEmail, otp) => {
  console.log(`\n==================================================`);
  console.log(`✉️  REAL GENERATED OTP FOR [${toEmail}]: [ ${otp} ]`);
  console.log(`==================================================\n`);

  const mailOptions = {
    from: `"CoDSM Marketplace" <noreply@codsm.org>`,
    to: toEmail,
    subject: `Your CoDSM Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">CoDSM</h1>
          <p style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Cooperative Services Marketplace</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <p style="font-size: 14px; color: #334155; margin-bottom: 12px;">Your 6-digit email verification code is:</p>
          <div style="font-size: 32px; font-weight: 800; color: #10b981; letter-spacing: 6px; padding: 12px; background-color: #ecfdf5; border-radius: 8px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8;">
          Cooperative-Owned Digital Service Marketplace • SIH 2026
        </div>
      </div>
    `,
  };

  try {
    const activeTransporter = await getTransporter();
    if (activeTransporter) {
      const info = await activeTransporter.sendMail(mailOptions);
      if (info && nodemailer.getTestMessageUrl(info)) {
        console.log('📧 Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    }
  } catch (err) {
    console.error('Email dispatch info:', err.message);
  }

  return true;
};
