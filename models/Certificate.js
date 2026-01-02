import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true },
  name: String,
  event: String,
  date: String,
  issuedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Certificate", certificateSchema);
