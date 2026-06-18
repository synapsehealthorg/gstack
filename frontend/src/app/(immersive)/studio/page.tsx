// Redirect /studio → /studio/default so that links using router.push('/studio') work
import { redirect } from 'next/navigation'

export default function StudioIndexPage() {
  redirect('/studio/default')
}
