import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  wishlist: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    url: String,
    name: String,
    price: Number,
    thumbnail: String,
    site: String,
  }],
});

export default mongoose.models.User || mongoose.model('User', userSchema);