/**
 * Servicio para gestionar invoices desde el panel de administración
 * @class InvoiceService
 */
class InvoiceService {
    constructor(authService) {
        this.api = new ApiService('https://localhost:44392/api/invoice');
        this.authService = authService;
    }

    /**
     * Obtiene el header de autorización con el token JWT
     * @private
     */
    getAuthHeaders() {
        const token = this.authService.getToken();
        return {
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Crea una nueva factura
     * @param {Object} invoiceData - Datos de la factura
     * @returns {Promise<Object>} Factura creada
     */
    async createInvoice(invoiceData) {
        try {
            const result = await this.api.request('', {
                method: 'POST',
                body: invoiceData,
                headers: this.getAuthHeaders()
            });
            return result;
        } catch (error) {
            console.error('Error creating invoice:', error);
            return {
                success: false,
                error: error.message || 'Error al crear la factura'
            };
        }
    }

    /**
     * Actualiza una factura existente
     * @param {number} id - ID de la factura
     * @param {Object} invoiceData - Datos de la factura
     * @returns {Promise<Object>} Factura actualizada
     */
    async updateInvoice(id, invoiceData) {
        try {
            const result = await this.api.request(`/${id}`, {
                method: 'PUT',
                body: invoiceData,
                headers: this.getAuthHeaders()
            });
            return result;
        } catch (error) {
            console.error('Error updating invoice:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar la factura'
            };
        }
    }

    /**
     * Obtiene una factura por ID
     * @param {number} id - ID de la factura
     * @returns {Promise<Object>} Factura
     */
    async getInvoiceById(id) {
        try {
            const result = await this.api.request(`/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            return result;
        } catch (error) {
            console.error('Error getting invoice:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener la factura'
            };
        }
    }

    /**
     * Obtiene una factura por booking ID
     * @param {number} bookingId - ID del booking
     * @returns {Promise<Object>} Factura
     */
    async getInvoiceByBookingId(bookingId) {
        try {
            const result = await this.api.request(`/booking/${bookingId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            return result;
        } catch (error) {
            console.error('Error getting invoice by booking:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener la factura del booking'
            };
        }
    }

    /**
     * Obtiene lista paginada de facturas
     * @param {number} pageIndex - Índice de página
     * @param {number} pageSize - Tamaño de página
     * @returns {Promise<Object>} Lista paginada de facturas
     */
    async getInvoices(pageIndex = 1, pageSize = 15) {
        try {
            const result = await this.api.request(`?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            return result;
        } catch (error) {
            console.error('Error getting invoices:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener las facturas'
            };
        }
    }

    /**
     * Genera un número de factura automático
     * @returns {string} Número de factura
     */
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV-${year}${month}-${random}`;
    }

    /**
     * Calcula totales de la factura
     * @param {Array} items - Items de la factura
     * @param {number} tax - Porcentaje de impuesto
     * @param {number} discount - Monto de descuento
     * @returns {Object} Cálculos de totales
     */
    calculateTotals(items, tax = 0, discount = 0) {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * (tax / 100);
        const total = subtotal + taxAmount - discount;

        return {
            subtotal: subtotal,
            tax: taxAmount,
            discount: discount,
            total: total
        };
    }

    /**
     * Genera PDF para imprimir con diálogo de impresión
     * @param {Object} invoice - Datos de la factura
     * @param {Object} booking - Datos del booking
     */
    generatePDFForPrint(invoice, booking) {
        // Abrir ventana para imprimir
        const printWindow = window.open('', '_blank');

        const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
        });
        const eventDate = new Date(booking.eventDate).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
        });

        printWindow.document.write('<html><head><title>Invoice ' + invoice.invoiceNumber + '</title>');
        printWindow.document.write('<meta charset="UTF-8">');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Montserrat', 'Segoe UI', Tahoma, sans-serif;
                background: #ffffff;
                padding: 30px;
                color: #333;
            }
            .invoice-container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                padding: 0;
            }
            .logo-header {
                padding: 40px 60px 30px 60px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            .logo-section img {
                max-height: 100px;
                width: auto;
            }
            .invoice-title {
                text-align: right;
            }
            .invoice-title h1 {
                font-size: 36px;
                color: #4a6b52;
                font-weight: 700;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            .billing-container {
                padding: 0 60px;
                margin-bottom: 20px;
            }
            .billing-row {
                display: flex;
                justify-content: space-between;
                gap: 40px;
            }
            .billing-to {
                flex: 1;
            }
            .billing-to h3 {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 12px;
                color: #333;
            }
            .billing-to p {
                font-size: 14px;
                line-height: 1.8;
                color: #333;
                margin: 0;
            }
            .billing-to .name {
                font-weight: 600;
                margin-bottom: 4px;
            }
            .invoice-details {
                flex: 1;
                text-align: right;
            }
            .invoice-details-row {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 6px;
                font-size: 14px;
            }
            .invoice-details-row strong {
                font-weight: 700;
                margin-right: 10px;
                color: #333;
            }
            .invoice-details-row span {
                color: #333;
                min-width: 140px;
                text-align: left;
            }
            .items-table {
                margin: 30px 60px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            thead th {
                background: #4a6b52;
                color: white;
                padding: 16px 20px;
                font-weight: 600;
                font-size: 14px;
                text-align: left;
                border-right: 1px solid #3d5a45;
            }
            thead th:last-child {
                border-right: none;
            }
            thead th:nth-child(2),
            thead th:nth-child(3),
            thead th:nth-child(4) {
                text-align: center;
            }
            tbody tr:nth-child(odd) {
                background: #faf8f3;
            }
            tbody tr:nth-child(even) {
                background: #ffffff;
            }
            tbody td {
                padding: 18px 20px;
                font-size: 14px;
                color: #333;
                border-bottom: 1px solid #e8e4dc;
            }
            tbody td:nth-child(2),
            tbody td:nth-child(3),
            tbody td:nth-child(4) {
                text-align: center;
            }
            .payment-totals-section {
                padding: 0 60px;
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                gap: 40px;
            }
            .payment-method {
                flex: 1;
            }
            .payment-method h3 {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 15px;
                color: #333;
            }
            .payment-method p {
                font-size: 14px;
                line-height: 1.8;
                color: #333;
                margin: 8px 0;
            }
            .payment-method strong {
                font-weight: 700;
            }
            .totals-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            .subtotal-row {
                display: flex;
                justify-content: space-between;
                width: 100%;
                max-width: 350px;
                padding: 12px 20px;
                background: #faf8f3;
                margin-bottom: 3px;
                font-size: 15px;
            }
            .subtotal-row strong {
                font-weight: 700;
                color: #333;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                max-width: 350px;
                padding: 0;
                margin-top: 8px;
            }
            .total-label {
                background: #6b9d7a;
                color: white;
                padding: 16px 24px;
                font-size: 18px;
                font-weight: 700;
                flex: 1;
                text-align: center;
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }
            .total-amount {
                background: #5a8a68;
                color: white;
                padding: 16px 24px;
                font-size: 18px;
                font-weight: 700;
                flex: 1;
                text-align: center;
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
            }
            .signatures {
                padding: 0 60px;
                margin-top: 80px;
                margin-bottom: 60px;
                display: flex;
                justify-content: space-between;
                gap: 100px;
            }
            .signature-box {
                flex: 1;
                text-align: center;
            }
            .signature-line {
                border-top: 2px solid #333;
                padding-top: 8px;
                font-size: 14px;
                color: #333;
                font-weight: 600;
            }
            .footer {
                background: #4a6b52;
                color: white;
                padding: 20px 60px;
                text-align: center;
                font-size: 13px;
                display: flex;
                justify-content: space-around;
                align-items: center;
                gap: 30px;
            }
            .footer-item {
                opacity: 0.95;
            }
            .notes {
                margin: 30px 60px;
                padding: 20px;
                background: #faf8f3;
                border-left: 4px solid #4a6b52;
            }
            .notes h4 {
                color: #4a6b52;
                margin-bottom: 10px;
                font-size: 14px;
                font-weight: 700;
            }
            .notes p {
                font-size: 14px;
                line-height: 1.6;
                color: #333;
            }
            @media print {
                body { padding: 0; }
            }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');

        printWindow.document.write('<div class="invoice-container">');

        // Logo and Header
        printWindow.document.write('<div class="logo-header">');
        printWindow.document.write('<div class="logo-section">');
        printWindow.document.write('<img src="img/image.png" alt="Sisu Luxury Decor">');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<div class="invoice-title">');
        printWindow.document.write('<h1>INVOICE<\/h1>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');

        // Billing Section
        printWindow.document.write('<div class="billing-container">');
        printWindow.document.write('<div class="billing-row">');
        printWindow.document.write('<div class="billing-to">');
        printWindow.document.write('<h3>Billing to:</h3>');
        printWindow.document.write('<p class="name">' + booking.fullName + '</p>');
        printWindow.document.write('<p>P: ' + (booking.phone || 'N/A') + '</p>');
        printWindow.document.write('<p>E: ' + booking.email + '</p>');
        if (booking.address) {
            printWindow.document.write('<p>A: ' + booking.address + '</p>');
        }
        printWindow.document.write('</div>');
        printWindow.document.write('<div class="invoice-details">');
        printWindow.document.write('<div class="invoice-details-row">');
        printWindow.document.write('<strong>Invoice #:</strong>');
        printWindow.document.write('<span>' + invoice.invoiceNumber + '</span>');
        printWindow.document.write('</div>');
        printWindow.document.write('<div class="invoice-details-row">');
        printWindow.document.write('<strong>Date:</strong>');
        printWindow.document.write('<span>' + invoiceDate + '</span>');
        printWindow.document.write('</div>');
        printWindow.document.write('<div class="invoice-details-row">');
        printWindow.document.write('<strong>Setup date:</strong>');
        printWindow.document.write('<span>' + eventDate + '</span>');
        printWindow.document.write('</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('</div>');

        // Items Table
        printWindow.document.write('<div class="items-table">');
        printWindow.document.write('<table>');
        printWindow.document.write('<thead><tr>');
        printWindow.document.write('<th>Item description</th>');
        printWindow.document.write('<th>Price</th>');
        printWindow.document.write('<th>QTY</th>');
        printWindow.document.write('<th>Total</th>');
        printWindow.document.write('</tr></thead>');
        printWindow.document.write('<tbody>');

        invoice.items.forEach(item => {
            printWindow.document.write('<tr>');
            printWindow.document.write('<td>' + item.description + '</td>');
            printWindow.document.write('<td>$' + item.unitPrice.toFixed(2) + '</td>');
            printWindow.document.write('<td>' + item.quantity + '</td>');
            printWindow.document.write('<td>$' + item.total.toFixed(2) + '</td>');
            printWindow.document.write('</tr>');
        });

        printWindow.document.write('</tbody></table>');
        printWindow.document.write('</div>');

        // Payment Method and Totals
        printWindow.document.write('<div class="payment-totals-section">');
        printWindow.document.write('<div class="payment-method">');
        printWindow.document.write('<h3>Payment method:</h3>');
        printWindow.document.write('<p><strong>ACCOUNT:</strong> 00200000000</p>');
        printWindow.document.write('<p><strong>Paypal:</strong> invoice@sisudecor.com</p>');
        printWindow.document.write('</div>');

        printWindow.document.write('<div class="totals-section">');
        printWindow.document.write('<div class="subtotal-row">');
        printWindow.document.write('<strong>SUBTOTAL</strong>');
        printWindow.document.write('<span>$' + invoice.subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</span>');
        printWindow.document.write('</div>');

        if (invoice.tax > 0) {
            printWindow.document.write('<div class="subtotal-row">');
            printWindow.document.write('<strong>TAX</strong>');
            printWindow.document.write('<span>$' + invoice.tax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</span>');
            printWindow.document.write('</div>');
        }

        if (invoice.discount > 0) {
            printWindow.document.write('<div class="subtotal-row">');
            printWindow.document.write('<strong>DISCOUNT</strong>');
            printWindow.document.write('<span>-$' + invoice.discount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</span>');
            printWindow.document.write('</div>');
        }

        printWindow.document.write('<div class="total-row">');
        printWindow.document.write('<div class="total-label">TOTAL:</div>');
        printWindow.document.write('<div class="total-amount">$' + invoice.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('</div>');

        // Notes
        if (invoice.notes) {
            printWindow.document.write('<div class="notes">');
            printWindow.document.write('<h4>Notes:</h4>');
            printWindow.document.write('<p>' + invoice.notes + '</p>');
            printWindow.document.write('</div>');
        }

        // Signatures
        printWindow.document.write('<div class="signatures">');
        printWindow.document.write('<div class="signature-box">');
        printWindow.document.write('<div class="signature-line">Costumer Signature</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('<div class="signature-box">');
        printWindow.document.write('<div class="signature-line">Company Signature</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('</div>');

        // Footer
        printWindow.document.write('<div class="footer">');
        printWindow.document.write('<div class="footer-item">(214)347-6392</div>');
        printWindow.document.write('<div class="footer-item">invoice@sisudecor.com</div>');
        printWindow.document.write('<div class="footer-item">sisudecor.com</div>');
        printWindow.document.write('</div>');

        printWindow.document.write('</div>'); // Close invoice-container

        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Trigger print dialog after content loads
        printWindow.onload = function() {
            printWindow.print();
        };
    }

    /**
     * Genera PDF preview sin imprimir (solo visualización)
     * @param {Object} invoice - Datos de la factura
     * @param {Object} booking - Datos del booking
     */
    generatePDFPreview(invoice, booking) {
        // Abrir ventana para preview (sin imprimir)
        const printWindow = window.open('', '_blank');

        const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
        });
        const eventDate = new Date(booking.eventDate).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
        });

        printWindow.document.write('<html><head><title>Invoice ' + invoice.invoiceNumber + '<\/title>');
        printWindow.document.write('<meta charset="UTF-8">');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Montserrat', 'Segoe UI', Tahoma, sans-serif;
                background: #ffffff;
                padding: 30px;
                color: #333;
            }
            .invoice-container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                padding: 0;
            }
            .logo-header {
                padding: 40px 60px 30px 60px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            .logo-section img {
                max-height: 100px;
                width: auto;
            }
            .invoice-title {
                text-align: right;
            }
            .invoice-title h1 {
                font-size: 36px;
                color: #4a6b52;
                font-weight: 700;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            .billing-container {
                padding: 0 60px;
                margin-bottom: 20px;
            }
            .billing-row {
                display: flex;
                justify-content: space-between;
                gap: 40px;
            }
            .billing-to {
                flex: 1;
            }
            .billing-to h3 {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 12px;
                color: #333;
            }
            .billing-to p {
                font-size: 14px;
                line-height: 1.8;
                color: #333;
                margin: 0;
            }
            .billing-to .name {
                font-weight: 600;
                margin-bottom: 4px;
            }
            .invoice-details {
                flex: 1;
                text-align: right;
            }
            .invoice-details-row {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 6px;
                font-size: 14px;
            }
            .invoice-details-row strong {
                font-weight: 700;
                margin-right: 10px;
                color: #333;
            }
            .invoice-details-row span {
                color: #333;
                min-width: 140px;
                text-align: left;
            }
            .items-table {
                margin: 30px 60px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            thead th {
                background: #4a6b52;
                color: white;
                padding: 16px 20px;
                font-weight: 600;
                font-size: 14px;
                text-align: left;
                border-right: 1px solid #3d5a45;
            }
            thead th:last-child {
                border-right: none;
            }
            thead th:nth-child(2),
            thead th:nth-child(3),
            thead th:nth-child(4) {
                text-align: center;
            }
            tbody tr:nth-child(odd) {
                background: #faf8f3;
            }
            tbody tr:nth-child(even) {
                background: #ffffff;
            }
            tbody td {
                padding: 18px 20px;
                font-size: 14px;
                color: #333;
                border-bottom: 1px solid #e8e4dc;
            }
            tbody td:nth-child(2),
            tbody td:nth-child(3),
            tbody td:nth-child(4) {
                text-align: center;
            }
            .payment-totals-section {
                padding: 0 60px;
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                gap: 40px;
            }
            .payment-method {
                flex: 1;
            }
            .payment-method h3 {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 15px;
                color: #333;
            }
            .payment-method p {
                font-size: 14px;
                line-height: 1.8;
                color: #333;
                margin: 8px 0;
            }
            .payment-method strong {
                font-weight: 700;
            }
            .totals-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            .subtotal-row {
                display: flex;
                justify-content: space-between;
                width: 100%;
                max-width: 350px;
                padding: 12px 20px;
                background: #faf8f3;
                margin-bottom: 3px;
                font-size: 15px;
            }
            .subtotal-row strong {
                font-weight: 700;
                color: #333;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                max-width: 350px;
                padding: 0;
                margin-top: 8px;
            }
            .total-label {
                background: #6b9d7a;
                color: white;
                padding: 16px 24px;
                font-size: 18px;
                font-weight: 700;
                flex: 1;
                text-align: center;
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }
            .total-amount {
                background: #5a8a68;
                color: white;
                padding: 16px 24px;
                font-size: 18px;
                font-weight: 700;
                flex: 1;
                text-align: center;
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
            }
            .signatures {
                padding: 0 60px;
                margin-top: 80px;
                margin-bottom: 60px;
                display: flex;
                justify-content: space-between;
                gap: 100px;
            }
            .signature-box {
                flex: 1;
                text-align: center;
            }
            .signature-line {
                border-top: 2px solid #333;
                padding-top: 8px;
                font-size: 14px;
                color: #333;
                font-weight: 600;
            }
            .footer {
                background: #4a6b52;
                color: white;
                padding: 20px 60px;
                text-align: center;
                font-size: 13px;
                display: flex;
                justify-content: space-around;
                align-items: center;
                gap: 30px;
            }
            .footer-item {
                opacity: 0.95;
            }
            .notes {
                margin: 30px 60px;
                padding: 20px;
                background: #faf8f3;
                border-left: 4px solid #4a6b52;
            }
            .notes h4 {
                color: #4a6b52;
                margin-bottom: 10px;
                font-size: 14px;
                font-weight: 700;
            }
            .notes p {
                font-size: 14px;
                line-height: 1.6;
                color: #333;
            }
            @media print {
                body { padding: 0; }
            }
        `);
        printWindow.document.write('<\/style>');
        printWindow.document.write('<\/head><body>');

        printWindow.document.write('<div class="invoice-container">');

        // Logo and Header
        printWindow.document.write('<div class="logo-header">');
        printWindow.document.write('<div class="logo-section">');
        printWindow.document.write('<img src="img/image.png" alt="Sisu Luxury Decor">');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<div class="invoice-title">');
        printWindow.document.write('<h1>INVOICE<\/h1>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');

        // Billing Section
        printWindow.document.write('<div class="billing-container">');
        printWindow.document.write('<div class="billing-row">');
        printWindow.document.write('<div class="billing-to">');
        printWindow.document.write('<h3>Billing to:<\/h3>');
        printWindow.document.write('<p class="name">' + booking.fullName + '<\/p>');
        printWindow.document.write('<p>P: ' + (booking.phone || 'N/A') + '<\/p>');
        printWindow.document.write('<p>E: ' + booking.email + '<\/p>');
        if (booking.address) {
            printWindow.document.write('<p>A: ' + booking.address + '<\/p>');
        }
        printWindow.document.write('<\/div>');
        printWindow.document.write('<div class="invoice-details">');
        printWindow.document.write('<div class="invoice-details-row">');
        printWindow.document.write('<strong>Invoice #:<\/strong>');
        printWindow.document.write('<span>' + invoice.invoiceNumber + '<\/span>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<div class="invoice-details-row">');
        printWindow.document.write('<strong>Date:<\/strong>');
        printWindow.document.write('<span>' + invoiceDate + '<\/span>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<div class="invoice-details-row">');
        printWindow.document.write('<strong>Setup date:<\/strong>');
        printWindow.document.write('<span>' + eventDate + '<\/span>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');

        // Items Table
        printWindow.document.write('<div class="items-table">');
        printWindow.document.write('<table>');
        printWindow.document.write('<thead><tr>');
        printWindow.document.write('<th>Item description<\/th>');
        printWindow.document.write('<th>Price<\/th>');
        printWindow.document.write('<th>QTY<\/th>');
        printWindow.document.write('<th>Total<\/th>');
        printWindow.document.write('<\/tr><\/thead>');
        printWindow.document.write('<tbody>');

        invoice.items.forEach(item => {
            printWindow.document.write('<tr>');
            printWindow.document.write('<td>' + item.description + '<\/td>');
            printWindow.document.write('<td>$' + item.unitPrice.toFixed(2) + '<\/td>');
            printWindow.document.write('<td>' + item.quantity + '<\/td>');
            printWindow.document.write('<td>$' + item.total.toFixed(2) + '<\/td>');
            printWindow.document.write('<\/tr>');
        });

        printWindow.document.write('<\/tbody><\/table>');
        printWindow.document.write('<\/div>');

        // Payment Method and Totals
        printWindow.document.write('<div class="payment-totals-section">');
        printWindow.document.write('<div class="payment-method">');
        printWindow.document.write('<h3>Payment method:<\/h3>');
        printWindow.document.write('<p><strong>ACCOUNT:<\/strong> 00200000000<\/p>');
        printWindow.document.write('<p><strong>Paypal:<\/strong> invoice@sisudecor.com<\/p>');
        printWindow.document.write('<\/div>');

        printWindow.document.write('<div class="totals-section">');
        printWindow.document.write('<div class="subtotal-row">');
        printWindow.document.write('<strong>SUBTOTAL<\/strong>');
        printWindow.document.write('<span>$' + invoice.subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '<\/span>');
        printWindow.document.write('<\/div>');

        if (invoice.tax > 0) {
            printWindow.document.write('<div class="subtotal-row">');
            printWindow.document.write('<strong>TAX<\/strong>');
            printWindow.document.write('<span>$' + invoice.tax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '<\/span>');
            printWindow.document.write('<\/div>');
        }

        if (invoice.discount > 0) {
            printWindow.document.write('<div class="subtotal-row">');
            printWindow.document.write('<strong>DISCOUNT<\/strong>');
            printWindow.document.write('<span>-$' + invoice.discount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '<\/span>');
            printWindow.document.write('<\/div>');
        }

        printWindow.document.write('<div class="total-row">');
        printWindow.document.write('<div class="total-label">TOTAL:<\/div>');
        printWindow.document.write('<div class="total-amount">$' + invoice.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '<\/div>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');

        // Notes
        if (invoice.notes) {
            printWindow.document.write('<div class="notes">');
            printWindow.document.write('<h4>Notes:<\/h4>');
            printWindow.document.write('<p>' + invoice.notes + '<\/p>');
            printWindow.document.write('<\/div>');
        }

        // Signatures
        printWindow.document.write('<div class="signatures">');
        printWindow.document.write('<div class="signature-box">');
        printWindow.document.write('<div class="signature-line">Costumer Signature<\/div>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<div class="signature-box">');
        printWindow.document.write('<div class="signature-line">Company Signature<\/div>');
        printWindow.document.write('<\/div>');
        printWindow.document.write('<\/div>');

        // Footer
        printWindow.document.write('<div class="footer">');
        printWindow.document.write('<div class="footer-item">(214)347-6392<\/div>');
        printWindow.document.write('<div class="footer-item">invoice@sisudecor.com<\/div>');
        printWindow.document.write('<div class="footer-item">sisudecor.com<\/div>');
        printWindow.document.write('<\/div>');

        printWindow.document.write('<\/div>'); // Close invoice-container

        printWindow.document.write('<\/body><\/html>');
        printWindow.document.close();

        // NO TRIGGER PRINT - Solo preview
    }
}

// Exportar la clase para uso global
window.InvoiceService = InvoiceService;
