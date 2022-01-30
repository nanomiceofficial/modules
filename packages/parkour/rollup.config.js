import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'

export default {
    input: 'src/main.js',
    output: {
        file: 'build/parkour.js',
        format: 'iife',
        indent: true,
        compact: true,
        minifyInternalExports: true
    },
    plugins: [
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties', ['@babel/plugin-transform-classes', { loose: true }]]
        }),
        // terser()
    ]
}