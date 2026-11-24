import { firebaseConfig } from "./firebase-config.js";
export async function loadPublishedPosts() {
  if (!firebaseConfig) return null;
  const [{ initializeApp, getApp, getApps }, { getFirestore, collection, getDocs, query, where }] =
    await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore-lite.js"),
    ]);
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const result = await getDocs(
    query(collection(db, "posts"), where("published", "==", true)),
  );
  return result.docs.map((item) => {
    const row = item.data();
    return {
      ...row,
      published: String(row.published),
      pinned: String(row.pinned),
    };
  });
}
