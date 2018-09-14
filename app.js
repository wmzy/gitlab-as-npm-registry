const config = require('config');
const _ = require('lodash/fp');
const logger = require('pino')();
const Koa = require('koa');
const pino = require('koa-pino-logger');
const bodyParser = require('koa-bodyparser');
const route = require('koa-path-match')({/* options passed to path-to-regexp */})
const util = require('./util');

const Backend = require(`./backend/${config.get('backend')}`);

const app = new Koa();
app.use(pino());
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
  const backend = new Backend(config, getAuthToken(ctx.headers));
  ctx.body = await backend.getTarStream(ns, package, tar);
}))

app.use(route('/:package', async ctx => {
  const package = ctx.params.package;

  const backend = new Backend(config, util.getAuthToken(ctx.headers));
  ctx.body = await backend.getPackage(package);
}))

module.exports = app;
