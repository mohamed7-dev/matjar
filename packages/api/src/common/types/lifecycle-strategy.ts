import { Injector } from '../helpers/injector';

export interface LifecycleStrategy {
	onInit?(injector: Injector): Promise<void> | void;
	onDestroy?(): Promise<void> | void;
}
