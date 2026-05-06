import { Users, ShoppingBag, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react'
import { adminStats, mockOrders } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../lib/helpers'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { AdminLineChart } from '../../components/charts/NutritionChart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const kpis = [
  { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Subscriptions', value: adminStats.activeSubscriptions.toLocaleString(), change: '+8%', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
  { label: "Today's Orders", value: adminStats.ordersToday.toLocaleString(), change: '+5%', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Monthly Revenue', value: formatCurrency(adminStats.monthlyRevenue), change: '+15%', icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
]

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back — here's what's happening at NutriGo.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <ArrowUpRight size={13} className="text-green-500" />
                  <span className="text-xs font-medium text-green-600">{kpi.change} this month</span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">User Growth</h3>
          <AdminLineChart
            data={adminStats.userGrowth.map(d => ({ month: d.month, value: d.users }))}
            label="Users"
            color="#203417"
          />
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <AdminLineChart
            data={adminStats.revenueData.map(d => ({ month: d.month, value: d.revenue }))}
            label="Revenue"
            color="#AC905E"
            prefix="$"
          />
        </Card>
      </div>

      {/* Orders by status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminStats.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="count" fill="#203417" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-2">
            {mockOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.profile?.full_name}</p>
                  <p className="text-xs text-gray-400">{order.id} · {formatDate(order.delivery_date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold text-primary text-sm">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
