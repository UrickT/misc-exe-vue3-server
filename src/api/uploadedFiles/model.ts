import mongoose, { Schema, Document } from "mongoose";

export interface UploadedFile {
  fileSN: number;
  originalName: string;
  path: string; // Cloudinary 的完整 HTTPS 網址 (result.secure_url)
  publicID: string; // 用於管理與刪除的 ID (result.public_id)
  size: number;
  mimetype: string;
  uploadDate: Date;
}

export interface IUploadedFile extends UploadedFile, Document {}

const uploadedFileSchema = new Schema(
  {
    fileSN: { type: Number, required: true, unique: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    publicID: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
  },
  {
    collection: "uploadedFiles",
    versionKey: false,
  },
);

export const UploadedFileModel = mongoose.model<IUploadedFile>(
  "UploadedFile",
  uploadedFileSchema,
);
