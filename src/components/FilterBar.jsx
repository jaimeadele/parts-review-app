import { useRef, useState, useEffect } from 'react'
import { ManufacturerFilter } from './ManufacturerFilter'

const PER_PAGE_OPTIONS = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: 'All', value: null },
]

export function FilterBar({
  search,
  onSearchChange,
  showMarking,
  // Parts-mode props
  manufacturers,
  selectedManufacturers,
  onManufacturersChange,
  viewFilter,
  onViewFilterChange,
  markedCount,
  onExport,
  onImport,
  // FHC-mode props
  brands,
  selectedBrands,
  onBrandsChange,
  categories,
  selectedCategories,
  onCategoriesChange,
  availableSubcategories,
  selectedSubcategories,
  onSubcategoriesChange,
  editedCount,
  onExportEdits,
  // Shared props
  totalCount,
  filteredCount,
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
}) {
  const fileInputRef = useRef(null)
  const [pageInput, setPageInput] = useState(String(currentPage))

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  function handlePageKeyDown(e) {
    if (e.key === 'Enter') {
      const num = parseInt(pageInput, 10)
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        onGoToPage(num)
      } else {
        setPageInput(String(currentPage))
      }
      e.target.blur()
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    onImport(file)
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
      {/* Row 1: filters + actions */}
      <div className="flex flex-wrap items-center gap-3 py-1">
        <input
          type="search"
          placeholder="Search by title or part number…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {showMarking ? (
          <>
            <ManufacturerFilter
              manufacturers={manufacturers}
              selectedManufacturers={selectedManufacturers}
              onChange={onManufacturersChange}
            />

            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={viewFilter === 'marked'}
                onChange={() => onViewFilterChange(viewFilter === 'marked' ? 'all' : 'marked')}
                className="accent-blue-600"
              />
              Show marked only
            </label>

            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={viewFilter === 'unmarked'}
                onChange={() => onViewFilterChange(viewFilter === 'unmarked' ? 'all' : 'unmarked')}
                className="accent-blue-600"
              />
              Show unmarked only
            </label>

            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} parts
              {' · '}
              <strong className="text-gray-800">{markedCount.toLocaleString()} marked</strong>
            </span>

            <button
              onClick={onExport}
              disabled={markedCount === 0}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Export
            </button>

            <button
              onClick={() => fileInputRef.current.click()}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Import
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        ) : (
          <>
            <ManufacturerFilter
              manufacturers={brands}
              selectedManufacturers={selectedBrands}
              onChange={onBrandsChange}
              placeholder="Filter by Brand"
            />

            <ManufacturerFilter
              manufacturers={categories}
              selectedManufacturers={selectedCategories}
              onChange={onCategoriesChange}
              placeholder="Filter by Category"
            />

            <ManufacturerFilter
              manufacturers={availableSubcategories}
              selectedManufacturers={selectedSubcategories}
              onChange={onSubcategoriesChange}
              placeholder="Filter by Subcategory"
            />

            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} products
              {' · '}
              <strong className="text-gray-800">{editedCount.toLocaleString()} edited</strong>
            </span>

            <button
              onClick={onExportEdits}
              disabled={editedCount === 0}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Export Edits
            </button>
          </>
        )}
      </div>

      {/* Row 2: pagination */}
      <div className="flex items-center gap-3 py-1 border-t border-gray-100 mt-1">
        <span className="text-sm text-gray-500">Per page:</span>
        <div className="flex gap-1">
          {PER_PAGE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => onItemsPerPageChange(opt.value)}
              className={`px-2.5 py-0.5 text-sm rounded border ${
                itemsPerPage === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onGoToPage(1)}
              disabled={currentPage <= 1}
              className="px-2.5 py-0.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="First page"
            >
              «
            </button>
            <button
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              className="px-2.5 py-0.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              Page
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => setPageInput(String(currentPage))}
                onKeyDown={handlePageKeyDown}
                className="w-14 text-center border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              of {totalPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-0.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
            <button
              onClick={() => onGoToPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-0.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Last page"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
