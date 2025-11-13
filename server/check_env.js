require('dotenv').config();
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL loaded');
} else {
  console.log('DATABASE_URL missing');
}
