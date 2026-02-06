// Wacht tot de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    handleRouting();
});

// Luister naar veranderingen in de URL (de hash #)
window.addEventListener('hashchange', handleRouting);

// Functie 1: Bouw het menu op basis van de data
function renderMenu() {
    const menuContainer = document.querySelector('.menu-grid');
    if (!menuContainer) return;

    menuContainer.innerHTML = ''; // Maak leeg

    menuData.forEach(section => {
        // Categorie titel
        const catDiv = document.createElement('div');
        catDiv.className = 'nav-category';
        catDiv.textContent = section.category;
        menuContainer.appendChild(catDiv);

        // Links
        section.items.forEach(item => {
            const link = document.createElement('a');
            link.className = 'nav-item';
            link.dataset.id = item.id; // Opslaan voor styling
            link.innerHTML = `${item.icon} &nbsp; ${item.title}`;
            link.href = `#${item.id}`; // Dit activeert de hashchange
            
            // Klik event voor mobiel (menu sluiten)
            link.addEventListener('click', () => {
                if (window.innerWidth <= 850) {
                    toggleMenu();
                }
            });

            menuContainer.appendChild(link);
        });
    });
}

// Functie 2: Routing (wissel van pagina)
function handleRouting() {
    // Pak de hash zonder het # teken (bijv: "kantine")
    let hash = window.location.hash.substring(1);
    
    // Als er geen hash is, ga naar bestuurskamer (standaard)
    if (!hash) {
        hash = 'bestuurskamer';
        // Update URL zonder herladen zodat de back-button werkt
        history.replaceState(null, null, `#${hash}`);
    }

    // Zoek de juiste tool in de data
    let foundTool = null;
    menuData.forEach(cat => {
        const item = cat.items.find(i => i.id === hash);
        if (item) foundTool = item;
    });

    if (foundTool) {
        loadIframe(foundTool.url);
        updateActiveMenu(hash);
    }
}

// Functie 3: Iframe laden met animatie
function loadIframe(url) {
    const iframe = document.getElementById('mainFrame');
    
    // Start fade-out (onzichtbaar)
    iframe.classList.remove('fade-in');

    setTimeout(() => {
        iframe.src = url;
        
        iframe.onload = () => {
            iframe.classList.add('fade-in'); // Start fade-in
        };
    }, 200);
}

// Functie 4: Zet het actieve menu item in het geel
function updateActiveMenu(activeId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === activeId) {
            item.classList.add('active');
        }
    });
}

// Mobiel menu toggle
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
}