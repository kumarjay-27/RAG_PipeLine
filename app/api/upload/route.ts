import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded.' },
        { status: 400 }
      )
    }

    const fileName = file.name
    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let documentText = ''

    if (fileExtension === 'pdf') {
      const pdfData = await pdf(buffer)
      documentText = pdfData.text
    } else if (fileExtension === 'txt') {
      documentText = buffer.toString('utf-8')
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format. Only .pdf and .txt files are supported.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      documentText,
      fileName,
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse uploaded document.' },
      { status: 500 }
    )
  }
}
