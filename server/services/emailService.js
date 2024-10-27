import nodemailer from "nodemailer";
import fs from "node:fs";
import { getSettings } from "./settingsService.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "nguyenvantien0620@gmail.com",
    pass: "syec wbgs ijnm ymfw",
  },
});

export const sendMail = async (email) => {
  fs.readFile("./constants/emailTemplate.html", "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    data = data.replace("[DeviceName]", email.device.Name);
    data = data.replace("[DeviceIp]", email.device.Ip);
    data = data.replace("[DateTime]", new Date());
    data = data.replace("[PhoneNumber]", "0359811663");

    const settings = await getSettings()
    const toEmail = settings.rowCount ? settings.rows[0].Email : "nguyenvantien0620trip@gmail.com"
    const info = await transporter.sendMail({
      from: '"Hỗ trợ máy chấm công 👻" ', // sender address
      to: toEmail, // list of receivers
      subject: email.subject, // Subject line
      html: data, // html body
    });

    console.log("Message sent: %s", info.messageId);

    return info;
  });
};
