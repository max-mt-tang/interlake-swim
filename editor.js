import { auth, db } from "./firebase-client.js";
import { editorEmails } from "./firebase-config.js";
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
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
const $ = (s) => document.querySelector(s);
let selected = null,
  revision = null,
  dirty = false,
  saving = false,
  currentUser = null;
const message = (text) => {
  $("#message").textContent = text;
  $("#message").hidden = !text;
};
const allowed = (user) =>
  user &&
  editorEmails.includes(user.email?.toLowerCase()) &&
  user.emailVerified;
function errorMessage(e) {
  const messages = {
    'permission-denied': 'Access denied. Sign in with a verified editor account.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account already uses this email. Sign in or reset your password.',
    'auth/weak-password': 'Choose a password with at least 12 characters.',
    'auth/popup-blocked': 'Allow the sign-in popup, then try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'not-editor': 'Use Max’s or Coach Eberth’s approved email address.',
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
  revision = null;
  dirty = false;
  $("#post-form").reset();
  $("#post-date").value = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  $("#form-heading").textContent = "New update";
  $("#save-state").textContent = "";
  $("#preview").hidden = true;
}
function mayDiscard() {
  return !dirty || confirm("Discard your unsaved changes?");
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
    button.textContent = `${p.published ? "Published" : "Draft"} · ${p.date} · ${p.title}`;
    button.addEventListener("click", () => {
      if (saving || !mayDiscard()) return;
      selected = p.id;
      revision = p.revision;
      $("#title").value = p.title;
      $("#body").value = p.body;
      $("#post-date").value = p.date;
      $("#category").value = p.category;
      $("#post-link").value = p.link;
      $("#link-label").value = p.link_label;
      $("#pinned").checked = p.pinned;
      $("#form-heading").textContent = "Edit update";
      $("#save-state").textContent = p.published
        ? "Currently published"
        : "Private draft";
      $("#preview").hidden = true;
      dirty = false;
    });
    $("#post-list").append(button);
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
  if (!user) {
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
  if (!user.emailVerified) {
    $("#verification").hidden = false;
    message("Verify your email before posting.");
    return;
  }
  $("#workspace").hidden = false;
  message(`Signed in as ${user.email}`);
  await attempt(listPosts);
}
function credentials() {
  const email = $("#email").value.trim().toLowerCase();
  if (!editorEmails.includes(email)) throw Error("not-editor");
  return { email, password: $("#password").value };
}
function preview() {
  const box = $("#preview");
  box.replaceChildren();
  const title = document.createElement("h3");
  title.textContent = $("#title").value;
  const body = document.createElement("p");
  body.textContent = $("#body").value;
  box.append(title, body);
  box.hidden = false;
}
function setPasswordVisible(visible) {
  $("#password").type = visible ? "text" : "password";
  $("#toggle-password").textContent = visible ? "Hide password" : "Show password";
  $("#toggle-password").setAttribute("aria-pressed", String(visible));
}
$("#toggle-password").addEventListener("click", () => {
  setPasswordVisible($("#password").type === "password");
});
function updateSignInMethod() {
  const useGoogle = $("#email").value === "maxmttang@gmail.com";
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
      if ($("#email").value !== "maxmttang@gmail.com") return;
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
  $("#signout").addEventListener("click", () => {
    if (!saving && mayDiscard()) attempt(() => signOut(auth));
  });
  $("#new-post").addEventListener("click", () => {
    if (!saving && mayDiscard()) emptyForm();
  });
  $("#reload-posts").addEventListener("click", () => attempt(listPosts));
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
          pinned: true,
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
  $("#preview-button").addEventListener("click", preview);
  $("#post-form").addEventListener("input", () => {
    dirty = true;
  });
  $("#post-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (saving) return;
    attempt(async () => {
      if (!allowed(auth.currentUser)) throw Error("not-editor");
      const link = $("#post-link").value.trim();
      if (link && new URL(link).protocol !== "https:") {
        message("Use an https:// link.");
        return;
      }
      const data = {
        title: $("#title").value.trim(),
        body: $("#body").value.trim(),
        date: $("#post-date").value,
        category: $("#category").value,
        pinned: $("#pinned").checked,
        published: e.submitter?.value === "publish",
        link,
        link_label: $("#link-label").value.trim(),
      };
      if (!data.title || !data.body) {
        message("Add a title and message.");
        return;
      }
      const ref = selected
        ? doc(db, "posts", selected)
        : doc(collection(db, "posts"));
      const oldRevision = revision;
      saving = true;
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
        revision = (oldRevision || 0) + 1;
        dirty = false;
        $("#save-state").textContent = data.published
          ? "Published. Parents can now read this update."
          : "Draft saved. Only editors can read it.";
        message(data.published ? "Update published." : "Private draft saved.");
        await listPosts();
      } finally {
        saving = false;
        $("#post-form")
          .querySelectorAll("button,input,select,textarea")
          .forEach((n) => (n.disabled = false));
      }
    });
  });
  window.addEventListener("beforeunload", (e) => {
    if (dirty || saving) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}
