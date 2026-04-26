const path = require('path');
const fs = require('fs');
const bwipjs = require('bwip-js');

const BARCODE_DIR = path.join(__dirname, '..', '..', 'uploads', 'barcodes');

/**
 * Ensure the barcode upload directory exists.
 */
const ensureDir = () => {
  if (!fs.existsSync(BARCODE_DIR)) {
    fs.mkdirSync(BARCODE_DIR, { recursive: true });
  }
};

/**
 * Generate a unique barcode string using the format: STR{storeId}-PROD{productId}-{random}
 */
const generateBarcodeString = (storeId, productId) => {
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `STR${storeId}-PROD${productId}-${random}`;
};

/**
 * Generate a Code128 barcode image from a barcode string.
 * Saves the image as PNG to uploads/barcodes/ and returns the relative URL.
 */
const generateBarcodeImage = async (barcodeString) => {
  ensureDir();

  const filename = `${barcodeString}.png`;
  const filepath = path.join(BARCODE_DIR, filename);

  const pngBuffer = await bwipjs.toBuffer({
    bcid: 'code128',
    text: barcodeString,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: 'center',
  });

  fs.writeFileSync(filepath, pngBuffer);

  // Return relative URL (can be served via static middleware)
  return `/uploads/barcodes/${filename}`;
};

module.exports = { generateBarcodeString, generateBarcodeImage };
