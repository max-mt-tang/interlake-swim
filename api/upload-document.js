import {editor, driveToken, validId, fail} from '../lib/drive.js';
const MAX = 10000000;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const user = await editor(req);
    const {id, name, size} = req.body || {};
    const token = await driveToken();
    const headers = {Authorization: `Bearer ${token}`};
    if (id !== undefined) {
      if (!validId(id)) return res.status(400).json({error:'Invalid document.'});
      const meta = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=name,mimeType,size,parents,appProperties,trashed`, {headers, signal:AbortSignal.timeout(10000)});
      if (!meta.ok) return res.status(404).end();
      const file = await meta.json();
      if (file.trashed || file.mimeType !== 'application/pdf' || !(Number(file.size)>0 && Number(file.size)<=MAX) || !file.parents?.includes(process.env.GOOGLE_DRIVE_FOLDER_ID) || file.appProperties?.site !== 'interlake-swim-pdf' || file.appProperties?.editor !== user.localId) return res.status(403).json({error:'This document is not an eligible team PDF.'});
      const head = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {headers:{...headers,Range:'bytes=0-4'},signal:AbortSignal.timeout(10000)});
      if (head.status !== 206 || await head.text() !== '%PDF-') return res.status(400).json({error:'The file must be a valid PDF.'});
      const permission = await fetch(`https://www.googleapis.com/drive/v3/files/${id}/permissions`, {method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({type:'anyone',role:'reader',allowFileDiscovery:false}),signal:AbortSignal.timeout(10000)});
      if (!permission.ok) throw Error('sharing');
      return res.status(200).json({url:`https://drive.google.com/file/d/${id}/view`,name:file.name});
    }
    if (typeof name !== 'string' || !name.toLowerCase().endsWith('.pdf') || name.length>180 || /[\x00-\x1f/\\]/.test(name) || !Number.isInteger(size) || size<=0 || size>MAX) return res.status(400).json({error:'Choose a PDF up to 10 MB.'});
    const session = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', {method:'POST',headers:{...headers,'Content-Type':'application/json','X-Upload-Content-Type':'application/pdf','X-Upload-Content-Length':String(size)},body:JSON.stringify({name,mimeType:'application/pdf',parents:[process.env.GOOGLE_DRIVE_FOLDER_ID],appProperties:{site:'interlake-swim-pdf',editor:user.localId}}),signal:AbortSignal.timeout(10000)});
    const uploadUrl = session.headers.get('location');
    if (!session.ok || !uploadUrl?.startsWith('https://www.googleapis.com/upload/drive/')) throw Error('session');
    return res.status(201).json({uploadUrl});
  } catch(error) { fail(res,error); }
}
