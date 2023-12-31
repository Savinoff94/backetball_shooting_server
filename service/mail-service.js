const nodeMailer = require('nodemailer');

class MailService {

    constructor() {

        this.transporter = nodeMailer.createTransport({
            host:process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure: false,
            auth: {
                user:process.env.SMTP_USER,
                past:process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link){

        await this.transporter.sendMail({
            from:process.env.SMTP_USER,
            to,
            subject:'Account activation ' + process.env.API_URL,
            text: '',
            html:
                `
                <div>
                    <h1>To activate click on link</h1>
                    <a href="${link}">${link}</a>
                </div>
                `
        })
    }

}

module.exports = new MailService();