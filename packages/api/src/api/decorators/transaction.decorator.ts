import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
	TRANSACTION_ISOLATION_LEVEL_METADATA_KEY,
	TRANSACTION_MODE_METADATA_KEY,
} from '../../common/constants/keys';
import { TransactionInterceptor } from '../interceptors/transaction.interceptor';

/**
 * @description
 * Supported database transaction isolation levels.
 *
 * :::info
 * - `READ COMMITTED`: Prevents dirty reads.
 * - `READ UNCOMMITTED`: Allows dirty reads.
 * - `SERIALIZABLE`: Highest isolation level, fully prevents concurrency anomalies.
 * - `REPEATABLE READ`: Ensures consistent reads within a transaction.
 * :::
 */
export type TransactionIsolationLevel =
	| 'READ COMMITTED'
	| 'READ UNCOMMITTED'
	| 'SERIALIZABLE'
	| 'REPEATABLE READ';

/**
 * @description
 * Defines how a transaction should be managed.
 *
 * :::info
 * - `auto`: The transaction is automatically started and managed
 *   by the {@link TransactionInterceptor}.
 * - `manual`:  The transaction lifecycle is controlled manually
 *   inside the business logic.
 * :::
 */
export type TransactionManagementMode = 'auto' | 'manual';

interface TransactionDecoratorOptions {
	mode?: TransactionManagementMode;
	isolationLevel?: TransactionIsolationLevel;
}

export function Transaction(options?: TransactionDecoratorOptions): MethodDecorator {
	return applyDecorators(
		SetMetadata(TRANSACTION_MODE_METADATA_KEY, options?.mode || 'auto'),
		SetMetadata(TRANSACTION_ISOLATION_LEVEL_METADATA_KEY, options?.isolationLevel),
		UseInterceptors(TransactionInterceptor),
	);
}
