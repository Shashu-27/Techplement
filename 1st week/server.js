const dotenv=require('dotenv').config();
console.log(process.env);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const quotesRoute = require(`./routes/quotes`);


const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using the quoteApp database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use(`/api/quotes`, quotesRoute);

console.log("MongoDB URI:", process.env.MONGODB_URI);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});