const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ email: 'admin@nasfat.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    await User.create({
      fullName: 'Nasfat Admin',
      email: 'admin@nasfat.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
