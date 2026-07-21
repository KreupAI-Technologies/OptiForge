'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, AlertTriangle, Play, Lock } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface CloseTask {
  id: string
  task: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  assignedTo: string
  dueDate: string
}

export default function PeriodClosePage() {
  const [tasks, setTasks] = useState<CloseTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState<{ id: string; name: string } | null>(null)
  const [closing, setClosing] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const periods = await FinanceService.getFinancialPeriods()
      const list = Array.isArray(periods) ? periods : []
      // Pick the current (or most recent open) period and derive its
      // closing checklist into the task list the JSX renders.
      const current =
        list.find((p: any) => p?.isCurrent) ||
        list.find((p: any) => String(p?.status).toLowerCase() === 'open') ||
        list[0]
      setCurrentPeriod(
        current
          ? { id: String(current.id), name: current.periodName ?? current.periodCode ?? 'Current Period' }
          : null,
      )
      const checklist: any[] = Array.isArray(current?.closingChecklist)
        ? current.closingChecklist
        : []
      const mapped: CloseTask[] = checklist.map((c: any, i: number) => ({
        id: String(i + 1),
        task: c?.taskName ?? c?.task ?? `Task ${i + 1}`,
        status: c?.completed ? 'completed' : 'pending',
        assignedTo: c?.completedBy ?? 'Finance Team',
        dueDate: current?.endDate ?? new Date().toISOString().slice(0, 10),
      }))
      setTasks(mapped)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load period close data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // No dedicated close endpoint; PATCH period status to Closed.
  const handleClosePeriod = async () => {
    if (!currentPeriod) {
      setActionMessage({ type: 'error', text: 'No open period available to close.' })
      return
    }
    if (!confirm(`Close period "${currentPeriod.name}"? Posted transactions will be locked.`)) return
    setClosing(true)
    setActionMessage(null)
    try {
      await FinanceService.updateFinancialPeriod(currentPeriod.id, { status: 'Closed' })
      setActionMessage({ type: 'success', text: `Period "${currentPeriod.name}" closed.` })
      await load()
    } catch (e: any) {
      setActionMessage({ type: 'error', text: e?.message ?? 'Failed to close period.' })
    } finally {
      setClosing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />
      case 'blocked': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length ? (completedTasks / tasks.length) * 100 : 0

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Period-End Closing</h1>
          <p className="text-gray-600 mt-1">Month-end close checklist and procedures</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">October 2025 Close Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
            <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className={`p-4 rounded-lg border-2 ${task.status === 'completed' ? 'bg-green-50 border-green-200' :
                  task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                    task.status === 'blocked' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-semibold text-gray-900">{task.task}</p>
                      <p className="text-sm text-gray-600">{task.assignedTo} • Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {actionMessage && (
            <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {actionMessage.text}
            </div>
          )}
          <button
            onClick={handleClosePeriod}
            disabled={closing || !currentPeriod}
            className="mt-6 w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-5 w-5" />
            {closing ? 'Closing…' : 'Close Period'}
          </button>
        </div>
      </div>
    </div>
  )
}
