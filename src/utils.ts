export function getImageType(
    buffer: Buffer,
    pure: boolean = false,
    checkIsImage: boolean = true
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
        return undefined
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
