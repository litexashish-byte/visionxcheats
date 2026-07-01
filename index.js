const express = require('express');
const path = require('path');
const app = express();

// Serve backend
process.chdir(path.join(__dirname, 'backend'));
require('./server');
