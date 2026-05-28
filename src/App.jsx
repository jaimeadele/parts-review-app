import { useState, useEffect, useCallback } from 'react'
import { useParts } from './hooks/useParts'
import { useDebounce } from './hooks/useDebounce'
import { FilterBar } from './components/FilterBar'
import { PartGrid } from './components/PartGrid'
import { PartDetail } from './components/PartDetail'

export default function App() {
  const [searchInput, setSearchInput] = useState('')
  const [selectedManufacturers, setSelectedManufacturers] = useState([])
  const [showMarkedOnly, setShowMarkedOnly] = useState(false)
  const [selectedPartIndex, setSelectedPartIndex] = useState(null)
  const [importError, setImportError] = useState(null)
  const [itemsPerPage, setItemsPerPage] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)

  const debouncedSearch = useDebounce(searchInput, 300)

  const {
    parts,
    loading,
    filteredParts,
    manufacturers,
    markedSet,
    markedCount,
    markPart,
    unmarkPart,
    exportMarked,
    importMarked,
  } = useParts({
    search: debouncedSearch,
    selectedManufacturers,
    showMarkedOnly,
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, selectedManufacturers, showMarkedOnly, itemsPerPage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const totalPages = itemsPerPage === null ? 1 : Math.max(1, Math.ceil(filteredParts.length / itemsPerPage))

  const pagedParts = itemsPerPage === null
    ? filteredParts
    : filteredParts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCardClick = useCallback(
    (part) => {
      const index = pagedParts.findIndex((p) => p.id === part.id)
      setSelectedPartIndex(index)
    },
    [pagedParts]
  )

  async function handleImport(file) {
    setImportError(null)
    if (markedCount > 0) {
      const ok = window.confirm(
        `This will replace your ${markedCount} current marks with the imported marks. Continue?`
      )
      if (!ok) return
    }
    try {
      await importMarked(file)
    } catch (err) {
      setImportError(err.message)
    }
  }

  const selectedPart = selectedPartIndex !== null ? pagedParts[selectedPartIndex] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⟳</div>
          <p className="text-lg">Loading parts…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        manufacturers={manufacturers}
        selectedManufacturers={selectedManufacturers}
        onManufacturersChange={setSelectedManufacturers}
        showMarkedOnly={showMarkedOnly}
        onShowMarkedOnlyChange={setShowMarkedOnly}
        totalCount={parts.length}
        filteredCount={filteredParts.length}
        markedCount={markedCount}
        onExport={exportMarked}
        onImport={handleImport}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage((p) => p - 1)}
        onNextPage={() => setCurrentPage((p) => p + 1)}
      />

      {importError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {importError}
          <button onClick={() => setImportError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      <PartGrid
        parts={pagedParts}
        markedSet={markedSet}
        onMark={markPart}
        onUnmark={unmarkPart}
        onCardClick={handleCardClick}
      />

      {selectedPart && (
        <PartDetail
          part={selectedPart}
          isMarked={markedSet.has(selectedPart.id)}
          onMark={markPart}
          onUnmark={unmarkPart}
          onClose={() => setSelectedPartIndex(null)}
          onPrev={() => setSelectedPartIndex((i) => i - 1)}
          onNext={() => setSelectedPartIndex((i) => i + 1)}
          hasPrev={selectedPartIndex > 0}
          hasNext={selectedPartIndex < pagedParts.length - 1}
        />
      )}
    </div>
  )
}
