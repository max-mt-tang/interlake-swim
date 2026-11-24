/* Shared structured post format. Never render stored text as HTML. */
(() => {
  const PREFIX = 'IHS_RICH_V1\n';
  const safeImage = value => typeof value === 'string' && /^\/api\/photo\?id=[A-Za-z0-9_-]{10,150}$/.test(value);
  function safeLink(value) {
    try { const u = new URL(value); return ['https:', 'mailto:'].includes(u.protocol) ? u.href : null; }
    catch { return null; }
  }
  function decode(body) {
    if (!body?.startsWith(PREFIX)) return {ops: [{insert: (body || '') + '\n'}]};
    try {
      const parsed = JSON.parse(body.slice(PREFIX.length));
      if (!Array.isArray(parsed.ops)) throw Error();
      return {ops: parsed.ops.filter(op => typeof op.insert === 'string' || safeImage(op.insert?.image)).map(op => ({insert: op.insert, attributes: op.attributes || {}}))};
    } catch { return {ops: [{insert: 'This update could not be displayed.\n'}]}; }
  }
  function render(target, body) {
    target.replaceChildren();
    const plainText = !body?.startsWith(PREFIX);
    let line = [], list = null;
    function flush(attributes = {}) {
      if (plainText && !line.length) return;
      let block;
      if (['bullet', 'ordered'].includes(attributes.list)) {
        const tag = attributes.list === 'bullet' ? 'UL' : 'OL';
        if (!list || list.tagName !== tag) { list = document.createElement(tag); target.append(list); }
        block = document.createElement('li'); list.append(block);
      } else {
        list = null;
        block = document.createElement([1,2].includes(attributes.header) ? 'h' + (attributes.header + 2) : 'p');
        target.append(block);
      }
      if (!line.length) block.append(document.createElement('br'));
      for (const {text, attrs} of line) {
        let node = document.createTextNode(text);
        for (const [key, tag] of [['bold','strong'],['italic','em'],['underline','u']]) {
          if (attrs[key]) { const parent = document.createElement(tag); parent.append(node); node = parent; }
        }
        const href = safeLink(attrs.link);
        if (href) { const a = document.createElement('a'); a.href = href; a.rel = 'noopener noreferrer'; a.target = '_blank'; a.append(node); node = a; }
        block.append(node);
      }
      line = [];
    }
    for (const op of decode(body).ops) {
      if (typeof op.insert !== 'string') {
        if (line.length) flush();
        list = null;
        const image = document.createElement('img');
        image.src = op.insert.image;
        image.alt = 'Photo shared in the team update';
        image.loading = 'lazy';
        target.append(image);
        continue;
      }
      const parts = op.insert.split('\n');
      parts.forEach((part, i) => {
        if (part) line.push({text: part, attrs: op.attributes || {}});
        if (i < parts.length - 1) flush(op.attributes);
      });
    }
    if (line.length) flush();
  }
  window.SwimContent = {decode, render, encode: delta => PREFIX + JSON.stringify(delta)};
})();
