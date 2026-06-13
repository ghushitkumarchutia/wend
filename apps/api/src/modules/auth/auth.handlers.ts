import { emailQueue } from '../../common/queues';

export async function onEmailVerification(
  user: { email: string; name: string },
  url: string,
) {
  await emailQueue.add('email-verification', {
    to: user.email,
    userName: user.name,
    url,
    type: 'email-verification',
  });
}

export async function onPasswordReset(
  user: { email: string; name: string },
  url: string,
) {
  await emailQueue.add('password-reset', {
    to: user.email,
    userName: user.name,
    url,
    type: 'password-reset',
  });
}

export async function onAccountExists(email: string) {
  await emailQueue.add('account-exists', {
    to: email,
    type: 'account-exists',
  });
}
