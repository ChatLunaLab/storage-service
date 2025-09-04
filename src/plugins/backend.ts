import { Context } from 'koishi'
import { Config, logger } from '../index.js'
import type {} from '../service/storage.js'
import type {} from '@koishijs/plugin-server'

export function apply(ctx: Context, config: Config) {
    if (!config.backendPath) {
        return
    }

    ctx.inject(['server', 'chatluna_storage'], (ctx) => {
        ctx.server.get(`${config.backendPath}/temp/:id`, async (koa) => {
            const { id } = koa.params

            try {
                const fileInfo = await ctx.chatluna_storage.getTempFile(id)

                if (!fileInfo) {
                    koa.status = 404
                    return (koa.body = 'File not found')
                }

                koa.set(
                    'Content-Type',
                    fileInfo.type || 'application/octet-stream'
                )
                koa.set('Content-Length', fileInfo.size.toString())
                koa.set(
                    'Content-Disposition',
                    `inline; filename="${fileInfo.name}"`
                )
                koa.body = await fileInfo.data
            } catch (error) {
                logger.error('Error serving temp file:', error)
                koa.status = 500
                koa.body = 'Internal server error'
            }
        })
    })
}
