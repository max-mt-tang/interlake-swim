export async function uploadDocument(file, token) {
  if (!file.name.toLowerCase().endsWith('.pdf') || !file.size || file.size>10000000 || await file.slice(0,5).text() !== '%PDF-') throw Error('Choose a valid PDF up to 10 MB.');
  const request = async body => {
    const response = await fetch('/api/upload-document',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'PDF upload failed. Please try again.');
    return result;
  };
  const {uploadUrl} = await request({name:file.name,size:file.size});
  if (!uploadUrl?.startsWith('https://www.googleapis.com/upload/drive/')) throw Error('Invalid upload destination.');
  // Upload directly to a single-file session; no Drive access token reaches the browser.
  const uploaded = await fetch(uploadUrl,{method:'PUT',headers:{'Content-Type':'application/pdf'},body:file,signal:AbortSignal.timeout(120000)});
  if (!uploaded.ok) throw Error('PDF upload failed. Please try again.');
  const {id} = await uploaded.json();
  if (!/^[A-Za-z0-9_-]{10,150}$/.test(id || '')) throw Error('Invalid document response.');
  return request({id});
}
