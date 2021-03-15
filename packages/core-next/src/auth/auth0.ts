import crypto from 'crypto';

import { hashSync } from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { getRepository } from 'typeorm';

import { User } from '@dockite/database';
import { Auth0AuthConfiguration, DockiteConfiguration } from '@dockite/types';

export interface Auth0TokenPayload {
  sub: string;
  name: string;
}

/**
 * Verify a provided Auth0 token returning the current contents of the token
 * on success.
 */
export const verifyAuth0Token = (
  token: string,
  client: JwksClient,
  audience: string,
  domain: string,
): Promise<Auth0TokenPayload> => {
  // Wrap the below call in a promise to manage callbacks
  return new Promise((resolve, reject) => {
    // First attempt to verify the token using the Jwks library for deciphering the `well_known` public keys for a
    // given auth0 account.
    verify(
      token,
      (header, callback) => {
        // If the kid attribute isn't present we must throw since the provided token is invalid.
        if (!header.kid) {
          reject(new Error('JWT "kid" attribute is required.'));
        }

        // Otherwise we will proceed to get the public keys used for token verification
        client.getSigningKey(header.kid as string, (err, key) => {
          if (err) {
            reject(err);
          }

          callback(null, key.getPublicKey());
        });
      },
      {
        // Typically audience and domain will be the same value
        audience,
        algorithms: ['RS256'],
        issuer: `https://${domain}/`,
      },
      (err, result) => {
        // Finally if there's an error or an undefined result we will throw once more
        if (err) {
          reject(err);
        }

        if (!result) {
          reject(new Error('Provided token is invalid.'));
        }

        // Otherwise we will return the decoded token payload
        resolve(result as Auth0TokenPayload);
      },
    );
  });
};

/**
 * Provided a valid auth0 bearer token, retrieve or create the associated user and return the user object
 * for usage within the application.
 */
export const exchangeAuth0TokenForUser = async (
  token: string,
  config: DockiteConfiguration,
): Promise<User> => {
  const authConfig = config.auth as Auth0AuthConfiguration;

  const userRespository = getRepository(User);

  const client = new JwksClient({
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  });

  const result = await verifyAuth0Token(token, client, authConfig.audience, authConfig.domain);

  const auth0Id = result.sub.split('|').pop() as string;

  const email = `${auth0Id}@auth0.dockite.app`;

  // Attempt to retrieve the user using the derrived email
  let user = await userRespository.findOne({
    where: {
      email,
    },
    relations: ['roles'],
  });

  // If the user doesn't exist we will create it in the database since auth0 is the source of truth
  if (!user) {
    const [firstName, lastName] = result.name.split(' ', 2);

    const password = crypto
      .randomBytes(40)
      .toString('base64')
      .slice(0, 30);

    await userRespository.save({
      email,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      password: hashSync(password, 10),
      verified: true,
    });

    user = await userRespository.findOne({
      where: {
        email,
      },
      relations: ['roles'],
    });
  }

  // If the user still doesn't exist we will throw an error and abort the process
  if (!user) {
    throw new Error('Unable to retrieve or create user with provided token');
  }

  // Otherwise return the user
  return user;
};
