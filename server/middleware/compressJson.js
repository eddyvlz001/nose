const { gzip } = require('node:zlib');

// Compress image-rich JSON responses without changing stored photographs.
module.exports = function compressJson(req, res, next) {
  if (req.method !== 'GET') return next();
  res.vary('Accept-Encoding');
  if (!req.acceptsEncodings('gzip')) return next();
  const original = res.json.bind(res);
  res.json = function json(body) {
    const serialized = JSON.stringify(body);
    if (!serialized || Buffer.byteLength(serialized) < 2048) return original(body);
    gzip(serialized, {level:6}, (error, compressed) => {
      if (res.destroyed) return;
      if (error) return original(body);
      res.type('application/json');
      res.set('Content-Encoding','gzip');
      res.send(compressed);
    });
    return res;
  };
  next();
};
