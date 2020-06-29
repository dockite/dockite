import { createTransport, SendMailOptions } from 'nodemailer';

import { getConfig } from './config';

const config = getConfig();

const transport = createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: {
    user: config.mail.username,
    pass: config.mail.password,
  },
});

export const sendMail = async (options: Omit<SendMailOptions, 'from'>): Promise<void> => {
  transport.sendMail({
    ...options,
    from: config.mail.fromAddress,
  });
};
