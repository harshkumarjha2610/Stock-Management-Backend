const { Product, ProductSize, sequelize } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const barcodeService = require('./barcode.service');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * Create a product and auto-generate a barcode.
 */
const createProduct = async (data, storeId) => {
  const transaction = await sequelize.transaction();
  try {
    const { sizes, ...productData } = data;
    
    // Calculate total stock if sizes are provided
    let totalStock = productData.stock_quantity || 0;
    if (sizes && Array.isArray(sizes)) {
      totalStock = sizes.reduce((acc, s) => acc + (parseInt(s.quantity) || 0), 0);
    }

    const product = await Product.create({
      name: productData.name,
      description: productData.description,
      brand: productData.brand,
      sku: productData.sku,
      barcode: productData.barcode,
      category: productData.category,
      gender: productData.gender,
      fabric: productData.fabric,
      color: productData.color,
      image_url: productData.image_url,
      buying_price: productData.purchase_price || productData.buying_price,
      selling_price: productData.selling_price,
      gst_percent: productData.gst_percent,
      min_stock_level: productData.min_stock_level,
      status: productData.status || 'ACTIVE',
      stock_quantity: totalStock,
      unit: productData.unit,
      hsn_code: productData.hsn_code,
      expiry_date: productData.expiry_date,
      mfg_date: productData.mfg_date,
      store_id: storeId,
    }, { transaction });

    // Create sizes if provided
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      const sizesData = [];
      for (const s of sizes) {
        let sizeBarcode = null;
        sizeBarcode = barcodeService.generateSizeBarcodeString(storeId, product.id, s.size);
        sizesData.push({
          product_id: product.id,
          size: s.size,
          quantity: s.quantity || 0,
          barcode: sizeBarcode,
          barcode_image_url: null,
        });
      }
      await ProductSize.bulkCreate(sizesData, { transaction });
    } else {
      // Generate barcode after creation for products without sizes
      const barcodeString = barcodeService.generateBarcodeString(storeId, product.id);
      await product.update({
        barcode: barcodeString,
        barcode_image_url: null,
      }, { transaction });
    }

    await transaction.commit();
    return await Product.findByPk(product.id, {
      include: [{ association: 'sizes' }]
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Get paginated product list with optional search and filtering.
 */
const getProducts = async (storeId, query = {}) => {
  const { page, limit, offset } = parsePagination(query);

  const where = { store_id: storeId };

  // Search by name
  if (query && query.search) {
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
    include: [{ association: 'sizes' }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  // If 'page' is not provided, the frontend likely expects the full array for list views
  if (!query.page) return rows;

  return paginatedResponse(rows, count, page, limit);
};

/**
 * Get a single product by ID within a store.
 */
const getProductById = async (id, storeId) => {
  const product = await Product.findOne({
    where: { id, store_id: storeId },
    include: [{ association: 'sizes' }],
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
  const transaction = await sequelize.transaction();
  try {
    const product = await getProductById(id, storeId);
    const { sizes, ...productData } = data;

    // If sizes are provided, update total stock
    if (sizes && Array.isArray(sizes)) {
      productData.stock_quantity = sizes.reduce((acc, s) => acc + (parseInt(s.quantity) || 0), 0);
      
      const existingSizes = await ProductSize.findAll({ where: { product_id: id }, transaction });
      const existingSizesMap = {};
      existingSizes.forEach(s => {
        existingSizesMap[s.size] = s;
      });

      const incomingSizeNames = sizes.map(s => s.size);

      // Delete sizes that are not in incoming sizes
      const sizesToDelete = existingSizes.filter(s => !incomingSizeNames.includes(s.size));
      if (sizesToDelete.length > 0) {
        await ProductSize.destroy({
          where: {
            id: { [Op.in]: sizesToDelete.map(s => s.id) }
          },
          transaction
        });
      }

      // Create or update incoming sizes
      for (const s of sizes) {
        const existing = existingSizesMap[s.size];
        if (existing) {
          await existing.update({
            quantity: s.quantity || 0
          }, { transaction });
        } else {
          let sizeBarcode = null;
          sizeBarcode = barcodeService.generateSizeBarcodeString(storeId, id, s.size);
          await ProductSize.create({
            product_id: id,
            size: s.size,
            quantity: s.quantity || 0,
            barcode: sizeBarcode,
            barcode_image_url: null,
          }, { transaction });
        }
      }
    }

    const updateData = {
      name: productData.name,
      description: productData.description,
      brand: productData.brand,
      sku: productData.sku,
      category: productData.category,
      gender: productData.gender,
      fabric: productData.fabric,
      color: productData.color,
      image_url: productData.image_url,
      buying_price: productData.purchase_price || productData.buying_price,
      selling_price: productData.selling_price,
      gst_percent: productData.gst_percent,
      min_stock_level: productData.min_stock_level,
      status: productData.status,
      unit: productData.unit,
      hsn_code: productData.hsn_code,
      expiry_date: productData.expiry_date,
      mfg_date: productData.mfg_date,
    };
    if (productData.barcode !== undefined) {
      updateData.barcode = productData.barcode;
      updateData.barcode_image_url = null;
    }
    await product.update(updateData, { transaction });
    await transaction.commit();
    return await getProductById(id, storeId);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
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
