export async function uploadPhoto(file, token) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 15000000) throw Error('Choose a JPG, PNG, or WebP photo under 15 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    let image = canvas.toDataURL('image/jpeg', .8);
    if (image.length > 1300000) image = canvas.toDataURL('image/jpeg', .55);
    if (image.length > 1300000) throw Error('This photo is too large. Please choose a smaller version.');
    const response = await fetch('/api/upload-photo',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({image}),signal:AbortSignal.timeout(45000)});
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'Upload failed. Please try again.');
    if (!/^\/api\/photo\?id=[A-Za-z0-9_-]{10,150}$/.test(result.url)) throw Error('Upload returned an invalid photo.');
    return result.url;
  } finally { bitmap.close(); }
}
