## webpack-environment-suffix-plugin

- [overview](#overview)
- [installation](#installation)
- [webpack configuration](#configure-webpack)
- [options](#options)
- [ionic](#ionic--380)
    - [>=3.8.0](#ionic--380)
    - [< 3.8.0](#ionic--380-1)

### Overview
Plugin allows to use different versions of config files for the different environments. You can create several versions of same file:
```
config.js
config.dev.js
config.prod.js
config.qa.js
```
and plugin `webpack-environment-suffix-plugin` helps  resolve it properly. Idea is similar to what [angular cli](https://github.com/angular/angular-cli/wiki/build) `ng build --prod` does.

### Install
```sh
npm install webpack-environment-suffix-plugin --save
```

### Configure webpack
- Find your `webpack.config.js` file.
- Import `webpack-environment-suffix-plugin`
```js
const EnvironmentSuffixPlugin = require('webpack-environment-suffix-plugin');
```
- Add instance of plugin to a [list of plugins](https://webpack.js.org/concepts/plugins/#usage).
```js
├── webpack.config.js

const EnvironmentSuffixPlugin = require('webpack-environment-suffix-plugin');

//...
const config = {
//...
    plugins: [
    //...
    new EnvironmentSuffixPlugin({
        suffix: process.env.NODE_ENV || 'dev'
    })
    ]
//...
}
```
- Update `package.json`.
```json
├── package.json

//...
"scripts": {
//...
"build": "<you build script>",
"build:prod": "NODE_ENV=\"prod\" npm run build",
"build:dev": "NODE_ENV=\"dev\" npm run build",
"build:test": "NODE_ENV=\"qa\" npm run build
//...
}
```

## Options
- `suffix` -- defines file suffix that should to be used by resolver. For instance `"dev"`, `"prod"`, `"qa"` or ony other you want to use. (*Default*: `"dev"`).
- `ext` -- file extension. (*Default*: `"js"`; For typescript need to set to `"ts"`).
- `include` -- Tests files against array of regexps. By default value is `[/.*\.<your ext>$/]`. 
*Note:* To improve plugin performance set `include` values as precise as possible.
For example:
```js 
new EnvironmentSuffixPlugin ({ 
  "include":[/src\/config\/*.js/, /src\/environment\/*.js/]
})
``` 
- `exclude` -- Array of patterns to exclude. (*Default:* `[/node_modules/]`).
- `pattern` -- Pattern that is resolver is looking for. (*Default* `[name].[suffix]`). 
Example: 
```js
  //Add resolve js files with suffix defined in process.env.NODE_ENV
  new EnvironmentSuffixPlugin(
    suffix: process.env.NODE_ENV
  )

  //add resolve for typescript for with custom pattern
  new EnvironmentSuffixPlugin(
    ext: 'ts'
    suffix: process.env.NODE_ENV,
    include:[/src\/config/, /src\/environment/],
    // search fo custom pattern like: environment-dev.ts
    pattern: '[name]-[suffix]'
  )
```


## Ionic >= 3.8.0
This package might be configured to be used with `ionic`.

- Create new `webpack.config.js` file
```js
├── webpack.config.js

const webpackConfig = require('@ionic/app-scripts/config/webpack.config');
const EnvironmentSuffixPlugin = require('webpack-environment-suffix-plugin');

const ionicEnv = ['prod', 'dev'];

const addPluginToWebpackConfig = (config, env) => {
  const plugins = config[env].plugins || [];

  config[env].plugins = [
    ...plugins,
    new EnvironmentSuffixPlugin({
      ext: 'ts',
      suffix: process.env.NODE_ENV || 'dev'
    })
  ];

  return config;
};

module.exports = () => {
  return ionicEnv.reduce(addPluginToWebpackConfig, webpackConfig);
};

```

- Add `"ionic_webpack": <new webpack.config.js path>"` to a `config` section of your `package.json`.
```json
├── package.json

"config": {
    "ionic_webpack": "./webpack.config.js" 
}
```

### Ionic < 3.8.0
Earlier versions of `ionic` have different structure of `@ionic/app-scripts/config/webpack.config`.

```js
├── webpack.config.js

const originalWebpackConfig = require('@ionic/app-scripts/config/webpack.config');
const EnvironmentSuffixPlugin = require('webpack-environment-suffix-plugin');


module.exports = () => {
    const plugins = originalWebpackConfig.plugins || [];

    originalWebpackConfig.plugins = [
      ...plugins,
      new EnvironmentSuffixPlugin({
        ext: 'ts',
        suffix: process.env.NODE_ENV || 'dev'
      })
    ];

    return originalWebpackConfig;
}
```