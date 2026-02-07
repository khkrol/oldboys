/**
 * injury.js - Geavanceerde Hattrick Genezingscalculator
 * Inclusief simulatie van update-tijden.
 */

const InjuryCalculator = {
    mode: 'tsi', // Start modus

    // Update tijden per land (HH:MM)
    countries: {
        "nederland": "05:05",
        "curacao": "06:25",
        "suriname": "06:11",
        "indonesie": "23:00"
    },

    // Genezingsmatrix (Factor per update)
    // Rij = Leeftijd (index 0 = 17 jaar)
    // Kolom = Dokters niveau (0-5)
    healingTable: [
        [0.02279, 0.02735, 0.03191, 0.03646, 0.04102, 0.04558], // 17
        [0.02174, 0.02609, 0.03044, 0.03478, 0.03913, 0.04348], // 18
        [0.02069, 0.02483, 0.02897, 0.0331, 0.03724, 0.04138],  // 19
        [0.01964, 0.02357, 0.0275, 0.03142, 0.03535, 0.03928],  // 20
        [0.01859, 0.02231, 0.02603, 0.02974, 0.03346, 0.03718], // 21
        [0.01754, 0.02105, 0.02456, 0.02806, 0.03157, 0.03508], // 22
        [0.0165, 0.0198, 0.0231, 0.0264, 0.0297, 0.033],        // 23
        [0.01545, 0.01854, 0.02163, 0.02472, 0.02781, 0.0309],  // 24
        [0.0144, 0.01728, 0.02016, 0.02304, 0.02592, 0.0288],   // 25
        [0.01335, 0.01602, 0.01869, 0.02136, 0.02403, 0.0267],  // 26
        [0.0123, 0.01476, 0.01722, 0.01968, 0.02214, 0.0246],   // 27
        [0.01125, 0.0135, 0.01575, 0.018, 0.02025, 0.0225],     // 28
        [0.0102, 0.01224, 0.01428, 0.01632, 0.01836, 0.0204],   // 29
        [0.00915, 0.01098, 0.01281, 0.01464, 0.01647, 0.0183],  // 30
        [0.00811, 0.00973, 0.01135, 0.01298, 0.0146, 0.01622],  // 31
        [0.00706, 0.00847, 0.00988, 0.0113, 0.01271, 0.01412],  // 32
        [0.00601, 0.00721, 0.00841, 0.00962, 0.01082, 0.01202], // 33
        [0.00496, 0.00595, 0.00694, 0.00794, 0.00893, 0.00992], // 34
        [0.00391, 0.00469, 0.00547, 0.00626, 0.00704, 0.00782], // 35
        [0.00286, 0.00343, 0.004, 0.00458, 0.00515, 0.00572],   // 36
        [0.00181, 0.00217, 0.00253, 0.0029, 0.00326, 0.00362],  // 37
        [0.00077, 0.00092, 0.00108, 0.00123, 0.00139, 0.00154]  // 38+
    ],

    // UI Tab Wisselen
    switchTab: function(newMode) {
        this.mode = newMode;
        
        // Buttons updaten
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(newMode === 'tsi' ? 'tabTsi' : 'tabWeek').classList.add('active');

        // Velden tonen/verbergen
        document.getElementById('inputTsi').classList.toggle('hidden', newMode !== 'tsi');
        document.getElementById('inputWeek').classList.toggle('hidden', newMode !== 'week');
        
        // Verberg resultaten als je van tab wisselt
        document.getElementById('resultsArea').classList.add('hidden');
    },

    // Modal openen/sluiten
    toggleModal: function() {
        const modal = document.getElementById('infoModal');
        modal.classList.toggle('hidden');
    },

    // De Rekenfunctie
    calculate: function() {
        // 1. Inputs Ophalen
        const age = parseInt(document.getElementById('age').value) || 25;
        const docs = parseInt(document.getElementById('medic').value) || 0;
        const country = document.getElementById('country').value;
        
        let startSublevel = 0.0;

        // 2. Modus specifieke logica
        if (this.mode === 'tsi') {
            const tsiCur = document.getElementById('tsiCurrent').value;
            const tsiHealthy = document.getElementById('tsiHealthy').value;

            // Validatie: zijn de velden leeg?
            if (!tsiCur || !tsiHealthy) {
                alert("Vul beide TSI waarden in om te berekenen.");
                return;
            }

            const cur = parseFloat(tsiCur);
            const healthy = parseFloat(tsiHealthy);

            if (cur >= healthy) {
                alert("Huidige TSI moet lager zijn dan gezonde TSI.");
                return;
            }

            // Formule: Str = (1 - (TSI_tr / TSI_zd)) * 10
            const healthFactor = cur / healthy;
            startSublevel = (1 - healthFactor) * 10;

        } else {
            // Week modus
            const weeks = document.getElementById('weeksInput').value;
            if (!weeks) {
                alert("Vul het aantal weken in.");
                return;
            }
            startSublevel = parseFloat(weeks);
        }

        // 3. Genezingssnelheid bepalen
        let ageIndex = age - 17;
        if (ageIndex < 0) ageIndex = 0;
        if (ageIndex >= this.healingTable.length) ageIndex = this.healingTable.length - 1;

        // Tabelwaarde * 10 = sublevels per update
        const healingPerUpdate = this.healingTable[ageIndex][docs] * 10;

        // 4. Simulatie draaien
        const result = this.simulateRecovery(startSublevel, healingPerUpdate, country);

        // 5. Resultaten tonen
        this.renderResults(startSublevel, result);
    },

    simulateRecovery: function(currentLevel, healRate, countryKey) {
        let level = currentLevel;
        let now = new Date();
        
        let updatesPlayable = 0;
        let updatesHealed = 0;
        let datePlayable = null;
        let dateHealed = null;

        // Bepaal tijdstip van de eerstvolgende update
        const timeStr = this.countries[countryKey] || "05:05";
        const [uHour, uMin] = timeStr.split(':').map(Number);
        
        let nextUpdate = new Date(now);
        nextUpdate.setHours(uHour, uMin, 0, 0);

        // Als update vandaag al geweest is, begin morgen
        if (nextUpdate <= now) {
            nextUpdate.setDate(nextUpdate.getDate() + 1);
        }

        // Loop maximaal 200 dagen (veiligheid)
        for (let i = 1; i <= 200; i++) {
            level -= healRate; // Genezing toepassen

            // Check: Pleister (Speelklaar) is < 1.0
            if (level < 1.0 && datePlayable === null) {
                updatesPlayable = i;
                datePlayable = new Date(nextUpdate); // Kloon datum
            }

            // Check: Gezond is <= 0.0
            if (level <= 0.0) {
                updatesHealed = i;
                dateHealed = new Date(nextUpdate); // Kloon datum
                break; // Klaar!
            }

            // Volgende dag
            nextUpdate.setDate(nextUpdate.getDate() + 1);
        }

        return { datePlayable, updatesPlayable, dateHealed, updatesHealed };
    },

    renderResults: function(startLevel, res) {
        // Maak zichtbaar
        document.getElementById('resultsArea').classList.remove('hidden');
        
        // Toon berekende sublevel
        document.getElementById('sublevelVal').innerText = startLevel.toFixed(3);

        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };

        // --- Box 1: Pleister ---
        const playEl = document.getElementById('boxPlay');
        if (startLevel < 1.0) {
            document.getElementById('datePlay').innerText = "NU";
            document.getElementById('updatesPlay').innerText = "0";
            playEl.className = "result-box neutral"; // Grijs/groen want al klaar
        } else {
            document.getElementById('datePlay').innerText = res.datePlayable ? res.datePlayable.toLocaleDateString('nl-NL', options) : "???";
            document.getElementById('updatesPlay').innerText = res.updatesPlayable;
            playEl.className = "result-box secondary"; // Geel
        }

        // --- Box 2: Volledig ---
        const healEl = document.getElementById('boxHeal');
        if (startLevel <= 0) {
             document.getElementById('dateHeal').innerText = "NU";
             document.getElementById('updatesHeal').innerText = "0";
             healEl.className = "result-box neutral";
        } else {
             document.getElementById('dateHeal').innerText = res.dateHealed ? res.dateHealed.toLocaleDateString('nl-NL', options) : "> 200 dagen";
             document.getElementById('updatesHeal').innerText = res.updatesHealed;
             
             // Rood maken als het heel lang duurt
             if (res.updatesHealed > 50) {
                 healEl.className = "result-box alert";
             } else {
                 healEl.className = "result-box primary";
             }
        }

        // Update Dr Umit Quote op basis van ernst
        const quoteEl = document.querySelector('.quote-box');
        let quoteText = "";
        
        if (startLevel > 4.0) {
            quoteText = `"Ai, dit is ernstig. Zonder goede artsen is zijn carrière voorbij."`;
        } else if (res.updatesPlayable <= 2) {
            quoteText = `"Goed nieuws! Hij staat waarschijnlijk dit weekend alweer op het veld."`;
        } else {
            quoteText = `"De behandeling is gestart. Ik houd de situatie nauwlettend in de gaten."`;
        }
        
        quoteEl.innerHTML = `<div><span class="name-tag">Dr. Ümit:</span></div>${quoteText}`;
    }
};