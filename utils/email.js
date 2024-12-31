//Email notification system and templates
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

//Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
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
            from: process.env.EMAIL_USER,
            to,
            subject: subject || emailTemplates[template].subject,
            html
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

module.exports = { sendEmail };