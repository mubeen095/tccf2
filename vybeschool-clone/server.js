const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PUBLIC = path.join(__dirname, 'www.vybeschool.com');
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
};

const COMPRESSABLE = new Set(['.html', '.js', '.css', '.json', '.xml', '.svg']);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Access-Control-Allow-Origin': '*',
};

function serveFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const acceptEncoding = (res.req.headers['accept-encoding'] || '');
  const useGzip = COMPRESSABLE.has(ext) && acceptEncoding.includes('gzip');

  const headers = {
    'Content-Type': contentType,
    'Vary': 'Accept-Encoding',
    ...SECURITY_HEADERS,
  };
  if (useGzip) headers['Content-Encoding'] = 'gzip';

  res.writeHead(statusCode, headers);

  if (res.req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.destroy();
  });

  if (useGzip) {
    stream.pipe(zlib.createGzip()).pipe(res);
  } else {
    stream.pipe(res);
  }
}

function serve404(res) {
  const fallback = path.join(PUBLIC, '404.html');
  if (fs.existsSync(fallback)) {
    const ext = path.extname(fallback).toLowerCase();
    const contentType = MIME[ext] || 'text/html; charset=utf-8';
    res.writeHead(404, {
      'Content-Type': contentType,
      ...SECURITY_HEADERS,
    });
    fs.createReadStream(fallback).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
    res.end('<h1>404 Not Found</h1>');
  }
}

const server = http.createServer((req, res) => {
  res.req = req;

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { 'Allow': 'GET, HEAD', ...SECURITY_HEADERS });
    res.end('Method not allowed');
    return;
  }

  let url;
  try {
    url = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, SECURITY_HEADERS);
    res.end('Bad request');
    return;
  }

  if (url.includes('\0')) {
    res.writeHead(400, SECURITY_HEADERS);
    res.end('Bad request');
    return;
  }

  if (url.endsWith('/')) url += 'index.html';
  const filePath = path.resolve(PUBLIC, `.${url}`);

  if (!filePath.startsWith(`${PUBLIC}${path.sep}`)) {
    serve404(res);
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(res, filePath, 200);
  } else if (url.includes('.')) {
    serve404(res);
  } else {
    const spaPath = path.join(PUBLIC, 'index.html');
    if (fs.existsSync(spaPath)) {
      serveFile(res, spaPath, 200);
    } else {
      serve404(res);
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
