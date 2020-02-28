import { GraphQLModule } from '@graphql-modules/core';

import { SessionContext, UserContext, RootContext } from '../common/types';
import { getenv } from '../utils';
import { verify } from '../utils/jwt-verify';

import { ExternalGraphQLModule } from './external';
import { InternalGraphQLModule } from './internal';

export const rootModule = new GraphQLModule({
  imports: [InternalGraphQLModule, ExternalGraphQLModule],
  context(session: SessionContext, _: any, { injector }): RootContext {
    try {
      const authorization = session.req.headers.authorization || '';
      const bearerSplit = authorization.split('Bearer');
      const token = bearerSplit[bearerSplit.length - 1].trim();

      const user = verify<UserContext>(token, getenv('APP_SECRET', 'secret'));

      return { user };
    } catch {
      return {};
    }
  },
});
