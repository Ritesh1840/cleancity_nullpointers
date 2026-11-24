/*// Only the cloud name and an UNSIGNED upload preset belong here. Never add the API secret.
export const CLOUDINARY = {
  cloudName: "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UNSIGNED_PRESET"
};
export const cloudinaryReady = !CLOUDINARY.cloudName.startsWith("YOUR_");
export const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`;
*/

// Only the cloud name and an UNSIGNED upload preset belong here. Never add the API secret.
export const CLOUDINARY = {
  cloudName: "kubswp1c",
  uploadPreset: "cleancity_unsigned"
};
export const cloudinaryReady = !CLOUDINARY.cloudName.startsWith("YOUR_");
export const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`;