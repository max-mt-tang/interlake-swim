import { firebaseConfig } from "./firebase-config.js";
export async function loadPublishedPosts() {
  if (!firebaseConfig) return null;
  const [{ db }, { collection, getDocs, query, where }] =
    await Promise.all([
      import("./firebase-client.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js"),
    ]);
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
