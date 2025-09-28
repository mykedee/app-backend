const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstname = user.firstname;
    this.lastname = user.lastname;   
    this.copyRightDate = user.copyRightDate; 
    this.Url = user.Url;
    this.from = `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../view/emails/${template}.pug`,
      {
        firstname: this.firstname,
        Url: this.Url,
        subject,
        copyRightDate: this.copyRightDate,
        // code: this.code,
        // formattedItemsPrice: this.formattedItemsPrice.toLocaleString(),
        // itemsPrice: this.itemsPrice.toLocaleString(),
        // orderItems: this.orderItems,
        // shippingAddress: this.shippingAddress,
        // _id: this._id,
      }
    );
    const message = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    await this.newTransport().sendMail(message);
  }
  async sendWelcomeMessage() {
    await this.send("welcome", "User Email Verification");
  }

  async sendForgotPasswordMessage() {
    await this.send("forgotpassword", "Forgot Password");
  }

  // async sendOrderConfirm() {
  //   await this.send("orderconfirm", "Your Order Has Been Confirmed");
  // }
};
