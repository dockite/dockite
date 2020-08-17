import { createTransport, SendMailOptions } from 'nodemailer';
import debug from 'debug';

import { getConfig } from './config';

const log = debug('dockite:core:mail');

const config = getConfig();

const transport = createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: {
    user: config.mail.username,
    pass: config.mail.password,
  },
  requireTLS: true,
});

export const sendMail = async (options: Omit<SendMailOptions, 'from'>): Promise<void> => {
  await transport
    .sendMail({
      ...options,
      from: config.mail.fromAddress,
    })
    .catch(err => log(err));
};
