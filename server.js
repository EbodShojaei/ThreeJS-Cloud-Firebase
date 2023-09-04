// Import the necessary modules
require('module-alias/register');
require('dotenv').config();
const { app, express, session, path, cors } = require('@config/dependencies');
const sendLoad = require('@routes/api/sendLoad');

const port = process.env.PORT || 3020;
const SESSION_SECRET = process.env.SESSION_SECRET;
const PRODUCTION = process.env.NODE_ENV || false;
const CYCLIC_URL = process.env.CYCLIC_URL || `http://localhost:${port}}`;

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: PRODUCTION },
}));

const corsOptions = {
    origin: CYCLIC_URL,
    credentials: true,
};

app.set('view engine', 'ejs'); // Enable ejs middleware.
app.use(cors(corsOptions)); // Set up CORS middleware

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize the router
const router = express.Router();
app.use(router);

// Attach other routes
app.use('/', sendLoad(), require('@routes/home'));
app.use('*', require('@routes/error404'));

// Start the server
app.listen(port, () => console.log(`App listening on port ${port}!`));
