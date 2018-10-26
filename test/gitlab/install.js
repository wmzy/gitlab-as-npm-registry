const path = require('path');
const {spawn} = require('child_process');
const NPM_CONFIG_USERCONFIG = path.join(__dirname, '../fixtures/.npmrc');

function runNpm(...arg) {
  const npm = spawn('npm', arg, {
    env: {...process.env, NPM_CONFIG_USERCONFIG},
    cwd: path.join(__dirname, '../../tmp')
  });

  npm.stdout.on('data', data => console.log(data.toString()));
  npm.stderr.on('data', data => console.error(data.toString()));

  return new Promise((resolve, reject) => {
    npm.on('close', code => {
      if (code) return reject(new Error('process exit with ' + code));
      resolve();
    });
  });
}

describe('GitLab Backend', function() {
  this.timeout(5000);

  before(function(done) {
    // start server
    this.server = spawn('node', [
      '-r',
      path.join(__dirname, '../mock/gitlab-server.js'),
      'server.js'
    ]);
    this.server.stdout.on('data', data => {
      console.log(data.toString());
      if (data.toString().includes('app started')) done();
    });
    this.server.stderr.on('data', data => console.error(data.toString()));

    this.server.on('close', code =>
      done(new Error(`server start error: ${code}`))
    );
  });

  describe('#install', function() {
    it('should install latest package success', function() {
      return runNpm('i', '@gitlab/a', '--userconfig', NPM_CONFIG_USERCONFIG);
    });
  });
});
