const express = require('express');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Ruta para imprimir XML locales
app.post('/imprimir-xml', (req, res) => {
  const { filePath } = req.body; // Ej: "C:/facturas/factura1.xml"
  
  try {
    // 1. Leer el archivo XML
    const xmlContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
    
    // 2. Parsear XML (usa tu función existente)
    const facturaData = parseFacturaXML(xmlContent); // Reemplaza con tu función
    
    // 3. Imprimir
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);
    
    device.open(() => {
      printer
        .font('a')
        .align('ct')
        .text(`FACTURA: ${facturaData.numeroFactura}`)
        .text(`CLIENTE: ${facturaData.razonSocialComprador}`)
        .cut()
        .close();
      res.send('¡XML impreso!');
    });
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// Inicia el servidor en localhost:3001
app.listen(3001, 'localhost', () => {
  console.log('Servidor listo en http://localhost:3001');
});