interface ProductoFactura {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
  infoAdicional?: string
  impuesto: number
}

interface FacturaPDFData {
  nombreComercial: string
  direccion: string
  ruc: string
  numeroFactura: string
  claveAcceso: string
  fechaEmision: string
  razonSocialComprador: string
  identificacionComprador: string
  direccionComprador?: string
  subtotal: number
  iva: number
  total: number
  ivaPercentage: number
  moneda: string
  productos: ProductoFactura[]
  infoAdicional: Record<string, string>
  formaPago: string
}

export type { FacturaPDFData }