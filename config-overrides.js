const path = require('path');

const pathOverrides = {
  appBuild: path.resolve(__dirname,'target/classes/public'),
  appPackageJson: path.resolve(__dirname,'package.json'),
  appPublic: path.resolve(__dirname,'app/public'),
  appHtml: path.resolve(__dirname,'app/public/index.html'),
  appIndexJs: path.resolve(__dirname,'app/src/index.js'),
  appSrc: path.resolve(__dirname,'app/src')
};

module.exports = {
  webpack: function(config, env) {
    config.output.path = pathOverrides.appBuild;
    return config;
  },
  paths: function(paths, env) {
    const newPaths =  {
      ...paths,
      ...pathOverrides,
    };
    return newPaths;
  },
  devServer: function(configFunction) {
    // Return the replacement function for create-react-app to use to generate the Webpack
    // Development Server config. "configFunction" is the function that would normally have
    // been used to generate the Webpack Development server config - you can use it to create
    // a starting configuration to then modify instead of having to create a config from scratch.
    return function(proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      const config = configFunction(proxy, allowedHost);
      config.devMiddleware.writeToDisk = true;
      config.static.directory = pathOverrides.appBuild;
      // Return your customised Webpack Development Server config.
      return config;
    }
  }
};
