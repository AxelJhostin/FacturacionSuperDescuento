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
    const printWindow = window.open('', '_blank')
    if (printWindow && facturaRef.current) {
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(style => style.outerHTML)
        .join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Factura - ${factura?.nombreComercial || 'Factura'}</title>
            ${styles}
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { 
                margin: 0 !important; 
                padding: 5mm !important;
                width: 80mm !important;
                font-family: 'Courier New', monospace !important;
                -webkit-print-color-adjust: exact;
              }
            </style>
          </head>
          <body>
            ${facturaRef.current.innerHTML}
            <script>
              setTimeout(() => {
                window.print()
                window.close()
              }, 300)
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleSavePDF = async () => {
    if (!facturaRef.current) return;
    
    // Asegurar estilos antes de capturar
    facturaRef.current.style.width = '80mm'
    facturaRef.current.style.margin = '0 auto'

    const canvas = await html2canvas(facturaRef.current, {
      scale: 4,
      logging: false,
      useCORS: true,
      width: 320, // 80mm * 4 (alta resolución)
      windowWidth: 320,
      backgroundColor: '#FFFFFF',
      scrollX: 0,
      scrollY: 0
    })

    const pdfHeight = (canvas.height * 80) / canvas.width
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, pdfHeight] // 80mm de ancho
    })

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0, // Margen izquierdo
      0, // Margen superior
      80, // Ancho
      pdfHeight // Alto
    )

    pdf.save(`factura-${factura?.numeroFactura || new Date().getTime()}.pdf`)
  }

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
              <div id="factura-print" ref={facturaRef}>
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