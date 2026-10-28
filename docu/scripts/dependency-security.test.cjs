const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const {EventEmitter} = require('node:events');
const {createRequire} = require('node:module');
const req = createRequire(process.cwd() + '/package.json');
const launch = req('launch-editor');
const spawn = cp.spawn, exec = cp.exec, exists = fs.existsSync;
const platform = Object.getOwnPropertyDescriptor(process, 'platform');
const resolve = path.resolve;
const directory = fs.mkdtempSync(path.join(os.tmpdir(),'editor-normal-'));
const file = path.join(directory,'normal file.js');fs.writeFileSync(file,'normal');
let calls = [], checks = 0, rejected;
try {
 cp.spawn = (...args) => { calls.push(args); return new EventEmitter(); };
 cp.exec = (...args) => { calls.push(args); return new EventEmitter(); };
 launch(file + ':3:2', 'code', () => { throw Error('normal editor control rejected'); });
 assert.equal(calls.length,1);
 if (platform.value === 'win32') {
  assert.ok(calls[0][0].includes('code'));
  assert.ok(calls[0][0].includes('normal file.js'));
 } else {
  assert.equal(calls[0][0],'code');
  assert.ok(calls[0][1].some(value => value.includes(file)));
 }
 calls=[];fs.existsSync = value => { checks++;return exists(value); };
 Object.defineProperty(process,'platform',{...platform,value:'win32'});
 if (platform.value !== 'win32') path.resolve = (...args) => path.win32.resolve(...args);
 launch('\\\\server\\share\\normal.js','code',(_file,message) => { rejected=message; });
 assert.match(rejected,/UNC paths are not supported/);assert.equal(checks,0);assert.equal(calls.length,0);
 console.log('PASS normal path/line/column preserved with mocked process; Windows UNC rejected before filesystem access; no editor/shell/network launched');
} finally {
 Object.defineProperty(process,'platform',platform);path.resolve=resolve;cp.spawn=spawn;cp.exec=exec;fs.existsSync=exists;fs.rmSync(directory,{recursive:true,force:true});
}
