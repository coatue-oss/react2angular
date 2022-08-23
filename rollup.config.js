import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
  entry: "index.es6.js",
  dest: "index.browser.js",
  format: "iife",
  moduleName: "react2angular",
  plugins: [
    nodeResolve({
      browser: true,
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    commonjs(),
  ],
  external: ["react", "react-dom"],
  globals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};
