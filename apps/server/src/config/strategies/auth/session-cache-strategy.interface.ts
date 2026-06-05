import { PermissionsIndexMap } from '../../../common/helpers/permission-index';
import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy';

export type CachedSessionUser = {
	id: string;
	identifier: string;
	isVerified: boolean;
	permissionsIndex: PermissionsIndexMap;
};

export interface SessionCacheEntry {
	id: string;
	token: string;
	expiresAt: Date;
	authenticationStrategyName?: string;
	activeMarketplaceRegionId?: string;
	activeOrderId?: string;
	cacheExpiry: number;
	user: CachedSessionUser;
}

export interface SessionCacheStrategy extends LifecycleStrategy {
	set(sessionEntry: SessionCacheEntry): Promise<void> | void;
	get(sessionToken: string): Promise<SessionCacheEntry | undefined> | SessionCacheEntry | undefined;
	delete(sessionToken: string): Promise<void> | void;
	clear(): Promise<void> | void;
}
