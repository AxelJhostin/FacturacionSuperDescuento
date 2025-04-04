'use client'
import { useState, useRef } from 'react'
import { parseFacturaXML } from '@/utils/parseFactura'
import FacturaThermal from '@/components/FacturaThermal'
import type { FacturaPDFData } from '@/types/factura'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import './page.css'

export default function FacturaPage() {
  const [factura, setFactura] = useState<FacturaPDFData | null>(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [showInvoice, setShowInvoice] = useState(false)
  const facturaRef = useRef<HTMLDivElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setFileName('')
    setFactura(null)
    setShowInvoice(false)

    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    try {
      const data = await parseFacturaXML(file)
      setFactura(data)
    } catch (err) {
      setError('Error al procesar el archivo XML. Verifica el formato.')
      console.error(err)
    }
  }

  const handlePrint = () => {
    if (!facturaRef.current) return;
  
    // 1. Clonar el elemento con sus estilos actuales
    const clone = facturaRef.current.cloneNode(true) as HTMLElement;
  
    // 2. Crear una ventana temporal
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Por favor permite ventanas emergentes para imprimir');
      return;
    }
  
    // 3. Escribir el contenido clonado (con estilos heredados)
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura ${factura?.numeroFactura || ''}</title>
          <style>
            @page { 
              size: 80mm auto; 
              margin: 0; 
            }
            body { 
              margin: 0 !important; 
              padding: 5mm !important;
              width: 80mm !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
          <!-- Inyectar TODOS los estilos de la página actual -->
          ${Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(tag => tag.outerHTML)
            .join('')}
        </head>
        <body>
          ${clone.outerHTML}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleSavePDF = async () => {
    if (!facturaRef.current) return;
  
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: fixed;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      width: 80mm;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background: white;
      z-index: 9999;
    `;
  
    const clone = facturaRef.current.cloneNode(true) as HTMLElement;
    clone.style.cssText = `
      width: 80mm !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
    `;
  
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
  
    try {
      const canvas = await html2canvas(clone, {
        scale: 3, // Aumentamos la calidad
        logging: true,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        width: 80 * 3.78, // 80mm a pixeles (3.78px/mm)
        windowWidth: 80 * 3.78,
        scrollX: 0,
        scrollY: 0
      });
  
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
  
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        'FAST'
      );
  
      pdf.save(`factura-${factura?.numeroFactura || 'factura'}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div className="page-container">
      <header className="app-header">
        <h1>Sistema de Facturación</h1>
        <p>El Super Descuento</p>
      </header>

      <section className="upload-section">
        <label className="upload-button">
          📄 Subir Factura XML
          <input 
            type="file" 
            accept=".xml" 
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
        {fileName && <p className="file-name">Archivo: {fileName}</p>}
        {error && <p className="error-message">{error}</p>}
      </section>

      {factura && (
        <div className="invoice-section">
          <div className="button-container">
            <button 
              onClick={() => setShowInvoice(!showInvoice)}
              className="toggle-button"
            >
              {showInvoice ? 'Ocultar Factura' : 'Mostrar Factura'}
            </button>
          </div>

          {showInvoice && (
            <div className="factura-preview">
              <div 
                id="factura-print" 
                ref={facturaRef}
                style={{
                  width: '80mm',
                  margin: '0 auto',
                  padding: '5mm',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
              >
                <FacturaThermal data={factura} />
              </div>
              <div className="action-buttons">
                <button onClick={handlePrint} className="print-button">
                  🖨️ Imprimir Factura
                </button>
                <button onClick={handleSavePDF} className="pdf-button">
                  💾 Guardar como PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}