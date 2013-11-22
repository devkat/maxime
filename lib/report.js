var
  _ = require('lodash'),
  sprintf = require('sprintf');

function report(level, loc, msg) {
  throw new Error(sprintf('%s:%d:%d – %s: %s', loc.file, loc.start.line, loc.start.column, level, msg));
}

module.exports = {
  error: _.partial(report, 'Error'),
  warn: _.partial(report, 'Warning')
};
