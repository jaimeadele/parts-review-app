import { useState, useRef, useEffect } from 'react'

export function ManufacturerFilter({ manufacturers, selectedManufacturers, onChange, placeholder = 'Filter by Manufacturer' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const allCheckboxRef = useRef(null)

  const allChecked = manufacturers.length > 0 && selectedManufacturers.length === manufacturers.length
  const someChecked = selectedManufacturers.length > 0 && !allChecked

  useEffect(() => {
    if (allCheckboxRef.current) {
      allCheckboxRef.current.indeterminate = someChecked
    }
  }, [someChecked])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function toggleManufacturer(name) {
    if (selectedManufacturers.includes(name)) {
      onChange(selectedManufacturers.filter((m) => m !== name))
    } else {
      onChange([...selectedManufacturers, name])
    }
  }

  const label =
    selectedManufacturers.length === 0
      ? placeholder
      : selectedManufacturers.length === 1
      ? selectedManufacturers[0]
      : `${selectedManufacturers.length} selected`

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`border rounded px-3 py-1.5 text-sm bg-white flex items-center gap-2 min-w-50 justify-between ${
          selectedManufacturers.length > 0
            ? 'border-blue-500 text-blue-700'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="truncate">{label}</span>
        <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 max-h-72 overflow-y-auto min-w-55">
          <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
            <input
              ref={allCheckboxRef}
              type="checkbox"
              checked={allChecked}
              onChange={() => onChange(allChecked ? [] : manufacturers)}
              className="accent-blue-600"
            />
            All
          </label>
          {manufacturers.map((name) => (
            <label
              key={name}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedManufacturers.includes(name)}
                onChange={() => toggleManufacturer(name)}
                className="accent-blue-600"
              />
              {name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
