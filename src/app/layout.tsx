import './globals.css'

export const metadata = {
  title: 'Sistema de Facturación',
  description: 'Generador de facturas térmicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}