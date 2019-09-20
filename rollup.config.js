import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import cssnano from 'cssnano';
import { eslint } from 'rollup-plugin-eslint';
import filesize from 'rollup-plugin-filesize';
import license from 'rollup-plugin-license';
import postcss from 'postcss';
import sass from 'rollup-plugin-sass';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import fs from 'fs';

const pkg = require('./package.json');
const banner = ['/*!', pkg.name, pkg.version, '*/\n'].join(' ');

function getSassOptions(minify = false) {
  const postcssPlugins = [
    autoprefixer({
      grid: false
    })
  ];

  if (minify) {
    postcssPlugins.push(cssnano());
  }
  return {
    output(styles, styleNodes) {
      fs.mkdirSync('dist/css', { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
      });

      styleNodes.forEach(({ id, content }) => {
        const scssName = id.substring(id.lastIndexOf('/') + 1, id.length);
        const [name] = scssName.split('.');
        fs.writeFileSync(`dist/css/${name}.${minify ? 'min.css' : 'css'}`, content);
      });
    },
    processor: (css) => postcss(postcssPlugins)
      .process(css, {
        from: undefined
      })
      .then((result) => result.css)
  };
}

const rollupBuilds = [
  {
    input: './src/js/tether.js',
    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: 'Tether',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      eslint({
        include: '**/*.js'
      }),
      babel(),
      sass(getSassOptions(false)),
      license({
        banner
      }),
      filesize(),
      visualizer()
    ]
  }
];

rollupBuilds.push({
  input: './src/js/tether.js',
  output: [
    {
      file: 'dist/js/tether.min.js',
      format: 'umd',
      name: 'Tether',
      sourcemap: true
    },
    {
      file: 'dist/js/tether.esm.min.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    babel(),
    sass(getSassOptions(true)),
    terser(),
    license({
      banner
    }),
    filesize(),
    visualizer()
  ]
});

export default rollupBuilds;

