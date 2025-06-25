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

  // Gestion du formulaire
  form.addEventListener('submit', async function (e) {
    const isAnonymous = document.getElementById('anonymous').checked;
    const nameField = document.getElementById('name');
    const name = nameField.value.trim();

    nameField.disabled = false;
    if (!isAnonymous && name === "") {
      e.preventDefault();
      alert("Merci de renseigner votre nom et prénom OU de cocher 'Rester anonyme'.");
      nameField.focus();
      return false;
    }

    e.preventDefault();
    const formData = new FormData(this);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (['other-workshops', 'sport-activities'].includes(key)) {
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

    try {
      await addDoc(collection(db, "reponses-qvct"), data);
      document.getElementById('wellness-form').classList.add('hidden');
      document.getElementById('confirmation').classList.remove('hidden');
      document.getElementById('progress-bar').style.width = '100%';
      document.getElementById('progress-text').textContent = '100% complété';
    } catch (err) {
      alert("Erreur lors de l'enregistrement : " + err.message);
      console.error("Erreur Firebase:", err);
    }
  });

  // Gestion dynamique des horaires "Non / pause déjeuner / fin de journée"
  const sections = ['sport', 'nutrition', 'massage', 'sophrology'];
  sections.forEach(section => {
    const radioNon = document.querySelector(`input[name="${section}-outside-hours"][value="non"]`);
    const checkboxLunch = document.querySelector(`input[name="${section}-time-lunch"]`);
    const checkboxEvening = document.querySelector(`input[name="${section}-time-evening"]`);

    if (radioNon && checkboxLunch && checkboxEvening) {
      // Quand "Non" est sélectionné
      radioNon.addEventListener('change', function () {
        if (this.checked) {
          checkboxLunch.checked = false;
          checkboxEvening.checked = false;
          checkboxLunch.disabled = true;
          checkboxEvening.disabled = true;

          checkboxLunch.nextElementSibling.querySelector('.checked-box')?.classList.add('hidden');
          checkboxEvening.nextElementSibling.querySelector('.checked-box')?.classList.add('hidden');
        }
      });

      // Quand on clique sur une checkbox => réactive + désélectionne "Non"
      [checkboxLunch, checkboxEvening].forEach(checkbox => {
        checkbox.addEventListener('change', function () {
          checkboxLunch.disabled = false;
          checkboxEvening.disabled = false;

          if (this.checked) {
            radioNon.checked = false;
            radioNon.nextElementSibling.querySelector('.checked-radio')?.classList.add('hidden');
          }

          // Si aucune n’est cochée, recoche "Non" et désactive à nouveau
          if (!checkboxLunch.checked && !checkboxEvening.checked) {
            radioNon.checked = true;
            radioNon.nextElementSibling.querySelector('.checked-radio')?.classList.remove('hidden');
            checkboxLunch.disabled = true;
            checkboxEvening.disabled = true;
          }
        });
      });
    }
  });
});
// Affiche ou masque les horaires selon le choix Oui/Non pour "hors temps de travail"
function toggleSectionTimes(section) {
    const radioOui = document.querySelector(`input[name="${section}-outside-hours"][value="oui"]`);
    const details = document.getElementById(`${section}-times-details`);
    if (radioOui && radioOui.checked) {
        details.classList.remove('hidden');
    } else {
        details.classList.add('hidden');
        details.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    ['sport', 'nutrition', 'massage', 'sophrology'].forEach(section => {
        document.querySelectorAll(`input[name="${section}-outside-hours"]`).forEach(input => {
            input.addEventListener('change', () => toggleSectionTimes(section));
        });
        // Initialise l'état à l'ouverture
        toggleSectionTimes(section);
    });
});


