import { AppConfig, LogLevel, StdoutLoggerStrategy } from '@matjar/api';
import { DEFAULT_SERVER_PORT } from '@matjar/common/lib/shared-constants';

const env = typeof process !== 'undefined' ? process.env : {};

export const appConfig: AppConfig = {
	api: {
		port: DEFAULT_SERVER_PORT,
		enableIntrospection: true,
		admin: {
			enablePlayground: true,
			enableDebugging: true,
		},
		store: {
			enablePlayground: true,
			enableDebugging: true,
		},
	},
	database: {
		synchronize: true,
		type: 'postgres',
		logging: false,
		host: env.DB_HOST,
		port: env.DB_PORT ? Number(env.DB_PORT) : undefined,
		username: env.DB_USER_NAME,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
		schema: env.DB_SCHEMA,
	},
	system: {
		loggerStrategy: new StdoutLoggerStrategy({
			logLevel: LogLevel.Debug,
		}),
	},
};
