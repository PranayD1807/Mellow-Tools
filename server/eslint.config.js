import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off', // Backend often uses console for logging in development
        },
    },
    {
        ignores: ['node_modules/', 'coverage/'],
    }
];
