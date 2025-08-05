const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY, // Your API key here
});
// const axios = require('axios');

// async function sendSuccessEmailDirect(jobType, message) {
//   try {
//     const emailData = {
//       from: {
//         email: "noreply@test-r6ke4n150regon12.mlsender.net", // Replace with your trial domain
//         name: "Cron Job Monitor"
//       },
//       to: [
//         {
//           email: process.env.NOTIFICATION_EMAIL,
//           name: "Job Monitor"
//         }
//       ],
//       subject: `✅ ${jobType} - Success`,
//       html: `
//         <h2>✅ Cron Job Success</h2>
//         <p><strong>Job:</strong> ${jobType}</p>
//         <p><strong>Status:</strong> Completed Successfully</p>
//         <p><strong>Time:</strong> ${new Date().toISOString()}</p>
//         <p><strong>Details:</strong> ${message}</p>
//       `
//     };

//     const response = await axios.post('https://api.mailersend.com/v1/email', emailData, {
//       headers: {
//         'Authorization': `Bearer ${process.env.MAILERSEND_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('Email sent successfully:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error sending email:', error.response?.data || error.message);
//     throw error;
//   }
// }

async function sendSuccessEmail(jobType, message) {
  try {
    // Use your trial domain (replace with your actual trial domain)
    const sentFrom = new Sender(
      process.env.SEND_FROM, // Replace with your actual trial domain
      "Cron Job Monitor"
    );
    
    const recipients = [
      new Recipient(process.env.NOTIFICATION_EMAIL, "Job Monitor")
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`✅ ${jobType} - Success`)
      .setHtml(`
        <h2>✅ Cron Job Success</h2>
        <p><strong>Job:</strong> ${jobType}</p>
        <p><strong>Status:</strong> Completed Successfully</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Details:</strong> ${message}</p>
        <hr>
        <p><em>Automated notification from your cron job system</em></p>
      `);

    await mailerSend.email.send(emailParams);
    console.log(`Success email sent for ${jobType}`);
  } catch (error) {
    console.error('Error sending success email:', error.message);
  }
}

async function sendErrorEmail(jobType, error) {
  try {
    const sentFrom = new Sender(
      process.env.SEND_FROM, // Replace with your actual trial domain
      "Cron Job Monitor"
    );
    
    const recipients = [
      new Recipient(process.env.NOTIFICATION_EMAIL, "Job Monitor")
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`❌ ${jobType} - Failed`)
      .setHtml(`
        <h2>❌ Cron Job Error</h2>
        <p><strong>Job:</strong> ${jobType}</p>
        <p><strong>Status:</strong> Failed</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Error:</strong> ${error}</p>
        <hr>
        <p><em>Automated notification from your cron job system</em></p>
      `);

    await mailerSend.email.send(emailParams);
    console.log(`Error email sent for ${jobType}`);
  } catch (error) {
    console.error('Error sending error email:', error.message);
  }
}

module.exports = { sendSuccessEmail, sendErrorEmail };
