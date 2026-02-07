=============================================================================
PROJECT DOCUMENTATIE - STYLING (CSS)
=============================================================================

Hieronder worden de stylesheets beschreven. De applicatie maakt gebruik van 
CSS Variabelen (bijv. var(--ht-green)) om kleuren consistent te houden.

-----------------------------------------------------------------------------
5. global.css
-----------------------------------------------------------------------------
DOEL:
De basis van de huisstijl. Dit bestand moet in ELKE HTML-pagina geladen worden.
Het bevat de "bouwstenen" die overal gebruikt worden.

BELANGRIJKSTE ONDERDELEN:
- Variabelen (:root):
  Hier worden de kleuren gedefinieerd (Hattrick groen, geel, achtergrondgrijs).
  Als je de huisstijl wilt aanpassen, doe je dat hier.

- Algemene Componenten:
  * Buttons: De standaard groene actieknoppen.
  * Inputs: Invoervelden die niet inzoomen op mobiel (font-size 16px).
  * Character Display: De styling voor het plaatje met het spraakwolkje 
    (gebruikt in tools voor advies).
  * Resultaat blokken: De groene, gele en rode vlakken om uitkomsten te tonen.

-----------------------------------------------------------------------------
6. layout.css
-----------------------------------------------------------------------------
DOEL:
Regelt de hoofdindeling (het "skelet") van de applicatie. Dit bestand is 
vooral belangrijk voor de index.html (de schil) en de navigatiebalk.

WERKING:
- Sidebar (Navigatie):
  Zorgt voor de donkergroene balk links. Bevat styling voor de actieve knop
  (geel accent) en hover-effecten.
  
- Responsive Design (Mobiel):
  Bevat de regels voor schermen kleiner dan 850px.
  * Verbergt de sidebar standaard.
  * Toont de "Hamburger" menuknop bovenin.
  * Schuift het menu in beeld als je op de knop drukt.

- Iframe Animatie:
  Zorgt ervoor dat nieuwe pagina's met een zachte 'fade-in' verschijnen 
  in plaats van hard te verspringen.

-----------------------------------------------------------------------------
7. game.css
-----------------------------------------------------------------------------
DOEL:
Specifieke styling voor de minigames en interactieve elementen. Dit bestand
zorgt voor de "fun" factor (animaties en spelelementen).

BELANGRIJKSTE ONDERDELEN:
- Game Specifiek:
  Bevat styling voor Memory (draaiende kaarten), Mastermind (pionnetjes), 
  en de Runner game (clouds achtergrond).

- Animaties:
  * @keyframes pulse/popIn: Laat knoppen en spelstukken bewegen.
  * Shake animatie: Laat het scherm trillen bij een fout antwoord.

- UI Elementen:
  * 3D Knoppen: Knoppen die 'indrukken' als je erop klikt (tactiele feedback).
  * Modals (Popups): De vensters die over het spel heen komen (bijv. bij winst),
    met een wazige achtergrond (backdrop-filter).
  * Leaderboard: Styling voor de ranglijst (goud/zilver/brons accenten).

-----------------------------------------------------------------------------
VOLGORDE VAN LADEN (BELANGRIJK!)
-----------------------------------------------------------------------------
Omdat de bestanden van elkaar afhankelijk zijn (game.css gebruikt variabelen 
uit global.css), moet je ze in de juiste volgorde in de <head> zetten:

1. global.css  (Moet altijd als eerste!)
2. layout.css  (Alleen nodig in de index.html / hoofdschil)
3. game.css    (Alleen nodig in de pagina's van de tools/games)