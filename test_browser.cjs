const http = require('node:http');
const {spawn} = require('node:child_process');
const assert = require('node:assert/strict');
const server = http.createServer((req,res) => {res.setHeader('Content-Type','text/html');res.end('<html><body><img src="data:image/png;base64,iVBORw0KGgo="><button></button></body></html>');});
server.listen(0, '127.0.0.1', () => {
 const url = `http://127.0.0.1:${server.address().port}`;
 const child = spawn(process.execPath,['axe_runner.cjs',url],{env:{...process.env,NEXUS_AUDIT_ORIGINS:url}});
 let data=''; child.stdout.on('data', b=>data+=b);
 child.on('error', err=>{console.error(err.message);process.exitCode=1;server.close();});
 child.on('close', code=>{try {assert.equal(code,0);const result=JSON.parse(data);assert.equal(result.success,true);assert.equal(result.accessibility_pass,false);assert.ok(result.issues.some(x=>x.id==='button-name'));console.log('PASS: real Chromium/axe detected unlabeled button');}catch(e){console.error(e.message);process.exitCode=1;}finally{server.close();}});
});
