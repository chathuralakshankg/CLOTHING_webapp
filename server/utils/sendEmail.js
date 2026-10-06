const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.to,
    from: process.env.FROM_EMAIL,
    subject: options.subject,
    html: options.html,
  };

  await sgMail.send(msg);
};

module.exports = sendEmail;
