import 'reflect-metadata';
import 'dotenv/config';
import { appConfig } from './app-config';
import { bootstrap } from './bootstrap';

void bootstrap(appConfig);
