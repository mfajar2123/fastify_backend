const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '4dffa9780721ca',
    pass: '0d71f168ae7999'
  }
});


async function sendWelcomeEmail(to, username) {
  const mailOptions = {
    from: '"My App" <noreply@myapp.com>',
    to,
    subject: 'Welcome to My App!',

    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #4CAF50;
            }
            p {
              font-size: 16px;
              line-height: 1.5;
            }
            .footer {
              font-size: 12px;
              text-align: center;
              margin-top: 20px;
              color: #888;
            }
            .btn {
              display: inline-block;
              padding: 12px 25px;
              margin-top: 20px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to My App, ${username}!</h1>
            <p>We're excited to have you on board. Thank you for registering with us.</p>
            <p>If you have any questions or need help getting started, feel free to reach out to our support team.</p>
            <a href="https://myapp.com" class="btn">Get Started</a>
            <div class="footer">
              <p>&copy; 2025 My App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  // Mengirim email
  await transporter.sendMail(mailOptions);
}

module.exports = { sendWelcomeEmail };
