import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, EntitySchema, ObjectLiteral, ObjectType, Repository } from 'typeorm';
import { RequestContext } from '../api/request-context/request-context';
import { TRANSACTION_MANAGER_KEY } from '../common/constants/keys';

type EntityTarget<Entity extends ObjectLiteral> = string | ObjectType<Entity> | EntitySchema<Entity>;

@Injectable()
export class OrmService {
	constructor(@InjectDataSource() private readonly _dataSource: DataSource) {}

	public get dataSource(): DataSource {
		return this._dataSource;
	}

	public getRepository<Entity extends ObjectLiteral>(
		requestContext: RequestContext,
		target: EntityTarget<Entity>,
	): Repository<Entity> {
		const entityManager = (requestContext as any)[TRANSACTION_MANAGER_KEY] as EntityManager | undefined;

		if (entityManager) {
			const repo = entityManager.getRepository(target);
			if (repo) return repo;
			return this.dataSource.getRepository(target);
		}
		return this.dataSource.getRepository(target);
	}
}
