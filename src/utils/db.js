const mongoose = require('mongoose');
const dbUrl = process.env.DB_URL;
const poolSize = process.env.DB_POOL_SIZE;

module.exports = {
    conn: () => {
        const db = mongoose.createConnection(dbUrl, { poolSize: poolSize, useNewUrlParser: true, useUnifiedTopology: true })
        return db;
    }
}