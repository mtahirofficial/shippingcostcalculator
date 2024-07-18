const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { Service } = require("../core");
const { resolve } = require("path");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const APP_NAME = process.env.APP_NAME
const MAILER_USER = process.env.MAILER_USER

class MailerService extends Service {
  _transporter;
  constructor() {
    super();
    this.configTransporter();
    this.configUseTemplate();
  }

  configTransporter() {
    this._transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      // host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
      },
    });
  }

  configUseTemplate() {
    this._transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extname: ".hbs",
          layoutsDir: resolve(__dirname, "../views/layouts"),
          partialsDir: resolve(__dirname, "../views/partials"),
        },
        viewPath: resolve(__dirname, "../views"),
        extName: ".hbs",
      })
    );
  }

  async sendEmail({ to, subject, template, context, attachments }) {
    return await this._transporter.sendMail({
      from: '"Mern Stack 👻" truongdq.dev@gmail.com', // sender address
      to,
      subject,
      template,
      context,
      attachments,
    });
  }

  async mailBySendGrid(envelop) {
    try {
      envelop.from = { "email": MAILER_USER, "name": APP_NAME };

      return await sgMail.send({ ...envelop });
    } catch (error) {
      console.error("catch", error.response.body.errors);
    }
  }
}

module.exports = new MailerService();
