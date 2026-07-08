import { Resend } from 'resend';
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

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error('RESEND_API_KEY is required');
}

const resend = new Resend(resendApiKey);
const fromEmail = process.env.NODE_ENV === 'development'
  ? 'onboarding@resend.dev'
  : (process.env.FROM_EMAIL ?? 'Wend <noreply@wend.app>');

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

  try {
    const { data: resData, error: resError } = await resend.emails.send({
      from: fromEmail,
      to: data.to,
      subject: data.subject ?? subjectMap[data.type] ?? 'Notification from Wend',
      html,
    });
    
    if (resError) {
      console.error(`[Email Worker] Resend API Error for job ${job.id}:`, resError);
      throw new Error(`Resend API Error: ${resError.message} (${resError.name})`);
    }
    
    console.log(`[Email Worker] Resend success for job ${job.id}:`, resData);
  } catch (err) {
    console.error(`[Email Worker] Error sending email via Resend for job ${job.id}:`, err);
    throw err;
  }
}
