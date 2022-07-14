module.exports = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  semi: false,
  endOfLine: 'lf',
  trailingComma: 'es5',
  bracketSpacing: true,
  overrides: [
    { files: './**/*.json', options: { parser: 'json'}},
    { files: '.*.rc', options: { parser: 'json'}}
  ]
}