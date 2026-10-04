document.addEventListener("DOMContentLoaded", () => {
    const discordWebhookUrl = "REMPLACE_PAR_TON_URL_PROXY";
    const discordGuildId = "1342602738604773436";

    // Preloader
    const preloader = document.querySelector(".cyber-preloader");
    if (preloader) {
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            preloader.classList.add("fade-out");
            document.body.style.overflow = "";
        }, 1300);
    } else {
        document.body.style.overflow = "";
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
                    setTimeout(() => { window.location.href = href; }, 450);
                } else {
                    window.location.href = href;
                }
            }
        });
    });

    // Animations Scroll Reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
            }
        });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

    document.querySelectorAll(".scroll-reveal").forEach(element => {
        revealObserver.observe(element);
    });

    // Planning Dynamic Fetch
    fetch("planning.json")
        .then(response => {
            if (!response.ok) throw new Error("Erreur de chargement");
            return response.json();
        })
        .then(data => {
            const nextLiveEl = document.getElementById("next-live-text");
            if (nextLiveEl && data.nextLiveDate) {
                nextLiveEl.textContent = data.nextLiveDate;
            }

            const weeklyGrid = document.getElementById("weekly-grid");
            if (weeklyGrid && data.weeklySchedule) {
                weeklyGrid.innerHTML = "";
                data.weeklySchedule.forEach(item => {
                    const isLive = item.status === "live";
                    const card = document.createElement("div");
                    card.className = `glass-card scroll-reveal${isLive ? " is-live-day" : ""}`;
                    card.innerHTML = `
                        <div class="card-title">
                            <i class="fa-solid fa-calendar-day card-icon"></i> ${item.day}
                        </div>
                        <span class="tag" style="${isLive ? 'color: var(--zombar-green); border-color: var(--zombar-green);' : ''}">
                            ${isLive ? "LIVE STREAM" : "OFFLINE"}
                        </span>
                        <p style="margin-top: 10px; color: rgba(255,255,255,0.7); font-size: 14px;">${item.text}</p>
                    `;
                    weeklyGrid.appendChild(card);
                    revealObserver.observe(card);
                });
            }
        })
        .catch(err => {
            console.warn("planning.json indisponible :", err.message);
        });

    // Formulaire de contact
    const suggestionForm = document.getElementById("suggestion-form");
    const formFeedback = document.getElementById("form-feedback");

    if (suggestionForm && formFeedback) {
        suggestionForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const pseudo = document.getElementById("user-pseudo").value;
            const type = document.getElementById("suggestion-type").value;
            const message = document.getElementById("user-message").value;

            const discordMessage = {
                username: "Système Zombar",
                embeds: [{
                    title: `📩 Nouvelle Transmission : ${type}`,
                    color: 3394560,
                    fields: [
                        { name: "👤 Expéditeur", value: `**${pseudo}**`, inline: true },
                        { name: "🏷️ Catégorie", value: type, inline: true },
                        { name: "📝 Message", value: message }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            fetch(discordWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(discordMessage)
            })
            .then(response => {
                if (!response.ok) throw new Error("Erreur réseau");
                formFeedback.innerHTML = `<p style="color: var(--zombar-green); font-weight: bold; margin-top: 10px;">Message transmis avec succès !</p>`;
                suggestionForm.reset();
            })
            .catch(() => {
                formFeedback.innerHTML = `<p style="color: #ff3333; font-weight: bold; margin-top: 10px;">Échec de l'envoi du message.</p>`;
            });
        });
    }

    // Confettis Total Subs
    const totalBtn = document.getElementById("total-subs-btn");
    if (totalBtn) {
        totalBtn.addEventListener("click", () => {
            if (typeof confetti === "function") {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#33ff00', '#ff6600', '#ffd700', '#00f2fe']
                });
            }
        });
    }

    // Discord Widget Fetch
    const countEl = document.getElementById("discord-online-count");
    const membersListEl = document.getElementById("discord-members-list");

    if (countEl && discordGuildId) {
        fetch(`https://discord.com/api/guilds/${discordGuildId}/widget.json`)
            .then(res => res.json())
            .then(data => {
                if (data && data.presence_count !== undefined) {
                    countEl.textContent = data.presence_count;

                    if (membersListEl && data.members) {
                        membersListEl.innerHTML = "";
                        data.members.slice(0, 10).forEach(member => {
                            if (member.avatar_url) {
                                const img = document.createElement("img");
                                img.src = member.avatar_url;
                                img.alt = member.username;
                                img.className = "discord-avatar-item";
                                membersListEl.appendChild(img);
                            }
                        });
                    }
                }
            })
            .catch(() => {
                countEl.textContent = "50+";
            });
    }
});