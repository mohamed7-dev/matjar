import { Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class GlobalSettingsResolver {
	@Mutation('updateGlobalSettings')
	public updateGlobalSettings(): boolean {
		return true;
	}
}
