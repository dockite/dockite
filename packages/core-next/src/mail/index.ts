import { config } from 'dotenv/types';
import { createTransport, SendMailOptions } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { getConfig } from '../common/config';

let mailer: Mail | null = null;

/**
 * Bootstraps the mailer by creating a valid transport that will be used for interacting
 * with various mail backends.
 */
export const setupMailer = (): void => {
  const config = getConfig();

  mailer = createTransport({
    host: config.mail.host,
    port: config.mail.port,

    secure: config.mail.secure,

    auth: {
      user: config.mail.username,
      pass: config.mail.password,
    },

    requireTLS: true,
  });
};

/**
 * Sends an email to an email adress with the provided configuration.
 *
 * Additionally, bootstraps the mailer if it hasn't already been bootstrapped.
 */
export const sendMail = async (options: Omit<SendMailOptions, 'from'>): Promise<void> => {
  if (!mailer) {
    setupMailer();
  }

  const config = getConfig();

  await mailer?.sendMail({
    ...options,
    from: config.mail.fromAddress,
  });
};
