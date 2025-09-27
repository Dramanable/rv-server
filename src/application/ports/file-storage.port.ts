import {
  FileUrl,
  CloudProvider,
} from "../../domain/value-objects/file-url.value-object";

export interface UploadFileRequest {
  file: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
  isPublic?: boolean;
}

export interface UploadFileResponse {
  fileUrl: FileUrl;
  uploadedAt: Date;
}

export interface DeleteFileRequest {
  fileUrl: FileUrl;
}

export interface FileStorageConfig {
  provider: CloudProvider;
  bucket: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  accountName?: string;
  containerName?: string;
  projectId?: string;
}

/**
 * Port for file storage operations
 * Supports AWS S3, Azure Blob Storage, and Google Cloud Storage
 */
export interface FileStoragePort {
  /**
   * Upload a file to cloud storage
   */
  uploadFile(request: UploadFileRequest): Promise<UploadFileResponse>;

  /**
   * Delete a file from cloud storage
   */
  deleteFile(request: DeleteFileRequest): Promise<void>;

  /**
   * Generate a presigned URL for direct file upload
   */
  generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn?: number,
    folder?: string,
  ): Promise<string>;

  /**
   * Generate a presigned URL for file download
   */
  generatePresignedDownloadUrl(
    fileUrl: FileUrl,
    expiresIn?: number,
  ): Promise<string>;

  /**
   * Check if a file exists
   */
  fileExists(fileUrl: FileUrl): Promise<boolean>;

  /**
   * Get file metadata
   */
  getFileMetadata(fileUrl: FileUrl): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
  }>;

  /**
   * Copy a file to another location
   */
  copyFile(
    sourceUrl: FileUrl,
    destinationFolder: string,
    newFileName?: string,
  ): Promise<FileUrl>;

  /**
   * List files in a folder
   */
  listFiles(folder: string, limit?: number): Promise<FileUrl[]>;
}
