/**
 * Opens URL in new tab without triggering popup blockers
 * This uses a temporary anchor element instead of window.open()
 */
export function openInNewTab(url: string): void {
  const tempLink = document.createElement('a')
  tempLink.href = url
  tempLink.target = '_blank'
  tempLink.rel = 'noopener,noreferrer'
  document.body.appendChild(tempLink)
  tempLink.click()
  document.body.removeChild(tempLink)
}

/**
 * Safely opens URL with error handling
 */
export function safeOpenInNewTab(url: string | null | undefined): void {
  if (!url) {
    console.log('❌ Missing URL!')
    return
  }

  try {
    openInNewTab(url)
  } catch (error) {
    console.error('❌ Error opening URL:', error)
  }
} 