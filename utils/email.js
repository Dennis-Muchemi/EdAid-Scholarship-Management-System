//Email notification system and templates
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const emailTemplates = {
    'application-confirmation': {
        subject: 'Application Submitted Successfully',
        template: 'application-confirmation.ejs'
    },
    'application-status-update': {
        subject: 'Application Status Updated',
        template: 'application-status-update.ejs'
    },
    'review-assigned': {
        subject: 'New Application Assigned for Review',
        template: 'review-assigned.ejs'
    }
};

const sendEmail = async ({ to, template, data, subject }) => {
    try {
        const templatePath = path.join(__dirname, '../views/emails', emailTemplates[template].template);
        const html = await ejs.renderFile(templatePath, data);

        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to,
            subject: subject || emailTemplates[template].subject,
            html
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

module.exports = { sendEmail };