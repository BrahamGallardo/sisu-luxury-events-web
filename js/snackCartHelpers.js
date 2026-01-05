/**
 * Funciones auxiliares específicas para snack carts
 */


/**
 * Agrega botones "Add to Event" a las tarjetas de snack carts
 */
function enhanceSnackCartCards() {
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach((item, index) => {
        // Verificar si ya tiene el botón
        if (item.querySelector('.add-to-event-btn')) {
            return;
        }

        // Obtener datos del producto
        const link = item.closest('a');
        const title = item.querySelector('h5')?.textContent || 'Snack Cart';
        const image = item.querySelector('img')?.src || '';

        // Crear ID único
        const cartType = title.toLowerCase().replace(/\s+/g, '_');
        const serviceId = 'snack_cart_' + cartType + '_' + index;

        // Crear botón "Add to Event"
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'text-center p-3 pt-0';
        buttonContainer.innerHTML = `
            <button class="btn btn-primary rounded-pill px-4 add-to-event-btn"
                    onclick="event.preventDefault(); event.stopPropagation();
                            addSnackCartToEvent('${serviceId}', '${title}', '${image}', '${cartType}');">
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
 * Agrega un snack cart al evento
 * @param {string} serviceId - ID del servicio
 * @param {string} title - Título del cart
 * @param {string} image - URL de la imagen
 * @param {string} cartType - Tipo de cart
 */
function addSnackCartToEvent(serviceId, title, image, cartType) {
    if (!window.serviceModal) {
        console.error('ServiceModal not initialized');
        return;
    }

    window.serviceModal.open({
        id: serviceId,
        name: title,
        type: 'snack-cart',
        image: image,
        description: 'Delicious snack cart service for your event',
        extras: []
    });
}

/**
 * Inicializa la página de snack carts
 */
function initializeSnackCarts() {
    // Esperar a que todos los scripts estén cargados
    if (typeof EventStorage === 'undefined' ||
        typeof EventCart === 'undefined' ||
        typeof ServiceModal === 'undefined') {
        console.warn('Waiting for event services to load...');
        setTimeout(initializeSnackCarts, 100);
        return;
    }

    // Mejorar tarjetas de snack carts
    enhanceSnackCartCards();

    console.log('Snack carts initialized with event booking functionality');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSnackCarts);
} else {
    initializeSnackCarts();
}
