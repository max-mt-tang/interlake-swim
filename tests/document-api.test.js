import test from 'node:test';
import assert from 'node:assert/strict';
import upload from '../api/upload-document.js';
const res = () => ({code:200,setHeader(){},status(c){this.code=c;return this},json(v){this.value=v;return this},end(){return this}});
test('PDF authorization, validation and sharing boundaries',async t=>{
 const oldFetch=globalThis.fetch;const env={...process.env};
 for(const key of ['CLIENT_ID','CLIENT_SECRET','REFRESH_TOKEN','FOLDER_ID'])process.env['GOOGLE_DRIVE_'+key]='test';
 let file={name:'results.pdf',mimeType:'application/pdf',size:'1000',parents:['test'],appProperties:{site:'interlake-swim-pdf',editor:'editor1'}};
 let signature='%PDF-',shared=false;
 const setup=()=>{shared=false;globalThis.fetch=async(url,opts)=>{
  if(url.includes('identitytoolkit'))return Response.json({users:[{localId:'editor1',email:'maxmttang@gmail.com',emailVerified:true}]});
  if(url.includes('oauth2'))return Response.json({access_token:'test',expires_in:3600});
  if(url.includes('/permissions')){shared=true;assert.equal(JSON.parse(opts.body).role,'reader');return Response.json({id:'permission'});}
  if(url.includes('alt=media'))return new Response(signature,{status:206});
  if(url.includes('uploadType'))return new Response(null,{status:200,headers:{Location:'https://www.googleapis.com/upload/drive/v3/files?upload_id=test'}});
  return Response.json(file);
 }};
 const call=async body=>{const r=res();await upload({method:'POST',headers:{authorization:'Bearer test'},body},r);return r};
 try {
  await t.test('anonymous upload rejected',async()=>{globalThis.fetch=()=>{throw Error()};const r=res();await upload({method:'POST',headers:{},body:{}},r);assert.equal(r.code,401)});
  setup();
  await t.test('10MB limit enforced',async()=>{assert.equal((await call({name:'a.pdf',size:10000001})).code,400)});
  await t.test('non PDF filename rejected',async()=>{assert.equal((await call({name:'a.html',size:100})).code,400)});
  await t.test('10MB session supported without proxying content',async()=>{const r=await call({name:'results.pdf',size:10000000});assert.equal(r.code,201);assert.ok(r.value.uploadUrl)});
  await t.test('other folder cannot be shared',async()=>{file.parents=['other'];assert.equal((await call({id:'validfileid123'})).code,403);assert.equal(shared,false);file.parents=['test']});
  await t.test('other editor file cannot be shared',async()=>{file.appProperties.editor='other';assert.equal((await call({id:'validfileid123'})).code,403);file.appProperties.editor='editor1'});
  await t.test('fake PDF cannot be shared',async()=>{signature='<html';assert.equal((await call({id:'validfileid123'})).code,400);assert.equal(shared,false);signature='%PDF-'});
  await t.test('valid team PDF gets reader link',async()=>{const r=await call({id:'validfileid123'});assert.equal(r.code,200);assert.equal(shared,true);assert.equal(r.value.url,'https://drive.google.com/file/d/validfileid123/view')});
 }finally{globalThis.fetch=oldFetch;for(const key of ['CLIENT_ID','CLIENT_SECRET','REFRESH_TOKEN','FOLDER_ID']){const name='GOOGLE_DRIVE_'+key;if(env[name]===undefined)delete process.env[name];else process.env[name]=env[name]}}
});
