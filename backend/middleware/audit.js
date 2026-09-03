const AuditLog = require('../models/AuditLog');

const audit = (action, resourceType = '') =>
  async (req, res, next) => {
    const origJson = res.json;
    res.json = function (body) {
      res.locals.body = body;
      return origJson.call(this, body);
    };

    res.on('finish', async () => {
      try {
        const resourceId = req.params.id || req.params.bookingId || req.body._id || null;
        await AuditLog.create({
          user: req.user ? req.user._id : null,
          action: action || `${req.method} ${req.originalUrl.split('?')[0]}`,
          resourceType,
          resourceId,
          metadata: {
            method: req.method,
            path: req.originalUrl.split('?')[0],
            statusCode: res.statusCode,
            body: req.method === 'GET' ? undefined : this?._method ?? undefined,
          },
          ip: req.ip,
        });
      } catch (error) {
        console.error('audit log failed:', error.message);
      }
    });

    next();
  };

module.exports = { audit };