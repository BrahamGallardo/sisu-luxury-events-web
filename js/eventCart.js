/**
 * Servicio para gestionar el carrito de evento
 * @class EventCart
 */
class EventCart {
    constructor() {
        this.storage = new EventStorage();
        this.initializeCart();
    }

    /**
     * Inicializa el carrito si no existe
     * @private
     */
    initializeCart() {
        if (!this.storage.exists()) {
            const emptyCart = {
                services: [],
                customerInfo: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.storage.save(emptyCart);
        }
    }

    /**
     * Agrega un servicio al evento
     * @param {Object} service - Servicio a agregar
     * @param {string} service.id - ID único del servicio
     * @param {string} service.name - Nombre del servicio
     * @param {string} service.type - Tipo: 'decoration' o 'snack-cart'
     * @param {string} service.image - URL de la imagen
     * @param {number} service.quantity - Cantidad
     * @param {number} service.duration - Duración en horas
     * @param {string} service.notes - Observaciones
     * @returns {boolean} True si se agregó exitosamente
     */
    addService(service) {
        try {
            const cart = this.storage.get();

            // Validar servicio
            if (!service.id || !service.name || !service.type) {
                console.error('Invalid service data');
                return false;
            }

            // Crear objeto de servicio
            const newService = {
                id: service.id,
                name: service.name,
                type: service.type,
                image: service.image || '',
                quantity: service.quantity || 1,
                duration: service.duration || 4,
                notes: service.notes || '',
                extras: [],
                addedAt: new Date().toISOString()
            };

            // Verificar si el servicio ya existe
            const existingIndex = cart.services.findIndex(s => s.id === service.id);

            if (existingIndex !== -1) {
                // Si existe, actualizar cantidad
                cart.services[existingIndex].quantity += newService.quantity;
                cart.services[existingIndex].duration = newService.duration;
                cart.services[existingIndex].notes = newService.notes;
                cart.services[existingIndex].extras = [];
            } else {
                // Si no existe, agregar nuevo
                cart.services.push(newService);
            }

            cart.updatedAt = new Date().toISOString();

            const saved = this.storage.save(cart);
            if (saved) {
                this.triggerCartUpdate();
            }
            return saved;
        } catch (error) {
            console.error('Error adding service:', error);
            return false;
        }
    }

    /**
     * Elimina un servicio del evento
     * @param {string} serviceId - ID del servicio a eliminar
     * @returns {boolean} True si se eliminó exitosamente
     */
    removeService(serviceId) {
        try {
            const cart = this.storage.get();
            const initialLength = cart.services.length;

            cart.services = cart.services.filter(s => s.id !== serviceId);

            if (cart.services.length < initialLength) {
                cart.updatedAt = new Date().toISOString();
                const saved = this.storage.save(cart);
                if (saved) {
                    this.triggerCartUpdate();
                }
                return saved;
            }

            return false;
        } catch (error) {
            console.error('Error removing service:', error);
            return false;
        }
    }

    /**
     * Actualiza la cantidad de un servicio
     * @param {string} serviceId - ID del servicio
     * @param {number} quantity - Nueva cantidad
     * @returns {boolean} True si se actualizó exitosamente
     */
    updateQuantity(serviceId, quantity) {
        try {
            const cart = this.storage.get();
            const service = cart.services.find(s => s.id === serviceId);

            if (service && quantity > 0) {
                service.quantity = quantity;
                cart.updatedAt = new Date().toISOString();
                const saved = this.storage.save(cart);
                if (saved) {
                    this.triggerCartUpdate();
                }
                return saved;
            }

            return false;
        } catch (error) {
            console.error('Error updating quantity:', error);
            return false;
        }
    }

    /**
     * Actualiza un servicio completo
     * @param {string} serviceId - ID del servicio
     * @param {Object} updates - Objeto con las propiedades a actualizar
     * @returns {boolean} True si se actualizó exitosamente
     */
    updateService(serviceId, updates) {
        try {
            const cart = this.storage.get();
            const serviceIndex = cart.services.findIndex(s => s.id === serviceId);

            if (serviceIndex !== -1) {
                // Preservar el timestamp original de cuando se agregó
                const originalAddedAt = cart.services[serviceIndex].addedAt;

                cart.services[serviceIndex] = {
                    ...updates,
                    id: serviceId,           // Asegurar que el ID no cambie
                    addedAt: originalAddedAt // Preservar timestamp original
                };
                cart.updatedAt = new Date().toISOString();
                const saved = this.storage.save(cart);
                if (saved) {
                    this.triggerCartUpdate();
                }
                return saved;
            }

            return false;
        } catch (error) {
            console.error('Error updating service:', error);
            return false;
        }
    }

    /**
     * Obtiene todos los servicios del evento
     * @returns {Array} Array de servicios
     */
    getServices() {
        try {
            const cart = this.storage.get();
            return cart ? cart.services : [];
        } catch (error) {
            console.error('Error getting services:', error);
            return [];
        }
    }

    /**
     * Obtiene un servicio específico
     * @param {string} serviceId - ID del servicio
     * @returns {Object|null} Servicio o null si no existe
     */
    getService(serviceId) {
        try {
            const services = this.getServices();
            return services.find(s => s.id === serviceId) || null;
        } catch (error) {
            console.error('Error getting service:', error);
            return null;
        }
    }

    /**
     * Obtiene el total de servicios en el evento
     * @returns {number} Número total de servicios
     */
    getTotalItems() {
        try {
            const services = this.getServices();
            return services.reduce((total, service) => total + service.quantity, 0);
        } catch (error) {
            console.error('Error getting total items:', error);
            return 0;
        }
    }

    /**
     * Guarda la información del cliente
     * @param {Object} customerInfo - Información del cliente
     * @returns {boolean} True si se guardó exitosamente
     */
    saveCustomerInfo(customerInfo) {
        try {
            const cart = this.storage.get();
            cart.customerInfo = customerInfo;
            cart.updatedAt = new Date().toISOString();
            return this.storage.save(cart);
        } catch (error) {
            console.error('Error saving customer info:', error);
            return false;
        }
    }

    /**
     * Obtiene la información del cliente
     * @returns {Object|null} Información del cliente
     */
    getCustomerInfo() {
        try {
            const cart = this.storage.get();
            return cart ? cart.customerInfo : null;
        } catch (error) {
            console.error('Error getting customer info:', error);
            return null;
        }
    }

    /**
     * Limpia todo el evento
     * @returns {boolean} True si se limpió exitosamente
     */
    clearEvent() {
        try {
            const cleared = this.storage.clear();
            if (cleared) {
                this.initializeCart();
                this.triggerCartUpdate();
            }
            return cleared;
        } catch (error) {
            console.error('Error clearing event:', error);
            return false;
        }
    }

    /**
     * Obtiene todo el evento (servicios + info del cliente)
     * @returns {Object} Objeto completo del evento
     */
    getFullEvent() {
        try {
            return this.storage.get() || {
                services: [],
                customerInfo: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting full event:', error);
            return {
                services: [],
                customerInfo: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Dispara un evento personalizado cuando el carrito se actualiza
     * @private
     */
    triggerCartUpdate() {
        const event = new CustomEvent('eventCartUpdated', {
            detail: {
                totalItems: this.getTotalItems(),
                services: this.getServices()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Verifica si un servicio ya está en el evento
     * @param {string} serviceId - ID del servicio
     * @returns {boolean} True si el servicio existe
     */
    hasService(serviceId) {
        const services = this.getServices();
        return services.some(s => s.id === serviceId);
    }
}

// Exportar la clase para uso global
window.EventCart = EventCart;
