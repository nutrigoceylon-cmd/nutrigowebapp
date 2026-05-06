import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface DailyNutrition {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionChartProps {
  data: DailyNutrition[]
  type?: 'bar' | 'line'
}

export function NutritionChart({ data, type = 'bar' }: NutritionChartProps) {
  if (type === 'line') {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="calories" stroke="#203417" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} />
          <Legend />
          <Bar dataKey="protein" fill="#203417" name="Protein (g)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="carbs" fill="#AC905E" name="Carbs (g)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="fat" fill="#ABB6A2" name="Fat (g)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AdminChartData {
  month: string
  value: number
}

interface AdminLineChartProps {
  data: AdminChartData[]
  label: string
  color?: string
  prefix?: string
}

export function AdminLineChart({ data, label, color = '#203417', prefix = '' }: AdminLineChartProps) {
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(value) => [`${prefix}${Number(value).toLocaleString()}`, label]}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
