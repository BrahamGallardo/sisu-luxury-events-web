/**
 * Script para manejar el formulario de Contact Us
 */

// Configuración de la API
const API_CONFIG = {
    baseUrl: 'https://localhost:44392' // Cambiar según el puerto de tu API localhost:44392
};

// Inicializar servicios
const apiService = new ApiService(API_CONFIG.baseUrl);
const contactService = new ContactService(apiService);

// Referencias a elementos del DOM
let contactForm;
let nameInput;
let emailInput;
let subjectInput;
let messageInput;
let submitButton;

/**
 * Inicializa el formulario y los event listeners
 */
function initContactForm() {
    // Obtener referencias a los elementos del DOM
    contactForm = document.querySelector('form');
    nameInput = document.getElementById('name');
    emailInput = document.getElementById('email');
    subjectInput = document.getElementById('subject');
    messageInput = document.getElementById('message');
    submitButton = contactForm.querySelector('button[type="submit"]');

    // Agregar event listener al formulario
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Verificar la salud del servicio al cargar la página
    checkServiceHealth();
}

/**
 * Verifica si el servicio de API está disponible
 */
async function checkServiceHealth() {
    try {
        const response = await contactService.healthCheck();
        if (response.success) {
            console.log('✅ Servicio de Contact Us disponible');
        } else {
            console.warn('⚠️ El servicio de Contact Us no está disponible');
        }
    } catch (error) {
        console.error('❌ Error al verificar el servicio:', error);
    }
}

/**
 * Maneja el envío del formulario
 * @param {Event} event - Evento de submit
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    // Limpiar mensajes anteriores
    clearMessages();

    // Deshabilitar el botón de envío
    setSubmitButtonState(true);

    // Validar reCAPTCHA antes de procesar
    let captchaToken = null;
    try {
        if (window.captchaService) {
            captchaToken = await window.captchaService.execute('contact');
        }
    } catch (error) {
        console.error('reCAPTCHA error:', error);
        if (window.alertService) {
            window.alertService.error(
                'Security Verification Failed',
                'Please refresh the page and try again.'
            );
        } else {
            showErrorMessage('Security verification failed. Please refresh and try again.');
        }
        setSubmitButtonState(false);
        return;
    }

    // Obtener valores del formulario
    const contactData = {
        name: nameInput.value,
        email: emailInput.value,
        subject: subjectInput.value,
        message: messageInput.value,
        captchaToken: captchaToken
    };

    try {
        // Enviar los datos
        const response = await contactService.sendMessage(contactData);

        if (response.success) {
            // Limpiar mensajes anteriores
            clearMessages();

            // Mostrar mensaje de éxito con SweetAlert
            if (window.alertService) {
                window.alertService.success(
                    'Message Sent!',
                    'We\'ll contact you soon.',
                    { timer: 3000 }
                );
            } else {
                showSuccessMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.');
            }

            // Limpiar el formulario
            contactForm.reset();
        } else {
            // Mostrar errores con SweetAlert
            if (window.alertService) {
                if (response.validationErrors && response.validationErrors.length > 0) {
                    window.alertService.validationError(response.validationErrors);
                } else {
                    const errorMsg = response.data?.message || response.error || 'Error sending message';
                    window.alertService.error('Error', errorMsg);
                }
            } else {
                // Fallback sin SweetAlert
                if (response.validationErrors && response.validationErrors.length > 0) {
                    showErrorMessage('Por favor corrige los siguientes errores:', response.validationErrors);
                } else {
                    const errorMsg = response.data?.message || response.error || 'Error al enviar el mensaje';
                    showErrorMessage(errorMsg);
                }
            }
        }
    } catch (error) {
        if (window.alertService) {
            window.alertService.error(
                'Unexpected Error',
                'An unexpected error occurred. Please try again.'
            );
        } else {
            showErrorMessage('Ocurrió un error inesperado. Por favor intenta de nuevo.');
        }
        console.error('Error:', error);
    } finally {
        // Rehabilitar el botón de envío
        setSubmitButtonState(false);
    }
}

/**
 * Muestra un mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 */
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    contactForm.parentElement.insertBefore(alertDiv, contactForm);

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);

    // Scroll al mensaje
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje principal
 * @param {Array<string>} errors - Lista de errores (opcional)
 */
function showErrorMessage(message, errors = []) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alertDiv.role = 'alert';

    let errorHtml = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;

    if (errors.length > 0) {
        errorHtml += '<ul class="mb-0 mt-2">';
        errors.forEach(error => {
            errorHtml += `<li>${error}</li>`;
        });
        errorHtml += '</ul>';
    }

    errorHtml += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    alertDiv.innerHTML = errorHtml;

    contactForm.parentElement.insertBefore(alertDiv, contactForm);

    // Scroll al mensaje
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Limpia los mensajes de alerta anteriores
 */
function clearMessages() {
    const alerts = contactForm.parentElement.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
}

/**
 * Cambia el estado del botón de envío
 * @param {boolean} disabled - True para deshabilitar, false para habilitar
 */
function setSubmitButtonState(disabled) {
    if (submitButton) {
        submitButton.disabled = disabled;
        if (disabled) {
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        } else {
            submitButton.innerHTML = 'Send Message';
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}
