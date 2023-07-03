// Import the necessary modules
require('module-alias/register');
require('dotenv').config();
const { app, express, path, cors } = require('@config/dependencies');
const sendLoad = require('@routes/api/sendLoad');

app.set('view engine', 'ejs'); // Enable ejs middleware.
app.use(cors()); // Set up CORS middleware

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/public/', express.static(path.join(__dirname, 'public')));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/firebase/', express.static(path.join(__dirname, 'node_modules/firebase')));
app.use('/src/', express.static(path.join(__dirname, '/src')));

// Initialize the router
const router = express.Router();
app.use(router);

// Attach other routes
app.use('/', sendLoad(), require('@routes/home'));

// Set the port to 3000
const port = 3020;

// Start the server
app.listen(port, () => console.log(`App listening on port ${port}!`));
