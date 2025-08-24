import mongoose from "mongoose";

interface IUser {
  email: string;
  name: string;
  password: string;
  favoriteCities: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

type IUserModel = mongoose.Model<IUser> & {};

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
  favoriteCities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  }],
}, {
  timestamps: true
});

export const User = mongoose.model<IUser, IUserModel>("User", schema);
