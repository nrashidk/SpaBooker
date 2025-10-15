import { db } from "./db";
import { 
  spaNotificationSettings, 
  spaNotificationCredentials, 
  notificationEvents, 
  notificationUsage,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { decryptJSON } from "./encryptionService";
import {
  getBookingConfirmationEmail,
  getBookingModificationEmail,
  getBookingCancellationEmail,
} from "./emailTemplates";

interface NotificationPayload {
  to: string; // email or phone
  subject?: string; // for email
  message: string;
  html?: string; // for email
  templateData?: Record<string, any>;
}

interface NotificationResult {
  success: boolean;
  channel: string;
  provider: string;
  externalId?: string;
  error?: string;
}

interface EmailCredentials {
  apiKey: string;
  fromEmail: string;
}

interface SmsCredentials {
  accountSid: string;
  authToken: string;
  fromPhone: string;
}

interface WhatsAppCredentials {
  accountSid: string;
  authToken: string;
  fromPhone: string; // WhatsApp-enabled number
}

// Base provider adapter interface
abstract class NotificationProvider {
  abstract send(payload: NotificationPayload): Promise<NotificationResult>;
}

// Email provider adapter (SendGrid/Resend)
class EmailProvider extends NotificationProvider {
  constructor(
    private provider: string,
    private credentials: EmailCredentials
  ) {
    super();
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // In development mode or when no real credentials, log to console
      if (!this.credentials.apiKey || this.credentials.apiKey === 'mock') {
        console.log('📧 [EMAIL - DEV MODE]', {
          provider: this.provider,
          from: this.credentials.fromEmail,
          to: payload.to,
          subject: payload.subject,
          message: payload.message.substring(0, 100) + '...',
        });
        
        return {
          success: true,
          channel: 'email',
          provider: this.provider,
          externalId: 'mock-' + Date.now(),
        };
      }

      // Real email sending logic based on provider
      if (this.provider === 'sendgrid') {
        return await this.sendViaSendGrid(payload);
      } else if (this.provider === 'resend') {
        return await this.sendViaResend(payload);
      }

      throw new Error(`Unsupported email provider: ${this.provider}`);
    } catch (error: any) {
      return {
        success: false,
        channel: 'email',
        provider: this.provider,
        error: error.message,
      };
    }
  }

  private async sendViaResend(payload: NotificationPayload): Promise<NotificationResult> {
    // Resend implementation (when credentials provided)
    // Would use: import { Resend } from 'resend';
    throw new Error('Resend integration pending real credentials');
  }

  private async sendViaSendGrid(payload: NotificationPayload): Promise<NotificationResult> {
    // SendGrid implementation (when credentials provided)
    // Would use: import sgMail from '@sendgrid/mail';
    throw new Error('SendGrid integration pending real credentials');
  }
}

// SMS provider adapter (Twilio)
class SmsProvider extends NotificationProvider {
  constructor(
    private provider: string,
    private credentials: SmsCredentials
  ) {
    super();
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Development mode logging
      if (!this.credentials.accountSid || this.credentials.accountSid === 'mock') {
        console.log('💬 [SMS - DEV MODE]', {
          provider: this.provider,
          from: this.credentials.fromPhone,
          to: payload.to,
          message: payload.message.substring(0, 100) + '...',
        });
        
        return {
          success: true,
          channel: 'sms',
          provider: this.provider,
          externalId: 'mock-sms-' + Date.now(),
        };
      }

      // Real SMS sending via Twilio
      return await this.sendViaTwilio(payload);
    } catch (error: any) {
      return {
        success: false,
        channel: 'sms',
        provider: this.provider,
        error: error.message,
      };
    }
  }

  private async sendViaTwilio(payload: NotificationPayload): Promise<NotificationResult> {
    // Twilio implementation (when credentials provided)
    // Would use: import twilio from 'twilio';
    throw new Error('Twilio SMS integration pending real credentials');
  }
}

// WhatsApp provider adapter (Twilio WhatsApp API)
class WhatsAppProvider extends NotificationProvider {
  constructor(
    private provider: string,
    private credentials: WhatsAppCredentials
  ) {
    super();
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Development mode logging
      if (!this.credentials.accountSid || this.credentials.accountSid === 'mock') {
        console.log('📱 [WHATSAPP - DEV MODE]', {
          provider: this.provider,
          from: this.credentials.fromPhone,
          to: payload.to,
          message: payload.message.substring(0, 100) + '...',
        });
        
        return {
          success: true,
          channel: 'whatsapp',
          provider: this.provider,
          externalId: 'mock-wa-' + Date.now(),
        };
      }

      // Real WhatsApp sending via Twilio
      return await this.sendViaTwilioWhatsApp(payload);
    } catch (error: any) {
      return {
        success: false,
        channel: 'whatsapp',
        provider: this.provider,
        error: error.message,
      };
    }
  }

  private async sendViaTwilioWhatsApp(payload: NotificationPayload): Promise<NotificationResult> {
    // Twilio WhatsApp implementation (when credentials provided)
    // Would use: import twilio from 'twilio';
    throw new Error('Twilio WhatsApp integration pending real credentials');
  }
}

