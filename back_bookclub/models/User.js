import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    address:   { type: String },
    city:      { type: String },
    state:     { type: String },

    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    avatar: { type: String },

  },
  
);

export default mongoose.model("User", userSchema);










