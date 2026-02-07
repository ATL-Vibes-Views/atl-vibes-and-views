'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [areas, setAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('name, slug, area:areas(name)')
        .order('name')

      if (data) {
        const grouped: any = {}
        data.forEach((n: any) => {
          const areaName = n.area?.name || 'Other'
          if (!grouped[areaName]) grouped[areaName] = []
          grouped[areaName].push(n)
        })
        setAreas(Object.entries(grouped).sort())
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
        ATL Vibes & Views
      </h1>
      <p style={{ fontSize: 18, color: '#666', marginBottom: 40 }}>
        {loading ? 'Loading neighborhoods...' : `${areas.reduce((sum, [, n]) => sum + n.length, 0)} neighborhoods across ${areas.length} areas — live from Supabase`}
      </p>

      {areas.map(([areaName, neighborhoods]) => (
        <div key={areaName} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12, borderBottom: '2px solid #000', paddingBottom: 4 }}>
            {areaName} ({neighborhoods.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {neighborhoods.map((n: any) => (
              <div key={n.slug} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, fontSize: 14 }}>
                {n.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}

