require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');
    
    const result = await User.updateMany({ role: 'admin' }, { $set: { role: 'developer' } });
    console.log(`Updated ${result.modifiedCount} admin users to developer`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
