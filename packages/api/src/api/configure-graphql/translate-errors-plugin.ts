import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { I18nService } from '../../i18n/i18n.service';

export class TranslateErrorsPLugin implements ApolloServerPlugin {
	constructor(private i18nService: I18nService) {}

	async requestDidStart(): Promise<GraphQLRequestListener<any>> {
		return {
			willSendResponse: async (requestContext): Promise<any> => {
				const { errors, contextValue } = requestContext;
				const { body } = requestContext.response;
				if (errors && body.kind === 'single') {
					body.singleResult.errors = errors.map((err) => {
						return this.i18nService.translateGraphqlError(err, contextValue.req) as any;
					});
				}
			},
		};
	}
}
