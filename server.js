const unzip = require('unzip');
const _ = require('lodash/fp');
const querystring = require('querystring')
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const route = require('koa-path-match')({/* options passed to path-to-regexp */})
const Gitlab = require('./gitlab-client');

const gitlabURL = process.env.GITLAB_URL

const app = new Koa();
app.use(bodyParser());

app.use(async (ctx, next) => {
  console.log(ctx.method, ctx.request.url)
  console.log(ctx.headers)
  console.log(ctx.request.body)
  await next();
});

app.use(route('/-/user/org.couchdb.user:username', ctx => {
  const username = ctx.params.username
  console.log('username', username)

  ctx.body = '';
}))

app.use(route('/:ns/:package/-/:tar', async ctx => {
  const ns = ctx.params.ns;
  const package = ctx.params.package;
  const tar = ctx.params.tar;
  const version = 'v' + _.last(tar.split('-')).slice(0, -4);
  const auth = ctx.headers.authorization.split(' ')[1];
  const gitlabToken = new Buffer(auth, 'base64').toString().split(':')[1]
  console.log('gitlabToken', gitlabToken)
  const gitlabClient = new Gitlab(
    gitlabURL,
    gitlabToken
  );
  const res = await gitlabClient.downloadArtifacts(`${ns.slice(1)}/${package}`, version, 'pack')

  ctx.body = await new Promise(resolve =>
    res.pipe(unzip.Parse()).on('entry', resolve)
  );
}))

app.use(route('/:package', async ctx => {
  const package = ctx.params.package;
  const auth = ctx.headers.authorization.split(' ')[1];
  const gitlabToken = new Buffer(auth, 'base64').toString().split(':')[1]
  console.log('gitlabToken', gitlabToken)
  const gitlabClient = new Gitlab(gitlabURL, gitlabToken);
  console.log(querystring.escape(package.slice(1)))
  const tags = await gitlabClient.projectTags(package.slice(1))
  console.log('tags', tags)
  console.log('package', package)

  ctx.body = {
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
}))

app.listen(3000);

console.log('http://localhost:3000')
