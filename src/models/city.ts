import mongoose from "mongoose";

interface ICity {
  name: string;
  state?: string;
}

type ICityModel = mongoose.Model<ICity> & {};

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "City name is required"],
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
});

// Compound index for unique city+country combinations
schema.index({ name: 1, state: 1 }, { unique: true });

export const City = mongoose.model<ICity, ICityModel>("City", schema);
