 //===================== Products ========================//
const promisePool = require('../db/db');

exports.getProducts = async (req, res, next) => {
  try {
    const [results] = await promisePool.query('SELECT * FROM products');
    
    // Modify the result to include the full URL for the product image
    const productsWithFullImageUrls = results.map(product => {
      // Ensure no double '/uploads/' in the constructed URL
      product.product_img = `http://localhost:3000${product.product_img}`;
      return product;
    });

    res.json(productsWithFullImageUrls);  // Send the modified products in the response
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Failed to fetch products');
  }
};
