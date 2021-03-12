import crypto from 'crypto';

import { hashSync } from 'bcrypt';

import { User } from '@dockite/database';

/**
 * Creates the base User object for an anonymous user.
 */
export const getAnonymousUserData = (): Partial<User> => {
  return {
    id: '99999999-9999-4999-9999-999999999999',
    firstName: 'Anonymous',
    lastName: 'Dockite Internal',
    email: 'anonymous@dockite.app',
    password: hashSync(crypto.randomBytes(10).toString('hex'), 10),
  };
};

/**
 * Creates the base User object for a webhook user.
 */
export const getWebhookUserData = (): Partial<User> => {
  return {
    id: '99999999-9999-4999-9999-999999999998',
    firstName: 'Webhook',
    lastName: 'Dockite Internal',
    email: 'webhooks@dockite.app',
    password: hashSync(crypto.randomBytes(10).toString('hex'), 10),
  };
};
