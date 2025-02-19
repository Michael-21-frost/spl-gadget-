//===================== Admin ========================//
const pool = require('../db/db');
const productSchema = require('../validations/productValidation');

//==================================ORDERS MANAGEMENT
//=======Fetch all orders with optional pagination
exports.getAllOrders = async (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;

  // Validate page and limit values to ensure they are integers and greater than 0
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1; // Default to 1 if page is invalid
  if (isNaN(limit) || limit < 1) limit = 10; // Default to 10 if limit is invalid

  const offset = (page - 1) * limit;

  const query = `SELECT * FROM orders LIMIT ? OFFSET ?`;

  try {
      const [results] = await pool.query(query, [limit, offset]);
      res.json(results);
  } catch (err) {
      console.error('Error executing query:', err);
      return next({ status: 500, message: 'Failed to fetch orders' });
  }
};

//========Update order status
exports.updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Ensure the status is a valid ENUM value
  const validStatuses = ['Pending', 'Successful', 'Cancelled', 'Suspended'];
  if (!validStatuses.includes(status)) {
      return next({ status: 400, message: 'Invalid order status' });
  }

  const query = `UPDATE orders SET order_status = ? WHERE id = ?`;

  try {
      const [results] = await pool.query(query, [status, id]);
      if (results.affectedRows === 0) {
          return next({ status: 404, message: 'Order not found' });
      }
      res.status(200).json({ message: 'Order status updated successfully' });
  } catch (err) {
      console.error('Error updating order status:', err);
      return next({ status: 500, message: 'Failed to update order status' });
  }
};

//========Delete an order by ID
exports.deleteOrderByID = async (req, res, next) => {
  const { id } = req.params;

  const query = `DELETE FROM orders WHERE id = ?`;

  try {
      const [results] = await pool.execute(query, [id]); 
      if (results.affectedRows === 0) {
          return next({ status: 404, message: 'Order not found' });
      }
      res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
      console.error('Error deleting order:', err);
      return next({ status: 500, message: 'Failed to delete order' });
  }
};

//=================================PRODUCT MANAGEMENT

//=======Fetch all products with optional pagination
exports.getAllProducts = async (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;

  // Validate page and limit values to ensure they are integers and greater than 0
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1; // Default to 1 if page is invalid
  if (isNaN(limit) || limit < 1) limit = 10; // Default to 10 if limit is invalid

  const offset = (page - 1) * limit;

  const query = `SELECT * FROM products LIMIT ? OFFSET ?`;

  try {
      const [results] = await pool.query(query, [limit, offset]);

      const productsWithFullImageUrls = results.map(product => {
        product.product_img = `http://localhost:3000${product.product_img}`; // Ensure this is the full URL
        return product;
    });
    

      res.json(productsWithFullImageUrls); // Send the products with full URLs
  } catch (err) {
      console.error('Error fetching products:', err);
      return next({ status: 500, message: 'Failed to fetch products' });
  }
};

//=======Add new product
exports.addProduct = async (req, res, next) => {
  const { productName, price, description } = req.body;
  const product_img = req.file ? `/uploads/${req.file.filename}` : null;

  // Validate input using Joi or any validation method
  const { error } = productSchema.validate({ productName, price, description });
  if (error) return next({ status: 400, message: error.details[0].message });

  // Ensure product image is provided
  if (!product_img) return next({ status: 400, message: 'Product image is required' });

  const query = `INSERT INTO products (productName, price, description, product_img) VALUES (?, ?, ?, ?)`;

  try {
      const [results] = await pool.execute(query, [productName, price, description, product_img]);
      res.status(201).json({ message: 'Product added successfully', productId: results.insertId });
  } catch (err) {
      console.error('Error adding product:', err);
      return next({ status: 500, message: 'Failed to add product' });
  }
};

//====== Update product by ID

exports.updateProductByID = async (req, res, next) => {
    const { id } = req.params;
    const { productName, price, description } = req.body;
    const product_img = req.file ? `/uploads/${req.file.filename}` : null;
  
    // Log the incoming data for debugging
    console.log('Incoming Data:', { productName, price, description, product_img });
    
    // Log the params
    console.log('Incoming Params:', { id });
  
    // Validate input using Joi schema
    const validationInput = { productName, price, description };
    const { error } = productSchema.validate(validationInput);
  
    // Log validation input and result
    console.log('Validation Input:', validationInput);
    if (error) {
      console.error('Validation Error:', error.details);
      return next({ status: 400, message: error.details[0].message });
    }
  
    const query = `UPDATE products SET productName = ?, price = ?, description = ?, product_img = ? WHERE id = ?`;
  
    try {
      const [results] = await pool.execute(query, [productName, price, description, product_img, id]);
      if (results.affectedRows === 0) {
        return next({ status: 404, message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
      console.error('Error updating product:', err);
      return next({ status: 500, message: 'Failed to update product' });
    }
  };

//====== Delete a product by ID
exports.deleteProductByID = async (req, res, next) => {
  const { id } = req.params;

  const query = `DELETE FROM products WHERE id = ?`;

  try {
      const [results] = await pool.execute(query, [id]);
      if (results.affectedRows === 0) {
          return next({ status: 404, message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
      console.error('Error deleting product:', err);
      return next({ status: 500, message: 'Failed to delete product' });
  }
};
