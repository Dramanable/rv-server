import {
  InvalidValueError,
  RequiredValueError,
} from "@domain/exceptions/value-object.exceptions";

export enum CloudProvider {
  AWS_S3 = "AWS_S3",
  AZURE_BLOB = "AZURE_BLOB",
  GCP_STORAGE = "GCP_STORAGE",
}

export class FileUrl {
  constructor(
    private readonly url: string,
    private readonly provider: CloudProvider,
    private readonly bucket: string,
    private readonly key: string,
    private readonly contentType?: string,
    private readonly size?: number,
  ) {
    this.validateUrl(url);
    this.validateKey(key);
  }

  private validateUrl(url: string): void {
    if (!url || url.trim().length === 0) {
      throw new RequiredValueError("fileUrl");
    }

    try {
      const urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        throw new InvalidValueError(
          "protocol",
          urlObj.protocol,
          "File URL must use HTTP or HTTPS protocol",
        );
      }
    } catch {
      throw new InvalidValueError("fileUrl", url, "Invalid file URL format");
    }
  }

  private validateKey(key: string): void {
    if (!key || key.trim().length === 0) {
      throw new RequiredValueError("fileKey");
    }

    // Vérifier les caractères interdits (exemple : caractères de contrôle)
    if (
      key.includes("..") ||
      key.includes("//") ||
      key
        .split("")
        .some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
    ) {
      throw new InvalidValueError(
        "fileKey",
        key,
        "File key contains forbidden characters",
      );
    }
  }

  static create(
    url: string,
    provider: CloudProvider,
    bucket: string,
    key: string,
    contentType?: string,
    size?: number,
  ): FileUrl {
    return new FileUrl(url, provider, bucket, key, contentType, size);
  }

  // Factory methods pour chaque provider
  static createS3Url(
    bucket: string,
    key: string,
    region: string = "eu-west-1",
    contentType?: string,
    size?: number,
  ): FileUrl {
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return new FileUrl(
      url,
      CloudProvider.AWS_S3,
      bucket,
      key,
      contentType,
      size,
    );
  }

  static createAzureUrl(
    storageAccount: string,
    container: string,
    blob: string,
    contentType?: string,
    size?: number,
  ): FileUrl {
    const url = `https://${storageAccount}.blob.core.windows.net/${container}/${blob}`;
    return new FileUrl(
      url,
      CloudProvider.AZURE_BLOB,
      container,
      blob,
      contentType,
      size,
    );
  }

  static createGcpUrl(
    bucket: string,
    object: string,
    contentType?: string,
    size?: number,
  ): FileUrl {
    const url = `https://storage.googleapis.com/${bucket}/${object}`;
    return new FileUrl(
      url,
      CloudProvider.GCP_STORAGE,
      bucket,
      object,
      contentType,
      size,
    );
  }

  // Getters
  getUrl(): string {
    return this.url;
  }

  getProvider(): CloudProvider {
    return this.provider;
  }

  getBucket(): string {
    return this.bucket;
  }

  getKey(): string {
    return this.key;
  }

  getContentType(): string | undefined {
    return this.contentType;
  }

  getSize(): number | undefined {
    return this.size;
  }

  // Utility methods
  getFileName(): string {
    return this.key.split("/").pop() || this.key;
  }

  getFileExtension(): string {
    const fileName = this.getFileName();
    const lastDotIndex = fileName.lastIndexOf(".");
    return lastDotIndex > 0
      ? fileName.substring(lastDotIndex + 1).toLowerCase()
      : "";
  }

  isImage(): boolean {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const extension = this.getFileExtension();
    return (
      imageExtensions.includes(extension) ||
      (this.contentType?.startsWith("image/") ?? false)
    );
  }

  isDocument(): boolean {
    const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf", "odt"];
    const extension = this.getFileExtension();
    return (
      documentExtensions.includes(extension) ||
      (this.contentType?.includes("document") ?? false) ||
      this.contentType === "application/pdf"
    );
  }

  // Validation methods
  validateImageConstraints(
    maxSizeMB: number = 5,
    allowedExtensions: string[] = ["jpg", "jpeg", "png", "webp"],
  ): void {
    if (!this.isImage()) {
      throw new InvalidValueError(
        "fileType",
        this.contentType,
        "File is not a valid image",
      );
    }

    const extension = this.getFileExtension();
    if (!allowedExtensions.includes(extension)) {
      throw new InvalidValueError(
        "imageExtension",
        extension,
        `Image extension ${extension} is not allowed. Allowed: ${allowedExtensions.join(", ")}`,
      );
    }

    if (this.size && this.size > maxSizeMB * 1024 * 1024) {
      throw new InvalidValueError(
        "imageSize",
        this.size,
        `Image size ${this.size} exceeds maximum allowed size of ${maxSizeMB}MB`,
      );
    }
  }

  // Security methods
  isSecure(): boolean {
    return this.url.startsWith("https://");
  }

  isSameProvider(other: FileUrl): boolean {
    return this.provider === other.provider;
  }

  equals(other: FileUrl): boolean {
    return this.url === other.url;
  }

  toString(): string {
    return this.url;
  }

  // Serialization
  toJSON(): {
    url: string;
    provider: CloudProvider;
    bucket: string;
    key: string;
    contentType?: string;
    size?: number;
  } {
    return {
      url: this.url,
      provider: this.provider,
      bucket: this.bucket,
      key: this.key,
      contentType: this.contentType,
      size: this.size,
    };
  }

  static fromJSON(data: {
    url: string;
    provider: CloudProvider;
    bucket: string;
    key: string;
    contentType?: string;
    size?: number;
  }): FileUrl {
    return new FileUrl(
      data.url,
      data.provider,
      data.bucket,
      data.key,
      data.contentType,
      data.size,
    );
  }
}
