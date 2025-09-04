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

// Helper function for trial mode
const getRecipientEmail = (originalEmail) => {
    const isTrialMode = process.env.NODEMAILER_TRIAL_MODE === 'true';
    return isTrialMode ? process.env.NODEMAILER_ADMIN_EMAIL : originalEmail;
};

// Updated sendPasswordResetEmail to handle both reset link and new password
const sendPasswordResetEmail = async (email, username, resetLink = null, newPassword = null, loginLink = null) => {
    try {
        const recipientEmail = getRecipientEmail(email);
        
        // Different content based on whether it's a reset link or new password
        const isHardReset = newPassword !== null;
        const subject = isHardReset 
            ? `Your Password Has Been Reset${process.env.NODEMAILER_TRIAL_MODE === 'true' ? ` - For: ${email}` : ''}`
            : `Password Reset Request${process.env.NODEMAILER_TRIAL_MODE === 'true' ? ` - For: ${email}` : ''}`;

        const htmlContent = isHardReset ? `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .trial-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
                    .password-box { background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #28a745; }
                    .button { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
                    .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin: 15px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${process.env.NODEMAILER_TRIAL_MODE === 'true' ? `
                    <div class="trial-notice">
                        <strong>TRIAL MODE:</strong> This email was intended for <strong>${email}</strong> but sent to admin due to trial limitations.
                    </div>` : ''}
                    <div class="header">
                        <h1>Password Reset Complete</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${username}!</h2>
                        <p>Your company administrator has reset your password for security reasons.</p>
                        
                        <div class="password-box">
                            <strong>Your New Password:</strong><br>
                            <code style="font-size: 16px; font-weight: bold;">${newPassword}</code>
                        </div>
                        
                        <div class="warning">
                            <strong>Important:</strong> Please change this password immediately after logging in for security reasons.
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${loginLink}" class="button">Login to Your Account</a>
                        </div>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Click the login button above</li>
                            <li>Use your email and the new password provided</li>
                            <li>Change your password immediately after logging in</li>
                        </ol>
                        
                        <p>If you did not expect this password reset, please contact your company administrator immediately.</p>
                    </div>
                </div>
            </body>
            </html>
        ` : `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .trial-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
                    .button { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
                    .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; margin: 15px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${process.env.NODEMAILER_TRIAL_MODE === 'true' ? `
                    <div class="trial-notice">
                        <strong>TRIAL MODE:</strong> This email was intended for <strong>${email}</strong> but sent to admin due to trial limitations.
                    </div>` : ''}
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${username}!</h2>
                        <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
                        
                        <div class="warning">
                            <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" class="button">Reset Your Password</a>
                        </div>
                        
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #666;">${resetLink}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"${process.env.NODEMAILER_FROM_NAME || 'Multi-Tenant System'}" <${process.env.GMAIL_EMAIL}>`,
            to: recipientEmail,
            replyTo: process.env.GMAIL_EMAIL,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password email sent successfully to ${recipientEmail} (intended for ${email}):`, info.messageId);
        return {
            statusCode: 200,
            message: "Password email sent successfully",
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Password email sending failed:', error);
        throw error;
    }
};

const sendInvitationEmail = async (email, companyName, temporaryPassword, loginLink) => {
    try {
        const mailOptions = {
            from: `"${process.env.NODEMAILER_FROM_NAME || 'Multi-Tenant System'}" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            replyTo: process.env.GMAIL_EMAIL,
            subject: `Invitation to join ${companyName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Company Invitation</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
                        .password-box { background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #007bff; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to ${companyName}!</h1>
                        </div>
                        <div class="content">
                            <h2>You've been invited to join ${companyName}</h2>
                            <p>Congratulations! You have been invited to join <strong>${companyName}</strong> as a company administrator.</p>
                            
                            <div class="password-box">
                                <strong>Your Temporary Password:</strong><br>
                                <code style="font-size: 16px; font-weight: bold;">${temporaryPassword}</code>
                            </div>
                            
                            <p>Please use this temporary password to login to your account. <strong>We strongly recommend changing your password immediately after logging in.</strong></p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${loginLink}" class="button">Login to Your Account</a>
                            </div>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Click the login button above</li>
                                <li>Use your email and the temporary password provided</li>
                                <li>Change your password immediately</li>
                                <li>Start managing your company users</li>
                            </ol>
                            
                            <p>If you have any questions, please contact your system administrator.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; 2025 Multi-Tenant System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Welcome to ${companyName}!
                
                You've been invited to join ${companyName} as a company administrator.
                
                Your temporary password: ${temporaryPassword}
                
                Please login at: ${loginLink}
                
                Important: Change your password immediately after logging in.
                
                Best regards,
                Multi-Tenant System Team
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Invitation email sent successfully:', info.messageId);
        return {
            statusCode: 200,
            message: "Invitation email sent successfully",
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Invitation email sending failed:', error);
        throw error;
    }
};

const sendWelcomeEmail = async (email, username, companyName) => {
    try {
        const mailOptions = {
            from: `"${process.env.NODEMAILER_FROM_NAME || 'Multi-Tenant System'}" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: `Welcome to ${companyName}!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome ${username}!</h1>
                        </div>
                        <div class="content">
                            <p>Your account has been successfully created in <strong>${companyName}</strong>.</p>
                            <p>You can now access your account and start using the system.</p>
                            <p>If you need any assistance, please contact your company administrator.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully:', info.messageId);
        return {
            statusCode: 200,
            message: "Welcome email sent successfully",
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Welcome email sending failed:', error);
        throw error;
    }
};

module.exports = { 
    sendInvitationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail
};
