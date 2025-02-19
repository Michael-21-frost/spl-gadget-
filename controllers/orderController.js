//===================== Orders route========================//

const { v4: uuidv4 } = require('uuid');
const pool = require('../db/db'); 
const { validateOrder } = require('../validations/orderValidation');

// Place Order (with async/await)
exports.placeOrder = async (req, res, next) => {
  try {
      const { error, value } = validateOrder(req.body);
      if (error) {
          console.error('Validation Error:', error.details[0].message);
          return next({ status: 400, message: error.details[0].message });
      }

      const { username, phonenumber, email, state, address, local_government_area, product_name, number_of_items, total_price, note } = value;

      const order_number = uuidv4();

      const query = `
          INSERT INTO orders 
          (username, phonenumber, email, order_number, state, address, local_government_area, product_name, number_of_items, total_price, note, order_status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      // Added 'Pending' for the order_status in the values array
      await pool.query(query, [
          username, phonenumber, email, order_number, state, address, local_government_area, product_name, number_of_items, total_price, note || null, 'Pending'
      ]);

      res.status(201).json({
          message: 'Order placed successfully',
          order_number,
      });
  } catch (err) {
      console.error('Error placing order:', err);
      return next({ status: 500, message: 'Failed to place order' });
  }
};
