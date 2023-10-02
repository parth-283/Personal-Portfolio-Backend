const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html, pdf) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    secureConnection: false,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: true
    }
  });

  var mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: to,
    subject: subject,
    html: html,
    attachments: [
      {
        filename: 'Resume.pdf',
        content: pdf,
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return error
    } else {
      return info
    }
  });
}

module.exports = sendEmail