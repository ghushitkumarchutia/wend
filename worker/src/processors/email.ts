import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Button,
  Hr,
  Section,
} from '@react-email/components';
import { render } from '@react-email/render';
import type { Job } from 'bullmq';
import React from 'react';

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === 'true';

let transporter: any = null;
let resend: Resend | null = null;

if (smtpHost) {
  console.log(`[Email Worker] Initializing SMTP Transporter: host=${smtpHost}, port=${smtpPort}`);
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser && smtpPass ? {
      user: smtpUser,
      pass: smtpPass,
    } : undefined,
  });
} else {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('Either SMTP_HOST or RESEND_API_KEY must be provided in .env');
  }
  console.log('[Email Worker] Initializing Resend Transporter');
  resend = new Resend(resendApiKey);
}

const fromEmail = process.env.FROM_EMAIL ?? (smtpHost ? 'noreply@wend.app' : 'onboarding@resend.dev');

interface EmailJobData {
  to: string;
  userName: string;
  url?: string;
  type:
    | 'email-verification'
    | 'password-reset'
    | 'trip-invite'
    | 'trip-departure-reminder'
    | 'event-reminder'
    | 'email-change'
    | 'security-alert'
    | 'notification';
  subject?: string;
  tripName?: string;
  eventTitle?: string;
  action?: string;
  actorName?: string;
}

function renderEmailTemplate(data: EmailJobData) {
  switch (data.type) {
    case 'email-verification':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'Verify your email'),
              React.createElement(Text, null, `Hi ${data.userName}, please verify your email address to get started with Wend.`),
              React.createElement(
                Button,
                { href: data.url, style: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' } },
                'Verify Email',
              ),
              React.createElement(Hr, null),
              React.createElement(
                Text,
                { style: { fontSize: '12px', color: '#71717a' } },
                'If the button does not work, copy and paste this link: ',
              ),
              React.createElement(Link, { href: data.url, style: { fontSize: '12px', color: '#6366f1' } }, data.url),
            ),
          ),
        ),
      );

    case 'password-reset':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'Reset your password'),
              React.createElement(Text, null, `Hi ${data.userName}, you requested a password reset.`),
              React.createElement(
                Button,
                { href: data.url, style: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' } },
                'Reset Password',
              ),
              React.createElement(Hr, null),
              React.createElement(Text, { style: { fontSize: '12px', color: '#71717a' } }, 'If you did not request this, you can safely ignore this email.'),
            ),
          ),
        ),
      );

    case 'trip-invite':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'You\'re invited!'),
              React.createElement(Text, null, `Hi ${data.userName}, you have been invited to join the trip "${data.tripName}".`),
              React.createElement(
                Button,
                { href: data.url, style: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' } },
                'View Invite',
              ),
            ),
          ),
        ),
      );

    case 'trip-departure-reminder':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'Trip Departure Reminder'),
              React.createElement(Text, null, `Hi ${data.userName}, your trip "${data.tripName}" is coming up soon!`),
              React.createElement(
                Button,
                { href: data.url, style: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' } },
                'View Trip',
              ),
            ),
          ),
        ),
      );

    case 'event-reminder':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'Event Reminder'),
              React.createElement(Text, null, `Hi ${data.userName}, "${data.eventTitle}" for trip "${data.tripName}" is starting soon.`),
              React.createElement(
                Button,
                { href: data.url, style: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' } },
                'View Event',
              ),
            ),
          ),
        ),
      );

    case 'email-change':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'Email Address Changed'),
              React.createElement(Text, null, `Hi ${data.userName}, your email address on Wend has been updated to this address.`),
              React.createElement(Text, null, 'If you did not make this change, please contact support immediately.'),
              React.createElement(Hr, null),
              React.createElement(Text, { style: { fontSize: '12px', color: '#71717a' } }, 'This is an automated security notification from Wend.'),
            ),
          ),
        ),
      );

    case 'security-alert':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'Security Alert'),
              React.createElement(Text, null, `Hi ${data.userName}, a security-related change was made to your Wend account: ${(data.action ?? 'unknown action').replace(/_/g, ' ')}.`),
              React.createElement(Text, null, 'If you did not perform this action, please reset your password immediately.'),
              React.createElement(Hr, null),
              React.createElement(Text, { style: { fontSize: '12px', color: '#71717a' } }, 'This is an automated security notification from Wend.'),
            ),
          ),
        ),
      );

    case 'notification':
      return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(
          Body,
          { style: { fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' } },
          React.createElement(
            Container,
            { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
            React.createElement(
              Section,
              { style: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' } },
              React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold' } }, 'Trip Activity'),
              React.createElement(Text, null, `Hi ${data.userName}, ${data.actorName ?? 'Someone'} — ${(data.action ?? 'activity').replace(/_/g, ' ')} in "${data.tripName ?? 'your trip'}".`),
              data.url
                ? React.createElement(
                    Button,
                    { href: data.url, style: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' } },
                    'View Trip',
                  )
                : null,
              React.createElement(Hr, null),
              React.createElement(Text, { style: { fontSize: '12px', color: '#71717a' } }, 'You can manage your notification preferences in your Wend account settings.'),
            ),
          ),
        ),
      );
  }
}

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const data = job.data;

  const subjectMap: Record<string, string> = {
    'email-verification': 'Verify your email — Wend',
    'password-reset': 'Reset your password — Wend',
    'trip-invite': `You're invited to ${data.tripName ?? 'a trip'} — Wend`,
    'trip-departure-reminder': `Departure reminder: ${data.tripName ?? 'Your trip'} — Wend`,
    'event-reminder': `Event reminder: ${data.eventTitle ?? 'Upcoming event'} — Wend`,
    'email-change': 'Your email was changed — Wend',
    'security-alert': 'Security alert — Wend',
    'notification': `New activity in ${data.tripName ?? 'your trip'} — Wend`,
  };

  const element = renderEmailTemplate(data);
  const html = await render(element);

  console.log(`[Email Worker] Processing job ${job.id}: to=${data.to}, type=${data.type}`);
  if (data.url) {
    console.log(`[Email Worker] Action URL: ${data.url}`);
  }

  const to = data.to;
  const subject = data.subject ?? subjectMap[data.type] ?? 'Notification from Wend';

  try {
    if (transporter) {
      console.log(`[Email Worker] Sending via SMTP...`);
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });
      console.log(`[Email Worker] SMTP Success for job ${job.id}:`, info.messageId);
    } else if (resend) {
      console.log(`[Email Worker] Sending via Resend...`);
      const { data: resData, error: resError } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      });
      
      if (resError) {
        console.error(`[Email Worker] Resend API Error for job ${job.id}:`, resError);
        throw new Error(`Resend API Error: ${resError.message} (${resError.name})`);
      }
      
      console.log(`[Email Worker] Resend success for job ${job.id}:`, resData);
    }
  } catch (err) {
    console.error(`[Email Worker] Error sending email for job ${job.id}:`, err);
    throw err;
  }
}
