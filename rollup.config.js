import typescript from "@rollup/plugin-typescript";
import {dts} from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";

export default [{
	input: "src/index.ts",
	output: {
		file: "dist/fulltilt.js",
		format: "es",
		sourcemap: false,
	},
	plugins: [typescript()]
}, {
	input: "src/index.ts",
	output: {
		file: "dist/fulltilt.min.js",
		format: "es",
		sourcemap: true,
	},
	plugins: [typescript(), terser()],
}, {
	input: "src/index.ts", output: {
		file: "dist/fulltilt.d.ts", format: "es",
	}, plugins: [dts()]
}]
