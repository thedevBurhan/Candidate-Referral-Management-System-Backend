const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/candidates', require('./routes/candidates'));

const PORT = process.env.PORT || 9099;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

