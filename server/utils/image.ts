import fs from 'fs';
import path from 'path';

const storagePath = process.env.STORAGE_FOLDER ? process.env.STORAGE_FOLDER : 'storage'
const folderImagens = 'imagens'

export const folderpathImagens = path.join(storagePath, 'imagens')
export const folderStorage = path.join(storagePath)
export const folderBackup = path.join(process.env.BACKUP_FOLDER ? process.env.BACKUP_FOLDER : 'backups')

export function saveUserImage(userId: Number, capturedImage: string): string {
    // Create user's directory if it doesn't exist
    if (/^data:image\/[a-zA-Z]*;base64,/.test(capturedImage)) {
        const dirPath = path.join(storagePath, folderImagens, `${userId}`)
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
            fs.chmodSync(dirPath, '664')
        }

        // Remove data prefix from the string
        let imageBase64Data = capturedImage.replace(/^data:image\/\w+;base64,/, "")

        // Convert data string into a buffer
        let imageBase64:any = Buffer.from(imageBase64Data, 'base64')

        // Save the image
        const date = new Date()
        const nameImage = date.toISOString().replace(/[:.]/g, '.') + '.jpg'
        const filePath = path.join(dirPath, nameImage);
        fs.writeFileSync(filePath, imageBase64);
        fs.chmodSync(filePath, '664');
        return nameImage;
    } else {
        return capturedImage;
    }
}