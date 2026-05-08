const nodemailer = require("nodemailer");

async function testMail() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { 
        user: "webosingh93@gmail.com", 
        pass: "jnfz bbqu zloo kckk".replace(/\s/g, "")
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    console.log("Attempting to send test email...");
    const info = await transporter.sendMail({
      from: `"Test Sender" <webosingh93@gmail.com>`,
      to: "webosingh93@gmail.com", // Sending to self for test
      subject: "Test Nodemailer Email",
      text: "This is a test email to verify Nodemailer is working.",
    });

    console.log("Email sent successfully: ", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

testMail();
