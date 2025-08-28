import { PUBLIC_BASE_URL } from '@/lib/env'

export function buildCategoryItemList(categoryName: string, reps: { slug: string, title: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} AI Tools`,
    itemListElement: reps.slice(0, 3).map((r, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${PUBLIC_BASE_URL}/landing/${r.slug}`,
      name: r.title,
    })),
  }
}


