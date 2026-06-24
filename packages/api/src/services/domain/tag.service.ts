import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../api/request-context/request-context';
import { filterUnique } from '../../common/utils/filter-unique';
import { Tag } from '../../entities/tag/tag.entity';
import { OrmService } from '../../orm/orm.service';

@Injectable()
export class TagService {
	constructor(private readonly ormService: OrmService) {}
	public async createTagsFromValues(ctx: RequestContext, values: string[]): Promise<Tag[]> {
		return Promise.all(filterUnique(values).map(async (value) => this._createTagsFromValues(ctx, value)));
	}

	private async _createTagsFromValues(ctx: RequestContext, value: string): Promise<Tag> {
		const tag = await this.ormService.getRepository(ctx, Tag).findOne({
			where: {
				value,
			},
		});
		if (tag) return tag;
		return await this.ormService.getRepository(ctx, Tag).save(
			new Tag({
				value,
			}),
		);
	}
}
