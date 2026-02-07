/**
 * Hattrick Keeper Scout Logica v3.0
 * Gebaseerd op de 'Multi-Factoriale Convergentie Methode'.
 * Bron: Hattrick Keeper Scout Logica Verbetering.pdf
 */

const KEEPER_DATA = {
    // Minimale salarissen per niveau (Basissalaris zonder bonussen)
    // Bron: PDF Pagina 3 & 4
    salaryTable: {
        1: 250, 2: 270, 3: 330, 4: 450, 
        5: 610, 6: 830, 7: 1150, 8: 1590, 
        9: 2250, 10: 3170, 11: 4530, 12: 6450, 
        13: 9150, 14: 12910, 15: 18050, 16: 24150, 
        17: 31480, 18: 40930, 19: 52990, 20: 68210
    },

    // Skill namen voor display
    skillNames: [
        "Niet bestaand", "Rampzalig", "Slecht", "Waardeloos", "Zwak", 
        "Matig", "Redelijk", "Goed", "Uitstekend", "Formidabel", 
        "Uitmuntend", "Briljant", "Wereldklasse", "Buitenaards", 
        "Titanisch", "Magisch", "Utopisch", "Goddelijk", 
        "Goddelijk+1", "Goddelijk+2", "MAX"
    ],

    /**
     * Haalt de impact van vorm op TSI op.
     * Bron: PDF Tabel op pagina 2
     */
    getFormFactor: function(formLevel) {
        const formMap = {
            1: 0.305, 2: 0.50, 3: 0.629, 4: 0.732, 
            5: 0.820, 6: 0.897, 7: 0.967, 8: 1.00
        };
        return formMap[formLevel] || 0.82;
    }
};

/**
 * Hoofdfunctie die wordt aangeroepen bij elke input wijziging
 */
function berekenKeeper() {
    // 1. Input verzamelen
    const inputs = {
        salaris: parseFloat(document.getElementById('salaris').value) || 0,
        tsi: parseFloat(document.getElementById('tsi').value) || 0,
        leeftijd: parseInt(document.getElementById('leeftijd').value) || 17,
        vorm: parseInt(document.getElementById('vorm').value),
        spelhervatten: parseInt(document.getElementById('spelhervatten').value),
        isBuitenlander: document.getElementById('isBuitenlander').checked,
        heeftSpecialiteit: document.getElementById('heeftSpecialiteit').checked
    };

    if (inputs.salaris < 250 && inputs.tsi === 0) return; // Geen input

    // 2. Berekeningen uitvoeren
    const salSkill = calculateSalarySkill(inputs);
    const tsiSkill = calculateTsiSkill(inputs);
    
    // 3. Weging bepalen (Convergentie)
    // Bij jonge spelers (<21) is TSI leidend (70%).
    // Bij oudere spelers is Salaris leidend omdat TSI fluctueert en salaris stabiel is.
    let finalSkill = 0;
    let confidence = "Laag";

    if (inputs.salaris > 0 && inputs.tsi > 0) {
        if (inputs.leeftijd <= 21) {
            finalSkill = (tsiSkill * 0.70) + (salSkill * 0.30);
            confidence = "TSI-Dominant";
        } else {
            finalSkill = (salSkill * 0.65) + (tsiSkill * 0.35);
            confidence = "Salaris-Dominant";
        }
    } else if (inputs.salaris > 0) {
        finalSkill = salSkill;
        confidence = "Alleen Salaris";
    } else {
        finalSkill = tsiSkill;
        confidence = "Alleen TSI";
    }

    // 4. Output Renderen
    updateUI(finalSkill, salSkill, tsiSkill, confidence);
}

/**
 * Berekent Skill op basis van Salaris (Gecorrigeerd)
 * Logica: Neutraliseer bonussen -> Zoek in tabel -> Interpoleer
 */
