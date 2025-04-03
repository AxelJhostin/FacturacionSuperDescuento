import { parseStringPromise } from 'xml2js'
import type { FacturaPDFData } from '@/types/factura'
import { parseDecimal } from '@/utils/helpers'

export async function parseFacturaXML(file: File): Promise<FacturaPDFData> {
  const content = await file.text()
  const result = await parseStringPromise(content)

  const infoTributaria = result.factura.infoTributaria?.[0] || {}
  const infoFactura = result.factura.infoFactura?.[0] || {}
  const detalles = result.factura.detalles?.[0]?.detalle || []
  const infoAdicional = result.factura.infoAdicional?.[0]?.campoAdicional || []

  const camposAdicionales = infoAdicional.reduce((acc: Record<string, string>, campo: any) => {
    if (campo.$ && campo.$.nombre && campo._) {
      acc[campo.$.nombre] = campo._
    }
    return acc
  }, {})

  const numeroFactura = [
    infoTributaria.estab?.[0] || '001',
    infoTributaria.ptoEmi?.[0] || '001',
    infoTributaria.secuencial?.[0]?.padStart(9, '0') || '000000001'
  ].join('-')

  const subtotal = parseDecimal(infoFactura.totalSinImpuestos?.[0])
  const iva = parseDecimal(infoFactura.totalConImpuestos?.[0]?.totalImpuesto?.[0]?.valor?.[0])
  const total = parseDecimal(infoFactura.importeTotal?.[0])

  return {
    nombreComercial: infoTributaria.nombreComercial?.[0] || infoTributaria.razonSocial?.[0] || 'EL SUPER DESCUENTO',
    direccion: infoTributaria.dirMatriz?.[0] || 'Dirección no especificada',
    ruc: infoTributaria.ruc?.[0] || '',
    numeroFactura,
    claveAcceso: infoTributaria.claveAcceso?.[0] || '',
    fechaEmision: infoFactura.fechaEmision?.[0] || '',
    razonSocialComprador: infoFactura.razonSocialComprador?.[0] || 'CONSUMIDOR FINAL',
    identificacionComprador: infoFactura.identificacionComprador?.[0] || '9999999999999',
    direccionComprador: infoFactura.direccionComprador?.[0],
    subtotal,
    iva,
    total,
    ivaPercentage: 15,
    moneda: infoFactura.moneda?.[0] || 'USD',
    productos: detalles.map((detalle: any) => {
      const precioUnitario = parseDecimal(detalle.precioUnitario?.[0])
      const cantidad = parseDecimal(detalle.cantidad?.[0])
      const descuento = parseDecimal(detalle.descuento?.[0])
      const subtotal = parseDecimal((precioUnitario * cantidad - descuento).toString())
      
      return {
        descripcion: detalle.descripcion?.[0] || 'Producto sin descripción',
        cantidad,
        precioUnitario,
        total: subtotal,
        infoAdicional: detalle.detallesAdicionales?.[0]?.detAdicional?.[0]?.$?.valor || '',
        impuesto: parseDecimal(detalle.impuestos?.[0]?.impuesto?.[0]?.valor?.[0])
      }
    }),
    infoAdicional: camposAdicionales,
    formaPago: infoFactura.pagos?.[0]?.pago?.[0]?.formaPago?.[0] || '01'
  }
}