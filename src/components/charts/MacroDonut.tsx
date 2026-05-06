import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MacroDonutProps {
  protein: number
  carbs: number
  fat: number
}

const COLORS = ['#203417', '#AC905E', '#ABB6A2']

export function MacroDonut({ protein, carbs, fat }: MacroDonutProps) {
  const total = protein * 4 + carbs * 4 + fat * 9
  const data = [
    { name: 'Protein', value: Math.round((protein * 4 / total) * 100), grams: protein },
    { name: 'Carbs', value: Math.round((carbs * 4 / total) * 100), grams: carbs },
    { name: 'Fat', value: Math.round((fat * 9 / total) * 100), grams: fat },
  ]

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value}% (${props.payload.grams}g)`, name]} />
          <Legend formatter={(value, entry) => `${value}: ${(entry.payload as {grams: number}).grams}g`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
