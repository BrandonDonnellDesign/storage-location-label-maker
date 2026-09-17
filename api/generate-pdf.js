const PDFDocument = require('pdfkit');

const CODE128 = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212',
  '112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131',
  '311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321',
  '112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121',
  '313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114',
  '122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212',
  '124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113',
  '114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'
];

function code128Values(text) {
  const values = [104];
  for (const ch of text) {
    const n = ch.charCodeAt(0);
    if (n < 32 || n > 126) return null;
    values.push(n - 32);
  }
  let checksum = 104;
  for (let i = 1; i < values.length; i++) checksum += values[i] * i;
  values.push(checksum % 103, 106);
  return values;
}

function drawBarcode(doc, text, x, y, width, height) {
  const values = code128Values(text);
  if (!values) return false;

  let units = 0;
  for (const value of values) {
    for (const digit of CODE128[value]) units += Number(digit);
  }

  const scale = width / units;
  let cursor = x;
  for (const value of values) {
    let black = true;
    for (const digit of CODE128[value]) {
      const barWidth = Number(digit) * scale;
      if (black) doc.rect(cursor, y, barWidth, height).fill();
      cursor += barWidth;
      black = !black;
    }
  }
  return true;
}

function getLocations(req) {
  const raw = req.query?.locations || '';
  return String(raw).split(/\r?\n/).map(v => v.trim()).filter(Boolean);
}

module.exports = (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.status(405).setHeader('Allow', 'GET').send('Method Not Allowed');
      return;
    }

    const locations = getLocations(req);
    if (!locations.length) {
      res.status(400).send('No storage locations supplied.');
      return;
    }
    if (locations.length > 100) {
      res.status(400).send('Maximum 100 labels per PDF.');
      return;
    }
    if (locations.some(v => !code128Values(v))) {
      res.status(400).send('Locations must contain printable ASCII characters.');
      return;
    }

    const doc = new PDFDocument({ size: [288, 432], margin: 0, autoFirstPage: false });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="storage-location-labels-4x6.pdf"');
    doc.pipe(res);

    for (const location of locations) {
      doc.addPage({ size: [288, 432], margin: 0 });
      doc.fillColor('#000000');
      doc.font('Helvetica-Bold').fontSize(25);
      doc.text(location, 18, 42, { width: 252, align: 'center', lineBreak: true });
      drawBarcode(doc, location, 18, 150, 252, 95);
    }

    doc.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).send('Unable to generate PDF.');
  }
};
