import z from 'zod';

export const assetsPageSearchSchema = z.object({
	pageSize: z.coerce.number().int().positive().catch(24),
	displayMode: z
		.enum([
			'grid',
			'list',
		])
		.catch('grid'),
});

export type AssetsPageSearchSchema = z.infer<typeof assetsPageSearchSchema>;

export type AssetsDisplayModeUnion = AssetsPageSearchSchema['displayMode'];
