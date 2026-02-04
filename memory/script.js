// --- CONFIGURATIE (DIT MOET JIJ AANPASSEN) ---
// Let op: Ik heb de config hier even ingekort voor het overzicht, 
// maar laat jouw originele config staan!

const firebaseConfig = {
  apiKey: "AIzaSyDnYWBnPqiurKK_vM4C_JT07UxGpaaifGs",
  authDomain: "oldboys-c58f9.firebaseapp.com",
  projectId: "oldboys-c58f9",
  storageBucket: "oldboys-c58f9.firebasestorage.app",
  messagingSenderId: "23329894436",
  appId: "1:23329894436:web:8cd9d409be74fce51f28b1"
};

// --- EINDE CONFIGURATIE ---

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 12 spelers
const cardsData = [
    { img: 'images/kaart1.jpg', number: '#1', name: 'Ralph Cicilia' },
    { img: 'images/kaart2.jpg', number: '#2', name: 'Des Millerson' },
    { img: 'images/kaart3.jpg', number: '#3', name: 'Gedeon Nepomuceno' },
    { img: 'images/kaart4.jpg', number: '#4', name: 'Moises van Heydoorn' },
    { img: 'images/kaart5.jpg', number: '#5', name: 'Ozzie Willems' },
    { img: 'images/kaart6.jpg', number: '#6', name: 'Edmar Pieter' },
    { img: 'images/kaart7.jpg', number: '#7', name: 'John Leepel' },
    { img: 'images/kaart8.jpg', number: '#8', name: 'Liemarvin Martina' },
    { img: 'images/kaart9.jpg', number: '#9', name: 'Eloy Coffie' },
    { img: 'images/kaart10.jpg', number: '#10', name: 'Sherman Symor' },
    { img: 'images/kaart11.jpg', number: '#11', name: 'Franklin Croes' },
    { img: 'images/kaart12.jpg', number: '#12', name: 'Andruw Cijntje' }
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
    matchesDisplay.innerText = `0/${totalPairs}`;
    winMsg.style.display = 'none';
    if(nameInput) nameInput.value = '';
    grid.innerHTML = '';

    // Leaderboard laden (maar nu op de achtergrond voor de modal)
    loadLeaderboard();

    // Kaarten dupliceren en schudden
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
                    <span class="player-name">${item.number} ${item.name}</span>
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
    matchesDisplay.innerText = `${matches}/${totalPairs}`;
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

// --- MODAL FUNCTIES (NIEUW) ---
function openLeaderboard() {
    document.getElementById('leaderboardModal').style.display = 'flex';
    loadLeaderboard(); // Verversen bij openen
}

function closeLeaderboard() {
    document.getElementById('leaderboardModal').style.display = 'none';
}

// Sluit modal als je ernaast klikt
window.onclick = function(event) {
    const modal = document.getElementById('leaderboardModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// --- FIREBASE FUNCTIES ---

function saveScore() {
    const name = nameInput.value.trim() || "Anoniem";
    const score = moves;
    const now = Date.now(); 

    db.collection("scores").add({
        name: name,
        score: score,
        date: now
    })
    .then(() => {
        alert("Topscore online opgeslagen!");
        winMsg.style.display = 'none'; // Sluit win scherm
        openLeaderboard(); // Toon direct de ranglijst
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

    db.collection("scores")
        .where("date", ">", weekAgo)
        .orderBy("date") 
        .get()
        .then((querySnapshot) => {
            let scores = [];
            querySnapshot.forEach((doc) => {
                scores.push(doc.data());
            });

            scores.sort((a, b) => a.score - b.score);
            const top3 = scores.slice(0, 3);
            updateLeaderboardUI(top3);
        })
        .catch((error) => {
            console.log("Error loading scores:", error);
            highScoreList.innerHTML = '<li><span>Laden mislukt</span></li>';
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
        // Compactere weergave voor mobiel
        li.innerHTML = `
            <span style="font-weight:bold; color:var(--ht-green)">#${index + 1}</span>
            <span style="flex:1; margin-left:10px;">${item.name}</span> 
            <span style="font-weight:bold">${item.score}</span>
        `;
        highScoreList.appendChild(li);
    });
}

// Moderne manier van laden
document.addEventListener('DOMContentLoaded', initGame);