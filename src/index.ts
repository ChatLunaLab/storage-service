/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable max-len */
import { Context, Logger, Schema } from 'koishi'

import { createLogger } from 'koishi-plugin-chatluna/utils/logger'
import { plugins } from './plugins'
import { ChatLunaStorageService } from './service/storage'

export let logger: Logger

export function apply(ctx: Context, config: Config) {
    ctx.on('ready', async () => {
        ctx.plugin(ChatLunaStorageService)
        logger = createLogger(ctx, 'chatluna-storage-service')
        await plugins(ctx, config)
    })
}

export const inject = {
    required: ['chatluna', 'database']
}

export interface Config {
    backendPath: string
    storagePath: string
    tempCacheTime: number
    imageCompression: number
}

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        storagePath: Schema.path({
            filters: ['directory']
        })
            .description('缓存存储路径')
            .default('./data/chatluna-storage'),
        backendPath: Schema.string()
            .description('后端服务器路径')
            .default('/chatluna-storage'),
        tempCacheTime: Schema.number()
            .description('临时数据的缓存时间（小时）')
            .default(24 * 7)
    }).description('基础配置'),
    Schema.object({
        imageCompression: Schema.number()
            .description('图片压缩的百分比，超过 80 以后将不会压缩图片')
            .default(80)
            .min(10)
            .max(100)
    }).description('附加配置')
])

export const name = 'chatluna-storage-service'
