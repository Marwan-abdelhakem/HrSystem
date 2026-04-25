import nodemailer from "nodemailer"

export async function sendEmail({
    to = "",
    subject = "test",
    text = "",
    html = "",
    cc = "",
    bcc = "",
    attachments = [],
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "m.amer3707@su.edu.eg",
            pass: "qumm yxiw cucb xbhz",
        },
    });
    const info = await transporter.sendMail({
        from: '"test" <m.amer3707@su.edu.eg>',
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        attachments,
    });

    console.log("Message sent:", info.messageId);

}

export const emailSubject = {
    confirmEmail: "Confirm Your Email",
    resetPassword: "Reset Your Password",
    welcome: "welcome To test "
}


