const assert=require('node:assert/strict');
const test=require('node:test');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const requireOwner=createRequire(process.cwd()+'/package.json');
const serialize=requireOwner('serialize-javascript');
test('ordinary functions, regexp/date cache keys and HTML-safe text retain their meaning',()=>{
 const input={text:'</script>',pattern:/ordinary/gi,date:new Date('2026-01-01T00:00:00.000Z'),fn:function ordinary(){return 'ordinary';}};
 for(const options of [{},{unsafe:true}]){
  const encoded=serialize(input,options);
  const result=vm.runInNewContext('('+encoded+')');
  assert.equal(result.text,input.text);assert.equal(result.pattern.source,input.pattern.source);
  assert.equal(result.pattern.flags,input.pattern.flags);assert.equal(result.date.toISOString(),input.date.toISOString());
  assert.equal(result.fn(),'ordinary');
  if(!options.unsafe)assert.equal(encoded.includes('</script>'),false);
 }
});
