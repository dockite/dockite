import debug from 'debug';
import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Document, Locale } from '@dockite/database';

import { Authenticated, Authorized } from '../../../../common/decorators';
import { createFindManyResult } from '../document/util';

import {
  AllLocalesArgs,
  CreateLocaleArgs,
  DeleteLocaleArgs,
  GetLocaleArgs,
  UpdateLocaleArgs,
} from './args';
import { FindManyLocalesResult } from './types';

const log = debug('dockite:core:resolvers:locale');

/**
 *
 */
@Resolver(_of => Locale)
export class LocaleResolver {
  private localeRepository: Repository<Locale>;

  private documentRepository: Repository<Document>;

  constructor() {
    this.localeRepository = getRepository(Locale);

    this.documentRepository = getRepository(Document);
  }

  @Authenticated()
  @Query(_returns => Locale)
  public async getLocale(
    @Args()
    input: GetLocaleArgs,
  ): Promise<Locale> {
    const { id } = input;

    try {
      const locale = await this.localeRepository.findOneOrFail(id);

      return locale;
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve Locale with ID ${id}`);
    }
  }

  @Authenticated()
  @Query(_returns => FindManyLocalesResult)
  public async allLocales(
    @Args()
    input: AllLocalesArgs,
  ): Promise<FindManyLocalesResult> {
    const { page, perPage } = input;

    try {
      const [locales, count] = await this.localeRepository.findAndCount({
        take: perPage,
        skip: (page - 1) * perPage,
      });

      return createFindManyResult(locales, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve Locales with provided input`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:locale:create' })
  @Mutation(_returns => Locale)
  public async createLocale(
    @Arg('input', _type => CreateLocaleArgs)
    input: CreateLocaleArgs,
  ): Promise<Locale> {
    const { id, title, icon } = input;

    try {
      const matched = await this.localeRepository.findOne(id);

      if (matched) {
        throw new Error(`Locale with ID ${id} already exists`);
      }

      const locale = await this.localeRepository.save({ id, title, icon });

      return locale;
    } catch (err) {
      log(err);

      throw new Error(`Unable to create Locale with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:locale:update' })
  @Mutation(_returns => Locale)
  public async updateLocale(
    @Arg('input', _type => UpdateLocaleArgs)
    input: UpdateLocaleArgs,
  ): Promise<Locale> {
    const { id, title, icon } = input;

    try {
      const locale = await this.localeRepository.findOneOrFail(id);

      Object.assign(locale, { title, icon });

      await this.localeRepository.save(locale);

      return locale;
    } catch (err) {
      log(err);

      throw new Error(`Unable to update Locale with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:locale:update' })
  @Mutation(_returns => Boolean)
  public async deleteLocale(
    @Arg('input', _type => DeleteLocaleArgs)
    input: DeleteLocaleArgs,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const locale = await this.localeRepository.findOneOrFail(id);

      await Promise.all([
        this.localeRepository.remove(locale),
        this.documentRepository
          .createQueryBuilder('document')
          .delete()
          .where('document.locale = :locale', { locale: locale.id })
          .execute(),
      ]);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }
}

export default LocaleResolver;
