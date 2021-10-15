module.exports = {
    'env': {
      'commonjs': true,
      'es2021': true,
      'node': true,
      'jest': true,
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
      'ecmaVersion': 12,
    },
    'rules': {
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'eqeqeq': 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 0,
      'no-unused-vars': 0,
    },
  };