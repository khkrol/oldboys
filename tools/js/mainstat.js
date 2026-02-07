/**
 * mainstat.js - Hoofdskill Schatter
 * Gebaseerd op "Schatting Hoofdskill Speler Uit Salaris" protocol.
 */

const MainStatScout = {
    // Constanten uit Tabel 1 [cite: 412, 413]
    // A = vermenigvuldigingsfactor, B = exponent
    constants: {
        'IM': { a: 0.000941805, b: 6.440795032, name: "Spelmaken" },
        'Winger': { a: 0.000443760, b: 6.464125722, name: "Vleugelspel" },
        'CD': { a: 0.000714556, b: 6.460781317, name: "Verdedigen" },
        'Fwd': { a: 0.000913698, b: 6.409006368, name: "Scoren" }
    },

    // Namen van skills voor weergave
    skillNames: [
        "Niet bestaand", "Rampzalig", "Slecht", "Zwak", "Matig", "Redelijk", 
        "Goed", "Uitstekend", "Formidabel", "Uitmuntend", "Briljant", 
        "Wereldklasse", "Bovennatuurlijk", "Titanisch", "Buitenaards", "Mythisch", 
        "Magisch", "Utopisch", "Goddelijk"
    ],

    toggleModal: function() {
        document.getElementById('infoModal').classList.toggle('hidden');
    },

    getSkillLabel: function(value) {
        // Hattrick logica: 6.01-7.00 = Goed (7).
        // We ronden af naar beneden voor index (index 0 = 0, index 7 = Goed)
        const intVal = Math.floor(value); 
        // Array index 6 is 'Goed' in HT termen (0-based array vs 1-based skill), 
        // maar de tool werkt makkelijker met de officiële HT nummers.
        // Index 0 = '0', Index 7 = 'Uitstekend' (eigenlijk 8).
        // Correctie: HT skill 7 = 'Goed'. Index 6 in array.
        if (intVal < 0) return "Onbekend";
        if (intVal >= this.skillNames.length) return "Goddelijk+";
        return `${this.skillNames[intVal]} (${intVal})`;
    },

    calculate: function() {
        // 1. Inputs ophalen
        const posKey = document.getElementById('position').value;
        const age = parseInt(document.getElementById('age').value) || 20;
        let salary = parseFloat(document.getElementById('salary').value);
        const hasSpecialty = document.getElementById('specialty').checked;
        
        const tsi = parseFloat(document.getElementById('tsi').value) || 0;
        const form = parseInt(document.getElementById('form').value) || 6;
        const stamina = parseInt(document.getElementById('stamina').value) || 7;

        if (!salary || salary < 250) {
            alert("Vul een geldig salaris in (> 250).");
            return;
        }

        const config = this.constants[posKey];

        // --- FASE 1: SALARIS NORMALISATIE ---
        
        // 1.1 Specialiteit correctie (+10% verwijderen) [cite: 360]
        if (hasSpecialty) {
            salary = salary / 1.10;
        }

        // 1.2 Leeftijdskorting omkeren (29+ jaar) [cite: 375, 558]
        if (age >= 29) {
            let discountYears = age - 28;
            // 10% korting per jaar cumulatief
            let discountFactor = 1.0 - (0.10 * discountYears);
            // Maximale korting is 90% (dus factor 0.1) [cite: 391]
            if (discountFactor < 0.1) discountFactor = 0.1;
            
            salary = salary / discountFactor;
        }

        // 1.3 Basis salaris verwijderen [cite: 399]
        let wageMass = salary - 250;
        if (wageMass < 0) wageMass = 0;

        // --- FASE 2: SKILL BEREKENING (LOON VECTOR) ---
        // Inverse formule: S = (Wage / C)^(1/b) + 1 [cite: 567]

        // Scenario A: Mono-skill (Max) - we nemen aan dat 100% loon uit hoofdskill komt
        const skillMax = Math.pow((wageMass / config.a), (1 / config.b)) + 1;

        // Scenario B: Multi-skill (Min) - we nemen aan dat 85% loon uit hoofdskill komt [cite: 572]
        const skillMin = Math.pow(((wageMass * 0.85) / config.a), (1 / config.b)) + 1;


        // --- FASE 3: TSI VALIDATIE (PRESTATIE VECTOR) ---
        let skillTsi = 0;
        if (tsi > 0) {
            // Formule: TSI_norm = (TSI * 1000) / (sqrt(Stamina) * sqrt(Form)) [cite: 477]
            const stMult = Math.sqrt(stamina);
            const fmMult = Math.sqrt(form);
            const tsiPure = (tsi * 1000) / (stMult * fmMult);

            // Skill = (sqrt(TSI_pure) / 1.03)^(1/3) [cite: 482]
            // Let op: TSI formule verschilt iets per positie in realiteit, maar cubic root is de basis.
            skillTsi = Math.pow((Math.sqrt(tsiPure) / 1.03), (1/3));
        }

        // --- FASE 4: RESULTATEN RENDEREN ---
        document.getElementById('resultsArea').classList.remove('hidden');
        
        // Wage Resultaat
        const resultText = `${skillMin.toFixed(1)} - ${skillMax.toFixed(1)}`;
        document.getElementById('wageResult').innerText = resultText;
        
        // Label bepalen op basis van het gemiddelde
        const avgSkill = (skillMin + skillMax) / 2;
        document.getElementById('wageLabel').innerText = this.getSkillLabel(avgSkill);

        // TSI Resultaat & Analyse
        const tsiBox = document.getElementById('boxTsi');
        const analysisEl = document.getElementById('analysisText');
        
        if (skillTsi > 0) {
            document.getElementById('tsiResult').innerText = skillTsi.toFixed(1);
            
            // Vergelijk Loon vs TSI [cite: 501]
            const delta = skillTsi - skillMax;

            if (delta > 0.3) {
                // TSI is significant hoger dan loon
                tsiBox.className = "result-box primary"; // Groen
                analysisEl.innerHTML = `
                    Pas op! De TSI (${skillTsi.toFixed(1)}) is hoger dan zijn salaris doet vermoeden. 
                    <br>Deze speler heeft waarschijnlijk <strong>getraind</strong> sinds zijn laatste verjaardag.
                    <br>Reken op het TSI-niveau.`;
            } else if (delta < -0.5) {
                // TSI is lager (Vorm dip)
                tsiBox.className = "result-box alert"; // Rood/Oranje
                analysisEl.innerHTML = `
                    De TSI is erg laag voor dit salaris. 
                    <br>Waarschijnlijk is zijn interne Vorm lager dan de zichtbare '${form}'. 
                    <br>Zijn basiskwaliteit ligt wel degelijk rond de <strong>${skillMax.toFixed(1)}</strong>.`;
            } else {
                // Stabiel
                tsiBox.className = "result-box secondary"; // Geel
                analysisEl.innerHTML = `
                    TSI en Salaris komen overeen. Dit is een stabiele schatting.
                    <br>Het niveau ligt rond de <strong>${avgSkill.toFixed(1)}</strong>.`;
            }
        } else {
            // Geen TSI ingevuld
            document.getElementById('tsiResult').innerText = "?";
            tsiBox.className = "result-box neutral";
            analysisEl.innerText = "Vul TSI, Vorm en Conditie in voor een check op recente training.";
        }
    }
};