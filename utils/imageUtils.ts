import fs from 'fs';
import path from 'path';

export function saveUserImage(userId: Number, capturedImage: string) {
    // Create user's directory if it doesn't exist
    const dirPath = path.join('public', 'imagens', `${userId}`)
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }

    // Remove data prefix from the string
    let imageBase64Data = capturedImage.replace(/^data:image\/\w+;base64,/, "")

    // Convert data string into a buffer
    let imageBase64 = Buffer.from(imageBase64Data, 'base64')

    // Save the image
    const date = new Date()
    const nameImage = date.toISOString().replace(/[:.]/g, '.') + '.jpg'
    const filePath = path.join(dirPath, nameImage);
    fs.writeFileSync(filePath, imageBase64);
    return nameImage;
}