import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'

type AutolinkRule = {
  id: string
  term: string
  aliases?: string[]
  url: string
  maxPerPage?: number
  priority?: number
  newTab?: boolean
  rel?: string
}

type AutolinkConfig = {
  limits: {
    maxPerPage: number
    minWordsBetweenLinks: number
    maxPerParagraph: number
  }
  rules: AutolinkRule[]
}

const SKIP_TAGS = new Set(['A', 'H1', 'H2', 'H3', 'CODE', 'PRE', 'SCRIPT', 'STYLE'])

function loadConfig(locale: string): AutolinkConfig | null {
  try {
    const file = path.join(process.cwd(), 'data', `autolink.${locale}.json`)
    const raw = fs.readFileSync(file, 'utf8')
    const cfg = JSON.parse(raw) as AutolinkConfig
    // Sort rules by priority desc (default 0)
    cfg.rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    return cfg
  } catch {
    return null
  }
}

function isInsideSkip(node: Element | null): boolean {
  let el: Element | null = node
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true
    el = el.parentElement
  }
  return false
}

function countWords(text: string): number {
  const m = text.trim().match(/[\p{L}\p{N}']+/gu)
  return m ? m.length : 0
}

function buildMatcher(rule: AutolinkRule): RegExp {
  const terms = [rule.term, ...(rule.aliases ?? [])]
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, r => `\\${r}`))
    .filter(Boolean)
  // word boundaries around any term/alias
  return new RegExp(`\\b(${terms.join('|')})\\b`, 'i')
}

export function autoLinkHtml(html: string, locale: string): string {
  if (locale !== 'en') return html

  const cfg = loadConfig('en')
  if (!cfg || !cfg.rules.length) return html

  const dom = new JSDOM(html)
  const document = dom.window.document

  let totalLinks = 0
  let wordsSinceLastLink = Number.MAX_SAFE_INTEGER
  const paragraphLinked = new WeakSet<Element>()
  const usedPerRule = new Map<string, number>()
  const matchedRules: string[] = []

  const walker = document.createTreeWalker(document.body, dom.window.NodeFilter.SHOW_TEXT)

  let node: Node | null = walker.nextNode()
  while (node) {
    const textNode = node as Text
    const parentEl = textNode.parentElement
    if (!parentEl) { node = walker.nextNode(); continue }

    // Skip nodes inside disallowed tags
    if (isInsideSkip(parentEl)) { 
      wordsSinceLastLink += countWords(textNode.textContent || '')
      node = walker.nextNode(); 
      continue 
    }

    const paragraph = parentEl.closest('p') as Element | null
    const paragraphHasLink = paragraph ? paragraphLinked.has(paragraph) : false

    const original = textNode.textContent || ''
    let cursor = 0
    let replaced = ''
    let didReplaceInThisNode = false

    // Try rules in priority order; at most one replacement per text node
    for (const rule of cfg.rules) {
      const used = usedPerRule.get(rule.id) ?? 0
      const maxPerRule = rule.maxPerPage ?? 1
      if (used >= maxPerRule) continue
      if (totalLinks >= cfg.limits.maxPerPage) break
      if (paragraphHasLink) continue
      if (wordsSinceLastLink < cfg.limits.minWordsBetweenLinks) continue

      const matcher = buildMatcher(rule)
      const m = matcher.exec(original)
      if (!m) continue

      // Ensure match isn't already part of an anchor (parent contains <a> children)?
      // We replace within this text node only.
      const matchStart = m.index
      const matchEnd = matchStart + m[0].length
      // Build nodes: before text, anchor, after text (bez wrapperu)
      const beforeText = original.slice(0, matchStart)
      const matchedText = original.slice(matchStart, matchEnd)
      const afterText = original.slice(matchEnd)

      const beforeNode = document.createTextNode(beforeText)
      const anchor = document.createElement('a')
      anchor.setAttribute('href', rule.url)
      anchor.setAttribute('data-autolink', rule.id)
      // target/rel politika: interní odkazy ve stejné záložce, externí default do nové
      const isExternal = /^https?:\/\//i.test(rule.url)
      const openInNewTab = (rule.newTab ?? isExternal) === true
      if (openInNewTab) {
        anchor.setAttribute('target', '_blank')
        const rel = rule.rel ?? (isExternal ? 'nofollow sponsored noopener' : 'noopener')
        anchor.setAttribute('rel', rel)
      }
      anchor.textContent = matchedText
      const afterNode = document.createTextNode(afterText)

      // Replace current text node with the trio
      parentEl.insertBefore(beforeNode, textNode)
      parentEl.insertBefore(anchor, textNode)
      parentEl.insertBefore(afterNode, textNode)
      parentEl.removeChild(textNode)

      didReplaceInThisNode = true
      // Pokračuj walkerem za \"afterNode\" (je to text node)
      walker.currentNode = afterNode

      usedPerRule.set(rule.id, used + 1)
      totalLinks += 1
      wordsSinceLastLink = 0
      if (paragraph) paragraphLinked.add(paragraph)
      if (!matchedRules.includes(rule.id)) matchedRules.push(rule.id)
      break
    }

    if (!didReplaceInThisNode) {
      wordsSinceLastLink += countWords(original)
    }

    node = walker.nextNode()
  }

  // Related links block (only if >=2 distinct rules matched)
  if (matchedRules.length >= 2) {
    const links: { id: string; url: string; label: string; prio: number; newTab: boolean; rel?: string }[] = []
    for (const ruleId of matchedRules) {
      const rule = cfg.rules.find(r => r.id === ruleId)
      if (!rule) continue
      const isExternal = /^https?:\/\//i.test(rule.url)
      const newTab = (rule.newTab ?? isExternal) === true
      const rel = newTab ? (rule.rel ?? (isExternal ? 'nofollow sponsored noopener' : 'noopener')) : undefined
      links.push({ id: rule.id, url: rule.url, label: rule.term, prio: rule.priority ?? 0, newTab, rel })
    }
    links.sort((a, b) => b.prio - a.prio)
    const top = links.slice(0, Math.min(5, links.length))

    const aside = document.createElement('aside')
    aside.setAttribute('aria-label', 'Related links')
    aside.innerHTML = `
      <section class="mt-12 border-t border-gray-200 pt-8">
        <h3 class="text-xl font-semibold text-slate-900 mb-4">Related links</h3>
        <ul class="list-disc list-inside space-y-1">
          ${top.map(l => `<li><a href="${l.url}" ${l.newTab ? `target=\"_blank\" rel=\"${l.rel}\"` : ''} class="text-blue-600 hover:underline">${l.label}</a></li>`).join('')}
        </ul>
      </section>
    `
    document.body.appendChild(aside)
  }

  return document.body.innerHTML
}

export function suggestAutolinkTags(
  html: string,
  locale: string,
  limit: number = 3
): { id: string; label: string; url: string }[] {
  if (locale !== 'en') return []
  const cfg = loadConfig('en')
  if (!cfg || !cfg.rules.length) return []

  const dom = new JSDOM(html)
  const document = dom.window.document
  const text = document.body?.textContent ?? ''

  const found: { id: string; label: string; url: string; prio: number }[] = []
  for (const rule of cfg.rules) {
    const matcher = buildMatcher(rule)
    if (matcher.test(text)) {
      found.push({ id: rule.id, label: rule.term, url: rule.url, prio: rule.priority ?? 0 })
    }
    if (found.length >= limit) break
  }
  found.sort((a, b) => b.prio - a.prio)
  return found.slice(0, limit).map(({ id, label, url }) => ({ id, label, url }))
}


