import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as Blob | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = (file as any).name || "uploaded_file_" + Date.now()
    // Sanitize filename
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, safeFilename)
    await fs.promises.writeFile(filePath, buffer)

    const fileUrl = `/uploads/${safeFilename}`
    return NextResponse.json({ url: fileUrl, filename: safeFilename })
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e.message || "Failed to upload file" }, { status: 500 })
  }
}
