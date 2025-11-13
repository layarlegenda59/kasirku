require('dotenv').config();
const keys = [
  'DATABASE_URL','DATABASE_URL_UNPOOLED','PGHOST','PGUSER','PGPASSWORD','POSTGRES_URL','NEXT_PUBLIC_STACK_PROJECT_ID','STACK_SECRET_SERVER_KEY'
];
for (const k of keys) {
  console.log(k + ':', process.env[k] ? 'loaded' : 'missing');
}
