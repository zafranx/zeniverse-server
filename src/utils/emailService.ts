import nodemailer from 'nodemailer';
import { ContactInquiryDocument } from '../models/ContactInquiry';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

interface ContactFormEmailData {
  inquiry: ContactInquiryDocument;
  companyEmail: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.defaultFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@zeniverse-ventures.com';
    this.transporter = nodemailer.createTransport(config);
  }

  // Verify SMTP connection
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP server connection verified');
      return true;
    } catch (error) {
      console.error('SMTP server connection failed:', error);
      return false;
    }
  }

  // Send generic email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send contact form notification to company
  async sendContactFormNotification(data: ContactFormEmailData): Promise<boolean> {
    const { inquiry, companyEmail } = data;
    
    const subject = `New Contact Form Submission${inquiry.subject ? ': ' + inquiry.subject : ''}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4b8cbb, #225f8c); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #4b8cbb; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #4b8cbb; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message through your website contact form.</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${inquiry.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${inquiry.email}</div>
            </div>
            ${inquiry.phone ? `
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${inquiry.phone}</div>
            </div>
            ` : ''}
            ${inquiry.subject ? `
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${inquiry.subject}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">${inquiry.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Submitted:</div>
              <div class="value">${inquiry.createdAt?.toLocaleString()}</div>
            </div>
            <div class="field">
              <div class="label">Status:</div>
              <div class="value">${inquiry.status.toUpperCase()}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was automatically generated from your website contact form.</p>
            <p>Please log in to your admin panel to manage this inquiry.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Contact Form Submission
      
      Name: ${inquiry.name}
      Email: ${inquiry.email}
      ${inquiry.phone ? `Phone: ${inquiry.phone}\n` : ''}
      ${inquiry.subject ? `Subject: ${inquiry.subject}\n` : ''}
      Message: ${inquiry.message}
      
      Submitted: ${inquiry.createdAt?.toLocaleString()}
      Status: ${inquiry.status.toUpperCase()}
      
      Please log in to your admin panel to manage this inquiry.
    `;

    return await this.sendEmail({
      to: companyEmail,
      subject,
      text,
      html,
    });
  }

  // Send auto-reply to user
  async sendContactFormAutoReply(inquiry: ContactInquiryDocument): Promise<boolean> {
    const subject = 'Thank you for contacting Zeniverse Ventures';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for your message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4b8cbb, #225f8c); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Zeniverse Ventures</div>
            <h2>Thank you for your message!</h2>
          </div>
          <div class="content">
            <p>Dear ${inquiry.name},</p>
            <p>Thank you for contacting Zeniverse Ventures. We have received your message and will get back to you as soon as possible.</p>
            <p><strong>Your message details:</strong></p>
            <ul>
              ${inquiry.subject ? `<li><strong>Subject:</strong> ${inquiry.subject}</li>` : ''}
              <li><strong>Submitted:</strong> ${inquiry.createdAt?.toLocaleString()}</li>
            </ul>
            <p>We typically respond to inquiries within 24-48 hours during business days. If your matter is urgent, please call us directly.</p>
            <p>Best regards,<br>The Zeniverse Ventures Team</p>
          </div>
          <div class="footer">
            <p>This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Dear ${inquiry.name},
      
      Thank you for contacting Zeniverse Ventures. We have received your message and will get back to you as soon as possible.
      
      Your message details:
      ${inquiry.subject ? `Subject: ${inquiry.subject}\n` : ''}
      Submitted: ${inquiry.createdAt?.toLocaleString()}
      
      We typically respond to inquiries within 24-48 hours during business days.
      
      Best regards,
      The Zeniverse Ventures Team
      
      This is an automated response. Please do not reply to this email.
    `;

    return await this.sendEmail({
      to: inquiry.email,
      subject,
      text,
      html,
    });
  }

  // Send custom reply to inquiry
  async sendInquiryReply(inquiry: ContactInquiryDocument, replyMessage: string, adminName: string): Promise<boolean> {
    const subject = `Re: ${inquiry.subject || 'Your inquiry to Zeniverse Ventures'}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reply to your inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4b8cbb, #225f8c); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .reply-box { background: white; padding: 15px; border-left: 4px solid #4b8cbb; margin: 15px 0; }
          .original-message { background: #e9e9e9; padding: 15px; margin-top: 20px; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Zeniverse Ventures</div>
            <h2>Reply to Your Inquiry</h2>
          </div>
          <div class="content">
            <p>Dear ${inquiry.name},</p>
            <div class="reply-box">
              ${replyMessage.replace(/\n/g, '<br>')}
            </div>
            <p>Best regards,<br>${adminName}<br>Zeniverse Ventures Team</p>
            
            <div class="original-message">
              <h4>Your Original Message:</h4>
              <p><strong>Sent:</strong> ${inquiry.createdAt?.toLocaleString()}</p>
              ${inquiry.subject ? `<p><strong>Subject:</strong> ${inquiry.subject}</p>` : ''}
              <p>${inquiry.message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div class="footer">
            <p>If you have any further questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Dear ${inquiry.name},
      
      ${replyMessage}
      
      Best regards,
      ${adminName}
      Zeniverse Ventures Team
      
      ---
      Your Original Message:
      Sent: ${inquiry.createdAt?.toLocaleString()}
      ${inquiry.subject ? `Subject: ${inquiry.subject}\n` : ''}
      ${inquiry.message}
    `;

    return await this.sendEmail({
      to: inquiry.email,
      subject,
      text,
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;