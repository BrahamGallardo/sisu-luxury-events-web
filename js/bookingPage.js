/**
 * Script para la página de booking - Resumen y finalización del evento
 */

class BookingPage {
    constructor() {
        this.cart = new EventCart();
        this.apiService = new ApiService('https://localhost:44392'); // Configurar según sea necesario
        this.bookingService = new BookingService(this.apiService);
        this.init();
    }

    /**
     * Inicializa la página de booking
     * @private
     */
    init() {
        this.renderEventSummary();
        this.attachFormEvents();
        this.prefillCustomerInfo();

        // Escuchar cambios en el carrito
        window.addEventListener('eventCartUpdated', () => {
            this.renderEventSummary();
        });
    }

    /**
     * Renderiza el resumen del evento
     * @private
     */
    renderEventSummary() {
        const services = this.cart.getServices();
        const summaryContainer = document.getElementById('eventSummaryContainer');

        if (!summaryContainer) return;

        if (services.length === 0) {
            summaryContainer.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>No services added yet.</strong><br>
                    Browse our <a href="decorations.html" class="alert-link">Decorations</a> and
                    <a href="snack-carts.html" class="alert-link">Snack Carts</a> to add items to your event.
                </div>
            `;
            return;
        }

        let html = '<div class="event-summary-list">';

        services.forEach((service, index) => {
            html += this.renderServiceCard(service, index);
        });

        html += '</div>';

        // Agregar total de servicios
        html += `
            <div class="bg-primary text-white p-4 rounded mt-4">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <h5 class="mb-0"><i class="fas fa-calendar-check me-2"></i>Total Services</h5>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <h3 class="mb-0">${this.cart.getTotalItems()} ${this.cart.getTotalItems() === 1 ? 'Service' : 'Services'}</h3>
                    </div>
                </div>
            </div>
        `;

        summaryContainer.innerHTML = html;
    }

    /**
     * Renderiza una tarjeta de servicio
     * @private
     * @param {Object} service - Servicio a renderizar
     * @param {number} index - Índice del servicio
     * @returns {string} HTML del servicio
     */
    renderServiceCard(service, index) {
        const typeIcon = service.type === 'decoration' ?
            '<i class="fas fa-star text-warning"></i>' :
            '<i class="fas fa-ice-cream text-info"></i>';

        const typeBadge = service.type === 'decoration' ?
            '<span class="badge bg-warning text-dark">Decoration</span>' :
            '<span class="badge bg-info">Snack Cart</span>';

        let extrasHTML = '';
        if (service.extras && service.extras.length > 0) {
            extrasHTML = `
                <div class="mt-2">
                    <small class="text-white d-block"><strong>Extras:</strong></small>
                    <ul class="list-unstyled ms-3 mb-0">
                        ${service.extras.map(extra => `
                            <li><small><i class="fas fa-check text-success me-1"></i>${extra.name}</small></li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        let notesHTML = '';
        if (service.notes && service.notes.trim() !== '') {
            notesHTML = `
                <div class="mt-2">
                    <small class="text-white"><strong>Notes:</strong></small>
                    <p class="mb-0 small text-white">${service.notes}</p>
                </div>
            `;
        }

        return `
            <div class="service-card bg-white rounded shadow-sm p-4 mb-3" data-service-id="${service.id}">
                <div class="row">
                    <div class="col-md-3">
                        <img src="${service.image}" alt="${service.name}"
                             class="img-fluid rounded" onerror="this.src='img/icon.jpg'">
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center mb-2">
                            ${typeIcon}
                            <h5 class="mb-0 ms-2">${service.name}</h5>
                        </div>
                        ${typeBadge}
                        <div class="mt-3">
                            <p class="mb-1"><strong>Quantity:</strong> ${service.quantity}</p>
                            <p class="mb-1"><strong>Duration:</strong> ${service.duration} hours</p>
                        </div>
                        ${extrasHTML}
                        ${notesHTML}
                    </div>
                    <div class="col-md-3 text-md-end">
                        <button class="btn btn-sm btn-outline-primary mb-2 w-100"
                                onclick="bookingPage.editService('${service.id}')">
                            <i class="fas fa-edit me-1"></i>Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger w-100"
                                onclick="bookingPage.removeService('${service.id}')">
                            <i class="fas fa-trash me-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Edita un servicio
     * @param {string} serviceId - ID del servicio a editar
     */
    editService(serviceId) {
        const service = this.cart.getService(serviceId);
        if (service && window.serviceModal) {
            // Abrir el modal en modo edición (NO eliminar el servicio)
            window.serviceModal.openForEdit(service);
        }
    }

    /**
     * Elimina un servicio
     * @param {string} serviceId - ID del servicio a eliminar
     */
    async removeService(serviceId) {
        const service = this.cart.getService(serviceId);
        if (!service) return;

        // Usar SweetAlert para confirmación
        const confirmed = window.alertService ?
            await window.alertService.confirmRemoveService(service.name) :
            confirm('Are you sure you want to remove this service from your event?');

        if (confirmed) {
            this.cart.removeService(serviceId);

            // Mostrar notificación
            if (window.alertService) {
                window.alertService.serviceRemoved(service.name);
            }
        }
    }

    /**
     * Adjunta eventos al formulario
     * @private
     */
    attachFormEvents() {
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    /**
     * Pre-llena la información del cliente si existe
     * @private
     */
    prefillCustomerInfo() {
        const customerInfo = this.cart.getCustomerInfo();
        if (!customerInfo) return;

        // Llenar campos del formulario
        const fields = ['fullName', 'email', 'phone', 'city', 'eventType', 'eventDate',
                        'eventTime', 'guestCount', 'venue', 'budget', 'hearAbout', 'additionalDetails'];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && customerInfo[field]) {
                element.value = customerInfo[field];
            }
        });
    }

    /**
     * Maneja el envío del formulario
     * @private
     * @param {Event} e - Evento del formulario
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        const services = this.cart.getServices();

        if (services.length === 0) {
            if (window.alertService) {
                window.alertService.warning(
                    'No Services Selected',
                    'Please add at least one service to your event before booking.'
                );
            } else {
                alert('Please add at least one service to your event before booking.');
            }
            return;
        }

        // Validar que se acepten los términos y condiciones
        const acceptTerms = document.getElementById('acceptTerms');
        if (!acceptTerms || !acceptTerms.checked) {
            if (window.alertService) {
                window.alertService.warning(
                    'Terms and Conditions Required',
                    'Please read and accept the Terms and Conditions to continue.'
                );
            } else {
                alert('Please read and accept the Terms and Conditions to continue.');
            }
            return;
        }

        // Validar reCAPTCHA antes de procesar
        let captchaToken = null;
        try {
            if (window.captchaService) {
                captchaToken = await window.captchaService.execute('booking');
            }
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            if (window.alertService) {
                window.alertService.error(
                    'Security Verification Failed',
                    'Please refresh the page and try again.'
                );
            } else {
                alert('Security verification failed. Please refresh and try again.');
            }
            return;
        }

        // Recopilar información del formulario
        const formData = {
            // Customer Information
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value || '',

            // Event Details
            eventType: document.getElementById('eventType').value,
            eventDate: document.getElementById('eventDate').value,
            eventTime: document.getElementById('eventTime').value || '',
            guestCount: parseInt(document.getElementById('guestCount').value) || 0,
            venue: document.getElementById('venue').value || '',

            // Additional Information
            budget: document.getElementById('budget').value || '',
            hearAbout: document.getElementById('hearAbout').value || '',
            additionalDetails: document.getElementById('additionalDetails').value || '',

            // Services
            services: services,

            // reCAPTCHA Token
            captchaToken: captchaToken
        };

        // Guardar información del cliente
        this.cart.saveCustomerInfo(formData);

        // Deshabilitar botón de envío
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

        try {
            // Enviar a la API
            console.log('Booking data:', formData);

            const response = await this.bookingService.createBooking(formData);

            if (response.success) {
                // Mostrar mensaje de éxito
                await this.showSuccessMessage();

                // Limpiar carrito después de un envío exitoso
                this.cart.clearEvent();
            } else {
                // Mostrar errores
                console.error('Booking error:', response);

                if (window.alertService) {
                    if (response.validationErrors && response.validationErrors.length > 0) {
                        window.alertService.validationError(response.validationErrors);
                    } else {
                        const errorMsg = response.data?.error || response.error || 'Error processing booking';
                        window.alertService.error('Booking Error', errorMsg);
                    }
                } else {
                    const errorMsg = response.data?.error || response.error || 'Error processing booking';
                    alert(errorMsg);
                }

                // Rehabilitar botón
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }

        } catch (error) {
            console.error('Error submitting booking:', error);

            if (window.alertService) {
                window.alertService.error(
                    'Booking Error',
                    'There was an error processing your booking. Please try again.'
                );
            } else {
                alert('There was an error processing your booking. Please try again.');
            }

            // Rehabilitar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    /**
     * Muestra mensaje de éxito
     * @private
     */
    async showSuccessMessage() {
        const form = document.getElementById('bookingForm');

        if (window.alertService) {
            // Usar SweetAlert para el mensaje de éxito
            await window.alertService.custom({
                icon: 'success',
                title: 'Booking Request Submitted!',
                html: `
                    <p>Thank you for your booking request! We've received your information and will contact you within 24 hours to confirm availability and finalize the details of your event.</p>
                `,
                confirmButtonText: 'Great!',
                allowOutsideClick: false
            });

            // Resetear formulario
            form.reset();

            // Preguntar si quiere empezar nueva reserva
            const startNew = await window.alertService.confirm(
                'Start New Booking?',
                'Would you like to start a new event booking?',
                {
                    confirmButtonText: 'Yes, start new',
                    cancelButtonText: 'No, keep this one'
                }
            );

            if (startNew) {
                this.cart.clearEvent();
                window.location.reload();
            }
        } else {
            // Fallback sin SweetAlert
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success alert-dismissible fade show';
            successMessage.innerHTML = `
                <h4 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Booking Request Submitted!</h4>
                <p class="mb-0">Thank you for your booking request! We've received your information and will contact you within 24 hours to confirm availability and finalize the details of your event.</p>
                <hr>
                <p class="mb-0 small">A confirmation email has been sent to your email address.</p>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;

            form.insertAdjacentElement('beforebegin', successMessage);
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            form.reset();

            setTimeout(() => {
                if (confirm('Would you like to start a new event booking?')) {
                    this.cart.clearEvent();
                    window.location.reload();
                }
            }, 3000);
        }
    }
}

// Inicializar la página de booking
let bookingPage;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bookingPage = new BookingPage();
    });
} else {
    bookingPage = new BookingPage();
}
