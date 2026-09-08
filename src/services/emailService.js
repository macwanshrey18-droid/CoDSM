const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return transporter;
  }

  return null;
}

exports.sendOtpEmail = async (toEmail, otp) => {
  console.log(`\n==================================================`);
  console.log(`✉️  REAL GENERATED OTP FOR [${toEmail}]: [ ${otp} ]`);
  console.log(`==================================================\n`);

  const activeTransporter = getTransporter();
  if (activeTransporter) {
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
          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; color: #334155;">Your verification code is:</p>
            <div style="font-size: 32px; font-weight: 800; color: #10b981; padding: 12px; background-color: #ecfdf5; border-radius: 8px;">
              ${otp}
            </div>
          </div>
        </div>
      `,
    };

    activeTransporter.sendMail(mailOptions).catch((err) => {
      console.error('SMTP Dispatch note:', err.message);
    });
  }

  return true;
};
