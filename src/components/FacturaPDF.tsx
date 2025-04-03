import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import type { FacturaPDFData } from '@/types/factura'

// Registrar fuente Helvetica
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf' },
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 'bold' }
  ]
})

// Estilos mejorados
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0057A0',
    paddingBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0057A0',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 3,
    color: '#333'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#0057A0',
    paddingBottom: 3,
    color: '#0057A0'
  },
  table: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5
  },
  tableHeader: {
    backgroundColor: '#0057A0',
    color: 'white',
    fontWeight: 'bold'
  },
  tableColHeader: {
    width: '25%',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
    padding: 3
  },
  tableCol: {
    width: '25%',
    fontSize: 10,
    textAlign: 'center',
    padding: 3
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000000'
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#555'
  },
  additionalInfo: {
    fontSize: 10,
    color: '#333',
    paddingVertical: 2
  }
})

interface FacturaPDFProps {
  data: FacturaPDFData
}

export default function FacturaPDF({ data }: FacturaPDFProps) {
  // Valores por defecto para propiedades opcionales
  const moneda = data.moneda || 'USD';
  const infoAdicional = data.infoAdicional || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.nombreComercial}</Text>
          <Text style={styles.subtitle}>{data.direccion}</Text>
          <Text style={styles.subtitle}>RUC: {data.ruc}</Text>
        </View>

        {/* Información de la factura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FACTURA ELECTRÓNICA</Text>
          <Text>Clave de acceso: {data.claveAcceso}</Text>
          <Text>Fecha de emisión: {data.fechaEmision}</Text>
        </View>

        {/* Información del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
          <Text>Razón Social: {data.razonSocialComprador}</Text>
          <Text>Identificación: {data.identificacionComprador}</Text>
          {data.direccionComprador && (
            <Text>Dirección: {data.direccionComprador}</Text>
          )}
        </View>

        {/* Detalle de productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS/SERVICIOS</Text>
          <View style={styles.table}>
            {/* Encabezados de tabla */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableColHeader}>Descripción</Text>
              <Text style={styles.tableColHeader}>Cantidad</Text>
              <Text style={styles.tableColHeader}>P. Unitario</Text>
              <Text style={styles.tableColHeader}>Total</Text>
            </View>
            
            {/* Filas de productos */}
            {data.productos.map((producto, index) => (
              <View key={`product-${index}`} style={styles.tableRow}>
                <Text style={styles.tableCol}>
                  {producto.descripcion}
                  {producto.infoAdicional && (
                    <Text style={{ fontSize: 8 }}>\n{producto.infoAdicional}</Text>
                  )}
                </Text>
                <Text style={styles.tableCol}>{producto.cantidad}</Text>
                <Text style={styles.tableCol}>{producto.precioUnitario.toFixed(2)}</Text>
                <Text style={styles.tableCol}>{producto.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalsRow}>
          <Text>SUBTOTAL:</Text>
          <Text>{data.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text>IVA {data.ivaPercentage || 12}%:</Text>
          <Text>{data.iva.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalsRow, { fontWeight: 'bold' }]}>
          <Text>TOTAL {moneda}:</Text>
          <Text>{data.total.toFixed(2)}</Text>
        </View>

        {/* Información Adicional */}
        {Object.keys(infoAdicional).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>
            {Object.entries(infoAdicional).map(([key, value], index) => (
              <Text key={`info-${index}`} style={styles.additionalInfo}>
                {key}: {value}
              </Text>
            ))}
          </View>
        )}

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>¡Gracias por su compra!</Text>
          <Text>{data.claveAcceso}</Text>
        </View>
      </Page>
    </Document>
  )
}