// Main notification service
export class NotificationService {
  /**
   * Send notification with automatic fallback
   */
  async sendNotification(
    spaId: number,
    notificationType: 'confirmation' | 'modification' | 'cancellation' | 'reminder',
    recipient: { email?: string; phone?: string },
    bookingId?: number,
    templateData?: Record<string, any>
  ): Promise<void> {
    // Get spa notification settings
    const [settings] = await db
      .select()
      .from(spaNotificationSettings)
      .where(eq(spaNotificationSettings.spaId, spaId));

    if (!settings) {
      console.log(`No notification settings for spa ${spaId}, skipping notification`);
      return;
    }

    // Check if this notification type is enabled
    const typeEnabled = this.isNotificationTypeEnabled(settings, notificationType);
    if (!typeEnabled) {
      console.log(`Notification type '${notificationType}' disabled for spa ${spaId}`);
      return;
    }

    // Determine channels to try based on settings and fallback order
    const channels = this.getChannelsToTry(settings, recipient);

    // Try each channel in order until one succeeds
    for (const channel of channels) {
      try {
        const result = await this.sendViaChannel(
          spaId,
          channel,
          notificationType,
          recipient,
          templateData
        );

        // Log the event
        await this.logNotificationEvent(
          spaId,
          bookingId,
          channel,
          result.provider,
          recipient,
          notificationType,
          result
        );

        // Update usage tracking
        await this.trackUsage(spaId, channel, result.success);

        if (result.success) {
          console.log(`✅ Notification sent successfully via ${channel} for spa ${spaId}`);
          return; // Success! Stop trying other channels
        }
      } catch (error: any) {
        console.error(`Failed to send via ${channel}:`, error.message);
      }
    }

    console.log(`⚠️ All notification channels failed for spa ${spaId}`);
  }

  private isNotificationTypeEnabled(settings: any, type: string): boolean {
    switch (type) {
      case 'confirmation':
        return settings.sendConfirmation;
      case 'modification':
        return settings.sendModification;
      case 'cancellation':
        return settings.sendCancellation;
      case 'reminder':
        return settings.sendReminder;
      default:
        return false;
    }
  }

  private getChannelsToTry(settings: any, recipient: { email?: string; phone?: string }): string[] {
    const channels: string[] = [];

    // Use fallback order if defined
    if (settings.fallbackOrder && settings.fallbackOrder.length > 0) {
      return settings.fallbackOrder.filter((ch: string) => {
        if (ch === 'email' && settings.emailEnabled && recipient.email) return true;
        if (ch === 'sms' && settings.smsEnabled && recipient.phone) return true;
        if (ch === 'whatsapp' && settings.whatsappEnabled && recipient.phone) return true;
        return false;
      });
    }

    // Default fallback: email -> SMS -> WhatsApp
    if (settings.emailEnabled && recipient.email) channels.push('email');
    if (settings.smsEnabled && recipient.phone) channels.push('sms');
    if (settings.whatsappEnabled && recipient.phone) channels.push('whatsapp');

    return channels;
  }

  private async sendViaChannel(
    spaId: number,
    channel: string,
    notificationType: string,
    recipient: { email?: string; phone?: string },
    templateData?: Record<string, any>
  ): Promise<NotificationResult> {
    // Get credentials for this channel
    const [credentials] = await db
      .select()
      .from(spaNotificationCredentials)
      .where(
        and(
          eq(spaNotificationCredentials.spaId, spaId),
          eq(spaNotificationCredentials.channel, channel)
        )
      );

    if (!credentials) {
      // No credentials configured - use mock mode
      const provider = this.getProviderForChannel(channel, {
        apiKey: 'mock',
        fromEmail: 'bookings@spa.local',
        accountSid: 'mock',
        authToken: 'mock',
        fromPhone: '+1234567890'
      });

      const payload = this.buildPayload(channel, notificationType, recipient, templateData);
      return await provider.send(payload);
    }

    // Decrypt credentials
    const decryptedCreds = decryptJSON(credentials.encryptedCredentials);

    // Get appropriate provider
    const provider = this.getProviderForChannel(channel, {
      ...decryptedCreds,
      fromEmail: credentials.fromEmail,
      fromPhone: credentials.fromPhone,
    });

    // Build payload
    const payload = this.buildPayload(channel, notificationType, recipient, templateData);

    // Send
    return await provider.send(payload);
  }

