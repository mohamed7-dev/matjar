import path from 'node:path';
import { bootstrap } from '@matjar/api';
import { appConfig } from './app-config';

bootstrap({
	userConfig: appConfig,
	adminDashboardRootPath: path.join(__dirname, '..', 'public', 'dashboard'),
});
