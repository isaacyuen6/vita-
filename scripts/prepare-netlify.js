const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'apps', 'mobile', 'dist');
const indexPath = path.join(distDir, 'index.html');
const swPath = path.join(distDir, 'sw.js');

if (fs.existsSync(indexPath)) {
  const html = fs
    .readFileSync(indexPath, 'utf8')
    .replace(/(["'=])\/vita-\//g, '$1/')
    .replace(/(["'=])\.\/vita-\//g, '$1./');
  fs.writeFileSync(indexPath, html);
}

if (fs.existsSync(swPath)) {
  const version = process.env.COMMIT_REF || process.env.DEPLOY_ID || String(Date.now());
  const sw = fs.readFileSync(swPath, 'utf8').replace(/__BUILD_VERSION__/g, version);
  fs.writeFileSync(swPath, sw);
}
