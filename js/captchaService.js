/**
 * Servicio genérico para Google reCAPTCHA v3
 * @class CaptchaService
 */
class CaptchaService {
    constructor(siteKey) {
        this.siteKey = siteKey;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Inicializa y carga el script de reCAPTCHA
     * @returns {Promise<boolean>} Promesa que resuelve cuando reCAPTCHA está listo
     */
    async init() {
        if (this.isLoaded) {
            return true;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = new Promise((resolve, reject) => {
            // Verificar si ya existe el script
            if (typeof grecaptcha !== 'undefined') {
                this.isLoaded = true;
                resolve(true);
                return;
            }

            // Cargar script de reCAPTCHA
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                grecaptcha.ready(() => {
                    this.isLoaded = true;
                    resolve(true);
                });
            };

            script.onerror = () => {
                console.error('Error loading reCAPTCHA script');
                reject(new Error('Failed to load reCAPTCHA'));
            };

            document.head.appendChild(script);
        });

        return this.loadPromise;
    }

    /**
     * Ejecuta reCAPTCHA y obtiene el token
     * @param {string} action - Acción que se está ejecutando (ej: 'submit', 'contact', 'booking')
     * @returns {Promise<string>} Token de reCAPTCHA
     */
    async execute(action = 'submit') {
        try {
            // Asegurar que reCAPTCHA esté cargado
            await this.init();

            if (!this.isLoaded || typeof grecaptcha === 'undefined') {
                throw new Error('reCAPTCHA not loaded');
            }

            // Ejecutar reCAPTCHA
            const token = await grecaptcha.execute(this.siteKey, { action: action });

            if (!token) {
                throw new Error('Failed to generate reCAPTCHA token');
            }

            return token;
        } catch (error) {
            console.error('reCAPTCHA execution error:', error);
            throw error;
        }
    }

    /**
     * Valida si el servicio está listo
     * @returns {boolean} True si reCAPTCHA está cargado y listo
     */
    isReady() {
        return this.isLoaded && typeof grecaptcha !== 'undefined';
    }

    /**
     * Resetea el estado de reCAPTCHA (útil para pruebas)
     */
    reset() {
        if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
            grecaptcha.reset();
        }
    }

    /**
     * Mueve el badge de reCAPTCHA a la izquierda
     */
    moveBadgeToLeft() {
        const style = document.createElement('style');
        style.id = 'recaptcha-custom-style';
        style.innerHTML = `
            .grecaptcha-badge {
                left: 4px !important;
                right: auto !important;
                bottom: 14px !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Oculta el badge de reCAPTCHA (opcional)
     * Nota: Si ocultas el badge, debes incluir el texto de términos de reCAPTCHA en tu sitio
     */
    hideBadge() {
        const style = document.createElement('style');
        style.innerHTML = '.grecaptcha-badge { visibility: hidden; }';
        document.head.appendChild(style);
    }

    /**
     * Muestra el badge de reCAPTCHA
     */
    showBadge() {
        const style = document.createElement('style');
        style.innerHTML = '.grecaptcha-badge { visibility: visible; }';
        document.head.appendChild(style);
    }
}

// Nota: La clave del sitio debe ser configurada por el usuario
// Para desarrollo/pruebas, usa una clave de prueba de Google
// En producción, reemplaza con tu propia clave de reCAPTCHA v3
const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key - Replace with your own

// Crear instancia global
window.captchaService = new CaptchaService(RECAPTCHA_SITE_KEY);

// Mover el badge a la izquierda cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.captchaService.moveBadgeToLeft();
    });
} else {
    window.captchaService.moveBadgeToLeft();
}

// Exportar la clase
window.CaptchaService = CaptchaService;
