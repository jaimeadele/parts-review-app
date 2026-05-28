import { useRef } from 'react'

export function FilterBar({
  search,
  onSearchChange,
  manufacturers,
  selectedManufacturers,
  onManufacturersChange,
  showMarkedOnly,
  onShowMarkedOnlyChange,
  totalCount,
  filteredCount,
  markedCount,
  onExport,
  onImport,
}) {
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    onImport(file)
  }

  function handleImportClick() {
    fileInputRef.current.click()
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Search by title or part number…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        multiple
        value={selectedManufacturers}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, (o) => o.value)
          onManufacturersChange(selected)
        }}
        className="border border-gray-300 rounded px-2 py-1 text-sm h-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Hold Ctrl / Cmd to select multiple manufacturers"
      >
        {manufacturers.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showMarkedOnly}
          onChange={(e) => onShowMarkedOnlyChange(e.target.checked)}
          className="accent-blue-600"
        />
        Show marked only
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
        onClick={handleImportClick}
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
    </div>
  )
}
