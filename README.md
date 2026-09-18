# Ask Lao Tzu MCP

Ask Lao Tzu MCP is a small, source-aware Model Context Protocol server for the 81 chapters of the *Tao Te Ching*. It gives an AI client structured access to the classical Chinese text, James Legge's 1891 public-domain translation, chapter search, practical reading paths, and gentle reflection prompts.

The project is deliberately modest: it is a reading companion, not an oracle. Tools return source material and invitations to think; they do not claim to settle translation disputes, diagnose a person, or make high-stakes decisions on a user's behalf.

## What it provides

- `get_chapter`: Chinese text, Legge translation, line pairs, a stable chapter URL, and the original chapter title.
- `search_chapters`: local full-text search across the title and both source languages.
- `get_reflection`: a topic- or chapter-aware prompt with source chapter references.
- `list_topics`: useful reading paths such as leadership, uncertainty, simplicity, and relationships.

## Run locally

```bash
npm install
npm run build
node dist/index.js
```

For development, use `npm run dev`. The server speaks MCP over stdio, so it can be added to any compatible desktop client. An example client configuration is in [`docs/CLIENT_CONFIG.md`](docs/CLIENT_CONFIG.md).

## Add to an MCP client

Point the client at the absolute path to `dist/index.js` and use `node` as the command. Keep the server local unless you have deliberately added authentication and transport controls.

## Source and attribution

The Chinese received text and James Legge translation are included for reading and research. James Legge's 1891 translation is public domain. See [`docs/SOURCES.md`](docs/SOURCES.md) for provenance and the limits of the dataset. The software is MIT licensed; the text dataset carries its own public-domain attribution.

The companion website is [asklaotzu.com/tao](https://asklaotzu.com/tao). It offers a browsable bilingual reading experience, but the MCP server remains useful offline.

For reproducible data work, pair this server with the companion [Tao Te Ching Open Data](https://github.com/luolin094/tao-te-ching-open-data) repository.
