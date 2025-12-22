/**
 * Servicio para gestionar la autenticación de usuarios
 * @class AuthService
 */
class AuthService {
    constructor() {
        this.api = new ApiService('https://localhost:44392/api/auth');
        this.storageKey = 'sisuAuth';
        this.tokenKey = 'sisuAuthToken';
    }

    /**
     * Realiza el login de un usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} Resultado del login con datos de sesión
     */
    async login(email, password) {
        try {
            const result = await this.api.post('/login', {
                email: email,
                password: password
            });

            if (result.success) {
                // Guardar token y datos del usuario en localStorage
                this.saveSession(result.data);
                return result;
            } else {
                return {
                    success: false,
                    error: result.data?.error || 'Error al iniciar sesión'
                };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cierra la sesión del usuario actual
     * @returns {Promise<Object>} Resultado del logout
     */
    async logout() {
        try {
            const token = this.getToken();

            if (!token) {
                // Si no hay token, solo limpiar localStorage
                this.clearSession();
                return {
                    success: true,
                    message: 'Sesión cerrada localmente'
                };
            }

            // Llamar al endpoint de logout con el token
            const result = await this.api.request('/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Limpiar localStorage independientemente de la respuesta
            this.clearSession();

            return {
                success: true,
                message: 'Sesión cerrada exitosamente'
            };
        } catch (error) {
            console.error('Error en logout:', error);
            // Aún así limpiar la sesión local
            this.clearSession();
            return {
                success: true,
                message: 'Sesión cerrada localmente'
            };
        }
    }

    /**
     * Obtiene información del usuario autenticado actual
     * @returns {Promise<Object>} Información del usuario
     */
    async getCurrentUser() {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No hay sesión activa');
            }

            const result = await this.api.request('/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (result.success) {
                // Actualizar datos del usuario en localStorage
                this.updateUserData(result.data);
                return result;
            } else {
                // Si el token expiró, limpiar sesión
                if (result.status === 401) {
                    this.clearSession();
                }
                return {
                    success: false,
                    error: result.data?.error || 'Error al obtener usuario'
                };
            }
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica si hay una sesión activa
     * @returns {boolean} True si hay sesión activa
     */
    isAuthenticated() {
        const token = this.getToken();
        const session = this.getSession();

        if (!token || !session) {
            return false;
        }

        // Verificar si el token ha expirado
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();

        if (now >= expiresAt) {
            this.clearSession();
            return false;
        }

        return true;
    }

    /**
     * Obtiene el token de autenticación
     * @returns {string|null} Token JWT o null si no existe
     */
    getToken() {
        try {
            return localStorage.getItem(this.tokenKey);
        } catch (error) {
            console.error('Error obteniendo token:', error);
            return null;
        }
    }

    /**
     * Obtiene los datos de la sesión actual
     * @returns {Object|null} Datos de sesión o null si no existe
     */
    getSession() {
        try {
            const sessionData = localStorage.getItem(this.storageKey);
            if (!sessionData) {
                return null;
            }
            return JSON.parse(sessionData);
        } catch (error) {
            console.error('Error obteniendo sesión:', error);
            return null;
        }
    }

    /**
     * Obtiene los datos del usuario de la sesión actual
     * @returns {Object|null} Datos del usuario o null si no existe
     */
    getUserData() {
        const session = this.getSession();
        return session ? session.user : null;
    }

    /**
     * Guarda los datos de sesión en localStorage
     * @private
     * @param {Object} sessionData - Datos de sesión del servidor
     */
    saveSession(sessionData) {
        try {
            localStorage.setItem(this.tokenKey, sessionData.token);
            localStorage.setItem(this.storageKey, JSON.stringify(sessionData));

            // Disparar evento de login exitoso
            this.triggerAuthEvent('login', sessionData.user);
        } catch (error) {
            console.error('Error guardando sesión:', error);
        }
    }

    /**
     * Actualiza los datos del usuario en la sesión
     * @private
     * @param {Object} userData - Datos actualizados del usuario
     */
    updateUserData(userData) {
        try {
            const session = this.getSession();
            if (session) {
                session.user = userData;
                localStorage.setItem(this.storageKey, JSON.stringify(session));
            }
        } catch (error) {
            console.error('Error actualizando datos de usuario:', error);
        }
    }

    /**
     * Limpia toda la información de sesión del localStorage
     * @private
     */
    clearSession() {
        try {
            const userData = this.getUserData();
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.storageKey);

            // Disparar evento de logout
            this.triggerAuthEvent('logout', userData);
        } catch (error) {
            console.error('Error limpiando sesión:', error);
        }
    }

    /**
     * Dispara un evento personalizado de autenticación
     * @private
     * @param {string} eventType - Tipo de evento: 'login' o 'logout'
     * @param {Object} userData - Datos del usuario
     */
    triggerAuthEvent(eventType, userData) {
        const event = new CustomEvent('authStateChanged', {
            detail: {
                type: eventType,
                user: userData,
                isAuthenticated: eventType === 'login'
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Verifica el estado de salud del servicio de autenticación
     * @returns {Promise<Object>} Estado del servicio
     */
    async healthCheck() {
        try {
            const result = await this.api.get('/health');
            return result;
        } catch (error) {
            console.error('Error en health check:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Redirige a la página de login si no hay sesión
     * @param {string} loginUrl - URL de la página de login (default: '/login.html')
     */
    requireAuth(loginUrl = '/login.html') {
        if (!this.isAuthenticated()) {
            // Guardar la URL actual para redireccionar después del login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = loginUrl;
        }
    }

    /**
     * Redirige a la página de admin u otra página después del login
     * @param {string} defaultUrl - URL por defecto si no hay redirect guardado
     */
    redirectAfterLogin(defaultUrl = '/admin.html') {
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || defaultUrl;
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
    }
}

// Exportar la clase para uso global
window.AuthService = AuthService;
