const { betterAuth } = require('better-auth');
const { mongodbAdapter } = require('@better-auth/mongo-adapter');
const { MongoClient } = require('mongodb');

async function run() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    const db = client.db();
    const auth = betterAuth({
      database: mongodbAdapter(db)
    });
    console.log('Success');
  } catch(e) {
    console.error(e);
  }
}
run();
