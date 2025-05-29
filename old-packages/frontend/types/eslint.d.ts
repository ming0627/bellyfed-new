declare module '@eslint/js';
declare module 'eslint-plugin-next';
declare module 'eslint-plugin-react-hooks';
declare module 'eslint-plugin-jsx-a11y';
declare module 'eslint' {
  namespace Linter {
    interface FlatConfig {
      [key: string]: any;
    }
  }
}
