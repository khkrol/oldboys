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

    // Laad Top 3 (Weekoverzicht)
    loadTop10: function(collection, listElementId, sortOrder = 'desc', unit = '') {
        if (!db) return;

        const listElement = document.getElementById(listElementId);
        if (!listElement) return;

        listElement.innerHTML = '<li class="loading-state"><span>Data ophalen...</span></li>';

        // Filter: Afgelopen 7 dagen
        const now = Date.now();
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const weekAgo = now - sevenDaysInMs;

        // Eerst proberen met datum filter
        db.collection(collection)
            .where("date", ">", weekAgo)
            .get()
            .then((querySnapshot) => {
                let scores = [];
                querySnapshot.forEach((doc) => {
                    scores.push(doc.data());
                });

                if (scores.length === 0) {
                    // Geen scores deze week? Toon Top 3 Aller Tijden
                    this.loadFallback(collection, listElement, sortOrder, unit);
                    return;
                }

                // Sorteren
                scores.sort((a, b) => {
                    return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
                });

                // Pak alleen de top 3
                this.renderList(scores.slice(0, 3), listElement, unit);
            })
            .catch((error) => {
                // Als index mist of query faalt, fallback
                console.log("Slimme query mislukt, schakel over op fallback...", error);
                this.loadFallback(collection, listElement, sortOrder, unit);
            });
    },

    // Fallback: Haal Top 3 op zonder datum filter
    loadFallback: function(collection, listElement, sortOrder, unit) {
        db.collection(collection)
            .orderBy("score", sortOrder)
            .limit(3) // LIMIT AANGEPAST NAAR 3
            .get()
            .then((querySnapshot) => {
                let scores = [];
                querySnapshot.forEach((doc) => scores.push(doc.data()));
                
                if (scores.length === 0) {
                    listElement.innerHTML = '<li class="empty-state"><span>Nog geen scores!</span></li>';
                } else {
                    this.renderList(scores, listElement, unit);
                }
            })
            .catch((err) => {
                console.error("Laden volledig mislukt:", err);
                listElement.innerHTML = '<li><span>Kan scores niet laden.</span></li>';
            });
    },

    // HTML maken voor Top 3
    renderList: function(scores, listElement, unit) {
        listElement.innerHTML = '';
        
        const medals = ["🥇", "🥈", "🥉"];

        scores.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add(`rank-${index + 1}`); // Voor CSS styling (goud/zilver/brons)

            // Datum formatteren: "Vr 14:30"
            let dateStr = "";
            if (item.date) {
                const dateObj = new Date(item.date);
                // Dag naam kort (Ma, Di, etc)
                const day = dateObj.toLocaleDateString('nl-NL', { weekday: 'short' }); 
                // Tijd (14:30)
                const time = dateObj.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
                dateStr = `${day} ${time}`;
            }

            // Score afronden als het decimalen heeft
            let displayScore = item.score;
            if (typeof item.score === 'number' && item.score % 1 !== 0) {
                displayScore = item.score.toFixed(2);
            }

            // De medaille kiezen (of nummer als we ooit meer dan 3 tonen)
            const rankIcon = medals[index] || `#${index + 1}`;

            li.innerHTML = `
                <div class="hs-rank">${rankIcon}</div>
                <div class="hs-info">
                    <span class="hs-name">${item.name}</span>
                    <span class="hs-date">${dateStr}</span>
                </div>
                <div class="hs-score">${displayScore}${unit}</div>
            `;
            listElement.appendChild(li);
        });
    }
};