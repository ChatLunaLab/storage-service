import { Context, Service, Time } from 'koishi'
import { Config } from '..'
import { TempFileInfo, TempFileInfoWithData } from '../types'
import { compressImage, getImageType, randomFileName } from '../utils'
import { join } from 'path'
import fs from 'fs/promises'

export class ChatLunaStorageService extends Service {
    constructor(
        ctx: Context,
        public config: Config
    ) {
        super(ctx, 'chatluna_storage', true)

        ctx.database.extend(
            'chatluna_storage_temp',
            {
                id: { type: 'string', length: 254 },
                path: 'string',
                name: 'string',
                type: {
                    type: 'string',
                    nullable: true
                },
                expireTime: 'integer',
                size: 'integer'
            },
            {
                autoInc: false,
                primary: 'id'
            }
        )

        this.setupAutoDelete()
    }

    private setupAutoDelete() {
        const ctx = this.ctx

        async function execute() {
            if (!ctx.scope.isActive) {
                return
            }

            const expiredFiles = await ctx.database.get(
                'chatluna_storage_temp',
                {
                    expireTime: {
                        $lt: Date.now()
                    }
                }
            )

            if (expiredFiles.length === 0) {
                return
            }

            const success: TempFileInfo[] = []

            for (const file of expiredFiles) {
                try {
                    await fs.unlink(file.path)
                    await ctx.database.remove('chatluna_storage_temp', {
                        id: file.id
                    })
                    success.push(file)
                } catch (error) {
                    // File might not exist or other error, remove from database anyway
                    await ctx.database.remove('chatluna_storage_temp', {
                        id: file.id
                    })
                    success.push(file)
                }
            }

            if (success.length > 0) {
                console.log(`Auto deleted ${success.length} expired temp files`)
            }
        }

        // Run immediately
        execute()

        // Run every 5 minutes
        ctx.setInterval(async () => {
            await execute()
        }, Time.minute * 5)
    }

    async createTempFile(
        buffer: Buffer,
        filename: string
    ): Promise<TempFileInfoWithData<Buffer>> {
        const isImage = getImageType(buffer, false, true) !== 'unknown'
        let processedBuffer = buffer

        if (isImage && this.config.imageCompression < 80) {
            const compressedImageBuffer = await compressImage(
                buffer,
                filename,
                this.config.imageCompression
            )
            processedBuffer = Buffer.from(compressedImageBuffer)
        }

        const randomName = randomFileName(filename)
        const filePath = join(this.config.storagePath, 'temp', randomName)
        const fileType = isImage
            ? getImageType(buffer, false, false)
            : undefined

        await fs.mkdir(join(this.config.storagePath, 'temp'), {
            recursive: true
        })
        await fs.writeFile(filePath, processedBuffer)

        const expireTime =
            Date.now() + this.config.tempCacheTime * 60 * 60 * 1000
        const fileInfo: TempFileInfo = {
            id: randomName.split('.')[0],
            path: filePath,
            name: filename,
            type: fileType,
            expireTime,
            size: processedBuffer.length
        }

        await this.ctx.database.create('chatluna_storage_temp', fileInfo)

        return {
            ...fileInfo,
            data: processedBuffer,
            url: `${this.config.backendPath}/temp/${randomName}`
        }
    }

    async getTempFile(
        id: string
    ): Promise<TempFileInfoWithData<Buffer> | null> {
        const fileInfo = await this.ctx.database.get('chatluna_storage_temp', {
            id
        })

        if (fileInfo.length === 0) {
            return null
        }

        const file = fileInfo[0]

        try {
            const data = await fs.readFile(file.path)
            return {
                ...file,
                data,
                url: `${this.config.backendPath}/temp/${file.name}`
            }
        } catch (error) {
            await this.ctx.database.remove('chatluna_storage_temp', { id })
            return null
        }
    }
}

declare module 'koishi' {
    interface Context {
        chatluna_storage: ChatLunaStorageService
    }

    interface Tables {
        chatluna_storage_temp: TempFileInfo
    }
}
