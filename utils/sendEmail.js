const nodemailer = require("nodemailer");
const dotenv = require("dotenv-safe");
dotenv.config({ path: ".env" });

const sendEmail = async ({ subject, email, message }) => {
  // Debug: Check if environment variables are set
  console.log('Environment check:');
  console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL ? 'Set' : 'Not set');
  console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? 'Set' : 'Not set');
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('SMTP')));
  
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials not configured. Please check your .env file.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: subject,
    text: message,
  };

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
