import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

class CustomGoogleEmbeddings extends Embeddings {
  modelName: string
  apiKey: string
  dimensions: number

  constructor(fields: { model?: string; apiKey: string; dimensions?: number } & EmbeddingsParams) {
    super(fields)
    this.modelName = fields.model || 'gemini-embedding-001'
    this.apiKey = fields.apiKey
    this.dimensions = fields.dimensions || 768
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return []

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:batchEmbedContents?key=${this.apiKey}`
    const requests = texts.map(text => ({
      model: `models/${this.modelName}`,
      content: {
        parts: [{ text }]
      },
      outputDimensionality: this.dimensions
    }))

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Google API Embedding error (status ${res.status}): ${errorText}`)
    }

    const json = await res.json()
    if (!json.embeddings) {
      throw new Error(`Google API did not return embeddings: ${JSON.stringify(json)}`)
    }

    return json.embeddings.map((e: any) => e.values)
  }

  async embedQuery(text: string): Promise<number[]> {
    const results = await this.embedDocuments([text])
    return results[0]
  }
}

const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY.trim() !== ''

export const embeddingModel = hasGeminiKey
  ? new CustomGoogleEmbeddings({
      model: 'gemini-embedding-001',
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      dimensions: 768,
    })
  : ({
      embedDocuments: async (texts: string[]) => {
        // Generate deterministic 768-dimension vectors based on text content
        return texts.map(text => {
          const vec = new Array(768).fill(0)
          for (let i = 0; i < 768; i++) {
            vec[i] = Math.sin(i * 0.1) * 0.05
          }
          for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i)
            const index = (i * 31) % 768
            vec[index] = Math.sin(charCode + i) * 0.8
          }
          let norm = 0
          for (let i = 0; i < 768; i++) {
            norm += vec[i] * vec[i]
          }
          norm = Math.sqrt(norm)
          if (norm > 0) {
            for (let i = 0; i < 768; i++) {
              vec[i] /= norm
            }
          }
          return vec
        })
      }
    } as any)

export const llm = hasGeminiKey
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      temperature: 0.3,
    })
  : ({
      invoke: async (prompt: string) => {
        let contextText = ''
        const contextMatch = prompt.match(/Context:\n([\s\S]+?)\n\nQuestion:/)
        if (contextMatch) {
          contextText = contextMatch[1]
        }
        
        const questionMatch = prompt.match(/Question:\s*([\s\S]+?)\n\nAnswer:/)
        const question = questionMatch ? questionMatch[1] : 'your query'

        let mockAnswer = `[DEVELOPMENT MOCK GENERATION]\n\n`
        mockAnswer += `You asked: "${question}"\n\n`
        if (contextText) {
          mockAnswer += `Based on the provided document contexts, here is a synthesized answer:\n`
          const lines = contextText.split('\n').filter(l => l.trim() && !l.startsWith('[') && !l.startsWith('Answer:'))
          if (lines.length > 0) {
            mockAnswer += `• ${lines[0].slice(0, 150)}...\n`
            if (lines[1]) mockAnswer += `• ${lines[1].slice(0, 150)}...\n`
          } else {
            mockAnswer += `• (Context chunks are available but could not be parsed)\n`
          }
          mockAnswer += `\n(Note: This response is mocked locally because GOOGLE_GENERATIVE_AI_API_KEY is not defined in your environment.)`
        } else {
          mockAnswer += `I could not find any relevant context in the uploaded documents to answer your question.`
        }

        return { content: mockAnswer }
      }
    } as any)
