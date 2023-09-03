// Import the necessary modules
require('module-alias/register');
require('dotenv').config();
const { app, express, path, cors } = require('@config/dependencies');
const sendLoad = require('@routes/api/sendLoad');

app.set('view engine', 'ejs'); // Enable ejs middleware.
app.use(cors()); // Set up CORS middleware

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize the router
const router = express.Router();
app.use(router);

// Attach other routes
app.use('/', sendLoad(), require('@routes/home'));

// Set the port to 3000
const port = process.env.PORT || 3020;

// Start the server
app.listen(port, () => console.log(`App listening on port ${port}!`));
