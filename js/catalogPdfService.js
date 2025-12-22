/**
 * Servicio para generar PDF del catálogo para open houses
 * @class CatalogPdfService
 */
class CatalogPdfService {
    constructor() {
        this.primaryColor = '#758e57';
        this.secondaryColor = '#ffcd35';
        this.darkColor = '#446e48';
        this.lightColor = '#b9bf79';
        this.accentColor = '#fff5db';
    }

    /**
     * Genera y descarga el PDF del catálogo
     * @param {VenuePackageCatalog} catalog - Instancia del catálogo
     */
    async generateCatalogPDF(catalog) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Función para agregar nueva página si es necesario
            const checkPageBreak = (requiredHeight) => {
                if (yPosition + requiredHeight > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                    return true;
                }
                return false;
            };

            // Función para agregar página con encabezado
            const addHeaderPage = () => {
                doc.addPage();
                yPosition = margin;
                this.addPageHeader(doc, pageWidth, margin, yPosition);
                yPosition = 50;
            };

            // Portada
            await this.addCoverPage(doc, pageWidth, pageHeight);
            doc.addPage();
            yPosition = margin;

            // Tabla de contenido
            this.addTableOfContents(doc, pageWidth, margin, yPosition);
            doc.addPage();
            yPosition = margin;

            // Obtener servicios del catálogo
            const decorations = catalog.getDecorations();
            const snackCarts = catalog.getSnackCarts();

            // Sección de Decoraciones
            this.addPageHeader(doc, pageWidth, margin, yPosition);
            yPosition = 50;
            
