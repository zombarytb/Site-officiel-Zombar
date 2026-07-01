document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // CONFIGURATION — remplace par ton vrai domaine en production
    // =========================================================================
    // ⚠️ SÉCURITÉ : Le webhook Discord NE DOIT PAS être dans le code client.
    // Remplace cette URL par l'endpoint de ton propre proxy/backend pour éviter
    // que n'importe qui puisse l'utiliser pour spammer ton Discord.
    const discordWebhookUrl = "REMPLACE_PAR_TON_URL_PROXY";

    const preloader = document.querySelector(".cyber-preloader");

    // =========================================================================
    // A. MANAGEMENT DU PRELOADER & TRANSITIONS FLUIDES
    // =========================================================================
    // Bloque le scroll pendant le chargement
    document.body.style.overflow = "hidden";

    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("fade-out");
            // Réactive le scroll une fois le preloader caché
            document.body.style.overflow = "";
        }, 1300);
    }

    const localLinks = document.querySelectorAll(".nav-links a, .hero-action-group a");
    localLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            if (href && !href.startsWith("#") && !link.getAttribute("target")) {
                e.preventDefault();
                if (preloader) {
                    preloader.classList.remove("fade-out");
                    preloader.classList.add("fade-in");

                    setTimeout(() => {
                        window.location.href = href;
                    }, 450);
                }
            }
        });
    });

    // =========================================================================
    // B. ANIMATIONS DE SCROLL (INTERSECTION OBSERVER)
    // =========================================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    document.querySelectorAll(".scroll-reveal").forEach(element => {
        revealObserver.observe(element);
    });

    // =========================================================================
    // C. CHARGEMENT DU PLANNING DEPUIS planning.json
    // =========================================================================
    fetch("planning.json")
        .then(response => {
            if (!response.ok) throw new Error("Impossible de charger planning.json");
            return response.json();
        })
        .then(data => {
            // --- Injection du prochain live ---
            const nextLiveEl = document.getElementById("next-live-text");
            if (nextLiveEl && data.nextLiveDate) {
                nextLiveEl.textContent = data.nextLiveDate;
            }

            // --- Injection des compteurs de réseaux sociaux ---
            if (data.counters) {
                const counterMap = {
                    twitch:  document.querySelector(".twitch-border .network-counter span"),
                    youtube: document.querySelector(".youtube-border .network-counter span"),
                    tiktok:  document.querySelector(".tiktok-border .network-counter span"),
                    discord: document.querySelector(".discord-border .network-counter span")
                };
                for (const [key, el] of Object.entries(counterMap)) {
                    if (el && data.counters[key]) {
                        el.textContent = data.counters[key];
                    }
                }
            }

            // --- Génération dynamique du planning hebdomadaire ---
            const weeklyGrid = document.getElementById("weekly-grid");
            if (weeklyGrid && data.weeklySchedule) {
                weeklyGrid.innerHTML = "";
                data.weeklySchedule.forEach(item => {
                    const isLive = item.status === "live";
                    const card = document.createElement("div");
                    card.className = `day-card-modern scroll-reveal${isLive ? " is-live-day" : ""}`;
                    card.innerHTML = `
                        <div class="day-card-header">
                            <span class="day-card-name">${item.day}</span>
                            <span class="status-badge ${isLive ? "live" : "offline"}">
                                ${isLive ? "LIVE STREAM" : "OFFLINE"}
                            </span>
                        </div>
                        <div class="day-card-body">${item.text}</div>
                    `;
                    weeklyGrid.appendChild(card);

                    // Active le scroll-reveal sur les nouvelles cartes
                    revealObserver.observe(card);
                });
            }
        })
        .catch(err => {
            console.warn("planning.json non disponible :", err.message);
            // Valeur de repli si le JSON est absent
            const nextLiveEl = document.getElementById("next-live-text");
            if (nextLiveEl) nextLiveEl.textContent = "Consulte le Discord pour les dates !";
        });

    // =========================================================================
    // D. EXPÉDITION DU FORMULAIRE DE SUGGESTIONS VIA WEBHOOK DISCORD
    // =========================================================================
    const suggestionForm = document.getElementById("suggestion-form");
    const formFeedback = document.getElementById("form-feedback");

    if (suggestionForm && formFeedback) {
        suggestionForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const pseudo = document.getElementById("user-pseudo").value;
            const type = document.getElementById("suggestion-type").value;
            const message = document.getElementById("user-message").value;

            const discordMessage = {
                username: "Système de Transmission Zombar",
                avatar_url: "https://i.imgur.com/4M79p9f.png",
                embeds: [{
                    title: `📩 Nouvelle Transmission : ${type}`,
                    color: 15651145,
                    fields: [
                        { name: "👤 Expéditeur", value: `**${pseudo}**`, inline: true },
                        { name: "🏷️ Catégorie", value: type, inline: true },
                        { name: "📝 Contenu", value: message }
                    ],
                    footer: { text: "ZOMBAR WEB PORTAL" },
                    timestamp: new Date().toISOString()
                }]
            };

            fetch(discordWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(discordMessage)
            })
            .then(response => {
                if (!response.ok) throw new Error("Le serveur distant a renvoyé un code d'erreur.");

                formFeedback.innerHTML = `
                    <div class="terminal-success-box">
                        <div><i class="fa-solid fa-check"></i> <strong>[SUCCESS] TRANSMISSION REÇUE ET ENCRYPTÉE.</strong></div>
                        <div style="font-size: 13px; margin-top: 5px; color: rgba(0, 255, 102, 0.7);">
                            &gt; Données transmises au quartier général sur Discord.<br>
                            &gt; Statut : OK. Merci pour ton implication !
                        </div>
                    </div>
                `;
                suggestionForm.reset();
            })
            .catch(error => {
                console.error("Erreur de transmission :", error);
                formFeedback.innerHTML = `
                    <div class="terminal-success-box" style="border-color: #ff3333; color: #ff3333; background: rgba(255,51,51,0.03);">
                        <div><i class="fa-solid fa-circle-xmark"></i> <strong>[CRITICAL ERROR] TRANSACTION INTERROMPUE.</strong></div>
                        <div style="font-size: 13px; margin-top: 5px;">
                            &gt; Le serveur de réception a refusé le flux. Vérifie ta connexion Internet.
                        </div>
                    </div>
                `;
            });
        });
    }
});