// Get the base URL for data fetching
// Use environment variable for production, default to local for development
const getDataBaseUrl = () => {
  // In production on Cloudflare Pages, you should set NEXT_PUBLIC_DATA_URL
  // Example: NEXT_PUBLIC_DATA_URL=https://your-cdn.com/data
  // Or upload data to Cloudflare R2 and set: NEXT_PUBLIC_DATA_URL=https://your-bucket.r2.cloudflare.com/data
  const envUrl = process.env.NEXT_PUBLIC_DATA_URL
  if (envUrl) return envUrl
  
  // Default to local /data path for development
  return '/data'
}

const DATA_BASE_URL = getDataBaseUrl()

// In-memory cache untuk meta dan halaman list
let metaCache: any = null
let listPageCache: Map<number, any> = new Map()

/**
 * Mengambil detail file berdasarkan file_code
 * Load per-request, bukan preload semua
 * Compatible with Edge Runtime (uses HTTP instead of fs)
 */
export async function getFileDetail(fileCode: string) {
  try {
    const prefix = fileCode.substring(0, 2)
    const url = `${DATA_BASE_URL}/detail/${prefix}/${fileCode}.json`
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch detail for ${fileCode}: ${response.status}`)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch detail for ${fileCode}:`, error)
    return null
  }
}

/**
 * Mengambil list data dengan pagination
 * Menggunakan data_page_X.json yang sudah ter-paginate
 * Compatible with Edge Runtime (uses HTTP instead of fs)
 */
export async function getListData(page: number) {
  try {
    if (listPageCache.has(page)) {
      return listPageCache.get(page)
    }

    const url = `${DATA_BASE_URL}/list/${page}.json`
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch list page ${page}: ${response.status}`)
      return { data: [], page, per_page: 200, total: 0, total_pages: 0 }
    }
    
    const data = await response.json()
    
    // Cache hasil
    listPageCache.set(page, data)
    return data
  } catch (error) {
    console.error(`Failed to fetch list page ${page}:`, error)
    return { data: [], page, per_page: 200, total: 0, total_pages: 0 }
  }
}

/**
 * Mengambil search index untuk prefix tertentu
 * Gunakan untuk search functionality
 * Compatible with Edge Runtime (uses HTTP instead of fs)
 */
export async function getSearchIndex(prefix: string) {
  try {
    const url = `${DATA_BASE_URL}/index/${prefix}.json`
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    })
    
    if (!response.ok) {
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch search index for ${prefix}:`, error)
    return []
  }
}

/**
 * Mengambil metadata (total files, per_page, dll)
 * Compatible with Edge Runtime (uses HTTP instead of fs)
 */
export async function getMeta() {
  try {
    if (metaCache) {
      return metaCache
    }

    const url = `${DATA_BASE_URL}/meta.json`
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch meta: ${response.status}`)
      return { total: 0, per_page: 200 }
    }
    
    metaCache = await response.json()
    return metaCache
  } catch (error) {
    console.error('Failed to fetch meta:', error)
    return { total: 0, per_page: 200 }
  }
}

/**
 * Helper untuk search di file-file index
 * Ini adalah alternatif jika tidak pakai file index
 * tapi tetap lebih optimal daripada load semua detail
 */
export async function searchInAllPages(query: string, maxResults = 100) {
  try {
    const meta = await getMeta()
    const totalPages = meta.total_pages || 137
    
    const keywords = query.toLowerCase().split(/\s+/).filter(Boolean)
    const results: any[] = []
    const seenFileCodes = new Set<string>()

    // Limit pencarian ke beberapa halaman pertama untuk performa
    const pagesToSearch = Math.min(totalPages, 10)

    for (let page = 1; page <= pagesToSearch && results.length < maxResults; page++) {
      const pageData = await getListData(page)
      const items = pageData.data || []

      for (const item of items) {
        if (seenFileCodes.has(item.file_code)) continue

        const titleLower = item.title.toLowerCase()
        const isMatch = keywords.some(keyword => titleLower.includes(keyword))

        if (isMatch) {
          seenFileCodes.add(item.file_code)
          results.push(item)
          if (results.length >= maxResults) break
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const fullQuery = query.toLowerCase()

      const aFullMatch = aTitle.includes(fullQuery)
      const bFullMatch = bTitle.includes(fullQuery)

      if (aFullMatch && !bFullMatch) return -1
      if (!aFullMatch && bFullMatch) return 1

      const aMatches = keywords.filter(k => aTitle.includes(k)).length
      const bMatches = keywords.filter(k => bTitle.includes(k)).length
      return bMatches - aMatches
    })

    return results
  } catch (error) {
    console.error('Failed to search:', error)
    return []
  }
}
