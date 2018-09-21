const unzip = require('unzip');
const _ = require('lodash/fp');
const Gitlab = require('./gitlab-client');

module.exports = class Backend {
  constructor(config, token) {
    this.client = new Gitlab(config.get('baseURL'), token);
  }

  getTarStream(ns, pkg, tar) {
    const version = 'v' + _.last(tar.split('-')).slice(0, -4);
    return this.client
      .downloadArtifacts(`${ns.slice(1)}/${pkg}`, version, 'pack')
      .then(
        res =>
          new Promise(resolve => res.pipe(unzip.Parse()).on('entry', resolve))
      );
  }

  getPackage(pkg) {
    return this.client.projectTags(pkg.slice(1)).then(tags => ({
      _id: pkg,
      name: pkg,
      'dist-tags': {
        latest: tags[0].name.slice(1)
      },
      versions: tags.reduce((previous, current) => {
        const v = current.name.slice(1);
        previous[v] = {
          _id: pkg + '@' + v,
          name: pkg,
          version: v,
          dist: {
            tarball: `http://localhost:3000/${pkg}/-/${
              pkg.split('/')[1]
            }-${v}.tgz`
          }
        };
        return previous;
      }, {})
    }));
  }
};
