export interface TempFileInfo {
    path: string
    name: string
    type?: string
    expireTime: number
    id: string
    size: number
}

export interface TempFileInfoWithData<T> extends TempFileInfo {
    data: T
    url: string
}
