export abstract class AppEvent {
	public readonly createdAt: Date;
	protected constructor() {
		this.createdAt = new Date();
	}
}
