import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Upload requests must use multipart/form-data." }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"])
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Upload a PNG, JPG, WebP, GIF, or PDF file." }, { status: 415 })
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Files must be 15 MB or smaller." }, { status: 413 })
    }

    const filename = file.name || "uploaded-file"
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const objectPath = `${user.id}/${crypto.randomUUID()}-${safeFilename}`
    const { error: uploadError } = await supabase.storage.from("marketplace-files").upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("marketplace-files").getPublicUrl(objectPath)
    return NextResponse.json({ url: data.publicUrl, filename: safeFilename })
  } catch (e: unknown) {
    console.error("Upload error:", e)
    const message = e instanceof Error ? e.message : "Failed to upload file"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
