import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';

import { GlobalContext } from '../common/types';

import { AuthenticationGraphQLModule } from './authentication';
import { ExternalGraphQLModule } from './external';
import { InternalGraphQLModule } from './internal';

const log = debug('dockite:core:root');

export const RootModule = async (): Promise<GraphQLModule<any, any, GlobalContext, any>> => {
  log('retrieving internal and external graphql modules');
  const [internal, external, authentication] = await Promise.all([
    InternalGraphQLModule(),
    ExternalGraphQLModule(),
    AuthenticationGraphQLModule(),
  ]);

  log('creating root module');
  return new GraphQLModule({
    imports: [internal, external, authentication],
    context: (ctx): GlobalContext => ctx,
  });
};
