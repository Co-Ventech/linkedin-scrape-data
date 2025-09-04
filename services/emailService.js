
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for SSL
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASS,
    },
});

async function sendSuccessEmail(jobType, message) {
    try {
        const mailOptions = {
            from: `"Cron Job Monitor" <${process.env.GMAIL_EMAIL}>`,
            to: process.env.NOTIFICATION_EMAIL,
            subject: `✅ ${jobType} - Success`,
            html: `
                <h2>✅ Cron Job Success</h2>
                <p><strong>Job:</strong> ${jobType}</p>
                <p><strong>Status:</strong> Completed Successfully</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                <p><strong>Details:</strong> ${message}</p>
                <hr>
                <p><em>Automated notification from your cron job system</em></p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Success email sent for ${jobType}:`, info.messageId);
        return {
            statusCode: 200,
            message: "Success email sent successfully"
        };
    } catch (error) {
        console.error('Error sending success email:', error.message);
        return {
            statusCode: 500,
            message: `Failed to send success email: ${error.message}`
        };
    }
}

async function sendErrorEmail(jobType, error) {
    try {
        const mailOptions = {
            from: `"Cron Job Monitor" <${process.env.GMAIL_EMAIL}>`,
            to: process.env.NOTIFICATION_EMAIL,
            subject: `❌ ${jobType} - Failed`,
            html: `
                <h2>❌ Cron Job Error</h2>
                <p><strong>Job:</strong> ${jobType}</p>
                <p><strong>Status:</strong> Failed</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                <p><strong>Error:</strong> ${error}</p>
                <hr>
                <p><em>Automated notification from your cron job system</em></p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Error email sent for ${jobType}:`, info.messageId);
        return {
            statusCode: 200,
            message: "Error email sent successfully"
        };
    } catch (error) {
        console.error('Error sending error email:', error.message);
        return {
            statusCode: 500,
            message: `Failed to send error email: ${error.message}`
        };
    }
}

module.exports = { sendSuccessEmail, sendErrorEmail };
