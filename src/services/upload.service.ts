import cloudinary from '../config/cloudinary';
import { ApiError } from '../utils/apiResponse';

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = 'bodhai/avatars'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(500, 'Failed to upload image'));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-critical, log and continue
  }
};