  private getProviderForChannel(channel: string, creds: any): NotificationProvider {
    switch (channel) {
      case 'email':
        return new EmailProvider(creds.provider || 'sendgrid', {
          apiKey: creds.apiKey,
          fromEmail: creds.fromEmail || 'noreply@spa.com',
        });
      case 'sms':
        return new SmsProvider('twilio', {
          accountSid: creds.accountSid,
          authToken: creds.authToken,
          fromPhone: creds.fromPhone,
        });
      case 'whatsapp':
        return new WhatsAppProvider('twilio', {
          accountSid: creds.accountSid,
          authToken: creds.authToken,
          fromPhone: creds.fromPhone,
        });
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  private buildPayload(
    channel: string,
    notificationType: string,
    recipient: { email?: string; phone?: string },
    templateData?: Record<string, any>
  ): NotificationPayload {
    const { subject, message, html } = this.getTemplate(notificationType, templateData);

    return {
      to: channel === 'email' ? recipient.email! : recipient.phone!,
      subject: channel === 'email' ? subject : undefined,
      message,
      html: channel === 'email' ? html : undefined,
      templateData,
    };
  }

  private getTemplate(type: string, data?: Record<string, any>) {
    // Use professional email templates
    if (!data) {
      return {
        subject: 'Notification',
        message: 'You have a new notification.',
        html: '<p>You have a new notification.</p>',
      };
    }

    const templateData = {
      customerName: data.customerName || 'Valued Customer',
      spaName: data.spaName || 'Spa',
      spaAddress: data.spaAddress,
      spaPhone: data.spaPhone,
      bookingDate: data.bookingDate || data.date,
      bookingTime: data.bookingTime || data.time,
      services: data.services || [],
      staffName: data.staffName,
      totalAmount: data.totalAmount,
      currency: data.currency || 'AED',
      bookingId: data.bookingId,
      cancellationPolicy: data.cancellationPolicy,
      notes: data.notes,
    };

    switch (type) {
      case 'confirmation':
        const confirmEmail = getBookingConfirmationEmail(templateData);
        return {
          subject: confirmEmail.subject,
          message: confirmEmail.text,
          html: confirmEmail.html,
        };
      case 'modification':
        const modifyEmail = getBookingModificationEmail(templateData);
        return {
          subject: modifyEmail.subject,
          message: modifyEmail.text,
          html: modifyEmail.html,
        };
      case 'cancellation':
        const cancelEmail = getBookingCancellationEmail(templateData);
        return {
          subject: cancelEmail.subject,
          message: cancelEmail.text,
          html: cancelEmail.html,
        };
      default:
        return {
          subject: 'Notification',
          message: 'You have a new notification.',
          html: '<p>You have a new notification.</p>',
        };
    }
  }

  private async logNotificationEvent(
    spaId: number,
    bookingId: number | undefined,
    channel: string,
    provider: string,
    recipient: { email?: string; phone?: string },
    notificationType: string,
    result: NotificationResult
  ): Promise<void> {
    await db.insert(notificationEvents).values({
      spaId,
      bookingId: bookingId || null,
      channel,
      provider,
      recipientEmail: recipient.email || null,
      recipientPhone: recipient.phone || null,
      notificationType,
      status: result.success ? 'sent' : 'failed',
      errorMessage: result.error || null,
      externalId: result.externalId || null,
      sentAt: result.success ? new Date() : null,
    });
  }

  private async trackUsage(spaId: number, channel: string, success: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Try to update existing record
    const [existing] = await db
      .select()
      .from(notificationUsage)
      .where(
        and(
          eq(notificationUsage.spaId, spaId),
          eq(notificationUsage.channel, channel),
          eq(notificationUsage.date, today)
        )
      );

    if (existing) {
      await db
        .update(notificationUsage)
        .set({
          successCount: success ? (existing.successCount || 0) + 1 : (existing.successCount || 0),
          failureCount: !success ? (existing.failureCount || 0) + 1 : (existing.failureCount || 0),
          updatedAt: new Date(),
        })
        .where(eq(notificationUsage.id, existing.id));
    } else {
      await db.insert(notificationUsage).values({
        spaId,
        channel,
        date: today,
        successCount: success ? 1 : 0,
        failureCount: !success ? 1 : 0,
        estimatedCost: '0.0000', // Will be calculated based on provider rates
      });
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
