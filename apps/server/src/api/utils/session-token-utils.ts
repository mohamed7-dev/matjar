import { Request, Response } from 'express';
import { AuthConfigOptions } from '../../config/types/app-config.interface';

export function setSessionToken(options: {
	sessionToken: string;
	rememberMe: boolean;
	authOptions: Required<AuthConfigOptions>;
	req: Request;
	res: Response;
}): void {
	const { sessionToken, authOptions, res } = options;

	res.set(authOptions.authTokenHeader, sessionToken);
}

export function getSessionToken(req: Request): string | undefined {
	const authHeader = req.get('Authorization')?.trim();
	if (authHeader) {
		const matchesBearer = authHeader.match(/^bearer\s(.+)$/i);
		return matchesBearer?.[1];
	}
}
