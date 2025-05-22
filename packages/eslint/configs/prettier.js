// @ts-check-disabled

import tseslint from 'typescript-eslint';
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default tseslint.config(eslintPluginPrettier, {
    rules: {
        'prettier/prettier': [
            'error',
            {
                semi: true,
                singleQuote: true,
                tabWidth: 2,
                trailingComma: 'es5',
                printWidth: 80,
                bracketSpacing: true,
                arrowParens: 'always',
            },
        ],
    },
});
