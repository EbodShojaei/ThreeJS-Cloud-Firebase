const express = require('express');
const session = require('express-session');
const rateLimit = require("express-rate-limit");
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.set('trust proxy', 1);
let router = express.Router();

module.exports = { router, app, express, session, rateLimit, path, cors, uuidv4 };