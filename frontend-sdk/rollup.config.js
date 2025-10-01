// Rollup configuration for dual ESM/CJS build
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const json = require('@rollup/plugin-json');

const pkg = require('./package.json');

const banner = `/**
 * RV Project Frontend SDK v${pkg.version}
 * ${pkg.description}
 *
 * @author ${pkg.author}
 * @license ${pkg.license}
 */`;

const baseConfig = {
  input: 'src/index.ts',
  external: ['axios', 'date-fns'],
  plugins: [
    nodeResolve({
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
  ],
};

export default [
  // ESM build
  {
    ...baseConfig,
    output: {
      file: pkg.module,
      format: 'esm',
      banner,
      sourcemap: true,
    },
  },

  // CommonJS build
  {
    ...baseConfig,
    plugins: [
      ...baseConfig.plugins,
      // Add terser for minification in CJS build
      terser({
        format: {
          comments: /RV Project Frontend SDK/,
        },
      }),
    ],
    output: {
      file: pkg.main,
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named',
    },
  },
];
