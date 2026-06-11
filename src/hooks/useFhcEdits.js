import { useState } from 'react'

const STORAGE_KEY = 'fhc-product-edits'

function loadEdits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useFhcEdits() {
  const [editsMap, setEditsMap] = useState(() => loadEdits())

  function saveEdits(id, fields) {
    setEditsMap((prev) => {
      const next = { ...prev, [id]: fields }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function exportEdits(allFhcParts) {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`

    const edited = allFhcParts
      .filter((p) => editsMap[p.id])
      .map((p) => ({
        id: p.id,
        title: p.title,
        original: {
          description: p.attributes?.Description ?? null,
          category: p.category ?? null,
          subcategory: p.subcategory ?? null,
        },
        edited: editsMap[p.id],
      }))

    const blob = new Blob([JSON.stringify(edited, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fhc-edits-${timestamp}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    editsMap,
    saveEdits,
    editedCount: Object.keys(editsMap).length,
    exportEdits,
  }
}
