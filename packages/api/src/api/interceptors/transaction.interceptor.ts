import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, Observable } from 'rxjs';
import {
	TRANSACTION_ISOLATION_LEVEL_METADATA_KEY,
	TRANSACTION_MODE_METADATA_KEY,
} from '../../common/constants/keys';
import { OrmService } from '../../orm/orm.service';
import { TransactionManagerService } from '../../orm/transaction-manager.service';
import { TransactionIsolationLevel, TransactionManagementMode } from '../decorators/transaction.decorator';
import { attachRequestContext, resolveRequestContext } from '../request-context/request-context-utils';
import { parseContext } from '../utils/parse-context';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
	constructor(
		private readonly transactionManagerService: TransactionManagerService,
		private readonly ormService: OrmService,
		private readonly reflector: Reflector,
	) {}

	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
		const { req } = parseContext(context);

		const requestContext = resolveRequestContext(req, context);

		const transactionIsolationLevel = this.reflector.get<TransactionIsolationLevel | undefined>(
			TRANSACTION_ISOLATION_LEVEL_METADATA_KEY,
			context.getHandler(),
		);
		const transactionMode = this.reflector.get<TransactionManagementMode | undefined>(
			TRANSACTION_MODE_METADATA_KEY,
			context.getHandler(),
		);

		if (requestContext) {
			return from(
				this.transactionManagerService.executeInTransaction({
					requestContext,
					dataSource: this.ormService.dataSource,
					isolationLevel: transactionIsolationLevel,
					managementMode: transactionMode,
					work: (requestContextWithEntityManager) => {
						attachRequestContext(requestContextWithEntityManager, req, context);
						return next.handle();
					},
				}),
			);
		} else {
			return next.handle();
		}
	}
}
