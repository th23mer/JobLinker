import nodemailer, { Transporter } from "nodemailer";

export interface IMailer {
  send(to: string, subject: string, text: string): Promise<void>;
}

export class Mailer implements IMailer {
  private transporter: Transporter | null = null;
  private from: string;

  constructor() {
    this.from = process.env.SMTP_FROM || "no-reply@joblinker.tn";
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      console.log(`[mailer:fallback] to=${to} subject="${subject}"\n${text}\n`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
    } catch (err) {
      console.error("[mailer] send failed:", err);
    }
  }
}
