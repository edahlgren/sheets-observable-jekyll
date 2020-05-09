import { readdirSync, copyFileSync } from 'fs';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

var plugins = [
  babel({
    babelrc: false,
    exclude: "node_modules/**",
    plugins: ["transform-html-import-to-string"],
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

var config = [
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
    input: "./src/runtime-config.js",
    output: [
      {
        file: "../assets/js/runtime-config.js",
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
    input: "./src/report/indexStatic.js",
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
    input: "./src/templates/correlation-1/index.js",
    output: [
      {
        file: "../assets/js/templates/correlation-1.js",
        format: "iife",
        name: "app"
      },
    ],
    plugins: plugins
  }
];

var notebooks = readdirSync("./src/notebooks");
notebooks.forEach(function(entry) {
  if (entry.endsWith(".js")) {
    config.push({
      input: "./src/notebooks/" + entry,
      output: [
        {
          file: "../assets/plots/" + entry,
          format: "iife",
          name: "app"
        },
      ],
      plugins: plugins
    });
  }
});

var notebooks = readdirSync("./src/notebooks/code/files");
notebooks.forEach(function(entry) {
  if (entry.endsWith(".json")) {
    copyFileSync(
      // source
      "./src/notebooks/code/files/" + entry,
      // target
      "../assets/plots/files/" + entry
    );
  }
});

console.log("config", config);

export default config;
