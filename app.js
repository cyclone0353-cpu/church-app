import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjzzpgDtYXvMZIqoFQ14qOgtRz_6YrgDw",
  authDomain: "onemind-church-dream.firebaseapp.com",
  projectId: "onemind-church-dream",
  storageBucket: "onemind-church-dream.firebasestorage.app",
  messagingSenderId: "478768693720",
  appId: "1:478768693720:web:2675bff9a9d1d44916f2ad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const appDiv = document.getElementById("app");

appDiv.innerHTML = `
  <h2>출석 체크</h2>
  <button id="save">출석 저장</button>
  <div id="result"></div>
`;

const ref = doc(db, "attendance", "today");

document.getElementById("save").onclick = async () => {
  await setDoc(ref, {
    time: new Date().toLocaleString()
  });
};

onSnapshot(ref, (docSnap) => {
  if (docSnap.exists()) {
    document.getElementById("result").innerText =
      "최근 저장: " + docSnap.data().time;
  }
});