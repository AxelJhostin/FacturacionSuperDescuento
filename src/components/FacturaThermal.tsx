import React from 'react'
import './FacturaThermal.css'
import type { FacturaPDFData } from '@/types/factura'
import { formatMoney } from '@/utils/helpers'

interface Producto {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
  infoAdicional?: string
  impuesto: number
}

const ProductRow = React.memo(({ producto }: { producto: Producto }) => (
  <tr>
    <td className="product-desc">
      <div className="product-name">{producto.descripcion}</div>
      {producto.infoAdicional && (
        <div className="product-additional">({producto.infoAdicional})</div>
      )}
    </td>
    <td className="text-center">{producto.cantidad.toFixed(2)}</td>
    <td className="text-right money-value">{formatMoney(producto.precioUnitario)}</td>
    <td className="text-right money-value">{formatMoney(producto.total)}</td>
  </tr>
))

const FacturaThermal: React.FC<{ data: FacturaPDFData }> = ({ data }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return new Date().toLocaleDateString('es-EC')
    }
  }

  const getMainAddress = (address: string = '') => {
    return address.split(',')[0].trim() || 'Dirección no especificada'
  }

  const { Email, Telefono, ...otrosCampos } = data.infoAdicional

  return (
    <div 
      className="factura-container"
      style={{
        margin: '0 auto',
        width: '80mm',
        minHeight: '100mm',
        boxSizing: 'border-box'
      }}
    >
      <header className="factura-header">
        <h1>{data.nombreComercial}</h1>
        <div className="store-info">
          <p>{getMainAddress(data.direccion)}</p>
          <p><strong>RUC:</strong> {data.ruc || '9999999999999'}</p>
        </div>
      </header>

      <div className="divider"></div>

      <section className="section">
        <h2>FACTURA ELECTRÓNICA</h2>
        <div className="section-grid">
          <div><strong>No. Factura:</strong></div>
          <div>{data.numeroFactura}</div>
          
          <div><strong>Fecha:</strong></div>
          <div>{formatDate(data.fechaEmision)}</div>
          
          <div><strong>Clave:</strong></div>
          <div className="clave-acceso">{data.claveAcceso || 'No disponible'}</div>
        </div>
      </section>

      <div className="divider"></div>

      <section className="section">
        <h2>DATOS DEL CLIENTE</h2>
        <div className="section-grid">
          <div><strong>Nombre:</strong></div>
          <div className="client-name">{data.razonSocialComprador}</div>
          
          <div><strong>CI:</strong></div>
          <div className="client-id">{data.identificacionComprador}</div>
          
          {data.direccionComprador && (
            <>
              <div><strong>Dirección:</strong></div>
              <div>{getMainAddress(data.direccionComprador)}</div>
            </>
          )}

          {Email && (
            <>
              <div><strong>Email:</strong></div>
              <div>{Email}</div>
            </>
          )}

          {Telefono && (
            <>
              <div><strong>Teléfono:</strong></div>
              <div>{Telefono}</div>
            </>
          )}
        </div>
      </section>

      <div className="divider"></div>

      <table className="products-table">
        <thead>
          <tr>
            <th style={{ width: '48%' }}>Descripción</th>
            <th style={{ width: '12%' }}>Cant.</th>
            <th style={{ width: '19%' }}>P.Unit.</th>
            <th style={{ width: '21%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.productos?.map((producto, index) => (
            <ProductRow key={`product-${index}`} producto={producto} />
          ))}
        </tbody>
      </table>

      <div className="divider"></div>

      <div className="totals-section">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>${formatMoney(data.subtotal)}</span>
        </div>
        <div className="total-row">
          <span>IVA {data.ivaPercentage}%:</span>
          <span>${formatMoney(data.iva)}</span>
        </div>
        <div className="total-row grand-total">
          <span>TOTAL {data.moneda}:</span>
          <span>${formatMoney(data.total)}</span>
        </div>
      </div>

      {Object.keys(otrosCampos).length > 0 && (
        <>
          <div className="divider"></div>
          <section className="section">
            <h2>INFORMACIÓN ADICIONAL</h2>
            <div className="section-grid">
              {Object.entries(otrosCampos).map(([key, value]) => (
                <React.Fragment key={key}>
                  <div><strong>{key}:</strong></div>
                  <div>{value}</div>
                </React.Fragment>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="divider"></div>

      <footer className="receipt-footer">
        <div className="payment-methods">
          <p>Aceptamos: Efectivo, Tarjetas, Transferencias</p>
        </div>
        <div className="footer-message">
          <p>¡Gracias por su compra!</p>
        </div>
        <div className="footer-details">
          <p>Software desarrollado por H.Axel</p>
          <p>{new Date().toLocaleDateString('es-EC')} - {new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </footer>
    </div>
  )
}

export default React.memo(FacturaThermal)