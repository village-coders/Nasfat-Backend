const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../src/models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await Admin.findOne({ email: 'admin@nasfat.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    await Admin.create({
      fullName: 'Nasfat Admin',
      email: 'admin@nasfat.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
