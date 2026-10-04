/* ========================================================
   ZOMBAR - Main Interactive Script
   ======================================================== */

// Remplace 'UC_VOTRE_CHANNEL_ID' par ton véritable ID YouTube (ex: UCxxxxxxxx)
const YOUTUBE_CHANNEL_ID = 'UC_VOTRE_CHANNEL_ID';

document.addEventListener('DOMContentLoaded', () => {
    // Initialise le flux YouTube si le conteneur existe
    if (document.getElementById('yt-feed')) {
        loadYouTubeVideos();
    }

    // Initialise le formulaire de contact s'il existe
    const contactForm = document.getElementById('suggestion-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

/**
 * 1. Chargement dynamique des vidéos YouTube via RSS-to-JSON
 */
async function loadYouTubeVideos() {
    const container = document.getElementById('yt-feed');
    const feedUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

    try {
        const res = await fetch(feedUrl);
        const data = await res.json();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            container.innerHTML = '';
            data.items.slice(0, 3).forEach(item => {
                const videoId = item.link.split('v=')[1];
                const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                
                container.innerHTML += `
                    <div class="yt-card">
                        <img src="${thumb}" alt="${item.title}">
                        <div class="yt-card-body">
                            <div class="yt-card-title">${item.title}</div>
                            <a href="${item.link}" target="_blank" class="yt-card-link">
                                <i class="fa-solid fa-play"></i> Regarder sur YouTube
                            </a>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `
                <div class="yt-card" style="grid-column: 1 / -1;">
                    <div class="yt-card-body">
                        <div class="yt-card-title">Retrouve toutes les vidéos directement sur la chaîne YouTube ZOMBAR !</div>
                        <a href="https://youtube.com" target="_blank" class="yt-card-link"><i class="fa-brands fa-youtube"></i> Visiter la chaîne</a>
                    </div>
                </div>`;
        }
    } catch (err) {
        container.innerHTML = `
            <div class="yt-card" style="grid-column: 1 / -1;">
                <div class="yt-card-body">
                    <div class="yt-card-title">Rejoins-nous directement sur YouTube pour ne rater aucune vidéo !</div>
                    <a href="https://youtube.com" target="_blank" class="yt-card-link"><i class="fa-brands fa-youtube"></i> Visiter la chaîne</a>
                </div>
            </div>`;
    }
}

/**
 * 2. Filtrage interactif du Mur de Clips
 */
function filterClips(category, btnElement) {
    document.querySelectorAll('.clip-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (btnElement) btnElement.classList.add('active');

    document.querySelectorAll('.clip-card').forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * 3. Sélecteur de catégories pour les Mods BeamNG
 */
function switchCategory(catId, btnElement) {
    document.querySelectorAll('.mod-panel').forEach(panel => {
        panel.classList.remove('active-panel');
    });

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetPanel = document.getElementById('panel-' + catId);
    if (targetPanel) {
        targetPanel.classList.add('active-panel');
    }

    if (btnElement) {
        btnElement.classList.add('active');
    }
}

/**
 * 4. FAQ Accordéon
 */
function toggleFaq(button) {
    const item = button.parentElement;
    item.classList.toggle('active');
}

/**
 * 5. Gestion de la soumission du formulaire de contact
 */
function handleFormSubmit(e) {
    e.preventDefault();
    const feedback = document.getElementById('form-feedback');
    if (feedback) {
        feedback.innerHTML = '<p style="color: var(--zombar-green); font-weight: 700; text-align: center;">Merci ! Ton message a été envoyé avec succès.</p>';
    }
    e.target.reset();
}