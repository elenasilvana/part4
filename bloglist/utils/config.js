require('dotenv').config({ path: '.env' });

const PORT = process.env.PORT;
const MONGO_URI = process.env.NODE_ENV === 'test'
? process.env.TEST_MONGO_DB_URI
: process.env.MONGO_URI;

module.exports = {
  MONGO_URI,
  PORT,
};
