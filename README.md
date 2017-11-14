## webpack-environment-suffix-plugin

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configure-webpack)
- [Ionic](#ionic--380)
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

## Ionic >= 3.8.0
This package might be configured to be used with `ionic`.

- Create new `webpack.config.js` file
```js
├── webpack.config.js

const originalWebpackConfig = require('@ionic/app-scripts/config/webpack.config');
const EnvironmentSuffixPlugin = require('webpack-environment-suffix-plugin');


module.exports = env => {
    const plugins = originalWebpackConfig[env].plugins || [];

    originalWebpackConfig[env].plugins = [
      ...plugins,
      new EnvironmentPlugin({
        ext: 'ts',
        suffix: /*process.env.NODE_ENV || 'dev'*/ env
      })
    ];

    return originalWebpackConfig;
}
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
      new EnvironmentPlugin({
        ext: 'ts',
        suffix: process.env.NODE_ENV || 'dev'
      })
    ];

    return originalWebpackConfig;
}
```