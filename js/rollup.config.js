import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

var plugins = [
  babel({
    babelrc: false,
    exclude: "node_modules/**",
    presets: [
      [
        "@babel/preset-env",
        {
          modules: false,
          useBuiltIns: "usage",
          corejs: 2,
          targets: {
            ie: '11',
          }
        },
      ],
    ],
  }),
  resolve(),
  commonjs(),
];

export default [
  {
    input: "./src/runtime.js",
    output: [
      {
        file: "../assets/js/runtime.js",
        format: "iife",
        name: "app"
      },
    ],
    plugins: plugins
  },
  {
    input: "./src/new/index.js",
    output: [
      {
        file: "../assets/js/new.js",
        format: "iife",
        name: "app"
      },
    ],
    plugins: plugins
  },
  {
    input: "./src/report/index.js",
    output: [
      {
        file: "../assets/js/report.js",
        format: "iife",
        name: "app"
      },
    ],
    plugins: plugins
  },
  {
    input: "./src/plot/index.js",
    output: [
      {
        file: "../assets/js/plot.js",
        format: "iife",
        name: "app"
      },
    ],
    plugins: plugins
  },
  {
    input: "./src/plots/basic-scatterplot.js",
    output: [
      {
        file: "../assets/plots/basic-scatterplot.js",
        format: "iife",
        name: "app"
      },
    ],
    plugins: plugins
  },
];
