import { DockiteFieldStatic } from '@dockite/types';
import debug from 'debug';

const log = debug('dockite:manager:fields');

export type DockiteFieldManager = Record<string, DockiteFieldStatic>;

export const FieldManager: DockiteFieldManager = {};

export const registerField = (id: string, field: DockiteFieldStatic): void => {
  if (!FieldManager[id]) {
    log(`registering field ${id}`);
    FieldManager[id] = field;
  } else {
    log(`field ${id} already exists`);
  }
};
