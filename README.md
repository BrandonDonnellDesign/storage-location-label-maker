# Storage Location Label Maker

Browser-based storage-location label maker for generating true **4 × 3 inch labels** with Code 128-B barcodes.

## Features

- Enter one storage location per line
- Live 4 × 3 inch label preview
- Code 128-B barcodes
- Generate multiple labels at once
- Generate a complete range of storage bins
- Labels are generated directly on the page
- Borderless label layout
- Responsive layout for desktop and mobile
- Print-friendly 4 × 3 inch sizing
- No browser-generated PDFs
- No new windows or tabs
- No automatic `window.print()` calls

## Generate a Bin Range

The range tool can generate multiple storage locations automatically.

For example:

- Start: `SMAKK.01.C.01`
- Stop: `SMAKK.17.C.13`

This generates rows `01–17` with bins `02–13`, for a total of **204 labels**.

The range generator supports matching location formats and is limited to 1,001 labels per generation.

## Supported Characters

Code 128-B supports printable ASCII characters. For best results, use letters, numbers, spaces, and standard punctuation in storage locations.

## Label Size

Each label is designed as:

- **Width:** 4 inches
- **Height:** 3 inches
- **Barcode:** Code 128-B
- **Layout:** Borderless

## Deployment

The live application is published with GitHub Pages:

https://brandondonnelldesign.github.io/storage-location-label-maker/

The app is a client-side HTML/CSS/JavaScript application and does not require a server-side PDF generator.
