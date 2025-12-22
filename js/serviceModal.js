/**
 * Modal para agregar servicios al evento
 * @class ServiceModal
 */
class ServiceModal {
    constructor() {
        this.cart = new EventCart();
        this.modalElement = null;
        this.currentService = null;
        this.editMode = false;  // Flag para modo edición
        this.editingServiceId = null;  // ID del servicio en edición
        this.init();
    }

    /**
     * Inicializa el modal
     * @private
     */
    init() {
        this.createModal();
        this.attachEvents();
    }

    /**
     * Crea el HTML del modal
     * @private
     */
    createModal() {
        // Verificar si ya existe
        if (document.getElementById('serviceModal')) {
            this.modalElement = document.getElementById('serviceModal');
            return;
        }

        // Crear el modal
        const modal = document.createElement('div');
        modal.id = 'serviceModal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-dark">
                        <h4 class="modal-title text-white">
                            <i class="fas fa-plus-circle me-2"></i>
                            Add to My Event
                        </h4>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Service Info -->
                        <div class="row mb-4">
                            <div class="col-md-4">
                                <img id="serviceImage" src="" alt="Service" class="img-fluid rounded">
                            </div>
                            <div class="col-md-8">
                                <h4 id="serviceName" class="mb-2"></h4>
                                <p id="serviceDescription" class="mb-0"></p>
                                <input type="hidden" id="serviceId">
                                <input type="hidden" id="serviceType">
                            </div>
                        </div>

                        <!-- Quantity -->
                        <div class="mb-4">
                            <label class="text-black fw-bold">
                                <i class="fas fa-hashtag me-2 text-primary"></i>Quantity
                            </label>
                            <div class="input-group" style="max-width: 200px;">
                                <button class="btn btn-outline-primary" type="button" id="decreaseQty">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="form-control text-center" id="serviceQuantity"
                                       value="1" min="1" max="10">
                                <button class="btn btn-outline-primary" type="button" id="increaseQty">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Duration -->
                        <div class="mb-4">
                            <label for="serviceDuration" class="text-black fw-bold">
                                <i class="fas fa-clock me-2 text-primary"></i>Event Duration (hours)
                            </label>
                            <select class="form-select" id="serviceDuration" style="max-width: 200px;">
                                <option value="2">2 hours</option>
                                <option value="3">3 hours</option>
                                <option value="4" selected>4 hours</option>
                                <option value="5">5 hours</option>
                                <option value="6">6 hours</option>
                                <option value="8">8 hours</option>
                                <option value="12">12 hours</option>
                                <option value="24">Full day (24 hours)</option>
                            </select>
                        </div>

                        <!-- Extras (for snack carts) -->
                        <div id="extrasSection" class="mb-4" style="display: none;">
                            <label class="text-black fw-bold">
                                <i class="fas fa-star me-2 text-primary"></i>Available Extras
                            </label>
                            <div id="extrasList" class="row g-3">
                                <!-- Extras will be inserted here -->
                            </div>
                        </div>

                        <!-- Notes -->
                        <div class="mb-3">
                            <label for="serviceNotes" class="text-black fw-bold">
                                <i class="fas fa-sticky-note me-2 text-primary"></i>Special Notes or Requests
                            </label>
                            <textarea class="form-control" id="serviceNotes" rows="3"
                                      placeholder="Add any special requests, color preferences, or additional details..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-primary" id="addToEventBtn">
                            <i class="fas fa-calendar-plus me-2"></i>Add to My Event
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;

        // Inicializar modal de Bootstrap
        this.bsModal = new bootstrap.Modal(this.modalElement);
    }

    /**
     * Adjunta los event listeners
     * @private
     */
    attachEvents() {
        // Botones de cantidad
        document.getElementById('decreaseQty').addEventListener('click', () => {
            const input = document.getElementById('serviceQuantity');
            const value = parseInt(input.value);
            if (value > 1) {
                input.value = value - 1;
            }
        });

        document.getElementById('increaseQty').addEventListener('click', () => {
            const input = document.getElementById('serviceQuantity');
            const value = parseInt(input.value);
            if (value < 10) {
                input.value = value + 1;
            }
        });

        // Botón de agregar al evento
        document.getElementById('addToEventBtn').addEventListener('click', () => {
            this.addToEvent();
        });
    }

    /**
     * Abre el modal con un servicio en modo agregar
     * @param {Object} service - Datos del servicio
     */
    open(service) {
        this.currentService = service;
        this.editMode = false;
        this.editingServiceId = null;

        // Llenar información del servicio
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceType').value = service.type;
        document.getElementById('serviceName').textContent = service.name;
        document.getElementById('serviceImage').src = service.image;
        document.getElementById('serviceDescription').textContent = service.description || '';

        // Resetear valores a defaults
        document.getElementById('serviceQuantity').value = 1;
        document.getElementById('serviceDuration').value = 4;
        document.getElementById('serviceNotes').value = '';

        // Manejar extras (solo para snack carts)
        const extrasSection = document.getElementById('extrasSection');
        if (service.type === 'snack-cart' && service.extras && service.extras.length > 0) {
            this.renderExtras(service.extras);
            extrasSection.style.display = 'block';
        } else {
            extrasSection.style.display = 'none';
        }

        // Resetear título y botón al estado "agregar"
        const modalTitle = this.modalElement.querySelector('.modal-title');
        modalTitle.innerHTML = `
            <i class="fas fa-plus-circle me-2"></i>
            Add to My Event
        `;

        const addBtn = document.getElementById('addToEventBtn');
        addBtn.innerHTML = '<i class="fas fa-calendar-plus me-2"></i>Add to My Event';

        // Mostrar modal
        this.bsModal.show();
    }

