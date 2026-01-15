import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    meta: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditSchema);
