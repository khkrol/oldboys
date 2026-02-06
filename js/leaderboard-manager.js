// js/leaderboard-manager.js

// 1. Firebase Configuratie
const firebaseConfig = {
  apiKey: "AIzaSyDnYWBnPqiurKK_vM4C_JT07UxGpaaifGs",
  authDomain: "oldboys-c58f9.firebaseapp.com",
  projectId: "oldboys-c58f9",
  storageBucket: "oldboys-c58f9.firebasestorage.app",
  messagingSenderId: "23329894436",
  appId: "1:23329894436:web:8cd9d409be74fce51f28b1"
};

// Veiligheidscheck: Bestaat Firebase wel?
let db;
if (typeof firebase === 'undefined') {
    console.error("CRITISCHE FOUT: Firebase script is niet geladen! Controleer je HTML head sectie.");
} else {
    // Initialiseer Firebase alleen als het nog niet bestaat
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    // Database verbinding maken
    db = firebase.firestore();
    console.log("Leaderboard Manager: Verbonden met Firebase.");
}

// 2. Het Leaderboard Object
const LeaderboardManager = {

    // Sla score op
    saveScore: function(collection, playerName, score, onSuccess) {
        if (!db) { alert("Geen verbinding met database."); return; }

        const name = playerName.trim() || "Anoniem";
        const now = Date.now();

        db.collection(collection).add({
            name: name,
            score: score,
            date: now
        })
        .then(() => {
            console.log(`Score opgeslagen in ${collection}: ${name} - ${score}`);
            if (onSuccess) onSuccess();
        })
        .catch((error) => {
            console.error("Fout bij opslaan:", error);
            alert("Kon score niet opslaan. Controleer je internet.");
        });
    },

    // Laad top 10
    loadTop10: function(collection, listElementId, sortOrder = 'desc', unit = '') {
        if (!db) return;

        const listElement = document.getElementById(listElementId);
        if (!listElement) return;

        listElement.innerHTML = '<li><span>Scores laden...</span></li>';

        // Filter: Afgelopen 7 dagen
        const now = Date.now();
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const weekAgo = now - sevenDaysInMs;

        // Eerst proberen met datum filter (hiervoor is soms een 'index' nodig in Firebase)
        db.collection(collection)
            .where("date", ">", weekAgo)
            .get()
            .then((querySnapshot) => {
                let scores = [];
                querySnapshot.forEach((doc) => {
                    scores.push(doc.data());
                });

                if (scores.length === 0) {
                    // Als er deze week geen scores zijn, laat dan de "All Time" scores zien
                    this.loadFallback(collection, listElement, sortOrder, unit);
                    return;
                }

                // Sorteren in Javascript (veilig en snel voor kleine lijsten)
                scores.sort((a, b) => {
                    return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
                });

                this.renderList(scores.slice(0, 10), listElement, unit);
            })
            .catch((error) => {
                // Als de query faalt (bijv. door missende index), val terug op simpele laad-actie
                console.log("Slimme query mislukt, schakel over op fallback...", error);
                this.loadFallback(collection, listElement, sortOrder, unit);
            });
    },

    // Fallback: Haal gewoon de laatste scores op zonder datum filter
    loadFallback: function(collection, listElement, sortOrder, unit) {
        db.collection(collection)
            .orderBy("score", sortOrder)
            .limit(10)
            .get()
            .then((querySnapshot) => {
                let scores = [];
                querySnapshot.forEach((doc) => scores.push(doc.data()));
                
                if (scores.length === 0) {
                    listElement.innerHTML = '<li><span>Nog geen scores!</span></li>';
                } else {
                    this.renderList(scores, listElement, unit);
                }
            })
            .catch((err) => {
                console.error("Laden volledig mislukt:", err);
                listElement.innerHTML = '<li><span>Kan scores niet laden.</span></li>';
            });
    },

    // HTML maken
    renderList: function(scores, listElement, unit) {
        listElement.innerHTML = '';
        scores.forEach((item, index) => {
            const li = document.createElement('li');
            
            // Datum netjes maken
            let dateStr = "-";
            if (item.date) {
                const dateObj = new Date(item.date);
                dateStr = dateObj.toLocaleDateString('nl-NL', {day: '2-digit', month: '2-digit'});
            }
            
            // Score afronden als het een kommagetal is (voor tijden)
            let displayScore = item.score;
            if (typeof item.score === 'number' && item.score % 1 !== 0) {
                displayScore = item.score.toFixed(2);
            }

            li.innerHTML = `
                <span style="font-weight:bold; color:var(--ht-green); width:20px;">#${index + 1}</span>
                <div style="flex:1; margin-left:10px; display:flex; flex-direction:column;">
                    <span style="font-weight:bold;">${item.name}</span>
                    <span style="font-size:0.75em; color:#888;">${dateStr}</span>
                </div>
                <span style="font-weight:bold">${displayScore}${unit}</span>
            `;
            listElement.appendChild(li);
        });
    }
};