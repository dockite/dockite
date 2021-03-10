import { EntitySchema } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/ban-types
export type EntityLike = Function | string | EntitySchema<any>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type SubscriberLike = Function | string;
