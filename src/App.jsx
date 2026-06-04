import { useState, useEffect, useCallback } from 'react'
import { useParts } from './hooks/useParts'
import { useFhcProducts } from './hooks/useFhcProducts'
import { useFhcEdits } from './hooks/useFhcEdits'
import { useDebounce } from './hooks/useDebounce'
import { FilterBar } from './components/FilterBar'
import { PartGrid } from './components/PartGrid'
import { PartDetail } from './components/PartDetail'
import { FhcProductDetail } from './components/FhcProductDetail'

export default function App() {
  const [activeDataset, setActiveDataset] = useState('parts')
  const [searchInput, setSearchInput] = useState('')
  const [selectedManufacturers, setSelectedManufacturers] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [viewFilter, setViewFilter] = useState('all')
  const [selectedPartIndex, setSelectedPartIndex] = useState(null)
  const [importError, setImportError] = useState(null)
  const [itemsPerPage, setItemsPerPage] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)

  const debouncedSearch = useDebounce(searchInput, 300)

  const partsData = useParts({
    search: debouncedSearch,
    selectedManufacturers,
    viewFilter,
  })

  const fhcData = useFhcProducts({
    search: debouncedSearch,
    selectedBrands,
    selectedCategories,
    selectedSubcategories,
  })

  const { editsMap, saveEdits, editedCount, exportEdits } = useFhcEdits()

  const showMarking = activeDataset === 'parts'
  const active = showMarking ? partsData : fhcData

  // Reset all filters when switching datasets
  useEffect(() => {
    setSearchInput('')
    setSelectedManufacturers([])
    setSelectedBrands([])
    setSelectedCategories([])
    setSelectedSubcategories([])
    setViewFilter('all')
    setCurrentPage(1)
    setSelectedPartIndex(null)
  }, [activeDataset])

  // Reset to page 1 when filters or items-per-page change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, selectedManufacturers, selectedBrands, selectedCategories, selectedSubcategories, viewFilter, itemsPerPage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const totalPages =
    itemsPerPage === null ? 1 : Math.max(1, Math.ceil(active.filteredParts.length / itemsPerPage))

  const pagedParts =
    itemsPerPage === null
      ? active.filteredParts
      : active.filteredParts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCardClick = useCallback(
    (part) => {
      const index = pagedParts.findIndex((p) => p.id === part.id)
      setSelectedPartIndex(index)
    },
    [pagedParts]
  )

  async function handleImport(file) {
    setImportError(null)
    if (partsData.markedCount > 0) {
      const ok = window.confirm(
        `This will replace your ${partsData.markedCount} current marks with the imported marks. Continue?`
      )
      if (!ok) return
    }
    try {
      await partsData.importMarked(file)
    } catch (err) {
      setImportError(err.message)
    }
  }

  const selectedPart = selectedPartIndex !== null ? pagedParts[selectedPartIndex] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dataset tab strip */}
      <div className="flex gap-0 border-b border-gray-300 bg-white px-4 pt-2">
        <button
          onClick={() => setActiveDataset('parts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeDataset === 'parts'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Machinio Parts
        </button>
        <button
          onClick={() => setActiveDataset('fhc')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeDataset === 'fhc'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          FHC Products
        </button>
      </div>

      {active.loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-spin">⟳</div>
            <p className="text-lg">Loading {showMarking ? 'parts' : 'products'}…</p>
          </div>
        </div>
      ) : (
        <>
          <FilterBar
            search={searchInput}
            onSearchChange={setSearchInput}
            showMarking={showMarking}
            manufacturers={partsData.manufacturers}
            selectedManufacturers={selectedManufacturers}
            onManufacturersChange={setSelectedManufacturers}
            viewFilter={viewFilter}
            onViewFilterChange={setViewFilter}
            markedCount={partsData.markedCount}
            onExport={partsData.exportMarked}
            onImport={handleImport}
            brands={fhcData.brands}
            selectedBrands={selectedBrands}
            onBrandsChange={setSelectedBrands}
            categories={fhcData.categories}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            availableSubcategories={fhcData.availableSubcategories}
            selectedSubcategories={selectedSubcategories}
            onSubcategoriesChange={setSelectedSubcategories}
            editedCount={editedCount}
            onExportEdits={() => exportEdits(fhcData.parts)}
            totalCount={active.parts.length}
            filteredCount={active.filteredParts.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => setCurrentPage((p) => p - 1)}
            onNextPage={() => setCurrentPage((p) => p + 1)}
            onGoToPage={setCurrentPage}
          />

          {importError && (
            <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {importError}
              <button onClick={() => setImportError(null)} className="ml-3 underline">Dismiss</button>
            </div>
          )}

          <PartGrid
            parts={pagedParts}
            markedSet={partsData.markedSet}
            onMark={partsData.markPart}
            onUnmark={partsData.unmarkPart}
            onCardClick={handleCardClick}
            showMarking={showMarking}
            editsMap={editsMap}
          />
        </>
      )}

      {selectedPart && showMarking && (
        <PartDetail
          part={selectedPart}
          isMarked={partsData.markedSet.has(selectedPart.id)}
          onMark={partsData.markPart}
          onUnmark={partsData.unmarkPart}
          onClose={() => setSelectedPartIndex(null)}
          onPrev={() => setSelectedPartIndex((i) => i - 1)}
          onNext={() => setSelectedPartIndex((i) => i + 1)}
          hasPrev={selectedPartIndex > 0}
          hasNext={selectedPartIndex < pagedParts.length - 1}
        />
      )}

      {selectedPart && !showMarking && (
        <FhcProductDetail
          part={selectedPart}
          editsMap={editsMap}
          onSaveEdits={saveEdits}
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
