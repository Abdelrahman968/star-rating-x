import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    postcss({
      extract: "styles.css",
      minimize: true,
    }),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: [
        ["@babel/preset-env", { targets: "> 0.5%, last 2 versions, not dead" }],
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
    }),
  ],
  external: ["react", "react-dom", "react/jsx-runtime"],
};
