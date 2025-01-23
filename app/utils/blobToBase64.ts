export default function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = () => {
      reject(new Error('Failed to convert blob to base64'));
    };
    reader.readAsDataURL(blob);
  });
}