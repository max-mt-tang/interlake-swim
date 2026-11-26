import { auth } from './firebase-client.js';
import { editorEmails, passwordEditorEmails } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
const names = {
  'maxmttang@gmail.com': 'Max', 's-tangm@bsd405.org': 'Max',
  'rayshinetang@gmail.com': 'Ray', 's-tangra@bsd405.org': 'Ray',
  'riverae@bsd405.org': 'Coach Eberth'
};
if (auth) onAuthStateChanged(auth, user => {
  const email = user?.email?.toLowerCase();
  const editor = editorEmails.includes(email) && (user?.emailVerified ||
    (passwordEditorEmails.includes(email) && user.providerData.some(provider => provider.providerId === 'password')));
  document.body.classList.toggle('signed-in-editor', editor);
  document.querySelector('#editor-session').hidden = !editor;
  document.querySelector('#editor-identity').textContent = editor ? `Signed in as ${names[email] || email} · ${email}` : '';
  const nav = document.querySelector('.nav-post');
  if (nav) nav.lastChild.textContent = editor ? 'Manage posts' : 'Coach to post';
  document.querySelectorAll('a[href="admin.html"]').forEach(link => {
    if (link.textContent.trim() === 'Sign in to post updates' || link.dataset.sessionLink) {
      link.dataset.sessionLink = 'true';
      link.textContent = editor ? 'Manage posts →' : 'Sign in to post updates';
    }
  });
});
