import { readFileSync } from 'node:fs'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

type Pair = { zh: string; en: string }
type Chapter = { n: number; leggeTitle: string; chinese: string; english: string; pairs: Pair[] }
type Reflection = { id: string; topic: string; chapters: number[]; prompt: string }

const chapters = JSON.parse(readFileSync(new URL('../data/chapters.json', import.meta.url), 'utf8')) as Chapter[]
const reflections = JSON.parse(readFileSync(new URL('../data/reflections.json', import.meta.url), 'utf8')) as Reflection[]

const topicChapters: Record<string, number[]> = {
  letting_go: [9, 16, 24, 29, 30, 48, 64, 77],
  uncertainty: [1, 14, 16, 20, 21, 25, 40, 71],
  leadership: [3, 17, 22, 37, 49, 57, 60, 66],
  relationships: [8, 22, 28, 33, 43, 49, 61, 78],
  simplicity: [12, 19, 20, 32, 46, 48, 52, 80],
  conflict: [31, 36, 58, 63, 68, 69, 78, 79],
}

function chapterSlug(chapter: Chapter): string {
  return `${String(chapter.n).padStart(2, '0')}-${chapter.leggeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
}

function json(value: unknown): { content: [{ type: 'text'; text: string }] } {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] }
}

const server = new McpServer({ name: 'ask-lao-tzu', version: '0.1.0' })

server.registerTool('get_chapter', {
  description: 'Read one Tao Te Ching chapter with Chinese text, James Legge public-domain translation, and line pairs. Use this when a user asks about a chapter or wants a source-aware reading.',
  inputSchema: { chapter: z.number().int().min(1).max(81).describe('Chapter number from 1 to 81') },
}, async ({ chapter }) => {
  const item = chapters.find((entry) => entry.n === chapter)
  if (!item) return json({ error: 'Chapter not found' })
  return json({ ...item, slug: chapterSlug(item), website: `https://asklaotzu.com/tao/${chapterSlug(item)}` })
})

server.registerTool('search_chapters', {
  description: 'Find chapters by a word or phrase in the title, Chinese text, or Legge translation. This is a lightweight local search, not a claim about canonical interpretation.',
  inputSchema: { query: z.string().min(1).max(120).describe('Search phrase') },
}, async ({ query }) => {
  const needle = query.toLowerCase()
  const matches = chapters.filter((entry) => `${entry.leggeTitle} ${entry.chinese} ${entry.english}`.toLowerCase().includes(needle))
  return json({ query, count: matches.length, results: matches.slice(0, 20).map((entry) => ({ chapter: entry.n, title: entry.leggeTitle, excerpt: entry.english.slice(0, 240), website: `https://asklaotzu.com/tao/${chapterSlug(entry)}` })) })
})

server.registerTool('get_reflection', {
  description: 'Return a grounded reflection prompt connected to one or more chapters. The prompt invites agency and does not diagnose or replace professional care.',
  inputSchema: { topic: z.string().optional().describe('Optional topic such as letting-go, leadership, or relationships'), chapter: z.number().int().min(1).max(81).optional() },
}, async ({ topic, chapter }) => {
  const candidates = reflections.filter((item) => (!topic || item.topic === topic || item.topic === topic.replace(/-/g, '_')) && (!chapter || item.chapters.includes(chapter)))
  const pool = candidates.length ? candidates : reflections
  const item = pool[Math.floor(Math.random() * pool.length)]
  return json({ ...item, source_chapters: item.chapters.map((number) => ({ number, title: chapters[number - 1]?.leggeTitle })), website: 'https://asklaotzu.com/tao' })
})

server.registerTool('list_topics', {
  description: 'List practical Tao reading paths and their chapter numbers.',
  inputSchema: {},
}, async () => json(Object.entries(topicChapters).map(([slug, chapterNumbers]) => ({ slug, chapters: chapterNumbers }))))

const transport = new StdioServerTransport()
await server.connect(transport)
