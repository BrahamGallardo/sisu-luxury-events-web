/**
 * Funciones auxiliares específicas para snack carts
 */

// Definir extras comunes para snack carts
const SNACK_CART_EXTRAS = {
    'charcuterie': [
        { id: 'extra_premium_cheese', name: 'Premium Cheese Selection', description: 'Upgraded artisan cheeses' },
        { id: 'extra_imported_meats', name: 'Imported Meats', description: 'Premium imported charcuterie' },
        { id: 'extra_gourmet_crackers', name: 'Gourmet Crackers', description: 'Assorted gourmet crackers and breadsticks' },
        { id: 'extra_fresh_fruits', name: 'Fresh Fruits', description: 'Seasonal fresh fruit accompaniments' }
    ],
    'mini_pancakes': [
        { id: 'extra_toppings_bar', name: 'Premium Toppings Bar', description: 'Extended selection of toppings' },
        { id: 'extra_fresh_berries', name: 'Fresh Berries', description: 'Assorted fresh berries' },
        { id: 'extra_chocolate_varieties', name: 'Chocolate Varieties', description: 'Multiple chocolate sauce options' },
        { id: 'extra_whipped_cream', name: 'Whipped Cream Station', description: 'Fresh whipped cream with flavors' }
    ],
    'fruit_snacks': [
        { id: 'extra_exotic_fruits', name: 'Exotic Fruits', description: 'Tropical and exotic fruit selection' },
        { id: 'extra_fruit_dips', name: 'Fruit Dips', description: 'Chocolate, caramel, and yogurt dips' },
        { id: 'extra_fruit_skewers', name: 'Fruit Skewers', description: 'Pre-made decorative fruit skewers' },
        { id: 'extra_smoothie_station', name: 'Smoothie Station', description: 'Fresh fruit smoothie preparation' }
    ],
    'elote_cart': [
        { id: 'extra_esquites', name: 'Esquites (Cup Corn)', description: 'Cup-style corn option' },
        { id: 'extra_premium_toppings', name: 'Premium Toppings', description: 'Extra cheese, bacon bits, jalapeños' },
        { id: 'extra_hot_sauce_variety', name: 'Hot Sauce Variety', description: 'Multiple hot sauce options' },
        { id: 'extra_lime_station', name: 'Fresh Lime Station', description: 'Fresh lime cutting station' }
    ],
    'paleta_cart': [
        { id: 'extra_premium_flavors', name: 'Premium Flavors', description: 'Gourmet and exotic paleta flavors' },
        { id: 'extra_fruit_bars', name: 'Fresh Fruit Bars', description: 'Real fruit ice cream bars' },
        { id: 'extra_chocolate_dipped', name: 'Chocolate Dipped Options', description: 'Chocolate-dipped paletas' },
        { id: 'extra_toppings', name: 'Toppings Station', description: 'Sprinkles, nuts, and toppings' }
    ]
};

/**
 * Obtiene los extras para un tipo de snack cart específico
 * @param {string} cartType - Tipo de snack cart
 * @returns {Array} Array de extras
 */
function getExtrasForSnackCart(cartType) {
    const normalizedType = cartType.toLowerCase().replace(/\s+/g, '_');
    return SNACK_CART_EXTRAS[normalizedType] || [];
}

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

        // Obtener extras para este tipo de cart
        const extras = getExtrasForSnackCart(cartType);

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

    const extras = getExtrasForSnackCart(cartType);

    window.serviceModal.open({
        id: serviceId,
        name: title,
        type: 'snack-cart',
        image: image,
        description: 'Delicious snack cart service for your event',
        extras: extras
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
