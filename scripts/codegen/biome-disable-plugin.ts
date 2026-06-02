import type { PluginFunction } from "@graphql-codegen/plugin-helpers";

export const plugin: PluginFunction = () => {
	return {
		content: `
            // biome-ignore-all lint: generated-content
            // biome-ignore-all lint: generated-content
        `,
	};
};
