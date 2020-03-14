import { DockiteFieldStatic } from '@dockite/field';
import debug from 'debug';

const log = debug('prime:core:fields');

export interface DockiteFieldManager {
  [id: string]: DockiteFieldStatic;
}

export const dockiteFields: DockiteFieldManager = {};

export const registerField = (id: string, field: DockiteFieldStatic): void => {
  if (!dockiteFields[id]) {
    log(`registering field ${id}`);
    dockiteFields[id] = field;
  } else {
    log(`field ${id} already exists`);
  }
};
