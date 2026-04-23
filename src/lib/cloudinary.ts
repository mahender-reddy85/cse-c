export const uploadToCloudinary = async (file: File, folder: string = 'cse-c/others') => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkfy6ofdq';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cse-c';

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url as string;
};
