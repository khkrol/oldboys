=============================================================================
PROJECT DOCUMENTATIE - STRUCTUUR EN WERKING
=============================================================================

Dit document beschrijft de werking van de JavaScript-bestanden die de applicatie
aandrijven. De applicatie is een portal met diverse tools en minigames, 
waarbij de inhoud dynamisch wordt geladen zonder de pagina te verversen.

-----------------------------------------------------------------------------
1. menu-data.js
-----------------------------------------------------------------------------
DOEL:
Dit is de centrale configuratie van de applicatie. Het bevat de "inhoudsopgave".
Als je een nieuwe tool of game wilt toevoegen, hoef je alleen dit bestand 
aan te passen.

WERKING:
- Bevat een constante array genaamd 'menuData'.
- De data is verdeeld in categorieën (bijv. "Tools", "Minigames").
- Elk item heeft:
  * id: Unieke naam (wordt gebruikt voor de URL hash).
  * title: De tekst in het menu.
  * icon: Een emoji of icoon.
  * url: Het bestand dat geladen moet worden (bijv. 'games/memory.html').

-----------------------------------------------------------------------------
2. app.js
-----------------------------------------------------------------------------
DOEL:
Dit is de "motor" van de website. Het zorgt voor de navigatie, het bouwen van 
het menu en het laden van de juiste pagina's.

BELANGRIJKSTE FUNCTIES:
- renderMenu():
  Leest 'menuData.js' uit en maakt automatisch de HTML-knoppen in de zijbalk.
  
- handleRouting():
  Kijkt naar de URL (achter het # teken). Als de URL verandert (bijv. #kantine),
  zoekt deze functie de juiste URL op en start het laden.
  
- loadIframe(url):
  Laadt de gekozen tool of game in het hoofdvenster (iframe). 
  Zorgt voor een nette fade-in/fade-out animatie tijdens het wisselen.

- Mobiele ondersteuning:
  Zorgt dat het menu op mobiele schermen open en dicht kan klappen.

-----------------------------------------------------------------------------
3. effects.js
-----------------------------------------------------------------------------
DOEL:
Verzorgt visuele feedback voor de minigames. Dit maakt het spelen leuker door
beloningen te tonen bij winst.

FUNCTIES (via object HattrickFX):
- win():
  Schiet confetti af (in de clubkleuren groen/geel/wit). Wordt gebruikt bij
  het behalen van een doel.
  
- highScore():
  Een langdurige vuurwerk-animatie. Bedoeld voor wanneer een speler een
  nieuwe topscore behaalt.
  
- shakeScreen():
  Laat het scherm kort trillen. Bedoeld als feedback bij "Game Over" of 
  een fout antwoord.

VEREISTE:
Dit bestand maakt gebruik van een externe library (waarschijnlijk canvas-confetti)
die ook in de HTML geladen moet zijn.

-----------------------------------------------------------------------------
4. leaderboard-manager.js
-----------------------------------------------------------------------------
DOEL:
Beheert de communicatie met de database (Google Firebase Firestore) om 
highscores op te slaan en te tonen.

BELANGRIJKSTE FUNCTIES:
- Configuratie:
  Bevat de API-sleutels om verbinding te maken met het 'oldboys' Firebase project.

- saveScore(collection, playerName, score):
  Slaat een score op in de database met de datum van vandaag.

- loadTop10 (toont eigenlijk Top 3):
  Probeert eerst scores van de afgelopen 7 dagen op te halen (weekklassement).
  Als er geen scores zijn deze week, schakelt hij over naar een "All-time" lijst.
  
- renderList():
  Zet de opgehaalde data om in nette HTML-lijstjes met medailles (🥇, 🥈, 🥉)
  en formatted datums (bijv. "Vr 14:30").

-----------------------------------------------------------------------------
IMPLEMENTATIE INSTRUCTIES
-----------------------------------------------------------------------------
Zorg dat de scripts in de juiste volgorde in je HTML staan (onderaan de body), 
omdat ze van elkaar afhankelijk zijn:

1. Firebase scripts (app & firestore)
2. Canvas Confetti script (voor effecten)
3. menu-data.js (moet er zijn voordat app.js draait)
4. effects.js
5. leaderboard-manager.js
6. app.js (start alles op)