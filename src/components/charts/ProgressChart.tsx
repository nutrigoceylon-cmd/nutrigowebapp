import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { WeightLog } from '../../types'
import { formatDateShort } from '../../lib/helpers'

interface ProgressChartProps {
  data: WeightLog[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.map(log => ({
    date: formatDateShort(log.log_date),
    weight: log.weight,
    bodyFat: log.body_fat_percentage,
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(value, name) => [
              name === 'weight' ? `${value} kg` : `${value}%`,
              name === 'weight' ? 'Weight' : 'Body Fat',
            ]}
          />
          <Line type="monotone" dataKey="weight" stroke="#203417" strokeWidth={2.5} dot={{ fill: '#203417', r: 4 }} />
          <Line type="monotone" dataKey="bodyFat" stroke="#AC905E" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#AC905E', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
