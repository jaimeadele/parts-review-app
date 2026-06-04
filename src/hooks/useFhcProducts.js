import { useState, useEffect, useMemo } from 'react'

function normalizeProduct(p) {
  return {
    id: p.product_number,
    title: p.product_name,
    part_number: p.product_number,
    primary_image: null,
    _imageUrl: p.image_url || null,
    images: [],
    manufacturer: p.brand
      ? { name: p.brand, slug: p.brand.toLowerCase().replace(/\s+/g, '-') }
      : null,
    url: p.product_url,
    category: p.category || null,
    subcategory: p.subcategory || null,
    details: {
      ...(p.condition ? { Condition: p.condition } : {}),
      ...(p.category ? { Category: p.category } : {}),
      ...(p.subcategory ? { Subcategory: p.subcategory } : {}),
    },
    attributes: {
      ...(p.description ? { Description: p.description } : {}),
    },
  }
}

export function useFhcProducts({ search, selectedBrands, selectedCategories, selectedSubcategories }) {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'fhc_products.json')
      .then((res) => res.json())
      .then((data) => {
        setParts(Array.isArray(data) ? data.map(normalizeProduct) : [])
        setLoading(false)
      })
      .catch(() => {
        setParts([])
        setLoading(false)
      })
  }, [])

  const brands = useMemo(() => {
    const names = new Set(parts.map((p) => p.manufacturer?.name).filter(Boolean))
    return Array.from(names).sort()
  }, [parts])

  const categories = useMemo(() => {
    const cats = new Set(parts.map((p) => p.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [parts])

  const availableSubcategories = useMemo(() => {
    const source =
      selectedCategories.length > 0
        ? parts.filter((p) => selectedCategories.includes(p.category))
        : parts
    const subs = new Set(source.map((p) => p.subcategory).filter(Boolean))
    return Array.from(subs).sort()
  }, [parts, selectedCategories])

  const filteredParts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return parts.filter((p) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.manufacturer?.name)) return false
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(p.subcategory)) return false
      if (term) {
        const inTitle = p.title?.toLowerCase().includes(term)
        const inNumber = p.part_number?.toLowerCase().includes(term)
        if (!inTitle && !inNumber) return false
      }
      return true
    })
  }, [parts, search, selectedBrands, selectedCategories, selectedSubcategories])

  return { parts, filteredParts, brands, categories, availableSubcategories, loading }
}
