import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

const { Schema, model } = mongoose;


const userSchema = new Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  roles: { 
    type: [String], 
    default: ['user'],
    enum: ['user', 'admin', 'moderator']
  },
  username: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  avatar: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\//.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  bio: { 
    type: String, 
    maxlength: [300, 'Bio cannot exceed 300 characters'] 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { 
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    }
  }
});

// Index for faster queries
userSchema.index({ email: 1, username: 1 });
userSchema.index({ roles: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware
userSchema.post('save', function(doc) {
  logger.debug(`User saved: ${doc.email}`, { 
    id: doc._id,
    hasUsername: !!doc.username
  });
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ roles: role });
};

// Virtual for user's full name
userSchema.virtual('displayName').get(function() {
  return this.username || this.email.split('@')[0];
});

const User = model('User', userSchema);

export default User; 