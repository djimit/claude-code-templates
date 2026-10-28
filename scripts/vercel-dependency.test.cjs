const assert = require('node:assert/strict');
const test = require('node:test');
const {createRequire} = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const owner = createRequire(require.resolve('@vercel/node'));

test('Vercel externally resolved dependencies preserve normal forwarding, config and routes', async () => {
  assert.equal(owner('undici/package.json').version, '6.29.1');
  assert.equal(owner('path-to-regexp/package.json').version, '6.3.0');
  const {MockAgent, request, Headers} = owner('undici');
  const dispatcher = new MockAgent();
  dispatcher.disableNetConnect();
  try {
    dispatcher.get('https://fixture.invalid').intercept({path:'/ordinary', method:'POST', body:'normal'}).reply(201, 'accepted');
    const response = await request('https://fixture.invalid/ordinary', {method:'POST', body:'normal', headers:new Headers({'content-type':'text/plain'}), dispatcher});
    assert.equal(response.statusCode, 201);
    assert.equal(await response.body.text(), 'accepted');
    dispatcher.assertNoPendingInterceptors();
  } finally { await dispatcher.close(); }
  const configOwner = createRequire(owner.resolve('@vercel/static-config'));
  assert.ok(Number(configOwner('ajv/package.json').version.split('.')[1]) >= 18);
  const {validate} = configOwner('./validation.js');
  const schema = {type:'object', properties:{memory:{type:'number'}}, required:['memory']};
  assert.deepEqual(validate(schema, {memory:128}), {memory:128});
  assert.throws(() => validate(schema, {memory:'invalid'}), /Invalid data/);
  const {pathToRegexp, match} = owner('path-to-regexp');
  let count = 0;
  for (const file of ['vercel.json','docs/vercel.json','docu/vercel.json']) {
    for (const route of JSON.parse(fs.readFileSync(path.join(process.cwd(), file))).rewrites || []) {
      assert.ok(pathToRegexp(route.source) instanceof RegExp);
      count++;
    }
  }
  assert.equal(count, 22);
  assert.equal(match('/plugin/:name')('/plugin/ordinary').params.name, 'ordinary');
  assert.deepEqual(Array.from(match('/component/:type/:name*')('/component/agent/one/two').params.name), ['one','two']);
  // shortcut: build-utils embeds its own old matcher; this external-copy control cannot prove that bundle fixed.
});
