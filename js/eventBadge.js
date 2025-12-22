/**
 * Componente del badge flotante "My Event"
 * @class EventBadge
 */
class EventBadge {
    constructor() {
        this.cart = new EventCart();
        this.badgeElement = null;
        this.init();
    }

    /**
     * Inicializa el badge
     * @private
     */
    init() {
        this.createBadge();
        this.attachEvents();
        this.updateBadge();
    }

    /**
     * Crea el HTML del badge
     * @private
     */
    createBadge() {
        // Verificar si ya existe
        if (document.getElementById('myEventBadge')) {
            this.badgeElement = document.getElementById('myEventBadge');
            return;
        }

        // Crear el badge
        const badge = document.createElement('div');
        badge.id = 'myEventBadge';
        badge.className = 'event-badge';
        badge.innerHTML = `
            <a href="booking.html" class="event-badge-link">
                <div class="event-badge-icon">
                    <i class="fas fa-calendar-check"></i>
                    <span class="event-badge-count">0</span>
                </div>
                <span class="event-badge-text">My Event</span>
            </a>
        `;

        document.body.appendChild(badge);
        this.badgeElement = badge;

        // Agregar estilos si no existen
        this.injectStyles();
    }

    /**
     * Inyecta los estilos CSS del badge
     * @private
     */
    injectStyles() {
        if (document.getElementById('eventBadgeStyles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'eventBadgeStyles';
        styles.textContent = `
            .event-badge {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 9999;
                animation: slideInUp 0.5s ease-out;
            }

            .event-badge-link {
                display: flex;
                align-items: center;
                gap: 12px;
                background: linear-gradient(135deg, #c59c6c 0%, #a8834a 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 50px;
                text-decoration: none;
                box-shadow: 0 8px 20px rgba(197, 156, 108, 0.4);
                transition: all 0.3s ease;
                font-weight: 500;
                font-size: 16px;
            }

            .event-badge-link:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 28px rgba(197, 156, 108, 0.5);
                background: linear-gradient(135deg, #d4ad7d 0%, #b8925b 100%);
                color: white;
            }

            .event-badge-icon {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }

            .event-badge-count {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 700;
                border: 2px solid white;
                animation: pulse 2s infinite;
            }

            .event-badge-count.hidden {
                display: none;
            }

            .event-badge-text {
                font-family: 'Montserrat', sans-serif;
                letter-spacing: 0.5px;
            }

            @keyframes slideInUp {
                from {
                    transform: translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }

            .event-badge.pulse-animation {
                animation: bounce 0.6s ease;
            }

            /* Ajustar botón Back to Top para que no choque con el badge */
            .back-to-top {
                bottom: 100px !important;
                right: 30px !important;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .event-badge {
                    bottom: 20px;
                    right: 20px;
                }

                .event-badge-link {
                    padding: 12px 20px;
                    font-size: 14px;
                }

                .event-badge-icon {
                    font-size: 20px;
                }

                .event-badge-count {
                    width: 20px;
                    height: 20px;
                    font-size: 10px;
                }

                .back-to-top {
                    bottom: 90px !important;
                    right: 20px !important;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Adjunta los event listeners
     * @private
     */
    attachEvents() {
        // Escuchar actualizaciones del carrito
        window.addEventListener('eventCartUpdated', (e) => {
            this.updateBadge();
            this.animateBadge();
        });
    }

    /**
     * Actualiza el contador del badge
     */
    updateBadge() {
        const totalItems = this.cart.getTotalItems();
        const countElement = this.badgeElement.querySelector('.event-badge-count');

        if (countElement) {
            countElement.textContent = totalItems;

            if (totalItems === 0) {
                countElement.classList.add('hidden');
            } else {
                countElement.classList.remove('hidden');
            }
        }
    }

    /**
     * Anima el badge cuando se agrega un item
     * @private
     */
    animateBadge() {
        this.badgeElement.classList.add('pulse-animation');
        setTimeout(() => {
            this.badgeElement.classList.remove('pulse-animation');
        }, 600);
    }

    /**
     * Muestra el badge
     */
    show() {
        if (this.badgeElement) {
            this.badgeElement.style.display = 'block';
        }
    }

    /**
     * Oculta el badge
     */
    hide() {
        if (this.badgeElement) {
            this.badgeElement.style.display = 'none';
        }
    }
}

// Inicializar el badge automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.eventBadge = new EventBadge();
    });
} else {
    window.eventBadge = new EventBadge();
}

// Exportar la clase
window.EventBadge = EventBadge;