function calculateSalarySkill(p) {
    let adjSalary = p.salaris;

    // Fase 1: Data-neutralisatie [Bron: PDF Pagina 8]
    if (p.isBuitenlander) {
        adjSalary /= 1.20; // 20% bonus verwijderen
    }
    
    if (p.heeftSpecialiteit) {
        // We nemen 10% als veilige marge voor moderne seizoenen
        adjSalary /= 1.10; 
    }

    // Correctie voor Spelhervatten: ca 0.25% per niveau
    // Spelers met hoog SP hebben hoger loon, dus we moeten loon verlagen om 'Kaal Keepen' te vinden.
    if (p.spelhervatten > 1) {
        const spImpact = 1 + (p.spelhervatten * 0.0025);
        adjSalary /= spImpact;
    }

    // Als salaris te laag is voor tabel
    if (adjSalary < 250) return 0;

    // Tabel Lookup & Interpolatie
    let estimatedLvl = 1;
    for (let lvl = 20; lvl >= 1; lvl--) {
        const base = KEEPER_DATA.salaryTable[lvl];
        
        if (adjSalary >= base) {
            // We hebben het basisniveau gevonden (bijv. 7). Nu de decimaal bepalen.
            // We kijken naar het volgende niveau voor de range.
            let nextBase = KEEPER_DATA.salaryTable[lvl + 1];
            
            // Als we boven 20 zitten, schatten we de groei (ca 30% per level)
            if (!nextBase) nextBase = base * 1.35; 

            const range = nextBase - base;
            const progress = adjSalary - base;
            
            // Lineaire interpolatie binnen de salarisbandbreedte
            // (Logaritmisch zou beter zijn, maar op korte afstanden is lineair acceptabel voor schatting)
            let decimal = progress / range;
            
            // Leeftijdscorrectie voor salaris (oude logica behouden als fallback)
            // Jonge spelers hebben vaak iets lager salaris dan formule doet vermoeden
            let ageCorrection = 0;
            if (p.leeftijd < 19) ageCorrection = 0.15;

            estimatedLvl = lvl + decimal + ageCorrection;
            break;
        }
    }
    return estimatedLvl;
}

/**
 * Berekent Skill op basis van TSI
 * Formule: TSI = 3 * GK^3.359 * FormFactor^0.5
 * Inverse: GK = ( (TSI / FormFactor^0.5) / 3 ) ^ (1 / 3.359)
 */
function calculateTsiSkill(p) {
    if (p.tsi <= 0) return 0;

    // Vormfactor ophalen (Tabel pagina 2)
    // PDF zegt: Invloed van vorm op TSI volgt vierkantswortel (Source 39)
    // Maar Tabel 1 geeft de "Theoretische prestatie-impact". 
    // In Source 31 staat: TSI = ... * Fm^0.5.
    // We gebruiken de tabelwaarden als de Fm component.
    
    // Uitstekende vorm (8) = 1.0
    // Rampzalige vorm (1) = 0.305
    const formPerformance = KEEPER_DATA.getFormFactor(p.vorm);
    
    // Kale TSI berekenen (TSI gezuiverd van vorm)
    // Uit formule: KaleTSI = TSI / sqrt(FormFactor)? 
    // PDF Source 31 impliceert dat de factor in de formule zit.
    // Laten we de formule strikt volgen: GK = (TSI / (3 * sqrt(Fm))) ^ (1/3.359)
    // Waarbij Fm de factor uit de tabel is.
    
    // N.B. Vorm 8 (1.0) -> sqrt(1) = 1. Klopt.
    const formFactor = Math.sqrt(formPerformance);
    
    const baseValue = p.tsi / (3 * formFactor);
    
    // Exponent: 1 / 3.359 (Bron: PDF Pagina 7, punt 117)
    const exponent = 1 / 3.359;
    
    const skill = Math.pow(baseValue, exponent);
    return skill;
}

function updateUI(finalSkill, salSkill, tsiSkill, confidence) {
    // Afronding en begrenzing
    if (finalSkill > 20) finalSkill = 20;
    if (finalSkill < 0) finalSkill = 0;

    const displayDecimal = finalSkill.toFixed(2);
    const intLevel = Math.floor(finalSkill);
    const levelName = KEEPER_DATA.skillNames[intLevel] || "Onbekend";

    // Main Display
    document.getElementById('resLevel').innerText = displayDecimal;
    document.getElementById('resNaam').innerText = levelName;

    // Debug / Analyse Display
    document.getElementById('debugSal').innerText = salSkill > 0 ? salSkill.toFixed(2) : "-";
    document.getElementById('debugTsi').innerText = tsiSkill > 0 ? tsiSkill.toFixed(2) : "-";
    document.getElementById('debugConf').innerText = confidence;
}

// Event Listeners toevoegen aan alle inputs
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', berekenKeeper);
        input.addEventListener('change', berekenKeeper);
    });
    
    // Modals
    window.openModal = function() { document.getElementById('infoModal').style.display = 'flex'; };
    window.closeModal = function() { document.getElementById('infoModal').style.display = 'none'; };
});