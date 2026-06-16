import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable, switchMap } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';
import { parseContext } from '../utils/parse-context';

@Injectable()
export class ApiErrorTranslationInterceptor implements NestInterceptor {
	constructor(private readonly i18nService: I18nService) {}
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
		const { req } = parseContext(context);
		return next.handle().pipe(
			switchMap((val) => Promise.resolve(val)),
			map((val) => {
				const normalizedValue = Array.isArray(val)
					? val
					: [
							val,
						];
				for (const item of normalizedValue) {
					// if (item instanceof AdminApiError || item instanceof PortalApiError) {
					this.i18nService.translateGraphqlApiError(item, req);
					// }
				}
				return val;
			}),
		);
	}
}
