import { useState, useEffect } from 'react'

const CDN_BASE = 'https://directus.multi.merciadev.com/assets'

function buildImageUrl(id) {
  return `${CDN_BASE}/${id}?fit=inside&width=600`
}

function DetailSection({ title, data }) {
  if (!data || Object.keys(data).length === 0) return null
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-gray-500 font-medium">{key}</dt>
            <dd className="text-gray-800">
              {Array.isArray(value) ? (
                <ul className="list-disc list-inside">
                  {value.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              ) : (
                String(value)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function PartDetail({ part, isMarked, onMark, onUnmark, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const primaryImageId = part.primary_image?.id
  const allImages = part.images ?? []

  const [activeImage, setActiveImage] = useState(
    primaryImageId
      ? buildImageUrl(primaryImageId)
      : (allImages[0] ?? import.meta.env.BASE_URL + 'default-image.jpg')
  );

  useEffect(() => {
    const primaryImageId = part.primary_image?.id
    const allImages = part.images ?? []
    setActiveImage(
      primaryImageId
        ? buildImageUrl(primaryImageId)
        : (allImages[0] ?? import.meta.env.BASE_URL + 'default-image.jpg')
    );
  }, [part])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' || e.key === 'Space') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  const thumbnails = [
    ...(primaryImageId ? [buildImageUrl(primaryImageId)] : []),
    ...allImages.filter((url) => url !== buildImageUrl(primaryImageId)),
  ]

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
          <div className='flex-1 pr-4 min-h-26'>
            <h2 className='text-xl font-bold text-gray-900 leading-snug line-clamp-2'>
              {part.title}
            </h2>
            <p className='text-sm text-gray-500 mt-1'>{part.part_number}</p>
            {part.subheading && (
              <p className='text-sm text-gray-600 mt-1 italic'>
                {part.subheading}
              </p>
            )}
            {part.manufacturer && (
              <a
                href={part.url}
                target='_blank'
                rel='noreferrer'
                className='text-sm text-blue-600 hover:underline mt-1 inline-block'
              >
                {part.manufacturer.name} ↗
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0'
          >
            ✕
          </button>
        </div>

        {/* Main image */}
        <div className='px-6 mt-4'>
          <img
            src={activeImage}
            alt={part.title}
            className='w-full rounded object-contain max-h-80 bg-gray-50'
          />
        </div>

        {/* Thumbnails — always reserve space for consistent layout */}
        <div className='px-6 mt-3 flex gap-2 overflow-x-auto pb-1 h-[72px]'>
          {thumbnails.length > 1 && thumbnails.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=''
                onClick={() => setActiveImage(url)}
                className={`h-16 w-16 object-cover rounded cursor-pointer shrink-0 border-2 ${
                  activeImage === url
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-300'
                }`}
              />
            ))}
        </div>

        {/* Mark button */}
        <div className='px-6 mt-4'>
          <button
            onClick={() => (isMarked ? onUnmark(part.id) : onMark(part.id))}
            className={`w-full py-2 rounded font-medium text-sm ${
              isMarked
                ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isMarked ? '✓ Marked for Website' : 'Mark for Website'}
          </button>
        </div>

        {/* Prev / Next */}
        <div className='flex justify-between items-center px-6 pb-6 pt-2 border-t border-gray-100'>
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className='px-4 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed'
          >
            ← Prev
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className='px-4 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed'
          >
            Next →
          </button>
        </div>

        {/* Pricing */}
        {(part.partssource_price != null ||
          part.outrightListPrice != null ||
          part.oemListPrice != null) && (
          <div className='px-6 mt-4'>
            <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>
              Pricing
            </h3>
            <dl className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
              {part.partssource_price != null && (
                <div className='contents'>
                  <dt className='text-gray-500 font-medium'>
                    PartsSource Price
                  </dt>
                  <dd className='text-gray-800'>
                    ${part.partssource_price.toFixed(2)}
                  </dd>
                </div>
              )}
              {part.outrightListPrice != null && (
                <div className='contents'>
                  <dt className='text-gray-500 font-medium'>Outright Price</dt>
                  <dd className='text-gray-800'>
                    ${part.outrightListPrice.toFixed(2)}
                  </dd>
                </div>
              )}
              {part.oemListPrice != null && (
                <div className='contents'>
                  <dt className='text-gray-500 font-medium'>OEM Price</dt>
                  <dd className='text-gray-800'>
                    ${part.oemListPrice.toFixed(2)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Details and attributes */}
        <div className='px-6 pb-6'>
          <DetailSection title='Details' data={part.details} />
          <DetailSection title='Attributes' data={part.attributes} />
        </div>
      </div>
    </div>
  );
}
