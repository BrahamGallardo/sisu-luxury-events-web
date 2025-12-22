/**
 * Funciones auxiliares para los catálogos de servicios
 */

/**
 * Agrega un servicio al evento desde cualquier página
 * @param {Object} serviceData - Datos del servicio
 */
function addServiceToEvent(serviceData) {
    if (!window.serviceModal) {
        console.error('ServiceModal not initialized');
        return;
    }

    window.serviceModal.open(serviceData);
}

/**
 * Agrega botones "Add to Event" a las tarjetas de productos en la página de catálogo
 */
function enhanceCatalogCards() {
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach((item, index) => {
        // Verificar si ya tiene el botón
        if (item.querySelector('.add-to-event-btn')) {
            return;
        }

        // Obtener datos del producto
        const link = item.closest('a');
        const title = item.querySelector('h5')?.textContent || 'Service';
        const image = item.querySelector('img')?.src || '';
        const detailPage = link?.href || '';

        // Crear ID único basado en el título y la imagen
        const serviceId = 'service_' + title.toLowerCase().replace(/\s+/g, '_') + '_' + index;

        // Crear botón "Add to Event"
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'text-center p-3 pt-0';
        buttonContainer.innerHTML = `
            <button class="btn btn-primary rounded-pill px-4 add-to-event-btn"
                    onclick="event.preventDefault(); event.stopPropagation();
                            addServiceToEvent({
                                id: '${serviceId}',
                                name: '${title}',
                                type: 'decoration',
                                image: '${image}',
                                description: 'Beautiful decoration package for your special event',
                                extras: []
                            });">
                <i class="fas fa-calendar-plus me-2"></i>Add to Event
            </button>
        `;

        // Insertar botón en la tarjeta
        const cardContent = item.querySelector('.text-center.p-4');
        if (cardContent) {
            cardContent.appendChild(buttonContainer.firstElementChild);
        }
    });
}

/**
 * Inicializa el catálogo cuando el DOM está listo
 */
function initializeCatalog() {
    // Esperar a que todos los scripts estén cargados
    if (typeof EventStorage === 'undefined' ||
        typeof EventCart === 'undefined' ||
        typeof ServiceModal === 'undefined') {
        console.warn('Waiting for event services to load...');
        setTimeout(initializeCatalog, 100);
        return;
    }

    // Mejorar tarjetas del catálogo
    enhanceCatalogCards();

    console.log('Catalog initialized with event booking functionality');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCatalog);
} else {
    initializeCatalog();
}
