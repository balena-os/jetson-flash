const fs = require('fs')

console.log('cleaning up images')
fs.unlinkSync('jetson-tx2.img');
fs.rmSync('jetson-flash-artifacts', { recursive: true, force: true });
