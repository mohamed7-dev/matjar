import { defineConfig } from '@lingui/cli';


export default defineConfig({
    sourceLocale:"en",
    locales:["en","ar"],
    orderBy:"messageId",
    catalogs: [
        {
            path: '<rootDir>/src/i18n/dictionaries/{locale}',
            include: ['<rootDir>/src'],
            exclude: ['<rootDir>/src/**/*.stories.tsx'],
        },
    ],
})