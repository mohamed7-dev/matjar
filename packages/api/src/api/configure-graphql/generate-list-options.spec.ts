import { describe, expect, it } from 'vitest';
import { generateListOptions } from './generate-list-options';

const { printType } = require('graphql');

describe('generateListOptions()', () => {
	const COMMON_SCHEMA_TYPES = `
        scalar JSON
        scalar DateTime

        interface Node {
            id: ID!
        }

        enum SortDirection {
	        ASC
	        DESC
        }

        enum FilterGroupOperator {
	        AND
	        OR
        }

        interface PaginatedList {
            items: [Node!]!
            totalItemsCount: Int!
        }

        type ProductList implements PaginatedList {
            items: [Product!]!
            totalItemsCount: Int!
        }

        input TextFilterInput { dummy: String }
        input NumericRangeInput { dummy: String }
        input NumericFilterInput { dummy: String }
        input BooleanFilterInput { dummy: String }
        input IdentifierFilterInput { dummy: String }
        input DateTimeRangeInput { dummy: String }
        input DateTimeFilterInput { dummy: String }
    `;

	it('creates list options input', () => {
		const sdl = `
            ${COMMON_SCHEMA_TYPES}
            type Query {
                products(options: ProductListOptions): ProductList
            }

            type Product {
                name: String!
            }
        
            input ProductListOptions
        `;

		const schema = generateListOptions(sdl);

		expect(printType(schema.getType('ProductListOptions') as any)).toBe(
			removeWhitespace(`
                   input ProductListOptions {
                     """Skips the first n results, for use in pagination"""
                     skip: Int

                     """Takes n results, for use in pagination"""
                     take: Int

                     """Specifies which properties to sort the results by"""
                     sort: ProductSortParameter

                     """Allows the results to be filtered"""
                     filter: ProductFilterParameter
                   }`),
		);
	});
});

function removeWhitespace(s: string): string {
	const indent = (s.match(/^\s+/m) as RegExpMatchArray)[0].replace(/\n/, '');
	return s.replace(new RegExp(`^${indent}`, 'gm'), '').trim();
}
