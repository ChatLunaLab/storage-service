import imageTiny from '@mxsir/image-tiny'

export async function compressImage(
    buffer: Buffer,
    filename: string,
    quality: number
) {
    const image = bufferToFile(buffer, filename)
    const compressedImage: File = await imageTiny(image, quality)

    return await compressedImage.arrayBuffer()
}

function bufferToFile(buffer: Buffer, filename: string): File {
    const imageType = getImageType(buffer)
    const fileNameWithoutExtension = filename.split('.')[0]
    filename = fileNameWithoutExtension + '.' + imageType
    return new File([buffer as Buffer<ArrayBuffer>], filename, {
        type: imageType
    })
}

export function getImageType(
    buffer: Buffer,
    pure: boolean = false,
    checkIsImage: boolean = false
): string {
    const first10Bytes = new Uint8Array(buffer).slice(0, 10)
    const type = Buffer.from(first10Bytes).toString('base64', 0, 10)
    if (type.startsWith('iVBORw0KGgoAAAANSUhEUg')) {
        return pure ? 'png' : 'image/png'
    } else if (type.startsWith('/9j/4AAQSkZJRg')) {
        return pure ? 'jpg' : 'image/jpeg'
    } else if (type.startsWith('R0lGOD')) {
        return pure ? 'gif' : 'image/gif'
    } else if (type.startsWith('UklGRg')) {
        return pure ? 'webp' : 'image/webp'
    }

    if (checkIsImage) {
        return 'unknown'
    }

    return pure ? 'jpg' : 'image/jpeg'
}

export function randomFileName(fileName: string): string {
    const extension = fileName.includes('.')
        ? '.' + fileName.split('.').pop()
        : ''
    const timestamp = Date.now()
    const randomBytes = Math.random().toString(36).substring(2, 15)
    const additionalRandom = Math.random().toString(36).substring(2, 10)
    return `${timestamp}_${randomBytes}_${additionalRandom}${extension}`
}
