const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { logger } = require("../src/utils/logger.utils");

let mongoServer;

// Connect to the in-memory database
module.exports.connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  logger.info("Connected to in-memory test database");
};

// Drop database, close the connection and stop mongod
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  logger.info("Closed test database connection");
};

// Clear all data in the database
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
  logger.info("Cleared test database");
};

// Setup before all tests
beforeAll(async () => {
  await module.exports.connect();
});

// Cleanup after each test
afterEach(async () => {
  await module.exports.clearDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await module.exports.closeDatabase();
});
