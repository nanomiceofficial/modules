import { terser } from "rollup-plugin-terser"
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/main.js',
    output: {
        file: 'build/bundle.js',
        format: 'iife',
        indent: false,
        compact: true,
        minifyInternalExports: true
    },
    plugins: [
        babel({
            babelrc: false,
            presets: ["@babel/preset-env"],
            plugins: [["@babel/plugin-transform-classes", { loose: true }]]
        }),
        terser()
    ]
};