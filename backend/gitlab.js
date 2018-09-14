const unzip = require('unzip');
const Gitlab = require('./gitlab-client');

module.exports = class Backend {
  constructor(config, token) {
    this.client = new Gitlab(config.get('baseURL'), token);
  }

  getTarStream(ns, package, tar) {
    const version = 'v' + _.last(tar.split('-')).slice(0, -4);
    return this.client.downloadArtifacts(`${ns.slice(1)}/${package}`, version, 'pack')
      .then(res => new Promise(resolve => res.pipe(unzip.Parse()).on('entry', resolve)));
  }

  getPackage(package) {
    return this.client.projectTags(package.slice(1))
      .then(tags => (
        {
          _id: package,
          name: package,
          'dist-tags': {
            latest: tags[0].name.slice(1)
          },
          versions: tags.reduce((previous, current) => {
            const v = current.name.slice(1);
            previous[v] = {
              _id: package + '@' + v,
              name: package,
              version: v,
              dist: {
                tarball: `http://localhost:3000/${package}/-/${package.split('/')[1]}-${v}.tgz`
              },
            }
            return previous;
          }, {})
        }
      ));
  }
}
