const CHUNK_SIZE = 1024 * 1024;
function encodeChunk(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(Error('Could not read the PDF. Please try again.'));
    reader.readAsDataURL(blob);
  });
}
export async function uploadDocument(file, token, onProgress = () => {}) {
  if (!file.name.toLowerCase().endsWith('.pdf') || !file.size || file.size>10000000 || await file.slice(0,5).text() !== '%PDF-') throw Error('Choose a valid PDF up to 10 MB.');
  const request = async body => {
    const response = await fetch('/api/upload-document',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'PDF upload failed. Please try again.');
    return result;
  };
  const {uploadUrl} = await request({name:file.name,size:file.size});
  if (!uploadUrl?.startsWith('https://www.googleapis.com/upload/drive/')) throw Error('Invalid upload destination.');
  let id;
  for (let offset = 0; offset < file.size;) {
    const data = await encodeChunk(file.slice(offset, Math.min(offset + CHUNK_SIZE, file.size)));
    const result = await request({uploadUrl,offset,size:file.size,data});
    if (result.id) { id = result.id; break; }
    if (!Number.isInteger(result.nextOffset) || result.nextOffset <= offset || result.nextOffset > file.size) throw Error('PDF upload stopped. Please try again.');
    offset = result.nextOffset;
    onProgress(Math.round(offset / file.size * 100));
  }
  if (!/^[A-Za-z0-9_-]{10,150}$/.test(id || '')) throw Error('Invalid document response.');
  return request({id});
}
