import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { ClassType } from '../common/types/class-type';
import { Logger } from '../logger/logger';
import { AppEvent } from './app-event';
import { BlockingHandlerOptions } from './types/blocking-handler';

const ContextName = 'EventBus';

@Injectable()
export class EventBus {
	private readonly stream = new Subject<AppEvent>();
	private readonly handlers = new Map<ClassType<AppEvent>, Array<BlockingHandlerOptions<any>>>();

	public async publish<Event extends AppEvent>(event: Event): Promise<void> {
		this.stream.next(event);

		const eventHandlers = this.handlers.get(event.constructor as ClassType<AppEvent>) ?? [];

		for (const handlerOptions of eventHandlers) {
			const start = Date.now();
			await handlerOptions.handler(event);
			const duration = Date.now() - start;
			Logger.debug(`Event handler "${handlerOptions.id}" completed in ${duration}ms`, ContextName);
			if (duration > 100) {
				Logger.warn(
					[
						`Event handler "${handlerOptions.id}" is slow (${duration}ms).`,
						'Consider moving heavy work to a background job.',
					].join('\n'),
					ContextName,
				);
			}
		}
	}

	public register<Event extends AppEvent>(options: BlockingHandlerOptions<Event>): void {
		const events = Array.isArray(options.event)
			? options.event
			: [
					options.event,
				];

		for (const event of events) {
			let handlerOptions = this.handlers.get(event);
			if (handlerOptions?.some((handlerOptions) => handlerOptions.id === options.id)) {
				throw new Error(`Duplicate event handler "${options.id}" for ${event.name}`);
			}
			if (handlerOptions) {
				handlerOptions.push(options);
			} else {
				handlerOptions = [
					options,
				];
			}
			this.handlers.set(event, this.orderHandlers(handlerOptions));
		}
	}

	private orderHandlers<Event extends AppEvent>(
		handlersOptions: Array<BlockingHandlerOptions<Event>>,
	): Array<BlockingHandlerOptions<Event>> {
		const ordered: Array<BlockingHandlerOptions<Event>> = [];

		const lookup = new Map<string, BlockingHandlerOptions<Event>>();

		for (const item of handlersOptions) {
			lookup.set(item.id, item);
		}

		const process = (handlerOptions: BlockingHandlerOptions<Event>): void => {
			if (handlerOptions.after) {
				const dependency = lookup.get(handlerOptions.after);
				if (dependency) {
					if (dependency.after === handlerOptions.id) {
						throw new Error(
							`Circular dependency between "${handlerOptions.id}" and "${dependency.id}"`,
						);
					}
					process(dependency);
				}
			}

			ordered.push(handlerOptions);

			if (handlerOptions.before) {
				const dependency = lookup.get(handlerOptions.before);
				if (dependency) {
					if (dependency.before === handlerOptions.id) {
						throw new Error(
							`Circular dependency between "${handlerOptions.id}" and "${dependency.id}"`,
						);
					}

					ordered.splice(
						ordered.findIndex((x) => x.id === dependency.id),
						1,
					);

					process(dependency);
				}
			}
		};

		for (const handlerOptions of handlersOptions) {
			process(handlerOptions);
		}

		return ordered;
	}
}
