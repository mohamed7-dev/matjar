import { Administrator } from './administrator/administrator.entity';
import { Asset } from './asset/asset.entity';
import { AssetTranslation } from './asset/asset-translation.entity';
import { AuthenticationMethod } from './authentication-method/authentication-method.entity';
import { ExternalAuthenticationMethod } from './authentication-method/external-authentication-method.entity';
import { NativeAuthenticationMethod } from './authentication-method/native-authentication-method.entity';
import { Company } from './company/company.entity';
import { MarketplaceRegion } from './marketplace-region/marketplace-region.entity';
import { Role } from './role/role.entity';
import { Session } from './session/session.entity';
import { User } from './user/user.entity';

export const entitiesMap = {
	User: User,
	AuthenticationMethod: AuthenticationMethod,
	NativeAuthenticationMethod: NativeAuthenticationMethod,
	ExternalAuthenticationMethod: ExternalAuthenticationMethod,

	Administrator: Administrator,

	Session: Session,

	Company: Company,

	MarketplaceRegion: MarketplaceRegion,

	Role: Role,

	Asset: Asset,
	AssetTranslation: AssetTranslation,
};

export type EntityNames = keyof typeof entitiesMap;
