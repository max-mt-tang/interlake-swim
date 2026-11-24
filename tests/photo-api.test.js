import test from 'node:test';
import assert from 'node:assert/strict';
import photo from '../api/photo.js';
import upload from '../api/upload-photo.js';
const originalFetch = globalThis.fetch;
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.code=c;return this},json(v){this.value=v;return this},send(v){this.value=v;return this},end(){return this}};}
test('photo API authorization and folder boundaries',async t=>{
  const originalEnv = {...process.env};
  for (const key of ['CLIENT_ID','CLIENT_SECRET','REFRESH_TOKEN','FOLDER_ID']) process.env['GOOGLE_DRIVE_'+key]='test-only';
  try {
    await t.test('unauthenticated uploads never contact Drive',async()=>{
      globalThis.fetch=()=>{throw Error('must not fetch')};
      const res=response();await upload({method:'POST',headers:{},body:{}},res);assert.equal(res.code,401);
    });
    await t.test('unverified accounts cannot upload',async()=>{
      globalThis.fetch=async()=>Response.json({users:[{email:'s-tangm@bsd405.org',emailVerified:false}]});
      const res=response();await upload({method:'POST',headers:{authorization:'Bearer fake'},body:{}},res);assert.equal(res.code,403);
    });
    await t.test('non-editor accounts cannot upload',async()=>{
      globalThis.fetch=async()=>Response.json({users:[{email:'outsider@example.com',emailVerified:true}]});
      const res=response();await upload({method:'POST',headers:{authorization:'Bearer fake'},body:{}},res);assert.equal(res.code,403);
    });
    await t.test('invalid photo ids are rejected without fetching',async()=>{
      globalThis.fetch=()=>{throw Error('must not fetch')};
      const res=response();await photo({method:'GET',query:{id:'../private'}},res);assert.equal(res.code,400);
    });
    await t.test('files outside the team folder are never served',async()=>{
      globalThis.fetch=async url=>{
        if(url.includes('oauth2'))return Response.json({access_token:'test-only',expires_in:3600});
        assert.ok(!url.includes('alt=media'));
        return Response.json({mimeType:'image/jpeg',parents:['another-folder'],appProperties:{site:'interlake-swim'},size:'100'});
      };
      const res=response();await photo({method:'GET',query:{id:'validfileid123'}},res);assert.equal(res.code,404);
    });
    await t.test('SVGs in the folder cannot be served as photos',async()=>{
      globalThis.fetch=async()=>Response.json({mimeType:'image/svg+xml',parents:['test-only'],appProperties:{site:'interlake-swim'},size:'100'});
      const res=response();await photo({method:'GET',query:{id:'validfileid123'}},res);assert.equal(res.code,404);
    });
  } finally {globalThis.fetch=originalFetch;for(const key of ['CLIENT_ID','CLIENT_SECRET','REFRESH_TOKEN','FOLDER_ID']){const name='GOOGLE_DRIVE_'+key;if(originalEnv[name]===undefined)delete process.env[name];else process.env[name]=originalEnv[name];}}
});
