import {defineConfig} from "@lingui/cli"

export default defineConfig({
    sourceLocale: "en",
    locales:["en"],
    catalogs:[{
        path:"<rootDit>/src/i18n/catalogs/{locale}",
        include:["<rootDit>/src/**"]
    }]
})