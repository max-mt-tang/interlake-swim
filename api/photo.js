import {driveToken, validId, fail} from '../lib/drive.js';
export default async function handler(req,res) {
  if (req.method !== 'GET') return res.status(405).end();
  const id = req.query.id;
  if (!validId(id)) return res.status(400).end();
  try {
    const token = await driveToken();
    const headers={Authorization:`Bearer ${token}`};
    const meta = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=mimeType,parents,appProperties,trashed,size`,{headers,signal:AbortSignal.timeout(10000)});
    if (!meta.ok) return res.status(404).end();
    const file = await meta.json();
    if (file.trashed || file.mimeType !== 'image/jpeg' || Number(file.size)>1000000 || !file.parents?.includes(process.env.GOOGLE_DRIVE_FOLDER_ID) || file.appProperties?.site !== 'interlake-swim') return res.status(404).end();
    const media = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`,{headers,signal:AbortSignal.timeout(15000)});
    if (!media.ok) throw Error('download');
    res.setHeader('Content-Type','image/jpeg');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600');
    res.status(200).send(Buffer.from(await media.arrayBuffer()));
  } catch(error) { fail(res,error); }
}
