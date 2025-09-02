/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable max-len */
import { Context, Logger, Schema } from 'koishi'

import { plugins } from './plugins'
import { ChatLunaStorageService } from './service/storage'

export let logger: Logger

export function apply(ctx: Context, config: Config) {
    ctx.on('ready', async () => {
        ctx.plugin(ChatLunaStorageService)
        logger = ctx.logger('chatluna-storage-service')
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
    maxStorageSize: number
    maxStorageCount: number
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
            .description('过期数据的缓存时间（小时）')
            .default(24 * 30),
        maxStorageSize: Schema.number()
            .description('最大存储空间（MB）')
            .default(500)
            .min(1),
        maxStorageCount: Schema.number()
            .description('最大存储文件数')
            .default(300)
            .min(1)
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
