import { Resolver } from 'type-graphql';

import { Field } from '@dockite/database';

/**
 *
 */
@Resolver(_of => Field)
export class FieldResolver {}

export default FieldResolver;
