/**
 * Servicio genérico para manejar el localStorage
 * @class EventStorage
 */
class EventStorage {
    constructor() {
        this.storageKey = 'sisuLuxuryEvent';
    }

    /**
     * Guarda datos en localStorage
     * @param {Object} data - Datos a guardar
     * @returns {boolean} True si se guardó exitosamente
     */
    save(data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(this.storageKey, jsonData);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Obtiene datos del localStorage
     * @returns {Object|null} Datos guardados o null si no existen
     */
    get() {
        try {
            const jsonData = localStorage.getItem(this.storageKey);
            if (!jsonData) {
                return null;
            }
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Elimina datos del localStorage
     * @returns {boolean} True si se eliminó exitosamente
     */
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Verifica si existen datos en localStorage
     * @returns {boolean} True si existen datos
     */
    exists() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * Actualiza una propiedad específica
     * @param {string} key - Clave de la propiedad
     * @param {*} value - Valor a guardar
     * @returns {boolean} True si se actualizó exitosamente
     */
    updateProperty(key, value) {
        try {
            const data = this.get() || {};
            data[key] = value;
            return this.save(data);
        } catch (error) {
            console.error('Error updating property:', error);
            return false;
        }
    }

    /**
     * Obtiene una propiedad específica
     * @param {string} key - Clave de la propiedad
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*} Valor de la propiedad
     */
    getProperty(key, defaultValue = null) {
        try {
            const data = this.get();
            if (!data || !(key in data)) {
                return defaultValue;
            }
            return data[key];
        } catch (error) {
            console.error('Error getting property:', error);
            return defaultValue;
        }
    }
}

// Exportar la clase para uso global
window.EventStorage = EventStorage;
