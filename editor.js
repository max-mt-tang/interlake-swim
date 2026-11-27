import { uploadDocument } from './document-upload.js';
import { auth, db } from "./firebase-client.js";
import { editorEmails, passwordEditorEmails } from "./firebase-config.js";
import { uploadPhoto } from './photo-upload.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  reload,
  getIdToken,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
let requestedPost = new URLSearchParams(location.search).get("post");
const $ = (s) => document.querySelector(s);
const writer = new Quill('#rich-body', {
  theme: 'snow', placeholder: 'Write your update here…',
  modules: {toolbar: '#format-toolbar', uploader: {handler: () => message('Use Add photo to upload an image.')}},
  formats: ['header', 'bold', 'italic', 'underline', 'list', 'link', 'image'],
});
writer.root.setAttribute('role', 'textbox');
writer.root.setAttribute('aria-labelledby', 'message-label');
writer.root.setAttribute('aria-multiline', 'true');
writer.clipboard.addMatcher('IMG', () => ({ops: []}));
let selected = null,
  revision = null,
  dirty = false,
  saving = false,
  uploading = false,
  currentUser = null;
let parentEmails = [];
const message = (text) => {
  $("#message").textContent = text;
  $("#message").hidden = !text;
};
const allowed = (user) =>
  user &&
  editorEmails.includes(user.email?.toLowerCase()) &&
  (user.emailVerified || (passwordEditorEmails.includes(user.email?.toLowerCase()) &&
    user.providerData.some(provider => provider.providerId === 'password')));
const canEditParentList = user => allowed(user) &&
  ['riverae@bsd405.org', 'rayshinetang@gmail.com', 's-tangra@bsd405.org', 'maxmttang@gmail.com', 's-tangm@bsd405.org'].includes(user.email?.toLowerCase());
