import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PartialAppConfig, RuntimeAppConfig } from './config/types/app-config.interface';
import { AppConfigUtils } from './config/utils/config-utils';
import { entitiesMap } from './entities/entities-map';
import { Logger } from './logger/logger';

export async function bootstrap(userConfig?: PartialAppConfig): Promise<NestExpressApplication> {
	const appConfig = runPreConfig(userConfig);

	Logger.setLoggerStrategy(appConfig.system.loggerStrategy);

	const {
		api: { port, host },
	} = appConfig;
	const app = await NestFactory.create<NestExpressApplication>(
		await import('./app.module.js').then((mod) => mod.AppModule),
		{
			logger: new Logger(),
		},
	);

	app.useLogger(new Logger());

	await app.listen(port, host, () => {
		Logger.info(`Server is running on port ${port}`);
	});

	return app;
}

function runPreConfig(userConfig?: PartialAppConfig): RuntimeAppConfig {
	AppConfigUtils.setConfig(userConfig);

	AppConfigUtils.setConfig({
		database: {
			entities: Object.values(entitiesMap),
		},
	});
	return AppConfigUtils.getConfig();
}
