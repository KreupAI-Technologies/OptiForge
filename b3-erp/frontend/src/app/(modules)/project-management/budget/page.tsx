'use client'

import { useState, useEffect } from 'react'
import {
 PieChart,
 Pie,
 BarChart,
 Bar,
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 Cell,
} from 'recharts'
import {
 DollarSign,
 TrendingUp,
 TrendingDown,
 AlertTriangle,
 CheckCircle,
 Download,
 Plus,
 Calendar,
} from 'lucide-react'
import { projectManagementService, Project, ProjectBudget } from '@/services/ProjectManagementService'

interface BudgetCategory {
 category: string
 budgetAllocated: number
 budgetSpent: number
 forecast: number
 variance: number
 variancePercent: number
}

interface SpendingTrend {
 month: string
 planned: number
 actual: number
 forecast: number
}

const COLORS = {
 labor: '#3b82f6',
 materials: '#10b981',
 equipment: '#f59e0b',
 subcontractor: '#8b5cf6',
 other: '#6b7280',
}

export default function BudgetManagementPage() {
 const [budgetData, setBudgetData] = useState<BudgetCategory[]>([])
 const [spendingTrend, setSpendingTrend] = useState<SpendingTrend[]>([])
 const [projects, setProjects] = useState<Project[]>([])
 const [selectedProjectId, setSelectedProjectId] = useState<string>('')
 const [isLoading, setIsLoading] = useState(true)
 const [selectedCategory, setSelectedCategory] = useState<string>('all')

 useEffect(() => {
  fetchProjects()
 }, [])

 useEffect(() => {
  if (selectedProjectId) {
   fetchBudgetData(selectedProjectId)
  }
 }, [selectedProjectId])

 const fetchProjects = async () => {
  try {
   const data = await projectManagementService.getProjects()
   setProjects(data)
   if (data.length > 0) {
    setSelectedProjectId(data[0].id)
   } else {
    setIsLoading(false)
   }
  } catch (error) {
   console.error('Failed to fetch projects:', error)
   setIsLoading(false)
  }
 }

 const fetchBudgetData = async (projectId: string) => {
  setIsLoading(true)
  try {
   const budgets = await projectManagementService.getBudgets(projectId)

   // Map API data to UI format
   const mappedBudgets: BudgetCategory[] = budgets.map(b => {
    const variance = b.budgetAllocated - b.budgetSpent
    const variancePercent = b.budgetAllocated > 0 ? (variance / b.budgetAllocated) * 100 : 0
    return {
     category: b.category,
     budgetAllocated: b.budgetAllocated,
     budgetSpent: b.budgetSpent,
     forecast: b.forecastCost,
     variance: variance,
     variancePercent: variancePercent
    }
   })

   setBudgetData(mappedBudgets)

   // Historical spending trend from the budget-trend aggregation endpoint
   try {
    const trend = await projectManagementService.getBudgetTrend(projectId)
    setSpendingTrend((trend || []) as SpendingTrend[])
   } catch {
    setSpendingTrend([])
   }

  } catch (error) {
   console.error('Failed to fetch budget data:', error)
  } finally {
   setIsLoading(false)
  }
 }

 const totalBudget = budgetData.reduce((sum, cat) => sum + cat.budgetAllocated, 0)
 const totalSpent = budgetData.reduce((sum, cat) => sum + cat.budgetSpent, 0)
 const totalForecast = budgetData.reduce((sum, cat) => sum + cat.forecast, 0)
 const totalVariance = totalBudget - totalSpent // Variance is typically Budget - Actual
 const utilizationPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

 const pieData = budgetData.map((cat) => ({
  name: cat.category,
  value: cat.budgetAllocated,
 }))

 const varianceData = budgetData.map((cat) => ({
  category: cat.category,
  planned: cat.budgetAllocated,
  actual: cat.budgetSpent,
  variance: cat.variance,
 }))

 const getVarianceColor = (variance: number): string => {
  // Positive variance (under budget) is green, negative (over budget) is red
  // Note: The calculation above was Budget - Spent. 
  // If Budget (50k) - Spent (45k) = 5k (Positive) -> Under Budget (Good) -> Green
  // If Budget (50k) - Spent (55k) = -5k (Negative) -> Over Budget (Bad) -> Red
  if (variance > 0) return 'text-green-600 bg-green-100'
  if (variance < 0) return 'text-red-600 bg-red-100'
  return 'text-gray-600 bg-gray-100'
 }

 const getVarianceIcon = (variance: number) => {
  if (variance > 0) return <TrendingDown className="h-4 w-4" /> // Trending down (spending less than budget) is good? Or maybe just check circle
  if (variance < 0) return <TrendingUp className="h-4 w-4" /> // Trending up (over budget)
  return <CheckCircle className="h-4 w-4" />
 }

 if (isLoading && projects.length === 0) {
  return (
   <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
     <p className="text-gray-600">Loading budget data...</p>
    </div>
   </div>
  )
 }

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="flex justify-between items-start">
    <div>
     <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
     <p className="text-gray-500 mt-1">Cost tracking, variance analysis, and forecasting</p>
    </div>
    <div className="flex gap-2 items-center">
     <select
      value={selectedProjectId}
      onChange={(e) => setSelectedProjectId(e.target.value)}
      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
     >
      {projects.map((project) => (
       <option key={project.id} value={project.id}>
        {project.name}
       </option>
      ))}
     </select>
     <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Add Expense
     </button>
     <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export Report
     </button>
    </div>
   </div>

   {/* Summary Cards */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-500">Total Budget</p>
       <p className="text-3xl font-bold text-gray-900 mt-2">
        ${(totalBudget / 1000).toFixed(0)}k
       </p>
       <p className="text-sm text-gray-500 mt-1">Allocated</p>
      </div>
      <div className="p-3 bg-blue-100 rounded-full">
       <DollarSign className="h-8 w-8 text-blue-600" />
      </div>
     </div>
    </div>

    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-500">Total Spent</p>
       <p className="text-3xl font-bold text-gray-900 mt-2">
        ${(totalSpent / 1000).toFixed(0)}k
       </p>
       <p className="text-sm text-gray-500 mt-1">
        {utilizationPercent.toFixed(1)}% utilized
       </p>
      </div>
      <div className="p-3 bg-green-100 rounded-full">
       <DollarSign className="h-8 w-8 text-green-600" />
      </div>
     </div>
    </div>

    <div
     className={`bg-white p-3 rounded-lg border border-gray-200 ${totalVariance < 0 ? 'border-red-200' : 'border-green-200'
      }`}
    >
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-500">Variance</p>
       <p
        className={`text-3xl font-bold mt-2 ${totalVariance < 0 ? 'text-red-600' : 'text-green-600'
         }`}
       >
        ${Math.abs(totalVariance / 1000).toFixed(1)}k
       </p>
       <p
        className={`text-sm mt-1 flex items-center gap-1 ${totalVariance < 0 ? 'text-red-600' : 'text-green-600'
         }`}
       >
        {totalVariance < 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {totalVariance < 0 ? 'Over' : 'Under'} budget
       </p>
      </div>
      <div className={`p-3 rounded-full ${totalVariance < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
       {totalVariance < 0 ? (
        <AlertTriangle className="h-8 w-8 text-red-600" />
       ) : (
        <CheckCircle className="h-8 w-8 text-green-600" />
       )}
      </div>
     </div>
    </div>

    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-500">Forecast (EAC)</p>
       <p className="text-3xl font-bold text-gray-900 mt-2">
        ${(totalForecast / 1000).toFixed(0)}k
       </p>
       <p className="text-sm text-gray-500 mt-1">Estimate at completion</p>
      </div>
      <div className="p-3 bg-purple-100 rounded-full">
       <TrendingUp className="h-8 w-8 text-purple-600" />
      </div>
     </div>
    </div>
   </div>

   {/* Charts Row 1 */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {/* Budget Allocation Pie Chart */}
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Allocation by Category</h3>
     <ResponsiveContainer width="100%" height={300}>
      <PieChart>
       <Pie
        data={pieData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
       >
        {pieData.map((entry, index) => (
         <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884d8'} />
        ))}
       </Pie>
       <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
      </PieChart>
     </ResponsiveContainer>
    </div>

    {/* Planned vs Actual Bar Chart */}
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <h3 className="text-lg font-semibold text-gray-900 mb-2">Planned vs Actual by Category</h3>
     <ResponsiveContainer width="100%" height={300}>
      <BarChart data={varianceData}>
       <CartesianGrid strokeDasharray="3 3" />
       <XAxis dataKey="category" />
       <YAxis />
       <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
       <Legend />
       <Bar dataKey="planned" fill="#3b82f6" name="Planned" />
       <Bar dataKey="actual" fill="#10b981" name="Actual" />
      </BarChart>
     </ResponsiveContainer>
    </div>
   </div>

   {/* Spending Trend */}
   <div className="bg-white p-3 rounded-lg border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Burndown & Forecast</h3>
    <ResponsiveContainer width="100%" height={300}>
     <LineChart data={spendingTrend}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
      <Legend />
      <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} name="Planned" />
      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
      <Line
       type="monotone"
       dataKey="forecast"
       stroke="#f59e0b"
       strokeWidth={2}
       strokeDasharray="5 5"
       name="Forecast"
      />
     </LineChart>
    </ResponsiveContainer>
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
     <div className="flex items-center gap-2">
      <div className="w-4 h-1 bg-blue-500"></div>
      <span className="text-gray-700">Planned Spend</span>
     </div>
     <div className="flex items-center gap-2">
      <div className="w-4 h-1 bg-green-500"></div>
      <span className="text-gray-700">Actual Spend</span>
     </div>
     <div className="flex items-center gap-2">
      <div className="w-4 h-1 bg-yellow-500" style={{ borderTop: '1px dashed #f59e0b' }}></div>
      <span className="text-gray-700">Forecast</span>
     </div>
    </div>
   </div>

   {/* Detailed Budget Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="p-6 border-b border-gray-200">
     <h3 className="text-lg font-semibold text-gray-900">Budget Variance Analysis</h3>
     <p className="text-sm text-gray-500 mt-1">Detailed breakdown by category</p>
    </div>
    <div className="overflow-x-auto">
     <table className="min-w-full">
      <thead className="bg-gray-50">
       <tr>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Category
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Budget Allocated
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Budget Spent
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Variance
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Variance %
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Forecast (EAC)
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Status
        </th>
       </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
       {budgetData.map((cat, index) => (
        <tr key={index} className="hover:bg-gray-50">
         <td className="px-3 py-2 whitespace-nowrap">
          <div className="flex items-center gap-2">
           <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: COLORS[cat.category.toLowerCase() as keyof typeof COLORS] || '#8884d8' }}
           ></div>
           <span className="text-sm font-medium text-gray-900">{cat.category}</span>
          </div>
         </td>
         <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
          ${cat.budgetAllocated.toLocaleString()}
         </td>
         <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
          ${cat.budgetSpent.toLocaleString()}
         </td>
         <td className="px-3 py-2 whitespace-nowrap">
          <span
           className={`text-sm font-medium ${cat.variance > 0 ? 'text-green-600' : cat.variance < 0 ? 'text-red-600' : 'text-gray-600'
            }`}
          >
           ${Math.abs(cat.variance).toLocaleString()}
          </span>
         </td>
         <td className="px-3 py-2 whitespace-nowrap">
          <div className="flex items-center gap-1">
           {getVarianceIcon(cat.variance)}
           <span
            className={`text-sm font-medium ${cat.variance > 0 ? 'text-green-600' : cat.variance < 0 ? 'text-red-600' : 'text-gray-600'
             }`}
           >
            {Math.abs(cat.variancePercent).toFixed(1)}%
           </span>
          </div>
         </td>
         <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
          ${cat.forecast.toLocaleString()}
         </td>
         <td className="px-3 py-2 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVarianceColor(cat.variance)}`}>
           {cat.variance > 0 ? 'Under Budget' : cat.variance < 0 ? 'Over Budget' : 'On Track'}
          </span>
         </td>
        </tr>
       ))}
       {/* Total Row */}
       <tr className="bg-gray-50 font-semibold">
        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">TOTAL</td>
        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
         ${totalBudget.toLocaleString()}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
         ${totalSpent.toLocaleString()}
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
         <span
          className={`text-sm font-medium ${totalVariance > 0 ? 'text-green-600' : totalVariance < 0 ? 'text-red-600' : 'text-gray-600'
           }`}
         >
          ${Math.abs(totalVariance).toLocaleString()}
         </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
         <span
          className={`text-sm font-medium ${totalVariance > 0 ? 'text-green-600' : totalVariance < 0 ? 'text-red-600' : 'text-gray-600'
           }`}
         >
          {totalBudget > 0 ? ((totalVariance / totalBudget) * 100).toFixed(1) : 0}%
         </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
         ${totalForecast.toLocaleString()}
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
         <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVarianceColor(totalVariance)}`}
         >
          {totalVariance > 0 ? 'Under Budget' : totalVariance < 0 ? 'Over Budget' : 'On Track'}
         </span>
        </td>
       </tr>
      </tbody>
     </table>
    </div>
   </div>

   {/* Insights */}
   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
     <DollarSign className="h-5 w-5 text-blue-600" />
     Budget Insights & Recommendations
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
     <div className="bg-white p-3 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">✅ Performing Well</h4>
      <ul className="text-sm text-gray-600 space-y-1">
       <li>• Labor costs 10% under budget</li>
       <li>• Equipment spending on track</li>
       <li>• Overall utilization at 96%</li>
      </ul>
     </div>
     <div className="bg-white p-3 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">⚠️ Needs Attention</h4>
      <ul className="text-sm text-gray-600 space-y-1">
       <li>• Materials 6.7% over budget</li>
       <li>• Other category showing 16% savings (review allocation)</li>
       <li>• Forecast trending 4.8% over total budget</li>
      </ul>
     </div>
    </div>
   </div>
  </div>
 )
}
