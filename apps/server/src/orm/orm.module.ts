import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { OrmService } from './orm.service';
import { TransactionManagerService } from './transaction-manager.service';

@Module({
	providers: [
		OrmService,
		TransactionManagerService,
	],
	exports: [
		OrmService,
		TransactionManagerService,
	],
})
export class OrmModule {
	public static forRoot(): DynamicModule {
		return TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => {
				return configService.database;
			},
			imports: [
				ConfigModule,
			],
			inject: [
				ConfigService,
			],
		});
	}
}
