const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Axios v1.x ships Node and browser bundles. Metro resolves the Node CJS entry
// which imports 'crypto', 'url', 'http' — unavailable in React Native.
// Force Metro to use the browser-compatible bundle instead.
const axiosBrowserPath = path.resolve(
  __dirname,
  'node_modules/axios/dist/browser/axios.cjs'
);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios') {
    return {
      type: 'sourceFile',
      filePath: axiosBrowserPath,
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
