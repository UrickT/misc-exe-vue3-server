import mongoose, { Schema, Document } from "mongoose";

export interface UploadedFile {
  fileSN: number;
  originalName: string;
  fileName: string;
  path: string;
  size: number;
  mimetype: string;
  uploadDate: Date;
}

export interface IUploadedFile extends UploadedFile, Document {}

const uploadedFileSchema = new Schema(
  {
    fileSN: { type: Number, required: true, unique: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
  },
  {
    collection: "uploadedFiles",
    versionKey: false,
  },
);

export const UploadedFileModel = mongoose.model<IUploadedFile>("UploadedFile", uploadedFileSchema);
