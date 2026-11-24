import {editor,configured,fail} from '../lib/drive.js';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method!=='GET') return res.status(405).end();
  try { await editor(req); res.json({configured:configured()}); } catch(error){fail(res,error);}
}
