const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Nasfat Contribution'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(error.message);
    }

    console.log('Message sent: %s', data.id);
    return data;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

module.exports = sendEmail;
