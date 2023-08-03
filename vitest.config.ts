/// <reference types="vitest" />
import { defineConfig } from "vite";

import path from "path";

export default defineConfig({
    test: {
        globals: true, // use `describe, it, test` without importing them
        environment: "node",
    },
    resolve: {
        alias: {
            '@utils': path.resolve(__dirname, './src/utils')
        }
    },
});