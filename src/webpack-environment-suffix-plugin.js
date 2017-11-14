/**
 * Returns function that checks path agains set of arrays
 * @param {RegExp[]} regexps
 * @return (path: string) => boolean
 */
const regexps2function = regexps => path =>
  Array.isArray(regexps)
    ? regexps.some(regexp => regexp.test(path))
    : regexps.test(path);

/**
 * Returns function that is used by reolver to search env dependent files 
 * @param {string} outputFormat 
 * @param {string} suffix 
 */
const formart2function = (outputFormat, suffix) => {
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
    excludeRequest = [/^[^\.]/],
    output = '[name].[suffix]',
    test = new RegExp(`${suffix}\\.(${ext})$`),
    excludeContext = [/node_modules/]
  }) {
    this.ext = ext;
    this.suffix = suffix;
    this.excludeRequest = prop2func(excludeRequest, () =>
      regexps2function(excludeRequest)
    );
    this.excludeContext = prop2func(excludeContext, () =>
      regexps2function(excludeContext)
    );
    this.output = prop2func(output, () =>
      formart2function(output, this.suffix, this.ext)
    );
  }

  checkRequest(fs, { request, context }) {
    if (this.excludeContext(context) || this.excludeRequest(request)) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      const file = fs.join(context, request);
      const newFileName = this.output(file);

      //readfile to check if it's <env> dependent version exist
      fs.fileSystem.readFile(
        `${newFileName}.${this.ext}`,
        (error, response) => (error ? reject() : resolve(newFileName))
      );
    }).then(newModule => {
      console.log(`Resolve ${request} => ${newModule}`);
      return newModule;
    });
  }

  /**
   * This method should be defined in order to work as webpack plugin
   */
  apply(compiler) {
    compiler.plugin('normal-module-factory', nmf => {
      console.log(`Resolve suffix ${this.suffix} for files *.${this.ext}`);
      const fs = nmf.resolvers.normal;
      nmf.plugin('before-resolve', (r, c) =>
        this.checkRequest(fs, r).then(
          newModule => /*  */ c(null, { ...r, request: newModule }),
          () => /* proceed with regular flow */ c(null, r)
        )
      );
    });
  }
}

module.exports = EnvironmentSuffixPlugin;
