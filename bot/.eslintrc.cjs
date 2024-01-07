module.exports = {
  extends: ['airbnb-base/legacy', 'plugin:prettier/recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  rules: {
    strict: 0,
    'comma-dangle': ['error', 'always-multiline'],
    'func-names': ['error', 'never'],
    radix: 0,
    'no-throw-literal': 0, //  Нельзя пихать строки в throw - выключил
    'no-use-before-define': 0, // Нельзя использовать до объявления - выключил
    'no-plusplus': 0, // Нельзя i++ - разрешил
    'no-await-in-loop': 0, // Нет await в циклах - отключил
    'no-multi-assign': 0, // запрещает const kek = lol = 2 + 1; - выключил
    'no-unused-expressions': ['error', { allowTernary: true }],
    'no-unused-vars': 'warn',
    'consistent-return': 0,
    'array-callback-return': ['error', { allowImplicit: true }],
    'no-path-concat': 0,
    'prettier/prettier': 'error',
    'no-restricted-syntax': 0,
    'no-param-reassign': ['error', { props: false }],
    'no-continue': 0,
  },
};