            // Banner decorativo para sección
            doc.setFillColor(117, 142, 87); // #758e57
            doc.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, 'F');
            
            // Línea dorada decorativa
            doc.setFillColor(255, 205, 53); // #ffcd35
            doc.rect(margin, yPosition + 8, contentWidth, 2, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('DECORATIONS', pageWidth / 2, yPosition + 7, { align: 'center' });
            
            yPosition += 18;
            doc.setTextColor(0, 0, 0);

            // Agregar decoraciones
            for (let i = 0; i < decorations.length; i++) {
                const decoration = decorations[i];
                
                checkPageBreak(60);
                if (yPosition === margin) {
                    this.addPageHeader(doc, pageWidth, margin, yPosition);
                    yPosition = 50;
                }

                yPosition = await this.addServiceItem(doc, decoration, pageWidth, margin, yPosition, 'decoration');
                
                // Agregar espacio entre items
                yPosition += 5;
            }

            // Nueva página para Snack Carts
            addHeaderPage();

            // Banner decorativo para sección
            doc.setFillColor(117, 142, 87); // #758e57
            doc.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, 'F');
            
            // Línea dorada decorativa
            doc.setFillColor(255, 205, 53); // #ffcd35
            doc.rect(margin, yPosition + 8, contentWidth, 2, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('SNACK CARTS', pageWidth / 2, yPosition + 7, { align: 'center' });
            
            yPosition += 18;
            doc.setTextColor(0, 0, 0);

            // Agregar snack carts
            for (let i = 0; i < snackCarts.length; i++) {
                const snackCart = snackCarts[i];
                
                checkPageBreak(60);
                if (yPosition === margin) {
                    this.addPageHeader(doc, pageWidth, margin, yPosition);
                    yPosition = 50;
                }

                yPosition = await this.addServiceItem(doc, snackCart, pageWidth, margin, yPosition, 'snack-cart');
                
                // Agregar espacio entre items
                yPosition += 5;
            }

            // Página de contacto
            addHeaderPage();
            this.addContactPage(doc, pageWidth, pageHeight, margin, yPosition);

            // Descargar el PDF
            const fileName = `Sisu_Luxury_Events_Catalog_${new Date().getFullYear()}.pdf`;
            doc.save(fileName);

            return { success: true };
        } catch (error) {
            console.error('Error generating catalog PDF:', error);
            return {
                success: false,
                error: error.message || 'Error al generar el PDF del catálogo'
            };
        }
    }

    /**
     * Agrega la portada del PDF
     */
    async addCoverPage(doc, pageWidth, pageHeight) {
        // Fondo degradado (simulado con rectángulos)
        doc.setFillColor(117, 142, 87); // #758e57
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Banda decorativa superior
        doc.setFillColor(255, 205, 53); // #ffcd35
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        // Banda decorativa inferior
        doc.setFillColor(255, 205, 53);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

        // Logo/Imagen
        const logoY = 50;
        const logoSize = 70;
        const logoX = pageWidth / 2 - logoSize / 2;
        
        // Intentar cargar y agregar imagen del logo
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    // Si no carga, mostrar placeholder
                    doc.setFillColor(255, 255, 255);
                    doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'F');
                    doc.setDrawColor(255, 205, 53);
                    doc.setLineWidth(2);
                    doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'S');
                    resolve();
                }, 3000);

                img.onload = () => {
                    clearTimeout(timeout);
                    try {
                        // Agregar borde dorado para el logo
                        doc.setDrawColor(255, 205, 53);
                        doc.setLineWidth(2);
                        doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'S');
                        
                        // Agregar la imagen del logo
                        doc.addImage(img, 'JPEG', logoX + 5, logoY + 5, logoSize - 10, logoSize - 10);
                        resolve();
                    } catch (error) {
                        console.warn('Could not add logo image:', error);
                        // Mostrar placeholder si falla
                        doc.setFillColor(255, 255, 255);
                        doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'F');
                        doc.setDrawColor(255, 205, 53);
                        doc.setLineWidth(2);
                        doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'S');
                        resolve();
                    }
                };
                
                img.onerror = () => {
                    clearTimeout(timeout);
                    // Mostrar placeholder si falla
                    doc.setFillColor(255, 255, 255);
                    doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'F');
                    doc.setDrawColor(255, 205, 53);
                    doc.setLineWidth(2);
                    doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'S');
                    resolve();
                };
                
                img.src = 'img/icon.jpg';
            });
        } catch (error) {
            console.warn('Error loading logo:', error);
            // Mostrar placeholder si hay error
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'F');
            doc.setDrawColor(255, 205, 53);
            doc.setLineWidth(2);
            doc.roundedRect(logoX, logoY, logoSize, logoSize, 8, 8, 'S');
        }

        // Título principal con sombra
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.text('SISU LUXURY', pageWidth / 2, logoY + 100, { align: 'center' });
        
        doc.setFontSize(28);
        doc.text('EVENTS', pageWidth / 2, logoY + 115, { align: 'center' });

        // Subtítulo elegante
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 245, 219); // #fff5db
        doc.text('Premium Event Services Catalog', pageWidth / 2, logoY + 140, { align: 'center' });

        // Líneas decorativas
        doc.setDrawColor(255, 205, 53);
        doc.setLineWidth(1.5);
        doc.line(pageWidth / 2 - 70, logoY + 155, pageWidth / 2 - 20, logoY + 155);
        doc.line(pageWidth / 2 + 20, logoY + 155, pageWidth / 2 + 70, logoY + 155);

        // Texto para open houses
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Perfect for Open Houses', pageWidth / 2, logoY + 175, { align: 'center' });
        
        doc.setFontSize(13);
        doc.setFont('helvetica', 'normal');
        doc.text('& Special Events', pageWidth / 2, logoY + 190, { align: 'center' });

        // Información de contacto en la parte inferior con fondo
        const contactY = pageHeight - 50;
        doc.setFillColor(68, 110, 72); // #446e48 (más oscuro)
        doc.roundedRect(pageWidth / 2 - 60, contactY, 120, 35, 5, 5, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('CONTACT US', pageWidth / 2, contactY + 8, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('(214) 347-6392', pageWidth / 2, contactY + 18, { align: 'center' });
        doc.text('gloriasoto720@gmail.com', pageWidth / 2, contactY + 28, { align: 'center' });
    }

    /**
     * Agrega el encabezado de página
     */
    addPageHeader(doc, pageWidth, margin, yPosition) {
        // Barra superior
        doc.setFillColor(117, 142, 87); // #758e57
        doc.rect(0, 0, pageWidth, 25, 'F');

        // Logo/Texto
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SISU LUXURY EVENTS', margin, 18);

        // Línea decorativa
        doc.setDrawColor(255, 205, 53); // #ffcd35
        doc.setLineWidth(1);
        doc.line(margin, 25, pageWidth - margin, 25);
    }

    /**
     * Agrega tabla de contenido
     */
    addTableOfContents(doc, pageWidth, margin, yPosition) {
        this.addPageHeader(doc, pageWidth, margin, yPosition);
        yPosition = 50;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('TABLE OF CONTENTS', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 20;

        // Decorations
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DECORATIONS', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('• Baby Shower Decor', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Elegant Backdrop', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Floral Dream', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Fairy Tale Decor', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Love Celebration', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• White Butterfly Decor', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Elegant Entrance', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Shimmer Walls', margin + 5, yPosition);
        
        yPosition += 15;

        // Snack Carts
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SNACK CARTS', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('• Charcuterie', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Mini Pancakes', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Fruit Snacks', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Elote', margin + 5, yPosition);
        yPosition += 7;
        doc.text('• Paleta Cart', margin + 5, yPosition);
    }

    /**
     * Agrega un item de servicio al PDF
     */
    async addServiceItem(doc, service, pageWidth, margin, yPosition, type) {
        const contentWidth = pageWidth - (margin * 2);
        // Imágenes cuadradas - tamaño ajustado para que quepan bien en el marco
        const imageSize = 45;
        const imageWidth = imageSize;
        const imageHeight = imageSize;
        const textStartX = margin + imageWidth + 12;
        const textWidth = contentWidth - imageWidth - 12;

        // Borde decorativo para el item
        doc.setDrawColor(117, 142, 87); // #758e57
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPosition - 3, contentWidth, imageHeight + 6, 2, 2, 'S');

        // Fondo sutil para el item
        doc.setFillColor(250, 248, 243); // #faf8f3
        doc.roundedRect(margin + 0.5, yPosition - 2.5, contentWidth - 1, imageHeight + 5, 2, 2, 'F');

        // Intentar cargar y agregar imagen
        let imageLoaded = false;
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve();
                }, 3000); // Timeout de 3 segundos

                img.onload = () => {
                    clearTimeout(timeout);
                    try {
                        // Dimensiones cuadradas para la imagen - ajustadas al marco
                        const padding = 4; // Padding interno
                        const squareSize = imageSize - (padding * 2); // Tamaño final de la imagen
                        const imageX = margin + padding;
                        const imageY = yPosition + padding;
                        
                        // Agregar borde cuadrado a la imagen
                        doc.setDrawColor(117, 142, 87);
                        doc.setLineWidth(1);
                        doc.roundedRect(imageX - 1, imageY - 1, squareSize + 2, squareSize + 2, 2, 2, 'S');
                        
                        // Agregar la imagen cuadrada - jsPDF ajustará automáticamente
                        doc.addImage(img, 'JPEG', imageX, imageY, squareSize, squareSize);
                        imageLoaded = true;
                        resolve();
                    } catch (error) {
                        console.warn('Could not add image:', service.image);
                        resolve();
                    }
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                
                // Intentar cargar desde ruta relativa
                if (service.image) {
                    img.src = service.image;
                } else {
                    resolve();
                }
            });
        } catch (error) {
            console.warn('Error loading image:', error);
        }

        // Si no hay imagen, agregar placeholder cuadrado
        if (!imageLoaded) {
            const padding = 4;
            const squareSize = imageSize - (padding * 2);
            const placeholderX = margin + padding;
            const placeholderY = yPosition + padding;
            
            doc.setFillColor(200, 200, 200);
            doc.roundedRect(placeholderX, placeholderY, squareSize, squareSize, 2, 2, 'F');
            doc.setDrawColor(117, 142, 87);
            doc.setLineWidth(1);
            doc.roundedRect(placeholderX - 1, placeholderY - 1, squareSize + 2, squareSize + 2, 2, 2, 'S');
            
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('Image', placeholderX + squareSize / 2, placeholderY + squareSize / 2 - 2, { align: 'center' });
        }

        // Nombre del servicio
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(117, 142, 87); // #758e57
        const nameLines = doc.splitTextToSize(service.name, textWidth);
        doc.text(nameLines, textStartX, yPosition + 8);

        // Tipo de servicio con badge
        const typeY = yPosition + 8 + (nameLines.length * 5) + 3;
        doc.setFillColor(255, 205, 53); // #ffcd35
        doc.roundedRect(textStartX, typeY - 4, 35, 6, 1, 1, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const typeText = type === 'decoration' ? 'DECORATION' : 'SNACK CART';
        doc.text(typeText, textStartX + 2, typeY);

        // Descripción genérica
        const descY = typeY + 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const description = this.getServiceDescription(service.name, type);
        const descLines = doc.splitTextToSize(description, textWidth);
        doc.text(descLines, textStartX, descY);

        // Calcular nueva posición Y
        const textHeight = (nameLines.length * 5) + (descLines.length * 4) + 15;
        const itemHeight = Math.max(imageHeight, textHeight) + 8;

        return yPosition + itemHeight;
    }

    /**
     * Obtiene descripción para un servicio
     */
    getServiceDescription(name, type) {
        if (type === 'decoration') {
            return 'Elegant and sophisticated decoration perfect for creating a memorable atmosphere at your open house or special event.';
        } else {
            return 'Premium snack cart service featuring high-quality ingredients and professional presentation, ideal for entertaining guests.';
        }
    }

    /**
     * Agrega página de contacto
     */
    addContactPage(doc, pageWidth, pageHeight, margin, yPosition) {
        this.addPageHeader(doc, pageWidth, margin, yPosition);
        yPosition = 70;

        // Título con fondo decorativo
        doc.setFillColor(117, 142, 87); // #758e57
        doc.roundedRect(pageWidth / 2 - 50, yPosition - 8, 100, 15, 3, 3, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTACT US', pageWidth / 2, yPosition + 3, { align: 'center' });
        
        yPosition += 35;

        // Tarjeta de contacto elegante
        const cardY = yPosition;
        const cardHeight = 80;
        doc.setFillColor(250, 248, 243); // #faf8f3
        doc.roundedRect(margin + 20, cardY, pageWidth - (margin * 2) - 40, cardHeight, 5, 5, 'F');
        
        doc.setDrawColor(117, 142, 87);
        doc.setLineWidth(2);
        doc.roundedRect(margin + 20, cardY, pageWidth - (margin * 2) - 40, cardHeight, 5, 5, 'S');

        // Línea decorativa superior en la tarjeta
        doc.setFillColor(255, 205, 53); // #ffcd35
        doc.rect(margin + 20, cardY, pageWidth - (margin * 2) - 40, 3, 'F');

        const cardContentY = cardY + 20;
        const centerX = pageWidth / 2;
        
        // Teléfono
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(117, 142, 87);
        doc.text('Phone', centerX, cardContentY, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('(214) 347-6392', centerX, cardContentY + 10, { align: 'center' });
        
        // Email
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(117, 142, 87);
        doc.text('Email', centerX, cardContentY + 30, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('gloriasoto720@gmail.com', centerX, cardContentY + 40, { align: 'center' });

        // Mensaje inspirador
        yPosition = cardY + cardHeight + 25;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const message = 'We look forward to helping you create unforgettable events.';
        doc.text(message, pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 10;
        doc.setFontSize(12);
        const message2 = 'Let us transform your open house into an extraordinary experience.';
        doc.text(message2, pageWidth / 2, yPosition, { align: 'center' });

        // Línea decorativa inferior
        yPosition = pageHeight - 50;
        doc.setDrawColor(117, 142, 87);
        doc.setLineWidth(2);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        
        // Línea dorada
        doc.setFillColor(255, 205, 53);
        doc.rect(margin, yPosition + 2, pageWidth - (margin * 2), 1, 'F');

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('© ' + new Date().getFullYear() + ' Sisu Luxury Events - All Rights Reserved', pageWidth / 2, pageHeight - 25, { align: 'center' });
    }
}

// Exportar la clase para uso global
window.CatalogPdfService = CatalogPdfService;

