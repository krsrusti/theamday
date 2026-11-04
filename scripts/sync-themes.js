const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'themes');
const dest = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'themes');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Synced themes ->', dest);