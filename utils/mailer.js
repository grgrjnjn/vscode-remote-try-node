import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendMail = async (to, subject, content) => {
    const mailOptions = {
        from: '"roku" <justanother893@gmail.com>',
        to,
        subject,
        text: content,
        html: `<p>${content}</p>`
    };

    await transporter.sendMail(mailOptions);
};