function errorMessage(e) {
  const messages = {
    'permission-denied': 'Access denied. Sign in with an approved editor account.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account already uses this email. Sign in or reset your password.',
    'auth/weak-password': 'Choose a password with at least 12 characters.',
    'auth/popup-blocked': 'Allow the sign-in popup, then try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'not-editor': 'Use Max’s, Ray’s, or Coach Eberth’s approved email address.',
    conflict: 'This post changed in another session. Copy your text, refresh the list and reopen the latest version before saving.'
  };
  return messages[e.code] || messages[e.message] || 'Could not complete the request. Check your connection and try again.';
}
async function attempt(fn) {
  try {
    await fn();
  } catch (e) {
    message(errorMessage(e));
  }
}
function emptyForm() {
  selected = null;
  $("#post-list").querySelectorAll("button").forEach(n => n.classList.remove("selected"));
  $("#delete-post").hidden = true;
  $("#new-post").hidden = true;
  revision = null;
  dirty = false;
  $("#post-form").reset();
  writer.setText('', 'silent');
  $("#post-date").value = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  $("#form-heading").textContent = "New update";
  $("#save-state").textContent = "";
}
function askConfirmation(title, description, confirmText, icon = 'trash-2') {
  const dialog = $("#confirm-dialog");
  $("#confirm-title").textContent = title;
  $("#confirm-description").textContent = description;
  $("#confirm-accept span").textContent = confirmText;
  $("#confirm-accept use").setAttribute('href', `assets/icons.svg#${icon}`);
  dialog.returnValue = 'cancel';
  dialog.showModal();
  return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), {once:true}));
}
async function mayDiscard() {
  return !dirty || await askConfirmation('Leave without saving?', 'Your unsaved changes to this update will be lost.', 'Discard changes', 'x');
}
async function listPosts() {
  const snap = await getDocs(collection(db, "posts"));
  if (!allowed(currentUser)) return;
  const rows = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.date.localeCompare(a.date));
  $("#post-list").replaceChildren();
  $("#import-posts").hidden = rows.some(
    (p) => p.id === "weekly-update-2026-11-22",
  );
  if (!rows.length)
    $("#post-list").textContent = "No updates yet. Create the first one.";
  for (const p of rows) {
    const button = document.createElement("button");
    button.type = "button";
    const title = document.createElement("strong");
    title.textContent = p.title;
    const meta = document.createElement("span");
    meta.className = "post-list-meta";
    meta.textContent = (p.published ? "Published" : "Draft") + " · " + p.date;
    button.append(title, meta);
    button.classList.toggle("selected", selected === p.id);
    button.addEventListener("click", async () => {
      if (saving || uploading || !(await mayDiscard())) return;
      $("#post-list").querySelectorAll("button").forEach(n => n.classList.remove("selected"));
      button.classList.add("selected");
      selected = p.id;
      $("#delete-post").hidden = false;
      $("#new-post").hidden = false;
      revision = p.revision;
      $("#title").value = p.title;
      const content = SwimContent.decode(p.body);
      if (p.link) content.ops.push(
        {insert: '\n'},
        {insert: p.link_label || 'Read more', attributes: {link: p.link}},
        {insert: '\n'},
      );
      writer.setContents(content, 'silent');
      $("#post-date").value = p.date;
      $("#category").value = p.category;
      $("#form-heading").textContent = "Edit update";
      $("#save-state").textContent = p.published
        ? "Currently published"
        : "Private draft";
      dirty = false;
    });
    $("#post-list").append(button);
    if (requestedPost === p.id) { requestedPost = null; button.click(); }
  }
}
async function showUser(user) {
  currentUser = user;
  document.body.classList.toggle("auth-screen", !allowed(user));
  $("#editor-title").textContent = allowed(user) ? "Team updates" : "Coach sign-in";
  $("#login").hidden = !!user;
  $("#signout").hidden = !user;
  $("#verification").hidden = true;
  $("#workspace").hidden = true;
  $("#parents-panel").hidden = true;
  $(".editor-layout").hidden = false;
  $("#show-updates").hidden = true;
  $("#show-parents").hidden = !canEditParentList(user);
  if (!user) {
    parentEmails = [];
    $("#parents-list").replaceChildren();
    $("#post-list").replaceChildren();
    emptyForm();
    message("");
    return;
  }
  if (!editorEmails.includes(user.email?.toLowerCase())) {
    message(
      "This account does not have editor access. Please sign out and use your approved email.",
    );
    return;
  }
  if (!allowed(user)) {
    $("#verification").hidden = false;
    message("Verify your email before posting.");
    return;
  }
  $("#workspace").hidden = false;
  message(`Signed in as ${user.email}`);
  await attempt(listPosts);
  try {
    const response = await fetch('/api/photo-status', {headers:{Authorization:`Bearer ${await user.getIdToken()}`}});
    if (!response.ok || !(await response.json()).configured) {
      $('#photo-status').textContent = 'Photo uploads are waiting for Max to connect the team’s Google Drive folder. You can still write and publish text updates.';
    }
  } catch { $('#photo-status').textContent = 'Photo storage is not connected yet. Text updates are ready to use.'; }
}
const validParentEmail = email => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email);
const parentsStatus = text => { $("#parents-status").textContent = text; };
async function listParents() {
  if (!canEditParentList(auth.currentUser)) return;
  const snap = await getDocs(collection(db, 'parentContacts'));
  if (!canEditParentList(auth.currentUser)) return;
  parentEmails = snap.docs.map(item => item.id).sort((a, b) => a.localeCompare(b));
  $("#parents-count").textContent = `(${parentEmails.length})`;
  const list = $("#parents-list");
  list.replaceChildren();
  if (!parentEmails.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No addresses added yet.';
    list.append(empty);
    return;
  }
  for (const email of parentEmails) {
    const row = document.createElement('li');
    const value = document.createElement('span');
    value.textContent = email;
    const edit = document.createElement('button');
    edit.type = 'button'; edit.textContent = 'Edit';
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = 'Remove';
    edit.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'email'; input.value = email;
      input.setAttribute('aria-label', `Correct ${email}`);
      const save = document.createElement('button');
      save.type = 'button'; save.textContent = 'Save';
      const cancel = document.createElement('button');
      cancel.type = 'button'; cancel.textContent = 'Cancel';
      row.replaceChildren(input, save, cancel);
      cancel.addEventListener('click', listParents);
      save.addEventListener('click', () => attempt(async () => {
        if (!canEditParentList(auth.currentUser)) throw Error('not-editor');
        const next = input.value.trim().toLowerCase();
        if (!validParentEmail(next)) { parentsStatus('Enter a valid email address.'); return; }
        if (next === email) { await listParents(); return; }
        if (parentEmails.includes(next)) { parentsStatus('That address is already in the list.'); return; }
        const batch = writeBatch(db);
        batch.set(doc(db, 'parentContacts', next), {email: next, createdAt: serverTimestamp()});
        batch.delete(doc(db, 'parentContacts', email));
        await batch.commit();
        parentsStatus('Email address updated.');
        await listParents();
      }));
      input.focus();
    });
    remove.addEventListener('click', () => attempt(async () => {
      if (!canEditParentList(auth.currentUser)) throw Error('not-editor');
      if (!(await askConfirmation('Remove parent email?', `${email} will be removed from the private list.`, 'Remove email'))) return;
      await deleteDoc(doc(db, 'parentContacts', email));
      parentsStatus('Email address removed.');
      await listParents();
    }));
    row.append(value, edit, remove);
    list.append(row);
  }
}
$("#show-parents").addEventListener('click', () => attempt(async () => {
  if (!canEditParentList(auth.currentUser) || !(await mayDiscard())) return;
  $(".editor-layout").hidden = true;
  $("#parents-panel").hidden = false;
  $("#show-parents").hidden = true;
  $("#show-updates").hidden = false;
  $("#editor-title").textContent = 'Parent emails';
  await listParents();
}));
$("#show-updates").addEventListener('click', () => {
  $("#parents-panel").hidden = true;
  $(".editor-layout").hidden = false;
  $("#show-parents").hidden = !canEditParentList(auth.currentUser);
  $("#show-updates").hidden = true;
  $("#editor-title").textContent = 'Team updates';
});
$("#refresh-parents").addEventListener('click', () => attempt(listParents));
$("#copy-parents").addEventListener('click', () => attempt(async () => {
  if (!canEditParentList(auth.currentUser)) throw Error('not-editor');
  await navigator.clipboard.writeText(parentEmails.join('; '));
  parentsStatus(`Copied ${parentEmails.length} email addresses.`);
}));
$("#add-parents-form").addEventListener('submit', event => {
  event.preventDefault();
  attempt(async () => {
    if (!canEditParentList(auth.currentUser)) throw Error('not-editor');
    const raw = $("#parent-emails").value;
    const emails = [...new Set(raw.split(/[\s,;]+/).map(value => value.trim().toLowerCase()).filter(Boolean))];
    const invalid = emails.filter(email => !validParentEmail(email));
    if (invalid.length) { parentsStatus(`Check these addresses: ${invalid.join(', ')}`); return; }
    const fresh = emails.filter(email => !parentEmails.includes(email));
    for (let start = 0; start < fresh.length; start += 400) {
      const batch = writeBatch(db);
      for (const email of fresh.slice(start, start + 400)) {
        batch.set(doc(db, 'parentContacts', email), {email, createdAt: serverTimestamp()});
      }
      await batch.commit();
    }
    $("#parent-emails").value = '';
    parentsStatus(`Added ${fresh.length} email addresses. ${emails.length - fresh.length} were already saved.`);
    await listParents();
  });
});
function credentials() {
  const email = $("#email").value.trim().toLowerCase();
  if (!editorEmails.includes(email)) throw Error("not-editor");
  return { email, password: $("#password").value };
}
function setPasswordVisible(visible) {
  $("#password").type = visible ? "text" : "password";
  $("#toggle-password span").textContent = visible ? "Hide password" : "Show password";
  $("#toggle-password use").setAttribute('href', `assets/icons.svg#${visible ? 'eye-off' : 'eye'}`);
  $("#toggle-password").setAttribute("aria-pressed", String(visible));
}
$("#toggle-password").addEventListener("click", () => {
  setPasswordVisible($("#password").type === "password");
});
function updateSignInMethod() {
  const useGoogle = ["maxmttang@gmail.com", "rayshinetang@gmail.com"].includes($("#email").value);
  $("#google-login").hidden = !useGoogle;
  $("#password-signin").hidden = useGoogle;
  $("#password").disabled = useGoogle;
  $("#password").required = !useGoogle;
  $("#password").value = "";
  setPasswordVisible(false);
}
updateSignInMethod();
$("#email").addEventListener("change", () => {
  updateSignInMethod();
  message("");
});
if (!auth) {
  message("The editor is being connected. Please check back soon.");
} else {
  emptyForm();
  await setPersistence(auth, browserSessionPersistence);
  onAuthStateChanged(auth, showUser);
  $("#google-login").addEventListener("click", () =>
    attempt(async () => {
      if (!["maxmttang@gmail.com", "rayshinetang@gmail.com"].includes($("#email").value)) return;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account", login_hint: $("#email").value });
      await signInWithPopup(auth, provider);
    }),
  );
  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("#password-signin").hidden) return;
    attempt(async () => {
      const c = credentials();
      await signInWithEmailAndPassword(auth, c.email, c.password);
      $("#password").value = "";
      setPasswordVisible(false);
    });
  });
  $("#reset").addEventListener("click", () =>
    attempt(async () => {
      const c = credentials();
      await sendPasswordResetEmail(auth, c.email);
      message("If this account exists, a password reset email has been sent.");
    }),
  );
  $("#resend").addEventListener("click", () =>
    attempt(async () => {
      await sendEmailVerification(auth.currentUser);
      message("Verification email sent.");
    }),
  );
  $("#check-verification").addEventListener("click", () =>
    attempt(async () => {
      await reload(auth.currentUser);
      await getIdToken(auth.currentUser, true);
      await showUser(auth.currentUser);
    }),
  );
  $("#signout").addEventListener("click", async () => {
    if (!saving && !uploading && await mayDiscard()) attempt(() => signOut(auth));
  });
  $("#new-post").addEventListener("click", async () => {
    if (!saving && !uploading && await mayDiscard()) emptyForm();
  });
  $("#import-posts").addEventListener("click", () =>
    attempt(async () => {
      const source = LOCAL_UPDATES.find((p) => p.title === "Weekly Update #3");
      const ref = doc(db, "posts", "weekly-update-2026-11-22");
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists()) return;
        tx.set(ref, {
          title: source.title,
          body: source.body,
          date: source.date,
          category: source.category,
          published: true,
          pinned: false,
          link: source.link || "",
          link_label: source.link_label || "",
          createdBy: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          revision: 1,
        });
      });
      message("The existing weekly update is now saved in the post database.");
      await listPosts();
    }),
  );
  $("#post-form").addEventListener("input", () => {
    dirty = true;
  });
  writer.on('text-change', () => { dirty = true; });
  let documentPosition = 0;
  $('#add-document').addEventListener('click', () => {
    if (saving || uploading) return;
    documentPosition = writer.getSelection()?.index ?? Math.max(0, writer.getLength()-1);
    $('#document-file').click();
  });
  $('#document-file').addEventListener('change', async () => {
    const file = $('#document-file').files[0];
    if (!file || saving || uploading) return;
    uploading = true;
    writer.enable(false);
    $('#add-document').disabled = true;
    $('#document-status').textContent = 'Uploading PDF…';
    try {
      if (!allowed(auth.currentUser)) throw Error('Please sign in with an approved editor account.');
      const result = await uploadDocument(file, await auth.currentUser.getIdToken(), percent => {
        $('#document-status').textContent = `Uploading PDF… ${percent}%`;
      });
      if (!/^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]{10,150}\/view$/.test(result.url)) throw Error('Invalid document link.');
      writer.insertText(documentPosition, '\n', 'api');
      writer.insertText(documentPosition+1, 'PDF: ' + file.name, {link:result.url}, 'api');
      writer.insertText(documentPosition+1+('PDF: ' + file.name).length, '\n', {link:false}, 'api');
      dirty = true;
      $('#document-status').textContent = 'PDF attached. Save or publish when ready. For meet results, select the Meet results category.';
    } catch(error) { $('#document-status').textContent = error.message || 'Could not upload the PDF.'; }
    finally { uploading = false; writer.enable(true); $('#add-document').disabled = false; $('#document-file').value = ''; }
  });
  let photoPosition = 0;
  $('#add-photo').addEventListener('click', () => {
    if (saving || uploading) return;
    photoPosition = writer.getSelection()?.index ?? Math.max(0, writer.getLength()-1);
    $('#photo-file').click();
  });
  $('#photo-file').addEventListener('change', async () => {
    const file = $('#photo-file').files[0];
    if (!file || saving || uploading) return;
    if (writer.getContents().ops.filter(op => op.insert?.image).length >= 6) {
      message('Please limit each update to six photos.');
      $('#photo-file').value = '';
      return;
    }
    uploading = true;
    writer.enable(false);
    $('#add-photo').disabled = true;
    $('#photo-status').textContent = 'Resizing and uploading photo…';
    try {
      if (!allowed(auth.currentUser)) throw Error('Please sign in with an approved editor account.');
      const url = await uploadPhoto(file, await auth.currentUser.getIdToken());
      writer.insertEmbed(photoPosition, 'image', url, 'api');
      writer.insertText(photoPosition+1, '\n', 'api');
      dirty = true;
      $('#photo-status').textContent = 'Photo added. Save or publish your update when ready. Uploaded photos are accessible to anyone with their image link.';
    } catch(error) {
      $('#photo-status').textContent = error.message || 'Could not upload the photo.';
    } finally {
      uploading = false;
      writer.enable(true);
      $('#add-photo').disabled = false;
      $('#photo-file').value = '';
    }
  });
  $("#delete-post").addEventListener("click", async () => {
    if (!selected || saving || uploading || !allowed(auth.currentUser)) return;
    if (!(await askConfirmation('Delete this update?', 'It will disappear from the team site, and you cannot undo this. Photos and PDFs you uploaded will stay available. Unsaved changes will be lost.', 'Delete update'))) return;
    if (!selected || saving || uploading || !allowed(auth.currentUser)) return;
    const ref = doc(db, "posts", selected);
    const oldRevision = revision;
    saving = true;
    writer.enable(false);
    const controls = $("#post-form").querySelectorAll("button,input,select,textarea");
    controls.forEach(n => n.disabled = true);
    attempt(async () => {
      try {
        await runTransaction(db, async tx => {
          const existing = await tx.get(ref);
          if (!existing.exists() || existing.data().revision !== oldRevision) throw Error("conflict");
          tx.delete(ref);
        });
        emptyForm();
        message("Post deleted. Uploaded photos and PDFs remain in Drive.");
        await listPosts();
      } finally {
        saving = false;
        writer.enable(true);
        controls.forEach(n => n.disabled = false);
      }
    });
  });
  $("#post-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (saving || uploading) return;
    attempt(async () => {
      if (!allowed(auth.currentUser)) throw Error("not-editor");
      const data = {
        title: $("#title").value.trim(),
        body: SwimContent.encode(writer.getContents()),
        date: $("#post-date").value,
        category: $("#category").value,
        pinned: false,
        published: true,
        link: "",
        link_label: "",
      };
      if (!data.title || (!writer.getText().trim() && !writer.getContents().ops.some(op => op.insert?.image))) {
        message("Add a title and message.");
        return;
      }
      if (data.body.length > 20000) {
        message('This update is too long. Please shorten the message or split it into two posts.');
        return;
      }
      const ref = selected
        ? doc(db, "posts", selected)
        : doc(collection(db, "posts"));
      const oldRevision = revision;
      saving = true;
      writer.enable(false);
      $("#post-form")
        .querySelectorAll("button,input,select,textarea")
        .forEach((n) => (n.disabled = true));
      try {
        await runTransaction(db, async (tx) => {
          const existing = await tx.get(ref);
          if (existing.exists()) {
            if (existing.data().revision !== oldRevision)
              throw Error("conflict");
            tx.update(ref, {
              ...data,
              revision: oldRevision + 1,
              updatedAt: serverTimestamp(),
            });
          } else {
            if (oldRevision !== null) throw Error("conflict");
            tx.set(ref, {
              ...data,
              revision: 1,
              createdBy: auth.currentUser.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        });
        selected = ref.id;
        $("#delete-post").hidden = false;
        $("#new-post").hidden = false;
        revision = (oldRevision || 0) + 1;
        dirty = false;
        $("#save-state").textContent = "Published. Parents can now read this update.";
        message("Update published.");
        await listPosts();
      } finally {
        saving = false;
        writer.enable(true);
        $("#post-form")
          .querySelectorAll("button,input,select,textarea")
          .forEach((n) => (n.disabled = false));
      }
    });
  });
  window.addEventListener("beforeunload", (e) => {
    if (dirty || saving || uploading) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}
