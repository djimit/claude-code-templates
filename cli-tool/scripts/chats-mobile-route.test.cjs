const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');
const {ChatsMobile} = require('../src/chats-mobile');

test('mobile routes register with the owning Express graph and preserve page fallback and API/static exclusions', async () => {
  const app = express();
  ChatsMobile.prototype.setupRoutes.call({app, data:{conversations:[], conversationStates:{}, lastUpdate:'local-control'}});
  const server = await new Promise(resolve => {const active=app.listen(0,'127.0.0.1',()=>resolve(active));});
  try {
    const base = 'http://127.0.0.1:' + server.address().port;
    for (const route of ['/', '/ordinary/nested/page']) {
      const response = await fetch(base + route);
      assert.equal(response.status,200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.ok((await response.text()).length > 100);
    }
    for (const route of ['/api/absent','/services/absent','/components/absent','/assets/absent']) {
      const response = await fetch(base + route);
      assert.equal(response.status,404);
      assert.deepEqual(await response.json(),{error:'Not found'});
    }
    assert.deepEqual((await (await fetch(base + '/api/conversations')).json()).conversations, []);
  } finally {server.closeAllConnections(); await new Promise(resolve=>server.close(resolve));}
});
