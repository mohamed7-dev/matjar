import 'reflect-metadata';
import path from 'node:path';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import express, { NextFunction, Request, Response } from 'express';
import { PartialAppConfig, RuntimeAppConfig } from './config/types/app-config.interface';
import { AppConfigUtils } from './config/utils/config-utils';
import { entitiesMap } from './entities/entities-map';
import { Logger } from './logger/logger';

interface BootstrapConfigOptions {
	userConfig?: PartialAppConfig;
	adminDashboardRootPath: string;
	nestOptions?: NestApplicationOptions;
}

export async function bootstrap({
	userConfig,
	adminDashboardRootPath,
	nestOptions,
}: BootstrapConfigOptions): Promise<NestExpressApplication> {
	const appConfig = runPreConfig(userConfig);

	Logger.setLoggerStrategy(appConfig.system.loggerStrategy);

	const {
		api: { port, host, cors },
	} = appConfig;
	const app = await NestFactory.create<NestExpressApplication>(
		await import('./app.module.js').then((mod) => mod.AppModule),
		{
			...nestOptions,
			logger: new Logger(),
			cors,
		},
	);

	app.useLogger(new Logger());

	setupAdminDashboardRoute(app, adminDashboardRootPath);

	await app.listen(port, host, () => {
		Logger.info(`Server is running on port ${port}`);
	});

	return app;
}
function setupAdminDashboardRoute(app: INestApplication, adminDashboardRootPath: string): void {
	const dashboardRoot = adminDashboardRootPath;
	const expressApp = app.getHttpAdapter().getInstance();
	const dashboardSpaFallback = (req: Request, res: Response, next: NextFunction): any => {
		if (
			![
				'GET',
				'HEAD',
			].includes(req.method) ||
			!req.accepts('html')
		) {
			return next();
		}
		const requestPath = new URL(req.originalUrl, 'http://localhost').pathname.replace(/\/$/, '');
		if (path.extname(requestPath)) {
			return next();
		}
		return res.sendFile(path.join(dashboardRoot, 'index.html'));
	};
	expressApp.use(
		'/dashboard',
		express.static(dashboardRoot, {
			index: false,
		}),
	);
	expressApp.get(
		[
			'/dashboard',
			'/dashboard/{*dashboardPath}',
		],
		dashboardSpaFallback,
	);
}

function runPreConfig(userConfig?: PartialAppConfig): RuntimeAppConfig {
	AppConfigUtils.setConfig(userConfig);

	AppConfigUtils.setConfig({
		database: {
			entities: Object.values(entitiesMap),
		},
	});

	exposeHeaders(AppConfigUtils.getConfig());
	return AppConfigUtils.getConfig();
}

function exposeHeaders(config: Readonly<RuntimeAppConfig>): void {
	const { authTokenHeader } = config.auth;
	const corsOptions = config.api.cors;
	if (typeof corsOptions === 'boolean') {
		return;
	}

	const { exposedHeaders: corsExposedHeaders } = corsOptions;
	let exposedHeaders: string[];

	if (!corsExposedHeaders) {
		exposedHeaders = [
			authTokenHeader,
		];
	} else if (typeof corsExposedHeaders === 'string') {
		exposedHeaders = [
			...corsExposedHeaders.split(',').map((header) => header.trim()),
			authTokenHeader,
		];
	} else {
		exposedHeaders = [
			...corsExposedHeaders,
			authTokenHeader,
		];
	}

	corsOptions.exposedHeaders = exposedHeaders;
}
