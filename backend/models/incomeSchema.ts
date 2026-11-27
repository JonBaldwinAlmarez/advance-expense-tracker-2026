import mongoose, { Schema, Types } from "mongoose";

// Shape of an income document in MongoDB
export type IIncome = {
  description: string;
  amount: number;
  category: string;
  date: Date;
  userId: Types.ObjectId; // the user who owns this income
  type: "income";
};

const incomeSchema = new Schema<IIncome>(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // must match the model name in userModel.ts
      required: true,
    },
    type: { type: String, default: "income" },
  },
  { timestamps: true },
);

const incomeModel = mongoose.model<IIncome>("Income", incomeSchema);

export default incomeModel;
