import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import autoPreprocess from "svelte-preprocess";
import { env } from "process";
import { terser } from "rollup-plugin-terser";

export default {
	input: "src/main.ts",
	output: {
		format: "cjs",
		file: "dist/main.js",
		exports: "default",
	},
	external: ["obsidian", "fs", "os", "path"],
	plugins: [
		svelte({
			emitCss: false,
			preprocess: autoPreprocess(),
		}),
		// Use source maps for development. The repo used `env.env === "DEV"` previously;
		// also respect NODE_ENV for a more common convention.
		typescript({ sourceMap: env.env === "DEV" || process.env.NODE_ENV === "development" }),
		resolve({
			browser: true,
			dedupe: ["svelte"],
		}),
		commonjs({
			include: "node_modules/**",
		}),
		// Minify the bundle when building for production (not DEV)
		...(env.env === "DEV" || process.env.NODE_ENV === "development" ? [] : [terser()]),
	],
};
