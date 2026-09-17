# Storage Location Label Maker

Browser-based 4 × 6 inch storage-location label maker with Code 128-B barcodes.

## Features

- Enter one storage location per line
- Live label preview
- Code 128-B barcodes
- Generate multiple labels at once
- Open a normal 4 × 6 label page
- Generate a server-side 4 × 6 PDF through Vercel
- No browser PDF blobs and no automatic `window.print()` call

## Work computers

The **Generate 4×6 PDF** button sends only the entered label text to the Vercel server function at `/api/generate-pdf`. The server creates the PDF with PDFKit and returns a normal PDF response. This avoids browser-side PDF generation and programmatic printing, which can be restricted by managed workstation security software.

The **Open 4×6 Labels** button remains available as a browser-only fallback.

## Supported characters

Code 128-B supports printable ASCII characters. For best results, use letters, numbers, spaces, and standard punctuation in storage locations.

## Deployment

The project is deployed on Vercel. Vercel installs the `pdfkit` dependency from `package.json` and exposes `api/generate-pdf.js` as the PDF endpoint.
