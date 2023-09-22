const fs = require('fs');

module.exports = () => {
    return {
        bundle: true,
        minify: true,
        sourcemap: false,
        format: 'esm',
        // Requires for allowing this to on Lambda runtime
        // https://github.com/floydspace/serverless-esbuild/issues/483
        outputFileExtension: '.mjs',
        // Enable tree shaking for both ECMAScript and CommonJS modules
        // https://esbuild.github.io/api/#main-fields
        // https://github.com/aws/aws-sdk-js-v3/issues/3542
        mainFields: ['module', 'main'],
        // Allow the use of "require" based deps while shipping ESM
        // https://github.com/evanw/esbuild/issues/1921#issuecomment-1152887672
        banner: {
            js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
        },
        logLevel: 'info',
        legalComments: 'external',
        plugins: [],
    };
};