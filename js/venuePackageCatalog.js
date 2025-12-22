/**
 * Catálogo de servicios disponibles para paquetes de venues
 * @class VenuePackageCatalog
 */
class VenuePackageCatalog {
    constructor() {
        this.services = this.initializeServices();
    }

    /**
     * Inicializa la lista de servicios disponibles
     * @returns {Array} Lista de servicios
     */
    initializeServices() {
        return [
            // Decorations
            {
                id: 'service_decoration_baby_shower',
                name: 'Baby Shower Decor',
                type: 'decoration',
                image: 'img/Decorations/decor-1.jpg'
            },
            {
                id: 'service_decoration_elegant',
                name: 'Elegant Backdrop',
                type: 'decoration',
                image: 'img/Decorations/decor-5.jpg'
            },
            {
                id: 'service_decoration_floral_dream',
                name: 'Floral Dream',
                type: 'decoration',
                image: 'img/Decorations/decor-9.jpg'
            },
            {
                id: 'service_decoration_fairy_tale',
                name: 'Fairy Tale Decor',
                type: 'decoration',
                image: 'img/Decorations/decor-13.jpg'
            },
            {
                id: 'service_decoration_love',
                name: 'Love Celebration',
                type: 'decoration',
                image: 'img/Decorations/decor-17.jpg'
            },
            {
                id: 'service_decoration_white_butterfly',
                name: 'White Butterfly Decor',
                type: 'decoration',
                image: 'img/Decorations/decor-21.jpg'
            },
            {
                id: 'service_decoration_elegant_entrance',
                name: 'Elegant Entrance',
                type: 'decoration',
                image: 'img/Decorations/decor-25.jpg'
            },
            {
                id: 'service_decoration_shimmer_walls',
                name: 'Shimmer Walls',
                type: 'decoration',
                image: 'img/Decorations/decor-29.jpg'
            },
            // Snack Carts
            {
                id: 'service_snack_charcuterie',
                name: 'Charcuterie',
                type: 'snack-cart',
                image: 'img/SnackCars/snackcar-1.jpg'
            },
            {
                id: 'service_snack_mini_pancakes',
                name: 'Mini Pancakes',
                type: 'snack-cart',
                image: 'img/SnackCars/snackcar-2.jpg'
            },
            {
                id: 'service_snack_fruit_snacks',
                name: 'Fruit Snacks',
                type: 'snack-cart',
                image: 'img/SnackCars/snackcar-3.jpg'
            },
            {
                id: 'service_snack_elote',
                name: 'Elote',
                type: 'snack-cart',
                image: 'img/SnackCars/snackcar-4.jpg'
            },
            {
                id: 'service_snack_paleta_cart',
                name: 'Paleta Cart',
                type: 'snack-cart',
                image: 'img/SnackCars/snackcar-5.jpg'
            }
        ];
    }

    /**
     * Obtiene todos los servicios
     * @returns {Array} Lista de servicios
     */
    getAllServices() {
        return this.services;
    }

    /**
     * Obtiene servicios por tipo
     * @param {string} type - Tipo de servicio ('decoration' o 'snack-cart')
     * @returns {Array} Lista de servicios filtrados
     */
    getServicesByType(type) {
        return this.services.filter(service => service.type === type);
    }

    /**
     * Obtiene un servicio por ID
     * @param {string} id - ID del servicio
     * @returns {Object|null} Servicio encontrado o null
     */
    getServiceById(id) {
        return this.services.find(service => service.id === id) || null;
    }

    /**
     * Obtiene decoraciones
     * @returns {Array} Lista de decoraciones
     */
    getDecorations() {
        return this.getServicesByType('decoration');
    }

    /**
     * Obtiene snack carts
     * @returns {Array} Lista de snack carts
     */
    getSnackCarts() {
        return this.getServicesByType('snack-cart');
    }
}

// Exportar la clase para uso global
window.VenuePackageCatalog = VenuePackageCatalog;

