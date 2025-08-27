import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BackfillCategoriesPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = Boolean((session as any)?.user?.isAdmin) || (session as any)?.user?.role === 'admin' || (session as any)?.user?.email === 'admin@admin.com'

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Backfill categories</h1>
        <p className="text-red-600">Unauthorized. You must be admin.</p>
        <div className="mt-4">
          <Link href="/admin" className="text-purple-600 underline">Back to Admin</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Backfill categories</h1>
      <p className="text-gray-600">
        This tool sets primary_category_id for each active product based on its current string category. No destructive changes.
      </p>

      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-medium">Step 1: Dry run</h2>
        <p className="text-gray-600">Simulates changes and shows a summary. No writes.</p>
        <form action="/api/admin/backfill/categories?dryRun=1" method="post" target="_blank">
          <button type="submit" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Run dry run</button>
        </form>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-medium">Step 2: Execute</h2>
        <p className="text-gray-600">Writes primary_category_id for products. Safe operation.</p>
        <form action="/api/admin/backfill/categories" method="post" target="_blank">
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Run backfill</button>
        </form>
      </div>

      <div className="mt-6">
        <Link href="/admin" className="text-purple-600 underline">Back to Admin</Link>
      </div>
    </div>
  )
}


