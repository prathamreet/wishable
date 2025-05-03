import mongoose from 'mongoose';

// Wishlist item schema
const wishlistItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  site: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'purchased', 'unavailable', 'archived'],
    default: 'active'
  },
  clientId: {
    type: String
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  purchasedAt: {
    type: Date
  }
}, { _id: true });

// User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  contactDetails: {
    phone: String,
    alternateEmail: String
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      },
      wishlistVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      priceDrops: {
        type: Boolean,
        default: true
      },
      stockAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  wishlist: [wishlistItemSchema],
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total wishlist count
userSchema.virtual('wishlistCount').get(function() {
  return this.wishlist ? this.wishlist.length : 0;
});

// Virtual for active wishlist count
userSchema.virtual('activeWishlistCount').get(function() {
  return this.wishlist ? this.wishlist.filter(item => item.status === 'active').length : 0;
});

// Index for better query performance
userSchema.index({ createdAt: -1 });
userSchema.index({ 'wishlist.status': 1 });
userSchema.index({ 'wishlist.priority': 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);