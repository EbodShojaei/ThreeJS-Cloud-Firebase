const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
let router = express.Router();

module.exports = { router, app, express, path, cors, uuidv4 };