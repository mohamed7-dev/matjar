/**
 * @description
 * Defines the shape of a paginated list response
 */
export interface PaginatedList<Entity> {
	items: Entity[];
	totalItemsCount: number;
}
