// --- CONFIGURATIE (DIT MOET JIJ AANPASSEN) ---

// PLAK HIERONDER JOUW 'firebaseConfig' DIE JE VAN GOOGLE HEBT GEKREGEN
// Het ziet er ongeveer zo uit:
const firebaseConfig = {
  apiKey: "AIzaSyDnYWBnPqiurKK_vM4C_JT07UxGpaaifGs",
  authDomain: "oldboys-c58f9.firebaseapp.com",
  projectId: "oldboys-c58f9",
  storageBucket: "oldboys-c58f9.firebasestorage.app",
  messagingSenderId: "23329894436",
  appId: "1:23329894436:web:8cd9d409be74fce51f28b1"
};

// --- EINDE CONFIGURATIE ---

// Initialiseer Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Volledige set van 12 spelers
const cardsData = [
    { img: 'kaart1.jpg', number: '#1', name: 'Ralph Cicilia' },
    { img: 'kaart2.jpg', number: '#2', name: 'Des Millerson' },
    { img: 'kaart3.jpg', number: '#3', name: 'Gedeon Nepomuceno' },
    { img: 'kaart4.jpg', number: '#4', name: 'Moises van Heydoorn' },
    { img: 'kaart5.jpg', number: '#5', name: 'Ozzie Willems' },
    { img: 'kaart6.jpg', number: '#6', name: 'Edmar Pieter' },
    { img: 'kaart7.jpg', number: '#7', name: 'John Leepel' },
    { img: 'kaart8.jpg', number: '#8', name: 'Liemarvin Martina' },
    { img: 'kaart9.jpg', number: '#9', name: 'Eloy Coffie' },
    { img: 'kaart10.jpg', number: '#10', name: 'Sherman Symor' },
    { img: 'kaart11.jpg', number: '#11', name: 'Franklin Croes' },
    { img: 'kaart12.jpg', number: '#12', name: 'Andruw Cijntje' }
];

let cardsArray = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matches = 0;
const totalPairs = cardsData.length; 

const grid = document.getElementById('gameGrid');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const winMsg = document.getElementById('winMessage');
const finalMovesSpan = document.getElementById('finalMoves');
const highScoreList = document.getElementById('highScoreList');
const nameInput = document.getElementById('playerName');

function initGame() {
    moves = 0;
    matches = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    
    movesDisplay.innerText = moves;
    matchesDisplay.innerText = `0 / ${totalPairs}`;
    winMsg.style.display = 'none';
    nameInput.value = '';
    grid.innerHTML = '';

    // Online Leaderboard laden
    loadLeaderboard();

    // Kaarten klaarmaken
    let tempArray = [];
    cardsData.forEach((item) => {
        tempArray.push({ ...item });
        tempArray.push({ ...item });
    });
    
    cardsArray = tempArray.sort(() => 0.5 - Math.random());

    cardsArray.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = item.name;

        card.innerHTML = `
            <div class="card-face card-front">?</div>
            <div class="card-face card-back">
                <img src="${item.img}" alt="${item.name}">
                <div class="player-info">
                    <span class="player-number">${item.number}</span>
                    <span class="player-name">${item.name}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesDisplay.innerText = moves;
    
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    matches++;
    matchesDisplay.innerText = `${matches} / ${totalPairs}`;
    resetBoard();

    if (matches === totalPairs) {
        setTimeout(() => {
            showWinScreen();
        }, 500);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function showWinScreen() {
    finalMovesSpan.innerText = moves;
    winMsg.style.display = 'block';
}

function resetGame() {
    initGame();
}

// --- ONLINE FIREBASE FUNCTIES ---

function saveScore() {
    const name = nameInput.value.trim() || "Anoniem";
    const score = moves;
    const now = Date.now(); 

    // Opslaan in de online database 'scores'
    db.collection("scores").add({
        name: name,
        score: score,
        date: now
    })
    .then(() => {
        alert("Topscore online opgeslagen!");
        resetGame();
    })
    .catch((error) => {
        console.error("Fout bij opslaan: ", error);
        alert("Kon niet verbinden met de database.");
    });
}

function loadLeaderboard() {
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const weekAgo = now - sevenDaysInMs;

    // Haal scores op: 
    // 1. Waar datum > 7 dagen geleden
    // 2. Sorteer op score (laagste eerst)
    // 3. Maximaal 3 resultaten
    
    db.collection("scores")
        .where("date", ">", weekAgo)
        .orderBy("date") // Firebase vereist soms eerst sorteren op het filter veld
        .get()
        .then((querySnapshot) => {
            let scores = [];
            querySnapshot.forEach((doc) => {
                scores.push(doc.data());
            });

            // Omdat we op datum filterden, moeten we nu nog sorteren op score (laag naar hoog)
            scores.sort((a, b) => a.score - b.score);
            
            // Pak de top 3
            const top3 = scores.slice(0, 3);

            updateLeaderboardUI(top3);
        })
        .catch((error) => {
            console.log("Nog geen index of fout:", error);
            // Fallback als de query faalt (bijv. index nog niet aangemaakt)
            highScoreList.innerHTML = '<li><span>Laden mislukt (Check console)</span></li>';
        });
}

function updateLeaderboardUI(top3) {
    highScoreList.innerHTML = '';
    
    if (top3.length === 0) {
        highScoreList.innerHTML = '<li><span>Nog geen scores deze week</span></li>';
        return;
    }

    top3.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${item.name}</span> <span>${item.score} pogingen</span>`;
        highScoreList.appendChild(li);
    });
}

window.onload = initGame;