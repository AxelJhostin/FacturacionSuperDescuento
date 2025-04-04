import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import type { FacturaPDFData } from '@/types/factura'

// Registrar fuentes (opcional)
Font.register({
  family: 'Courier',
  src: 'https://fonts.gstatic.com/s/courierprime/v9/u-450q2lgwslOqpF_6gQ8kELaw9pWt_.woff2'
})

// Estilos base para 80mm de ancho
const styles = StyleSheet.create({
  page: {
    padding: 5,
    fontFamily: 'Courier',
    fontSize: 9,
    width: '80mm'
  },
  header: {
    marginBottom: 5,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 3
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 8,
    marginBottom: 1
  },
  section: {
    marginBottom: 5
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 2
  },
  table: {
    width: '100%',
    marginBottom: 5,
    borderWidth: 0.5,
    borderColor: '#000'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderBottomColor: '#000',
    paddingVertical: 2
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  },
  tableCol: {
    width: '25%',
    fontSize: 8,
    textAlign: 'center',
    padding: 1
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: '#000'
  },
  footer: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 7
  }
})

export default function FacturaPDF({ data }: { data: FacturaPDFData }) {
  return (
    <Document>
      <Page size={[80, 297]} style={styles.page}> {/* 80mm de ancho */}
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.nombreComercial}</Text>
          <Text style={styles.subtitle}>{data.direccion}</Text>
          <Text style={styles.subtitle}>RUC: {data.ruc}</Text>
        </View>

        {/* Información de factura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FACTURA ELECTRÓNICA</Text>
          <Text>No: {data.numeroFactura}</Text>
          <Text>Fecha: {data.fechaEmision}</Text>
          <Text>Clave: {data.claveAcceso}</Text>
        </View>

        {/* Datos del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
          <Text>Nombre: {data.razonSocialComprador}</Text>
          <Text>Identificación: {data.identificacionComprador}</Text>
          {data.direccionComprador && <Text>Dirección: {data.direccionComprador}</Text>}
        </View>

        {/* Productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALLE</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol}>Descripción</Text>
              <Text style={styles.tableCol}>Cant.</Text>
              <Text style={styles.tableCol}>P.Unit</Text>
              <Text style={styles.tableCol}>Total</Text>
            </View>
            
            {data.productos.map((prod, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCol}>{prod.descripcion}</Text>
                <Text style={styles.tableCol}>{prod.cantidad}</Text>
                <Text style={styles.tableCol}>{prod.precioUnitario.toFixed(2)}</Text>
                <Text style={styles.tableCol}>{prod.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalsRow}>
          <Text>Subtotal:</Text>
          <Text>{data.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text>IVA {data.ivaPercentage}%:</Text>
          <Text>{data.iva.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalsRow, { fontWeight: 'bold' }]}>
          <Text>TOTAL:</Text>
          <Text>{data.total.toFixed(2)}</Text>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>¡Gracias por su compra!</Text>
        </View>
      </Page>
    </Document>
  )
}