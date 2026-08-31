const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const ROOT = __dirname; // workspace root (this file lives at the root)

// The @nx/webpack executor runs our config as-is (plain object), so entry and
// output must be complete here. The executor's `assets` option only works in
// NxAppWebpackPlugin (composePlugins) mode, so the dist package.json is
// written by this plugin after each build instead.
class WriteDistPackageJsonPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('WriteDistPackageJsonPlugin', () => {
      const src = JSON.parse(
        fs.readFileSync(path.join(ROOT, 'apps/minimacli/package.json'), 'utf8')
      );
      const distPkg = {
        name: src.name,
        version: src.version,
        description: src.description,
        type: 'module',
        license: src.license,
        repository: src.repository,
        engines: src.engines,
        keywords: src.keywords,
        main: './main.js',
        bin: src.bin,
      };
      const outDir = path.join(ROOT, 'dist/minimacli');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(
        path.join(outDir, 'package.json'),
        JSON.stringify(distPkg, null, 2) + '\n'
      );
    });
  }
}

module.exports = {
  mode: 'production',
  target: 'node',
  entry: path.resolve(ROOT, 'apps/minimacli/src/main.tsx'),
  output: {
    path: path.resolve(ROOT, 'dist/minimacli'),
    filename: 'main.js',
    clean: true,
  },
  experiments: {
    outputModule: true,
    topLevelAwait: true,
  },
  externalsPresets: { node: true },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@minimacli/plugin': path.resolve(ROOT, 'libs/minimacli-plugin/src/index.ts')
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true, compilerOptions: { jsx: 'react-jsx' } },
        },
      },
    ],
  },
  plugins: [
    new WriteDistPackageJsonPlugin(),
    // Ink's devtools branch imports optional packages (react-devtools-core, ws)
    // that are never installed; they only run with process.env.DEV === 'true'.
    new webpack.IgnorePlugin({ resourceRegExp: /^(react-devtools-core|ws)$/ }),
    // Compile-time envs: kills the devtools branch and selects React production.
    new webpack.DefinePlugin({
      'process.env.DEV': 'false',
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
  ],
  performance: { hints: false },
};
