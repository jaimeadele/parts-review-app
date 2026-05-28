import { useRef, useMemo } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { PartCard } from './PartCard'

const CARD_HEIGHT = 280
const GAP = 16
const COLUMNS = 4

export function PartGrid({ parts, markedSet, onMark, onUnmark, onCardClick }) {
  const parentRef = useRef(null)

  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < parts.length; i += COLUMNS) {
      result.push(parts.slice(i, i + COLUMNS))
    }
    return result
  }, [parts])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
  })

  if (parts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No parts match your filters.
      </div>
    )
  }

  return (
    <div ref={parentRef} className="px-4 py-4">
      <div
        style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                gap: GAP,
                height: CARD_HEIGHT,
              }}
            >
              {row.map((part) => (
                <PartCard
                  key={part.id}
                  part={part}
                  isMarked={markedSet.has(part.id)}
                  onMark={onMark}
                  onUnmark={onUnmark}
                  onClick={() => onCardClick(part)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
