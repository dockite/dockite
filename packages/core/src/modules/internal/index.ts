import { GraphQLModule } from '@graphql-modules/core';

import { AppError } from '../../common/errors';
import { AppErrorCode, RootContext, SessionContext } from '../../common/types';
import { getModules } from '../../utils';

import { InternalModuleContext } from './types/context';

// eslint-disable-next-line
export const getRegisteredInternalModules = (): any[] => {
  return getModules('internal');
};

export const InternalGraphQLModule = new GraphQLModule({
  // eslint-disable-next-line
  context(_: SessionContext, currentContext: RootContext, { injector }): InternalModuleContext {
    if (currentContext.user) {
      return { user: currentContext.user };
    }

    throw new AppError('Not Authorized', AppErrorCode.NotAuthorizedError);
  },
});
