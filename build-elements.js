const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/elements-build/runtime.js',
    './dist/elements-build/polyfills.js',
    './dist/elements-build/scripts.js',
    './dist/elements-build/main.js'
  ];

  await fs.ensureDir('dist/elements-build');
  await concat(files, 'dist/elements-build/select-list.js');
})();