const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'charmaine.l.d.cator@gmail.com', // Replace with your Gmail address
        pass: 'vntbfwluktvkrhow', // Replace with your Gmail app password (generated in Google account settings)
    },
  });

  const mailOptions = {
    from: 'charmaine.l.d.cator@gmail.com', // Sender address (same as the user in auth)
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendPasswordResetEmail;
