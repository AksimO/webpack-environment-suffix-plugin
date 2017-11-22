/**
 * Returns function that checks path against set of arrays
 * @param {RegExp[]} regexps
 * @return (path: string) => boolean
 */
const regexps2function = regexps => path =>
  regexps.length && regexps.some(regexp => regexp.test(path));

/**
* Returns function that is used by resolver to search env dependent files 
* @param {string} outputFormat 
* @param {string} suffix 
*/
const format2function = (outputFormat, suffix) => {
  const fileRegexp = /(.+)[\\/]([^\\/]+)$/;
  return requestName => {
    const match = requestName.match(fileRegexp);
    return match === null
      ? requestName
      : `${match[1]}/${outputFormat
          .replace('[name]', match[2])
          .replace('[suffix]', suffix)}`;
  };
};

const prop2func = (prop, fn) => (typeof prop === 'function' ? prop : fn());

class EnvironmentSuffixPlugin {
  constructor({
    ext = 'js',
    suffix = process.env.NODE_ENV,
    include = [new RegExp(`.+${ext}$`)],
    exclude = [/node_modules/],
    pattern = '[name].[suffix]'
  }) {
    this.ext = ext;
    this.suffix = suffix;
    this.include = prop2func(include, () => regexps2function(include));
    this.exclude = prop2func(exclude, () => regexps2function(exclude));
    this.pattern = prop2func(pattern, () =>
      format2function(pattern, this.suffix, this.ext)
    );
  }

  checkRequest(fs, { request, context }) {
    const moduleName = fs.join(context, request);
    const file = `${moduleName}.${this.ext}`;

    if (!this.include(file) || this.exclude(file)) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      const outputModuleName = this.pattern(moduleName);

      //read file to check if it's <env> dependent version exist
      fs.fileSystem.readFile(
        `${outputModuleName}.${this.ext}`,
        (error, response) => (error ? reject() : resolve(outputModuleName))
      );
    }).then(newModule => {
      console.log(`${request} => ${newModule}`);
      return newModule;
    });
  }

  /**
* This method should be defined in order to work as webpack plugin
*/
  apply(compiler) {
    compiler.plugin('normal-module-factory', nmf => {
      console.log(
        `Resolve suffix ${this.suffix} for file extensions ${this.ext}`
      );
      const fs = nmf.resolvers.normal;
      nmf.plugin('before-resolve', (r, c) =>
        this.checkRequest(fs, r).then(
          newModule => c(null, Object.assign({}, r, { request: newModule })),
          () => /* proceed with regular flow */ c(null, r)
        )
      );
    });
  }
}

module.exports = EnvironmentSuffixPlugin;
