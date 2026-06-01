import path from 'node:path';

const srcRootDir = path.join(__dirname, '..', '..');

export const ADMIN_TYPES_PATHS = [
	path.join(srcRootDir, 'api', 'schemas', 'admin', '*.graphql'),
	path.join(srcRootDir, 'api', 'schemas', 'shared', '*.graphql'),
];

export const STORE_TYPES_PATHS = [
	path.join(srcRootDir, 'api', 'schemas', 'store', '*.graphql'),
	path.join(srcRootDir, 'api', 'schemas', 'shared', '*.graphql'),
];
