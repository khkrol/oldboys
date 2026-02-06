==============================================================================
PROJECT: POTTER'S FOOTBALL GROUP (PFG) - PWA & TOOLKIT
Versie: 2.0
Datum: 06-02-2026
==============================================================================

1. SAMENVATTING
------------------------------------------------------------------------------
Dit project is een Progressive Web App (PWA) ontworpen voor de Potter's Football 
Group. Het fungeert als een centrale hub voor Hattrick-hulpmiddelen (tools) en 
minigames. 

De applicatie is gebouwd als een "Single Page App Shell". Dit betekent dat de 
bezoeker één keer de hoofdpagina laadt (de schil), waarna de inhoud (tools en 
games) razendsnel wordt ingeladen in een centraal venster zonder dat de hele 
pagina ververst hoeft te worden. Dankzij de Service Worker werkt de app ook 
offline of bij slecht bereik, en kan hij geïnstalleerd worden als een 'echte' 
app op telefoons.

==============================================================================

2. INSTALLATIEHANDLEIDING (VOOR GEBRUIKERS)
------------------------------------------------------------------------------
Omdat dit een PWA is, hoeft de app niet via de App Store of Play Store 
gedownload te worden. Hij wordt direct vanuit de browser geïnstalleerd.

A. ANDROID (via Chrome)
   1. Navigeer naar de URL van de site.
   2. Wacht tot de balk "Toevoegen aan startscherm" verschijnt onderin, OF:
   3. Tik op de drie puntjes (menu) rechtsboven in Chrome.
   4. Kies "App installeren" of "Toevoegen aan startscherm".
   5. De app verschijnt nu tussen je andere apps met het PFG-logo.

B. APPLE iOS (via Safari)
   1. Navigeer naar de URL van de site in Safari (Chrome op iOS werkt minder goed).
   2. Tik op de "Delen" knop (het vierkantje met de pijl omhoog) onderin.
   3. Scroll naar beneden en kies "Zet op beginscherm" (Add to Home Screen).
   4. Klik op "Voeg toe".
   5. De app staat nu op je startscherm en opent zonder browserbalken.

==============================================================================

3. TECHNISCHE WERKING (ONDER DE MOTORKAP)
------------------------------------------------------------------------------
Het project bestaat uit drie hoofdonderdelen:

A. DE SHELL (index.html + app.js + layout.css)
   Dit is het frame van de applicatie. Het bevat:
   - De navigatiebalk (sidebar).
   - De 'Mobile Bar' (voor kleine schermen).
   - Een <iframe> genaamd 'mainFrame'.
   
   Wanneer een gebruiker op het menu klikt, wordt niet de hele pagina ververst. 
   In plaats daarvan verandert Javascript alleen de bron (src) van het iframe. 
   Dit zorgt voor de snelheid en de 'app-ervaring'.

B. DE SERVICE WORKER (sw.js)
   Dit is de motor voor offline gebruik.
   - Bij het eerste bezoek slaat hij index.html, css en plaatjes op in de cache.
   - Als de gebruiker terugkomt, laadt de app direct uit het geheugen van de 
     telefoon, niet van het internet.
   - BELANGRIJK: Bij elke update moet de 'CACHE_NAME' in dit bestand aangepast 
     worden (zie sectie 5).

C. DE CONTENT (Tools & Games)
   Elke tool of game is een los HTML-bestand (bijv. tools/kantine.html). 
   Deze bestanden draaien binnen de Shell, maar kunnen ook los geopend worden.

D. DATA OPSLAG (Leaderboard Manager)
   Highscores worden opgeslagen in een externe database (Google Firebase). 
   Het bestand 'js/leaderboard-manager.js' regelt de verbinding.

==============================================================================

