import {randomUUID} from 'node:crypto';
import {editor, driveToken, fail} from '../lib/drive.js';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await editor(req);
    const encoded = req.body?.image;
    if (typeof encoded !== 'string' || encoded.length > 1400000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(encoded)) return res.status(400).json({error:'Choose a photo smaller than 1 MB after resizing.'});
    const bytes = Buffer.from(encoded.split(',')[1],'base64');
    if (bytes.length > 1000000 || bytes[0]!==255 || bytes[1]!==216 || bytes[bytes.length-2]!==255 || bytes[bytes.length-1]!==217) return res.status(400).json({error:'The photo must be a valid JPEG.'});
    const token = await driveToken();
    const boundary = 'swim_'+randomUUID();
    const metadata = {name:`swim-${randomUUID()}.jpg`,mimeType:'image/jpeg',parents:[process.env.GOOGLE_DRIVE_FOLDER_ID],appProperties:{site:'interlake-swim'}};
    const payload = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`),bytes,Buffer.from(`\r\n--${boundary}--`)]);
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{
      method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body:payload,signal:AbortSignal.timeout(25000)
    });
    if (!response.ok) throw Error('upload');
    const file = await response.json();
    res.status(201).json({url:`/api/photo?id=${file.id}`});
  } catch(error) { fail(res,error); }
}
