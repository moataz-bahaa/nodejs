const path = require('path');

const rootDir = path.dirname(require.main.filename);

const joinPath = (...params) => path.join(rootDir, ...params);

module.exports = joinPath;
