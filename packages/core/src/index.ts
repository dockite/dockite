import 'reflect-metadata';
import { connect } from './database';
import { start } from './server';

export default connect().then(() => start());
