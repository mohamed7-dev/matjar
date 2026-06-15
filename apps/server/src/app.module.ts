import path from 'node:path';
import { Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import express, { NextFunction, Request, Response } from 'express';
import { ApiModule } from './api/api.module';
import { CacheModule } from './cache/cache.module';
import { ConfigModule } from './config/config.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { I18nModule } from './i18n/i18n.module';
import { OrmModule } from './orm/orm.module';

@Module({
	imports: [
		ConfigModule,
		CacheModule,
		EventBusModule,
		ApiModule,
		OrmModule.forRoot(),
		I18nModule,
	],
})
export class AppModule implements OnModuleInit {
	constructor(private httpAdapterHost: HttpAdapterHost) {}
	onModuleInit(): void {
		const dashboardRoot = path.join(__dirname, '..', 'public', 'dashboard');
		const expressApp = this.httpAdapterHost.httpAdapter.getInstance();
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
}
