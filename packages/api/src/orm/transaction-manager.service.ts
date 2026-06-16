import { Injectable } from '@nestjs/common';
import { from, lastValueFrom, Observable, retry, timer } from 'rxjs';
import { DataSource, EntityManager, QueryRunner, TransactionAlreadyStartedError } from 'typeorm';
import {
	TransactionIsolationLevel,
	TransactionManagementMode,
} from '../api/decorators/transaction.decorator';
import { RequestContext } from '../api/request-context/request-context';
import { TRANSACTION_MANAGER_KEY } from '../common/constants/keys';

interface ExecuteInTransactionOptions<Result> {
	requestContext: RequestContext;
	work: (requestContext: RequestContext) => Promise<Result> | Observable<Result>;
	dataSource: DataSource;
	isolationLevel?: TransactionIsolationLevel;
	managementMode?: TransactionManagementMode;
}

@Injectable()
export class TransactionManagerService {
	public async executeInTransaction<Result>(options: ExecuteInTransactionOptions<Result>): Promise<Result> {
		const queryRunner = this.getOrCreateEntityManager(options.requestContext, options.dataSource);
		const transactionMode = options.managementMode || 'auto';

		if (transactionMode === 'auto') {
			await this.startTransaction(queryRunner, options.isolationLevel);
		}

		try {
			const result = await this.executeWork(options.requestContext, options.work);
			if (queryRunner.isTransactionActive) {
				queryRunner.commitTransaction();
			}
			return result;
		} catch (error) {
			if (queryRunner.isTransactionActive) {
				queryRunner.rollbackTransaction();
			}
			throw error;
		} finally {
			await this.releaseQueryRunnerIfNeeded(queryRunner);
		}
	}

	private async executeWork<Result>(
		requestContext: ExecuteInTransactionOptions<Result>['requestContext'],
		work: ExecuteInTransactionOptions<Result>['work'],
	): Promise<Result> {
		const maxRetries = 5;

		return lastValueFrom(
			from(work(requestContext)).pipe(
				retry({
					count: maxRetries,
					delay: (error, retryCount) => {
						if (!this.isRetriableError(error)) {
							throw error;
						}

						return timer(retryCount * 20);
					},
				}),
			),
		);
	}

	private isRetriableError(error: any): boolean {
		const postgresDeadlock = error.code === 'deadlock_detected';
		return postgresDeadlock;
	}

	/**
	 * @description
	 * Releases the QueryRunner if it is no longer needed.
	 *
	 * Ensures that:
	 * - Active transactions are not accidentally released
	 * - Nested transactions (savepoints) are respected
	 */
	private async releaseQueryRunnerIfNeeded(queryRunner: QueryRunner): Promise<void> {
		if (!queryRunner.isReleased && !queryRunner.isTransactionActive) {
			await queryRunner.release();
		}
	}

	private getOrCreateEntityManager(requestContext: RequestContext, dataSource: DataSource): QueryRunner {
		const entityManager = (requestContext as any)[TRANSACTION_MANAGER_KEY] as EntityManager | undefined;
		if (entityManager?.queryRunner && !entityManager.queryRunner.isReleased) {
			return entityManager.queryRunner;
		}

		const queryRunner = dataSource.createQueryRunner();
		(requestContext as any)[TRANSACTION_MANAGER_KEY] = queryRunner.manager;

		return queryRunner;
	}

	private async startTransaction(
		queryRunner: QueryRunner,
		isolationLevel?: TransactionIsolationLevel,
	): Promise<void> {
		const maxRetries = 25;
		let attempts = 0;
		let lastError: any;

		const attemptStartTransaction = async (): Promise<boolean> => {
			try {
				await queryRunner.startTransaction(isolationLevel);
				return true;
			} catch (err) {
				lastError = err;
				if (err instanceof TransactionAlreadyStartedError) return false;
				throw err;
			}
		};

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			const result = await attemptStartTransaction();
			if (result) return;
			// insert an increasing delay before retrying
			new Promise((resolve) => setTimeout(() => resolve, attempts * 20));
			attempts++;
		}
		throw lastError;
	}
}
