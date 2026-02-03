// De lijst met spelers, gekoppeld aan de plaatjes
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
const totalPairs = cardsData.length; // Dit is 12

const grid = document.getElementById('gameGrid');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const winMsg = document.getElementById('winMessage');

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
    grid.innerHTML = '';

    // Maak de paren (we kopiëren de lijst 2x)
    let tempArray = [];
    cardsData.forEach((item) => {
        tempArray.push({ ...item }); // Kopie 1
        tempArray.push({ ...item }); // Kopie 2
    });
    
    // Schudden
    cardsArray = tempArray.sort(() => 0.5 - Math.random());

    // HTML genereren
    cardsArray.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        // We gebruiken het rugnummer + naam als unieke ID voor de match
        card.dataset.name = item.name;

        // Hier voegen we de extra informatie toe in de HTML
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
            winMsg.style.display = 'block';
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

function resetGame() {
    initGame();
}

window.onload = initGame;