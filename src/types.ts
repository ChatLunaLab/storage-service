export interface TempFileInfo {
    path: string
    name: string
    type?: string
    expireTime: number
    id: string
    size: number
    accessTime: number
    accessCount: number
}

export interface TempFileInfoWithData<T> extends TempFileInfo {
    data: T
    url: string
}
