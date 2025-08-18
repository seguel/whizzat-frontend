// utils/getFileUrl.ts
export const getFileUrl = (fileName?: string) => {
  if (!fileName) return ""; // caso não tenha arquivo
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
  return `${BASE_URL}/uploads/${fileName}`;
};
