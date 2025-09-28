
const mongoose = require('mongoose');

const url = process.env.DB_CONNECTION_STRING;

const connectDB = async () => {
    await mongoose.connect(url);
}

module.exports = {
    connectDB,
}
