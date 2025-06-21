import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIG FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBHKKxPs7QPBVceajWSHLma5XSxGpl_Q6w",
  authDomain: "qvct-manager-app.firebaseapp.com",
  projectId: "qvct-manager-app",
  storageBucket: "qvct-manager-app.appspot.com",
  messagingSenderId: "349381960575",
  appId: "1:349381960575:web:eed97ccbecd4cd77b3704a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wellness-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    // Validation NOM ou ANONYME obligatoire
    const isAnonymous = document.getElementById('anonymous').checked;
    const nameField = document.getElementById('name');
    const name = nameField.value.trim();

    nameField.disabled = false; // Toujours le réactiver avant validation

    if (!isAnonymous && name === "") {
      e.preventDefault();
      alert("Merci de renseigner votre nom et prénom OU de cocher 'Rester anonyme'.");
      nameField.focus();
      return false; // On stoppe TOUT
    }

    e.preventDefault(); // Bloque le rechargement systématiquement ici

    // Collecte des réponses
    const formData = new FormData(this);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (key === 'other-workshops') {
        if (!data[key]) data[key] = [];
        data[key].push(value);
      } else {
        if (data[key]) {
          if (!Array.isArray(data[key])) data[key] = [data[key]];
          data[key].push(value);
        } else {
          data[key] = value;
        }
      }
    }
    data.date = new Date().toISOString();

    // ENREGISTREMENT DANS FIRESTORE
    try {
      await addDoc(collection(db, "reponses-qvct"), data);
      // Affichage confirmation
      document.getElementById('wellness-form').classList.add('hidden');
      document.getElementById('confirmation').classList.remove('hidden');
      document.getElementById('progress-bar').style.width = '100%';
      document.getElementById('progress-text').textContent = '100% complété';
    } catch (err) {
      alert("Erreur lors de l'enregistrement : " + err.message);
      console.error("Erreur Firebase:", err);
    }
  });
});
