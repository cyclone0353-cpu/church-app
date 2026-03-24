// Firebase 연결
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 데이터 불러오기
async function loadStudents() {
  const querySnapshot = await getDocs(collection(db, "students"));
  const container = document.body;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerText = `${data.class} - ${data.name}`;
    container.appendChild(div);
  });
}

loadStudents();
