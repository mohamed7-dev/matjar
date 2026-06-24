import { CreateAdministratorInput, UpdateAdministratorInput } from '@matjar/common/lib/generated-types';
import { RequestContext } from '../../api/request-context/request-context';
import { Administrator } from '../../entities/administrator/administrator.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type AdministratorEventInput = string | CreateAdministratorInput | UpdateAdministratorInput;

export class AdministratorEvent extends AppEntityEvent<Administrator, AdministratorEventInput> {
	constructor(
		ctx: RequestContext,
		entity: Administrator,
		type: AppEntityEventType,
		input?: AdministratorEventInput,
	) {
		super(ctx, entity, type, input);
	}
}
