import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StdoutLoggerStrategy } from '../config/strategies/logger/stdout-logger.strategy';
import { Logger } from '../logger/logger';
import { AppEvent } from './app-event';
import { EventBus } from './event-bus';

describe('EventBus', () => {
	let eventBus: EventBus;

	beforeEach(() => {
		eventBus = new EventBus();
		Logger.setLoggerStrategy(new StdoutLoggerStrategy());
	});

	describe('publish method', () => {
		it('Publishes events successfully', () => {
			const event = new TestEvent('testing');
			expect(async () => await eventBus.publish(event)).not.toThrow();
		});
		it('When invoked, calls blocking handler method', async () => {
			const mock = vi.fn((_event: AppEvent) => undefined);
			const event = new TestEvent('foo');

			eventBus.register({
				event: TestEvent,
				handler: (event) => mock(event),
				id: 'test-handler',
			});

			await eventBus.publish(event);

			expect(mock).toHaveBeenCalledTimes(1);
			expect(mock).toHaveBeenCalledWith(event);
		});
		it('When invoked, calls multiple blocking handler methods', async () => {
			const mock1 = vi.fn((_event: AppEvent) => undefined);
			const mock2 = vi.fn((_event: AppEvent) => undefined);
			const event = new TestEvent('foo');

			eventBus.register({
				handler: (e) => mock1(e),
				id: 'test-handler1',
				event: TestEvent,
			});
			eventBus.register({
				handler: (e) => mock2(e),
				id: 'test-handler2',
				event: TestEvent,
			});

			await eventBus.publish(event);
			expect(mock1).toHaveBeenCalledTimes(1);
			expect(mock1).toHaveBeenCalledWith(event);
			expect(mock2).toHaveBeenCalledTimes(1);
			expect(mock2).toHaveBeenCalledWith(event);
		});
		it('Throws when a handler method throws', async () => {
			const event = new TestEvent('foo');

			eventBus.register({
				handler: () => {
					throw new Error('Testing handler throwing error');
				},
				id: 'test-handler1',
				event: TestEvent,
			});

			await expect(eventBus.publish(event)).rejects.toThrow();
		});
	});

	describe('register method', () => {
		it('Throws when handler with same id exists', () => {
			eventBus.register({
				handler: (_e) => undefined,
				id: 'test-handler',
				event: TestEvent,
			});

			expect(() => {
				eventBus.register({
					handler: (_e) => undefined,
					id: 'test-handler',
					event: TestEvent,
				});
			}).toThrow(new Error(`Duplicate event handler "test-handler" for ${TestEvent.name}`));
		});
		it('Handles multiple events', async () => {
			const event1 = new TestEvent('foo');
			const event2 = new TestEvent2('bar');
			const mock = vi.fn((_event: AppEvent) => undefined);
			eventBus.register({
				handler: (e) => mock(e),
				id: 'test-handler',
				event: [
					TestEvent,
					TestEvent2,
				],
			});
			await eventBus.publish(event1);
			expect(mock).toHaveBeenCalledTimes(1);
			expect(mock).toHaveBeenCalledWith(event1);

			await eventBus.publish(event2);
			expect(mock).toHaveBeenCalledTimes(2);
			expect(mock).toHaveBeenCalledWith(event2);
		});
		it('Maintains the order of execution with before property', async () => {
			const mock = vi.fn((_input: string) => undefined);
			const event = new TestEvent('foo');

			eventBus.register({
				handler: () => mock('first-handler'),
				id: 'first-test-handler',
				event: TestEvent,
			});
			eventBus.register({
				handler: () => mock('second-handler'),
				id: 'second-test-handler',
				event: TestEvent,
				before: 'first-test-handler',
			});
			await eventBus.publish(event);
			expect(mock).toHaveBeenNthCalledWith(1, 'second-handler');
			expect(mock).toHaveBeenNthCalledWith(2, 'first-handler');
		});

		it('Maintains the order of execution with after property', async () => {
			const mock = vi.fn((_input: string) => undefined);
			const event = new TestEvent('foo');

			eventBus.register({
				handler: () => mock('first-handler'),
				id: 'first-test-handler',
				event: TestEvent,
				after: 'second-test-handler',
			});

			eventBus.register({
				handler: () => mock('second-handler'),
				id: 'second-test-handler',
				event: TestEvent,
			});

			await eventBus.publish(event);
			expect(mock).toHaveBeenNthCalledWith(1, 'second-handler');
			expect(mock).toHaveBeenNthCalledWith(2, 'first-handler');
		});

		it('Throws if it encounters circular dependency in before ordering', () => {
			const mock = vi.fn((_input: string) => undefined);
			eventBus.register({
				handler: () => mock('first-test-handler'),
				id: 'first-test-handler',
				event: TestEvent,
				before: 'second-test-handler',
			});
			expect(() =>
				eventBus.register({
					handler: () => mock('second-test-handler'),
					id: 'second-test-handler',
					event: TestEvent,
					before: 'first-test-handler',
				}),
			).toThrow(
				new Error(`Circular dependency between "first-test-handler" and "second-test-handler"`),
			);
		});

		it('Throws if it encounters circular dependency in after ordering', () => {
			const mock = vi.fn((_input: string) => undefined);
			eventBus.register({
				handler: () => mock('first-test-handler'),
				id: 'first-test-handler',
				event: TestEvent,
				after: 'second-test-handler',
			});
			expect(() =>
				eventBus.register({
					handler: () => mock('second-test-handler'),
					id: 'second-test-handler',
					event: TestEvent,
					after: 'first-test-handler',
				}),
			).toThrow(
				new Error(`Circular dependency between "first-test-handler" and "second-test-handler"`),
			);
		});
	});
});

class TestEvent extends AppEvent {
	constructor(public payload: string) {
		super();
	}
}

class TestEvent2 extends AppEvent {
	constructor(public payload: string) {
		super();
	}
}
