import NewSearchSystem from '@/components/NewSearchSystem';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true }
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/new-search`
  }
}

export default function NewSearchPage() {
  return <NewSearchSystem />;
}