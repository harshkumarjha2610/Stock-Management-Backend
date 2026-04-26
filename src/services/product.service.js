const { Product } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const barcodeService = require('./barcode.service');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * Create a product and auto-generate a barcode.
 */
const createProduct = async (data, storeId) => {
  const product = await Product.create({
    ...data,
    store_id: storeId,
  });

  // Generate barcode after creation (we need the product ID)
  try {
    const barcodeString = barcodeService.generateBarcodeString(storeId, product.id);
    const barcodeImageUrl = await barcodeService.generateBarcodeImage(barcodeString);

    await product.update({
      barcode: barcodeString,
      barcode_image_url: barcodeImageUrl,
    });
  } catch (err) {
    console.error('⚠️ Barcode generation failed for product', product.id, err.message);
    // Non-critical: product is still created without barcode
  }

  return product.reload();
};

/**
 * Get paginated product list with optional search and filtering.
 */
const getProducts = async (storeId, query) => {
  const { page, limit, offset } = parsePagination(query);

  const where = { store_id: storeId };

  // Search by name
  if (query.search) {
    where.name = { [Op.iLike]: `%${query.search}%` };
  }

  // Filter by category
  if (query.category) {
    where.category = query.category;
  }

  // Filter by brand
  if (query.brand) {
    where.brand = query.brand;
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return paginatedResponse(rows, count, page, limit);
};

/**
 * Get a single product by ID within a store.
 */
const getProductById = async (id, storeId) => {
  const product = await Product.findOne({
    where: { id, store_id: storeId },
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return product;
};

/**
 * Update a product within a store.
 */
const updateProduct = async (id, data, storeId) => {
  const product = await getProductById(id, storeId);
  await product.update(data);
  return product;
};

/**
 * Delete a product within a store.
 */
const deleteProduct = async (id, storeId) => {
  const product = await getProductById(id, storeId);
  await product.destroy();
  return { message: 'Product deleted successfully.' };
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
