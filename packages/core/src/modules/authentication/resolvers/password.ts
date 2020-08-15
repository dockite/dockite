import { promises as fs } from 'fs';
import path from 'path';

import { PasswordReset, User } from '@dockite/database';
import { hash } from 'bcrypt';
import { Arg, Mutation, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { getConfig } from '../../../config';
import { sendMail } from '../../../mail';
import { replaceTemplate } from '../../../utils';

// const log = debug('dockite:core:authentication:resolver');

const config = getConfig();

@Resolver()
export class PasswordResolver {
  @Mutation(_returns => Boolean)
  public async forgotPassword(@Arg('email') email: string): Promise<boolean> {
    const user = await getRepository(User).findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return true;
    }

    const passwordResetRepository = getRepository(PasswordReset);

    const passwordReset: PasswordReset = passwordResetRepository.create({
      userId: user.id,
    });

    const { id: passwordResetToken } = await passwordResetRepository.save(passwordReset);

    const template = await fs.readFile(
      path.resolve(path.join(__dirname, '../mail-templates/new-account.html')),
      'utf-8',
    );

    const templateParams: Record<string, any> = {
      appTitle: config.app.title,
      firstName: user.firstName,
      lastName: user.lastName,
      token: passwordResetToken,
      appURL: config.app.url,
    };

    if (!process.env.DISABLE_MARKETING) {
      templateParams.marketing =
        '- Powered by <a href="https://dockite.app" style="color: rgb(43, 108, 176); text-decoration: none; font-weight: bold;">Dockite</a>';
    } else {
      templateParams.marketing = '';
    }

    const content = replaceTemplate(template, templateParams);

    await sendMail({
      to: email,
      subject: 'Your password reset request',
      html: content,
    });

    return true;
  }

  @Mutation(_returns => Boolean)
  public async resetForgottenPassword(
    @Arg('token') token: string,
    @Arg('password') password: string,
  ): Promise<boolean> {
    const userRepository = getRepository(User);
    const passwordResetRepository = getRepository(PasswordReset);

    const passwordResetRequest = await passwordResetRepository.findOne(token);

    if (!passwordResetRequest) {
      return false;
    }

    const user = await userRepository.findOne(passwordResetRequest.userId);

    if (!user) {
      return false;
    }

    user.password = await hash(password, 10);

    await userRepository.save(user);

    return true;
  }
}
