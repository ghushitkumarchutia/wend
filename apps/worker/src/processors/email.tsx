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

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Wend <noreply@wend.app>';

function EmailVerificationEmail({ userName, url }: { userName: string; url: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f4f4f5', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px', maxWidth: '480px', margin: '0 auto' }}>
          <Text style={{ fontSize: '20px', fontWeight: 600, color: '#09090b', marginBottom: '16px' }}>
            Verify your email
          </Text>
          <Text style={{ fontSize: '14px', color: '#52525b', lineHeight: '1.6' }}>
            Hi {userName}, please verify your email address to get started with Wend.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button
              href={url}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Verify Email
            </Button>
          </Section>
          <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
          <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>
            Or copy this link: <Link href={url} style={{ color: '#2563eb' }}>{url}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function PasswordResetEmail({ userName, url }: { userName: string; url: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f4f4f5', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px', maxWidth: '480px', margin: '0 auto' }}>
          <Text style={{ fontSize: '20px', fontWeight: 600, color: '#09090b', marginBottom: '16px' }}>
            Reset your password
          </Text>
          <Text style={{ fontSize: '14px', color: '#52525b', lineHeight: '1.6' }}>
            Hi {userName}, we received a request to reset your password. Click below to proceed.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button
              href={url}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Reset Password
            </Button>
          </Section>
          <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
          <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>
            If you did not request this, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function TripInviteEmail({ inviterName, tripName, url }: { inviterName: string; tripName: string; url: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f4f4f5', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px', maxWidth: '480px', margin: '0 auto' }}>
          <Text style={{ fontSize: '20px', fontWeight: 600, color: '#09090b', marginBottom: '16px' }}>
            You're invited!
          </Text>
          <Text style={{ fontSize: '14px', color: '#52525b', lineHeight: '1.6' }}>
            {inviterName} has invited you to join the trip "{tripName}" on Wend.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button
              href={url}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              View Invitation
            </Button>
          </Section>
          <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
          <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>
            Or copy this link: <Link href={url} style={{ color: '#2563eb' }}>{url}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function SecurityAlertEmail({ type }: { type: string }) {
  const messages: Record<string, string> = {
    'security-password-changed': 'Your password was recently changed. If you did not make this change, contact support immediately.',
    'security-email-changed': 'Your email address was recently changed. If you did not make this change, contact support immediately.',
    'security-new-sign-in': 'A new sign-in was detected on your account. If this was not you, secure your account immediately.',
  };

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f4f4f5', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px', maxWidth: '480px', margin: '0 auto' }}>
          <Text style={{ fontSize: '20px', fontWeight: 600, color: '#09090b', marginBottom: '16px' }}>
            Security Alert
          </Text>
          <Text style={{ fontSize: '14px', color: '#52525b', lineHeight: '1.6' }}>
            {messages[type] ?? 'A security-related action was performed on your account.'}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function processEmailJob(job: Job) {
  const { type } = job.data as { type: string; to?: string; userName?: string; url?: string; inviterName?: string; tripName?: string; userId?: string };

  let html: string;
  let subject: string;
  let toEmail: string = job.data.to;

  switch (type) {
    case 'email-verification': {
      const { userName, url } = job.data;
      subject = 'Verify your email — Wend';
      html = await render(<EmailVerificationEmail userName={userName} url={url} />);
      break;
    }
    case 'password-reset': {
      const { userName, url } = job.data;
      subject = 'Reset your password — Wend';
      html = await render(<PasswordResetEmail userName={userName} url={url} />);
      break;
    }
    case 'trip-invite': {
      const { inviterName, tripName, url } = job.data;
      subject = `You're invited to ${tripName} — Wend`;
      html = await render(<TripInviteEmail inviterName={inviterName} tripName={tripName} url={url} />);
      break;
    }
    case 'security-alert':
    case 'security-password-changed':
    case 'security-email-changed':
    case 'security-new-sign-in': {
      subject = 'Security Alert — Wend';
      html = await render(<SecurityAlertEmail type={type} />);
      break;
    }
    default: {
      console.warn(`Unknown email type: ${type}`);
      return;
    }
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject,
    html,
  });
}
