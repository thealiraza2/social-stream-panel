// ImgBB API key (publishable - used client-side for image uploads)
export const IMGBB_API_KEY = "93654e3277d0bf5e9c608261b842e036";

export async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", IMGBB_API_KEY);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.data.url;
}
