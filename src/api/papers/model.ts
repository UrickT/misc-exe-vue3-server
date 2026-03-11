import mongoose, { Schema, Document } from "mongoose";

export interface Paper {
  paperSN: number;
  paperCategory: string;
  paperClass: string;
  paperName: string;
  paperColor: string;
  paperWeight: string;
  shortID: string;
  default: boolean;
  displayOrder: number;
}

export interface IPaper extends Paper, Document {}

const paperSchema = new Schema(
  {
    paperSN: { type: Number, required: true, unique: true },
    paperCategory: String,
    paperClass: String,
    paperName: String,
    paperColor: String,
    paperWeight: String,
    shortID: String,
    default: Boolean,
    displayOrder: Number,
  },
  {
    collection: "papers",
    versionKey: false,
  },
);

export const PaperModel = mongoose.model<IPaper>("Paper", paperSchema);
