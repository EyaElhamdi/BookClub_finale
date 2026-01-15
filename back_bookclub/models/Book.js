import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String },
    teaser: { type: String },
    buyLink: { type: String },
    excerpt: { type: String },
    year: { type: Number },
    pages: { type: Number },
    publisher: { type: String },
    isbn: { type: String },
    genres: [{ type: String }],
    longDescription: { type: String },
    reviews: [{ user: String, rating: Number, text: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
