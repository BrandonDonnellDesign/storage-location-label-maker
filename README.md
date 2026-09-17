# Storage Location Label Maker

A simple, self-contained browser app for turning storage locations into 4 × 6 inch Code 128 labels.

## Features

- Enter one storage location per line
- Live label preview
- Code 128-B barcodes
- Generate multiple labels at once
- Download a real 4 × 6 inch PDF, one label per page
- No server, database, login, or external JavaScript libraries required
- Works as a static site on Vercel, Netlify, or GitHub Pages

## Printing

The app intentionally does **not** call the browser's `window.print()` API. Some managed/work browsers block programmatic print operations. Instead, click **Download 4×6 PDF**, open the downloaded PDF, and print it from your PDF viewer at **100% / Actual Size** with the printer's media set to 4 × 6 inches.

## Supported characters

Code 128-B supports printable ASCII characters. For best results, use letters, numbers, spaces, and standard punctuation in storage locations.

## Development

There is no build step. Open `index.html` directly in a browser or serve the folder with any static web server.
