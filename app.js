//========== SPL GADGETS SERVER ENDPOINT ===========//
//====== MICHAEL OTOTE CEO OTOTECH INDUSTRIES =======//

//== Load environment variables
const dotenv = require('dotenv-safe');
dotenv.config();
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'NODE_ENV'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing environment variable: ${varName}`);
    process.exit(1);  // Exit if essential variables are missing
  }
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const promisePool = require('./db/db');
const fs = require('fs');

//== Check the database connection 
promisePool.query('SELECT 1')
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(1);  // Exit the process if the DB connection fails
  });

//== Controllers
const orderController = require('./controllers/orderController');
const adminController = require('./controllers/adminController');
const productController = require('./controllers/productController');

//== Middleware
const { errorHandler } = require('./middlewares/errorMiddleware');
const upload = require('./middlewares/upload.js');  

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Uploads directory created');
}

const app = express();
app.set('trust proxy', 1); // Trust the first proxy
const port = 3000;

//== Apply rate limit middleware
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour in milliseconds
  max: 100,  // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

//== Middleware
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:53834'], // Allowed frontend origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight
    allowedHeaders: ['Content-Type', 'Authorization'], // Match headers used in your requests
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Handle OPTIONS requests globally
app.options('*', cors());

app.use('/uploads', cors({ origin: 'http://localhost:4200', methods: ['GET'] }, { origin: 'http://localhost:53834', methods: ['GET']})); // For static uploads

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());
app.use(helmet());


//=========== Routes==========//
//=========== Order Routes
app.post('/order', orderController.placeOrder); // Send an order from client-side to server

//=========== Product Routes
app.get('/products', productController.getProducts); // Fetch all products to client-side

//============Admin Routes
// Admin orders routes
app.get('/admin/orders', adminController.getAllOrders); // Fetch all orders submitted to the server to admin
app.put('/admin/order/:id', adminController.updateOrderStatus); // Update order status on server from admin
app.delete('/admin/order/:id', adminController.deleteOrderByID); // Delete an order from admin

// Admin products routes
app.get('/admin/products', adminController.getAllProducts); // Fetch all products to admin from server
app.post('/admin/product', upload.single('product_img'), adminController.addProduct);  // Admin upload a new product to server
app.put('/admin/product/:id', upload.single('product_img'), adminController.updateProductByID);
 // Update product by ID on server from admin
app.delete('/admin/product/:id', adminController.deleteProductByID); // Admin to delete product

//===========Error Middleware
app.use(errorHandler);

//============Start Server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
