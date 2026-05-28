import { useState, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'parts-review-marked'

function loadMarkedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMarkedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useParts({ search, selectedManufacturers, showMarkedOnly }) {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [markedIds, setMarkedIds] = useState(() => loadMarkedIds())

  useEffect(() => {
    fetch('public/parts.json')
      .then((res) => res.json())
      .then((data) => {
        setParts(data.parts)
        setLoading(false)
      })
  }, [])

  const manufacturers = useMemo(() => {
    const names = new Set(parts.map((p) => p.manufacturer?.name).filter(Boolean))
    return Array.from(names).sort()
  }, [parts])

  const markedSet = useMemo(() => new Set(markedIds), [markedIds])

  const filteredParts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return parts.filter((p) => {
      if (showMarkedOnly && !markedSet.has(p.id)) return false
      if (selectedManufacturers.length > 0 && !selectedManufacturers.includes(p.manufacturer?.name)) return false
      if (term) {
        const inTitle = p.title?.toLowerCase().includes(term)
        const inNumber = p.part_number?.toLowerCase().includes(term)
        if (!inTitle && !inNumber) return false
      }
      return true
    })
  }, [parts, search, selectedManufacturers, showMarkedOnly, markedSet])

  function markPart(id) {
    setMarkedIds((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      saveMarkedIds(next)
      return next
    })
  }

  function unmarkPart(id) {
    setMarkedIds((prev) => {
      const next = prev.filter((x) => x !== id)
      saveMarkedIds(next)
      return next
    })
  }

  function exportMarked() {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`
    const filename = `marked-items-${timestamp}.json`

    const markedParts = parts
      .filter((p) => markedSet.has(p.id))
      .map((p) => ({
        id: p.id,
        part_number: p.part_number,
        title: p.title,
        manufacturer: p.manufacturer?.name,
        url: p.url,
      }))

    const payload = {
      exported_at: now.toISOString(),
      marked_count: markedParts.length,
      marked: markedParts,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function importMarked(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        let parsed
        try {
          parsed = JSON.parse(e.target.result)
        } catch {
          reject(new Error('Invalid file — could not parse JSON.'))
          return
        }

        if (!Array.isArray(parsed.marked)) {
          reject(new Error('Invalid file — missing marked list.'))
          return
        }

        const partIds = new Set(parts.map((p) => p.id))
        const validIds = parsed.marked
          .filter((entry) => entry?.id && partIds.has(entry.id))
          .map((entry) => entry.id)

        if (validIds.length === 0) {
          reject(new Error('No matching parts found in the current dataset.'))
          return
        }

        setMarkedIds(validIds)
        saveMarkedIds(validIds)
        resolve(validIds.length)
      }
      reader.readAsText(file)
    })
  }

  return {
    parts,
    loading,
    filteredParts,
    manufacturers,
    markedIds,
    markedSet,
    markedCount: markedIds.length,
    markPart,
    unmarkPart,
    exportMarked,
    importMarked,
  }
}
