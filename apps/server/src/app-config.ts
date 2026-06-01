import path from 'node:path';
import { LogLevel } from './config/strategies/logger/logger-strategy.interface';
import { StdoutLoggerStrategy } from './config/strategies/logger/stdout-logger.strategy';
import { AppConfig } from './config/types/app-config.interface';

const env = typeof process !== 'undefined' ? process.env : {};

const entitiesPath = path.resolve(path.join(__dirname, 'entities/**/*.entity.{ts,js}'));

export const appConfig: AppConfig = {
	database: {
		driver: require('pg'),
		type: 'postgres',
		synchronize: true,
		logging: false,
		host: env.DB_HOST,
		port: env.DB_PORT ? Number(env.DB_PORT) : undefined,
		username: env.DB_USER_NAME,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
		schema: env.DB_SCHEMA,
		entities: [
			entitiesPath,
		],
	},
	api: {
		enableIntrospection: true,
	},
	system: {
		loggerStrategy: new StdoutLoggerStrategy({
			logLevel: LogLevel.Debug,
		}),
	},
};
