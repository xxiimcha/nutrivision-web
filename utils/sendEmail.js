const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text) {
  console.log(`Attempting to send email to: ${to}`); // Log the start of the email sending process

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services as well like 'Yahoo', 'Outlook', etc.
    auth: {
      user: 'charmaine.l.d.cator@gmail.com', // Replace with your Gmail address
      pass: 'vntbfwluktvkrhow', // Replace with your Gmail app password (generated in Google account settings)
    },
  });

  // Set up email options
  const mailOptions = {
    from: 'charmaine.l.d.cator@gmail.com', // Sender address (same as the user in auth)
    to: to, // List of receivers
    subject: subject, // Subject line
    text: text, // Plain text body
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    const successMessage = `Email successfully sent to: ${to}`;
    console.log(successMessage); // Log success message to the terminal
  } catch (error) {
    const errorMessage = `Error sending email to: ${to} - ${error.message}`;
    console.error(errorMessage); // Log error message to the terminal
    throw new Error('Could not send email');
  }
}

module.exports = sendEmail;
