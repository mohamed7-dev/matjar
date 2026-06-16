import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { OrmService } from './orm.service';
import { TransactionManagerService } from './transaction-manager.service';

let defaultTypeOrmModule: DynamicModule;
@Module({
	imports: [
		ConfigModule,
	],
	providers: [
		OrmService,
		TransactionManagerService,
	],
	exports: [
		OrmService,
		TransactionManagerService,
	],
})
export class ConnectionCoreModule {}

@Module({
	imports: [
		ConnectionCoreModule,
	],
	exports: [
		ConnectionCoreModule,
	],
})
export class OrmModule {
	public static forRoot(): DynamicModule {
		if (!defaultTypeOrmModule) {
			defaultTypeOrmModule = TypeOrmModule.forRootAsync({
				imports: [
					ConfigModule,
				],
				useFactory: (configService: ConfigService) => {
					const { database } = configService;
					return {
						...database,
					};
				},
				inject: [
					ConfigService,
				],
			});
		}
		return {
			module: OrmModule,
			imports: [
				defaultTypeOrmModule,
			],
		};
	}
}