    /**
     * Abre el modal en modo edición
     * @param {Object} service - Datos del servicio a editar
     */
    openForEdit(service) {
        this.currentService = service;
        this.editMode = true;
        this.editingServiceId = service.id;

        // Llenar información del servicio
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceType').value = service.type;
        document.getElementById('serviceName').textContent = service.name;
        document.getElementById('serviceImage').src = service.image;
        document.getElementById('serviceDescription').textContent = service.description || '';

        // Pre-llenar con valores existentes
        document.getElementById('serviceQuantity').value = service.quantity || 1;
        document.getElementById('serviceDuration').value = service.duration || 4;
        document.getElementById('serviceNotes').value = service.notes || '';

        // Manejar extras (solo para snack carts)
        const extrasSection = document.getElementById('extrasSection');
        if (service.type === 'snack-cart' && service.availableExtras && service.availableExtras.length > 0) {
            this.renderExtras(service.availableExtras, service.extras);
            extrasSection.style.display = 'block';
        } else {
            extrasSection.style.display = 'none';
        }

        // Cambiar título del modal a modo edición
        const modalTitle = this.modalElement.querySelector('.modal-title');
        modalTitle.innerHTML = `
            <i class="fas fa-edit me-2"></i>
            Edit Service
        `;

        // Cambiar texto del botón a modo edición
        const addBtn = document.getElementById('addToEventBtn');
        addBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Service';

        // Mostrar modal
        this.bsModal.show();
    }

    /**
     * Renderiza los extras disponibles
     * @private
     * @param {Array} availableExtras - Array de extras disponibles
     * @param {Array} selectedExtras - Array de extras previamente seleccionados (opcional)
     */
    renderExtras(availableExtras, selectedExtras = []) {
        const extrasList = document.getElementById('extrasList');
        extrasList.innerHTML = '';

        availableExtras.forEach(extra => {
            // Verificar si este extra estaba seleccionado
            const isChecked = selectedExtras && selectedExtras.some(e => e.id === extra.id);

            const extraCard = document.createElement('div');
            extraCard.className = 'col-md-6';
            extraCard.innerHTML = `
                <div class="form-check bg-light p-3 rounded">
                    <input class="form-check-input" type="checkbox" value="${extra.id}"
                           id="extra_${extra.id}" data-extra-name="${extra.name}"
                           ${isChecked ? 'checked' : ''}>
                    <label class="text-black form-check-label w-75" for="extra_${extra.id}">
                        <strong>${extra.name}</strong>
                        ${extra.description ? `<br><small>${extra.description}</small>` : ''}
                    </label>
                </div>
            `;
            extrasList.appendChild(extraCard);
        });
    }

    /**
     * Agrega o actualiza el servicio al evento
     * @private
     */
    addToEvent() {
        const serviceData = {
            id: document.getElementById('serviceId').value,
            name: document.getElementById('serviceName').textContent,
            type: document.getElementById('serviceType').value,
            image: document.getElementById('serviceImage').src,
            quantity: parseInt(document.getElementById('serviceQuantity').value),
            duration: parseInt(document.getElementById('serviceDuration').value),
            notes: document.getElementById('serviceNotes').value,
            extras: this.getSelectedExtras()
        };

        let success = false;

        // Si está en modo edición, actualizar
        if (this.editMode && this.editingServiceId) {
            success = this.cart.updateService(this.editingServiceId, serviceData);

            if (success) {
                // Mostrar notificación de actualización
                if (window.alertService) {
                    window.alertService.custom({
                        icon: 'success',
                        title: 'Service Updated!',
                        text: `${serviceData.name} has been updated in your event.`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    alert(`${serviceData.name} has been updated in your event.`);
                }
            }
        } else {
            // Modo agregar normal
            success = this.cart.addService(serviceData);

            if (success) {
                // Mostrar notificación de agregado
                if (window.alertService) {
                    window.alertService.serviceAdded(serviceData.name);
                } else {
                    alert(`${serviceData.name} has been added to your event.`);
                }
            }
        }

        if (success) {
            // Cerrar modal
            this.bsModal.hide();

            // Resetear formulario y modo
            this.resetForm();
        } else {
            // Mostrar error
            if (window.alertService) {
                window.alertService.error(
                    'Error',
                    'There was an error processing your request. Please try again.'
                );
            } else {
                alert('There was an error processing your request. Please try again.');
            }
        }
    }

    /**
     * Obtiene los extras seleccionados
     * @private
     * @returns {Array} Array de extras seleccionados
     */
    getSelectedExtras() {
        const checkboxes = document.querySelectorAll('#extrasList input[type="checkbox"]:checked');
        const extras = [];

        checkboxes.forEach(checkbox => {
            extras.push({
                id: checkbox.value,
                name: checkbox.getAttribute('data-extra-name')
            });
        });

        return extras;
    }

    /**
     * Resetea el formulario del modal
     * @private
     */
    resetForm() {
        document.getElementById('serviceQuantity').value = 1;
        document.getElementById('serviceDuration').value = 4;
        document.getElementById('serviceNotes').value = '';

        // Desmarcar extras
        const checkboxes = document.querySelectorAll('#extrasList input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Resetear modo edición
        this.editMode = false;
        this.editingServiceId = null;
    }

}

// Inicializar el modal automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.serviceModal = new ServiceModal();
    });
} else {
    window.serviceModal = new ServiceModal();
}

// Exportar la clase
window.ServiceModal = ServiceModal;
