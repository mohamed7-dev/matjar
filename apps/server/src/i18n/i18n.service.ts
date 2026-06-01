import { Injectable } from '@nestjs/common';
import { Handler } from 'express';
import i18next from 'i18next';
import i18NextMW from 'i18next-http-middleware';

@Injectable()
export class I18nService {
	public setupMiddleware(): Handler {
		return i18NextMW.handle(i18next);
	}
}
