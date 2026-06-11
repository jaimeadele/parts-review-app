import { useState, useEffect } from 'react'

function DetailSection({ title, data }) {
  if (!data || Object.keys(data).length === 0) return null
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-gray-500 font-medium">{key}</dt>
            <dd className="text-gray-800">{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function FhcProductDetail({ part, editsMap, onSaveEdits, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const edits = editsMap[part.id] ?? {}

  const [description, setDescription] = useState(edits.description ?? part.attributes?.Description ?? '')
  const [category, setCategory] = useState(edits.category ?? part.category ?? '')
  const [subcategory, setSubcategory] = useState(edits.subcategory ?? part.subcategory ?? '')
  const [isEditing, setIsEditing] = useState(false)

  // Reset form and exit edit mode when navigating to a different product
  useEffect(() => {
    setIsEditing(false)
    const e = editsMap[part.id] ?? {}
    setDescription(e.description ?? part.attributes?.Description ?? '')
    setCategory(e.category ?? part.category ?? '')
    setSubcategory(e.subcategory ?? part.subcategory ?? '')
  }, [part.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleKey(e) {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape' || e.key === ' ') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  function handleSave() {
    onSaveEdits(part.id, { description, category, subcategory })
    setIsEditing(false)
  }

  function handleCancel() {
    const e = editsMap[part.id] ?? {}
    setDescription(e.description ?? part.attributes?.Description ?? '')
    setCategory(e.category ?? part.category ?? '')
    setSubcategory(e.subcategory ?? part.subcategory ?? '')
    setIsEditing(false)
  }

  const imageUrl = part._imageUrl ?? import.meta.env.BASE_URL + 'default-image.jpg'
  const isEdited = !!editsMap[part.id]

  return (
    <div
      className='fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-lg w-full max-w-3xl relative'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-start justify-between p-6 pb-0'>
          <div className='flex-1 pr-4'>
            <h2 className='text-xl font-bold text-gray-900 leading-snug'>
              {part.title}
            </h2>
            <p className='text-sm text-gray-500 mt-1'>{part.part_number}</p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0'
          >
            ✕
          </button>
        </div>

        {/* Image */}
        <div className='px-6 mt-4'>
          <img
            src={imageUrl}
            alt={part.title}
            className='w-full rounded object-contain max-h-80 bg-gray-50'
          />
        </div>

        {/* Read-only details */}
        <div className='px-6'>
          {part.manufacturer ? (
            <a
              href={part.url}
              target='_blank'
              rel='noreferrer'
              className='text-sm text-blue-600 hover:underline mt-1 inline-block'
            >
              {part.manufacturer.name} ↗
            </a>
          ) : part.url ? (
            <a
              href={part.url}
              target='_blank'
              rel='noreferrer'
              className='text-sm text-blue-600 hover:underline mt-1 inline-block'
            >
              View product ↗
            </a>
          ) : null}
          <DetailSection title='Details' data={part.details} />
        </div>

        {/* Info section (view or edit mode) */}
        <div className='px-6 mt-4 pb-2'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
              Info
              {isEdited && !isEditing && (
                <span className='ml-2 text-xs text-blue-600 normal-case font-normal'>
                  edited
                </span>
              )}
            </h3>
          </div>

          <div className='space-y-3'>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Category</p>
              {isEditing ? (
                <input
                  type='text'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              ) : (
                <p className='text-sm text-gray-800'>{category || '—'}</p>
              )}
            </div>

            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>
                Subcategory
              </p>
              {isEditing ? (
                <input
                  type='text'
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className='w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              ) : (
                <p className='text-sm text-gray-800'>{subcategory || '—'}</p>
              )}
            </div>

            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>
                Description
              </p>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={20}
                  className='w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'
                />
              ) : (
                <p className='text-sm text-gray-800 whitespace-pre-wrap'>
                  {description || '—'}
                </p>
              )}
            </div>
            {isEditing ? (
              <div className='align-right flex justify-end gap-4 mt-2 mr-4'>
                <button
                  onClick={handleCancel}
                  className='text-sm text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded'
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className='text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 px-3 py-1.5 rounded'
                >
                  Save
                </button>
              </div>
            ) : (
              <div className='align-right flex justify-end mt-2 mr-4'>
                <button
                  onClick={() => setIsEditing(true)}
                  className='text-sm text-white bg-blue-600 hover:bg-blue-800 px-3 py-1.5 rounded'
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        {part.documents?.length > 0 && (
          <div className='px-6 mt-4 pb-2'>
            <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>
              Documents
            </h3>
            <ul className='space-y-1'>
              {part.documents.map((url, i) => {
                const filename = decodeURIComponent(url.split('/').pop());
                return (
                  <li key={i}>
                    <a
                      href={url}
                      target='_blank'
                      rel='noreferrer'
                      className='text-sm text-blue-600 hover:underline break-all'
                    >
                      {filename} ↗
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Prev / Next */}
        <div className='flex justify-between items-center px-6 pb-6 pt-4 mt-4 border-t border-gray-100'>
          <button
            onClick={onPrev}
            disabled={!hasPrev || isEditing}
            className='px-4 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed'
          >
            ← Prev
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext || isEditing}
            className='px-4 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed'
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
