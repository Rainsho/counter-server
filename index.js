const http = require('http');
const fs = require('fs');
const { resolve } = require('path');

let count = 0;

const file = resolve(__dirname, 'counter.temp');
const svg = fs.readFileSync(resolve(__dirname, 'counter.svg'), 'utf-8');

const backup = () => fs.writeFileSync(file, count, 'utf-8');
const getSvg = (num) => svg.replace('XXX', num);

if (fs.existsSync(file)) {
  count = parseInt(fs.readFileSync(file, 'utf-8'), 10);
} else {
  backup();
}

process.on('beforeExit', backup);
process.on('SIGINT', () => {
  backup();
  process.exit(0);
});

http
  .createServer((req, res) => {
    const { url, socket, headers } = req;
    const { remoteAddress } = socket;
    const realIp = headers['x-forwarded-for']; // added by nginx

    console.log(new Date(), realIp || remoteAddress, url);

    switch (url) {
      case '/counter':
        res.write(`${++count}`);
        res.end();
        break;
      case '/counter.svg':
        res.setHeader('cache-control', 'max-age=0, no-cache, no-store');
        res.setHeader('content-type', 'image/svg+xml');
        res.write(getSvg(++count));
        res.end();
        break;
      default:
        res.statusCode = 204;
        res.end();
        break;
    }
  })
  .listen(23333);
