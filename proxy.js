const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Serve static files from the build directory of the client
app.use(express.static('client/build'));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const apiRoutes = require('./api/index');
app.use('/api', apiRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
