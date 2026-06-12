import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import chatHandler from './api/chat'
import timelineHandler from './api/timeline'

type ApiResponse = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => ApiResponse
  json: (payload: unknown) => unknown
}

type ApiHandler = (
  request: { method?: string; body?: unknown },
  response: ApiResponse,
) => unknown

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  if (!chunks.length) return undefined
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function createApiResponse(response: ServerResponse): ApiResponse {
  const apiResponse: ApiResponse = {
    setHeader(name, value) {
      response.setHeader(name, value)
    },
    status(code) {
      response.statusCode = code
      return apiResponse
    },
    json(payload) {
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(payload))
      return payload
    },
  }
  return apiResponse
}

function localApiPlugin(): Plugin {
  const routes: Record<string, ApiHandler> = {
    '/api/chat': chatHandler,
    '/api/timeline': timelineHandler,
  }

  return {
    name: 'amanaakses-local-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split('?')[0] ?? ''
        const handler = routes[path]
        if (!handler) return next()

        try {
          const body = request.method === 'POST' ? await readJsonBody(request) : undefined
          await handler(
            { method: request.method, body },
            createApiResponse(response),
          )
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({
            error: error instanceof Error ? error.message : 'Local API error.',
          }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  process.env.GEMINI_MODEL = env.GEMINI_MODEL

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  }
})