4. MAPSTRUCTUUR
------------------------------------------------------------------------------
/ (Root)
├── index.html            <-- De hoofdpagina (De Shell)
├── manifest.json         <-- Instellingen voor installatie (naam, icoon)
├── sw.js                 <-- Service Worker (Offline functionaliteit)
├── css/
│   ├── global.css        <-- Huisstijl (kleuren, knoppen, fonts)
│   ├── layout.css        <-- Indeling van de Shell (sidebar, iframe)
│   └── game.css          <-- Specifieke stijlen voor minigames
├── js/
│   ├── app.js            <-- Logica van de Shell (menu, navigatie)
│   ├── menu-data.js      <-- De inhoud van het menu (Hier voeg je items toe)
│   ├── effects.js        <-- Visuele effecten (confetti, shake)
│   └── leaderboard-manager.js <-- Firebase koppeling
├── assets/
│   └── images/           <-- Logo's en iconen
├── tools/                <-- Map voor alle losse tool-bestanden
└── games/                <-- Map voor alle losse game-bestanden

==============================================================================

5. ONTWIKKELING: STAPPENPLAN NIEUWE FEATURES
------------------------------------------------------------------------------
Wil je een nieuwe tool of game toevoegen? Volg exact deze stappen.

STAP 1: HET BESTAND MAKEN
   - Maak een nieuw HTML bestand in de map `tools/` of `games/`.
   - Zorg dat je in de <head> altijd verwijst naar `../css/global.css`.
   - Voor games verwijst je ook naar `../css/game.css`.
   
   Voorbeeld startcode:
   -------------------------------------------------
   <!DOCTYPE html>
   <html>
   <head>
       <link rel="stylesheet" href="../css/global.css">
   </head>
   <body>
       <div class="app-container">
           <div class="header"><h1>Mijn Nieuwe Tool</h1></div>
           </div>
   </body>
   </html>
   -------------------------------------------------

STAP 2: TOEVOEGEN AAN HET MENU
   - Open `js/menu-data.js`.
   - Voeg een nieuw object toe aan de lijst `items` onder de juiste categorie.
   
   Voorbeeld:
   { 
     id: "mijn-tool",      // Unieke ID (zonder spaties)
     title: "Mijn Tool",   // Naam in het menu
     icon: "🛠️",           // Emoji
     url: "tools/mijn-tool.html" // Pad naar je bestand
   }

STAP 3: UPDATE DE CACHE (BELANGRIJK!)
   - Omdat de app de oude bestanden onthoudt, zien gebruikers je nieuwe tool 
     pas als je een nieuwe versie forceert.
   - Open `sw.js`.
   - Verander de regel: const CACHE_NAME = 'potters-pfg-v2';
     Naar bijvoorbeeld: const CACHE_NAME = 'potters-pfg-v3';
   
   Zodra je dit uploadt naar de server, zal de browser van de gebruiker de oude 
   cache weggooien en de nieuwe bestanden (inclusief je nieuwe tool) downloaden.

==============================================================================

6. DATA & HIGHSCORES (FIREBASE)
------------------------------------------------------------------------------
Wil je een scorebord toevoegen aan een nieuwe game?

1. Zorg dat het script geladen wordt in je game-bestand:
   <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>
   <script src="../js/leaderboard-manager.js"></script>

2. Score opslaan (Javascript):
   LeaderboardManager.saveScore("naam_van_collectie", "Spelernaam", 100);

3. Lijst tonen (HTML + JS):
   Maak een <ul id="scoreLijst"></ul> en roep aan:
   LeaderboardManager.loadTop10("naam_van_collectie", "scoreLijst");

==============================================================================

7. BEKENDE VALKUILEN & TIPS
------------------------------------------------------------------------------
* Back-button gedrag:
  De app gebruikt `window.location.hash` (bijv. #kantine). Hierdoor werkt de 
  'terug'-knop op Android natuurlijk. Als de back-knop niet werkt, check 
  dan of je links wel <a href="#id"> gebruiken en geen harde links.

* iOS Safari 'Bounce':
  Soms stuitert het scherm op iOS. Dit is grotendeels opgelost in `layout.css` 
  door `height: 100dvh` te gebruiken.

* Plaatjes laden niet:
  Controleer of de paden kloppen. Vanuit een bestand in de map `tools/` moet 
  je `../assets/images/foto.jpg` gebruiken (twee puntjes om één map omhoog te gaan).

==============================================================================
EINDE README