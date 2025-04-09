const nodemailer = require('nodemailer');

async function sendOtpToEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'nutrivisioncembo@gmail.com', // Replace with your Gmail address
      pass: 'bawg ysjw modm uphc', // Replace with your Gmail password or App Password
    },
  });

  const mailOptions = {
    from: 'nutrivisioncembo@gmail.com',
    to: to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
}

module.exports = sendOtpToEmail;
