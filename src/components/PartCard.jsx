const CDN_BASE = 'https://directus.multi.merciadev.com/assets'

export function PartCard({ part, isMarked, onMark, onUnmark, onClick }) {
  const imageUrl = part.primary_image
    ? `${CDN_BASE}/${part.primary_image.id}?fit=inside&width=600`
    : '/default-image.jpg'

  function handleMarkClick(e) {
    e.stopPropagation()
    isMarked ? onUnmark(part.id) : onMark(part.id)
  }

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col bg-white rounded border cursor-pointer hover:shadow-md transition-shadow h-[280px] overflow-hidden ${
        isMarked ? 'border-l-4 border-l-green-500 border-t-gray-200 border-r-gray-200 border-b-gray-200' : 'border-gray-200'
      }`}
    >
      {isMarked && (
        <span className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          ✓
        </span>
      )}

      <div className="h-40 bg-gray-100 flex-shrink-0">
        <img
          src={imageUrl}
          alt={part.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-1 p-2 min-h-0">
        <p className="text-xs text-gray-500 truncate">{part.manufacturer?.name}</p>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mt-0.5 flex-1">
          {part.title}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{part.part_number}</p>

        <button
          onClick={handleMarkClick}
          className={`mt-2 w-full text-xs py-1 rounded font-medium ${
            isMarked
              ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isMarked ? '✓ Marked' : 'Mark for Website'}
        </button>
      </div>
    </div>
  )
}
