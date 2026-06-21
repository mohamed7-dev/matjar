import { CreateRoleInput, UpdateRoleInput } from '@matjar/common/lib/generated-types';
import { RequestContext } from '../../api/request-context/request-context';
import { Role } from '../../entities/role/role.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type RoleEventInput = string | CreateRoleInput | UpdateRoleInput;

export class RoleEvent extends AppEntityEvent<Role, RoleEventInput> {
	constructor(ctx: RequestContext, entity: Role, type: AppEntityEventType, input?: RoleEventInput) {
		super(ctx, entity, type, input);
	}
}
