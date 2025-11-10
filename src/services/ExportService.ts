import { TabItem } from '../types/Tab'

/**
 * Parse a URL to extract domain
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'Unknown'
  }
}

export const ExportService = {
  /**
   * Export tabs to bookmarks HTML format
   * @param tabs Array of TabItem objects to export
   * @returns Promise that resolves to the HTML string
   */
  async exportToBookmarksHTML(tabs: TabItem[]): Promise<string> {
    const now = new Date()

    // Group tabs by domain for better organization
    const domainGroups = new Map<string, TabItem[]>()
    tabs.forEach(tab => {
      const domain = tab.domain || 'Other'
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, [])
      }
      domainGroups.get(domain)!.push(tab)
    })

    // Generate HTML
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${now.getTime()}" LAST_MODIFIED="${now.getTime()}" PERSONAL_TOOLBAR_FOLDER="true">TabsAGO Export - ${now.toLocaleDateString()}</H3>
    <DL><p>
        <DT><H3 ADD_DATE="${now.getTime()}" LAST_MODIFIED="${now.getTime()}">Tabs (${tabs.length})</H3>
        <DL><p>
${Array.from(domainGroups.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([domain, domainTabs]) => {
    const domainHTML = domainTabs
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(tab => {
        const addDate = new Date(tab.capturedAt).getTime()
        return `            <DT><A HREF="${tab.url}" ADD_DATE="${addDate}" ICON="${tab.favicon || ''}">${tab.title}</A>`
      })
      .join('\n')
    return `            <DT><H3 ADD_DATE="${now.getTime()}" LAST_MODIFIED="${now.getTime()}">${domain}</H3>
            <DL><p>
${domainHTML}
            </DL><p>`
  })
  .join('\n')}
        </DL><p>
    </DL><p>
</DL><p>`

    return html
  },

  /**
   * Download the exported HTML as a file
   * @param tabs Array of TabItem objects to export
   */
  async downloadBookmarksHTML(tabs: TabItem[]): Promise<void> {
    try {
      const html = await this.exportToBookmarksHTML(tabs)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      // Create and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `tabsago-export-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Clean up the object URL
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      throw new Error('Failed to export tabs. Please try again.')
    }
  },

  /**
   * Parse HTML bookmarks file and extract tabs
   * @param htmlContent The HTML content string to parse
   * @returns Array of TabItem objects
   */
  async parseBookmarksHTML(htmlContent: string): Promise<TabItem[]> {
    try {
      // Create a DOM parser
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // Find all <A> tags (bookmarks)
      const anchorTags = doc.querySelectorAll('a[href]')
      const tabs: TabItem[] = []

      anchorTags.forEach((anchor) => {
        const url = anchor.getAttribute('href')
        if (!url || url.startsWith('javascript:')) return

        const title = anchor.textContent?.trim() || 'Untitled'
        const favicon = anchor.getAttribute('icon') || ''
        const addDateStr = anchor.getAttribute('add_date')
        
        // Parse the ADD_DATE timestamp if available
        let capturedAt = new Date().toISOString()
        if (addDateStr) {
          const timestamp = parseInt(addDateStr, 10)
          if (!isNaN(timestamp)) {
            // Convert Unix timestamp (seconds) to ISO string
            capturedAt = new Date(timestamp * 1000).toISOString()
          }
        }

        const domain = extractDomain(url)

        tabs.push({
          id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          url,
          favicon,
          capturedAt,
          domain,
          lastAccessed: undefined
        })
      })

      return tabs
    } catch (error) {
      console.error('Failed to parse bookmarks HTML:', error)
      throw new Error('Failed to parse bookmarks file. Please check the file format.')
    }
  },

  /**
   * Prompt user to select HTML file and import tabs
   * @returns Promise that resolves to array of imported TabItem objects
   */
  async importFromBookmarksHTML(): Promise<TabItem[]> {
    return new Promise((resolve, reject) => {
      // Create file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.html,.htm'
      
      input.onchange = async (e) => {
        try {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (!file) {
            reject(new Error('No file selected'))
            return
          }

          // Read file content
          const reader = new FileReader()
          reader.onload = async (event) => {
            try {
              const htmlContent = event.target?.result as string
              const tabs = await this.parseBookmarksHTML(htmlContent)
              resolve(tabs)
            } catch (error) {
              reject(error)
            }
          }
          reader.onerror = () => {
            reject(new Error('Failed to read file'))
          }
          reader.readAsText(file)
        } catch (error) {
          reject(error)
        }
      }

      input.oncancel = () => {
        reject(new Error('File selection cancelled'))
      }

      // Trigger file selection
      input.click()
    })
  }
}
