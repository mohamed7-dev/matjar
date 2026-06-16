// will be deleted once company is imported somewhere
import * as Company from './company/company.entity';

export const entitiesMap = {
	User: require('./user/user.entity').User,
	AuthenticationMethod: require('./authentication-method/authentication-method.entity')
		.AuthenticationMethod,
	NativeAuthenticationMethod: require('./authentication-method/native-authentication-method.entity')
		.NativeAuthenticationMethod,
	ExternalAuthenticationMethod: require('./authentication-method/external-authentication-method.entity')
		.ExternalAuthenticationMethod,

	Administrator: require('./administrator/administrator.entity').Administrator,

	Session: require('./session/session.entity').Session,
	// RefreshToken: require('./refresh-token/refresh-token.entity').RefreshToken,

	Company: require('./company/company.entity').Company,

	MarketplaceRegion: require('./marketplace-region/marketplace-region.entity').MarketplaceRegion,

	Role: require('./role/role.entity').Role,
	CompanyRole: require('./role/company-role.entity').CompanyRole,
	PlatformRole: require('./role/platform-role.entity').PlatformRole,

	Asset: require('./asset/asset.entity').Asset,
	AssetTranslation: require('./asset/asset-translation.entity').AssetTranslation,
};
