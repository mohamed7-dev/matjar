import { CreateAssetsInput } from '@matjar/common/lib/generated-types';
import { RequestContext } from '../../api/request-context/request-context';
import { Asset } from '../../entities/asset/asset.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type AssetInputTypes = CreateAssetsInput | string;

export class AssetEvent extends AppEntityEvent<Asset, AssetInputTypes> {
	constructor(ctx: RequestContext, entity: Asset, type: AppEntityEventType, input?: AssetInputTypes) {
		super(ctx, entity, type, input);
	}
}
