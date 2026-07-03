'use client'

import { useEffect, useState } from 'react'
import {
  Hash,
  FileText,
  File,
  Award,
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Copy,
  Plus,
  Loader2
} from 'lucide-react'
import { cpqCodeListService } from '@/services/cpq/cpq-orphans.service'

export default function CPQSettingsNumberingPage() {
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle')

  // Numbering Schemes
  const [numberingSchemes, setNumberingSchemes] = useState({
    quotes: {
      enabled: true,
      prefix: 'QT',
      separator: '-',
      yearFormat: 'YY',
      includeYear: true,
      includeMonth: false,
      sequenceLength: 5,
      startNumber: 1,
      currentSequence: 267,
      sample: 'QT-25-00267',
      resetFrequency: 'yearly',
      branchCode: false,
      categoryCode: false
    },
    proposals: {
      enabled: true,
      prefix: 'PR',
      separator: '-',
      yearFormat: 'YYYY',
      includeYear: true,
      includeMonth: false,
      sequenceLength: 4,
      startNumber: 1,
      currentSequence: 142,
      sample: 'PR-2025-0142',
      resetFrequency: 'yearly',
      branchCode: false,
      categoryCode: false
    },
    contracts: {
      enabled: true,
      prefix: 'CT',
      separator: '/',
      yearFormat: 'YY',
      includeYear: true,
      includeMonth: true,
      sequenceLength: 4,
      startNumber: 1,
      currentSequence: 89,
      sample: 'CT/25/10/0089',
      resetFrequency: 'monthly',
      branchCode: false,
      categoryCode: false
    },
    revisions: {
      enabled: true,
      prefix: 'REV',
      separator: '-',
      yearFormat: '',
      includeYear: false,
      includeMonth: false,
      sequenceLength: 2,
      startNumber: 1,
      currentSequence: 1,
      sample: 'QT-25-00267-REV-01',
      resetFrequency: 'per-document',
      branchCode: false,
      categoryCode: false
    }
  })

  // Advanced Options
  const [advancedOptions, setAdvancedOptions] = useState({
    allowManualOverride: false,
    requireApprovalForOverride: true,
    preventDuplicates: true,
    logNumberChanges: true,
    autoIncrementOnDraft: false,
    reserveNumbersOnCreate: true,
    skipDeletedNumbers: false,
    recycleExpiredNumbers: false
  })

  // Branch Codes (if enabled)
  const [branchCodes, setBranchCodes] = useState<{ id: any; name: string; code: string; active: boolean }[]>([])

  // Category Codes (if enabled)
  const [categoryCodes, setCategoryCodes] = useState<{ id: any; name: string; code: string; active: boolean }[]>([])

  const [codesLoading, setCodesLoading] = useState(true)
  const [codesError, setCodesError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    setCodesLoading(true)
    setCodesError(null)

    cpqCodeListService
      .findAll()
      .then((rows) => {
        if (!active) return
        const branch = rows
          .filter((r) => r.listType === 'branch')
          .map((r) => ({ id: r.id, name: r.name ?? '', code: r.code ?? '', active: Boolean(r.active) }))
        const category = rows
          .filter((r) => r.listType === 'category')
          .map((r) => ({ id: r.id, name: r.name ?? '', code: r.code ?? '', active: Boolean(r.active) }))
        setBranchCodes(branch)
        setCategoryCodes(category)
      })
      .catch((err: any) => {
        if (!active) return
        setCodesError(err?.message || 'Failed to load codes')
      })
      .finally(() => {
        if (!active) return
        setCodesLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const generateSample = (scheme: typeof numberingSchemes.quotes) => {
    let sample = scheme.prefix
    
    if (scheme.includeYear) {
      sample += scheme.separator
      sample += scheme.yearFormat === 'YYYY' ? '2025' : '25'
    }
    
    if (scheme.includeMonth) {
      sample += scheme.separator + '10'
    }
    
    if (scheme.branchCode) {
      sample += scheme.separator + 'BLR'
    }
    
    if (scheme.categoryCode) {
      sample += scheme.separator + 'MK'
    }
    
    sample += scheme.separator
    sample += String(scheme.currentSequence).padStart(scheme.sequenceLength, '0')
    
    return sample
  }

  const handleSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('success')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const updateScheme = (type: keyof typeof numberingSchemes, field: string, value: any) => {
    setNumberingSchemes({
      ...numberingSchemes,
      [type]: {
        ...numberingSchemes[type],
        [field]: value,
        sample: generateSample({ ...numberingSchemes[type], [field]: value })
      }
    })
    setHasChanges(true)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Numbering Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">Configure automatic numbering for quotes, proposals, and contracts</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === 'saving'}
          className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
            hasChanges && saveStatus !== 'saving'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : saveStatus === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Success Banner */}
      {saveStatus === 'success' && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Numbering settings saved successfully!</p>
        </div>
      )}

      {/* Quote Numbering */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quote Numbering</h3>
              <p className="text-sm text-gray-600">Configure automatic quote number generation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={numberingSchemes.quotes.enabled}
              onChange={(e) => updateScheme('quotes', 'enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Enabled</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
            <input
              type="text"
              value={numberingSchemes.quotes.prefix}
              onChange={(e) => updateScheme('quotes', 'prefix', e.target.value)}
              maxLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Separator</label>
            <select
              value={numberingSchemes.quotes.separator}
              onChange={(e) => updateScheme('quotes', 'separator', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="-">Hyphen (-)</option>
              <option value="/">Slash (/)</option>
              <option value="_">Underscore (_)</option>
              <option value="">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Length</label>
            <input
              type="number"
              value={numberingSchemes.quotes.sequenceLength}
              onChange={(e) => updateScheme('quotes', 'sequenceLength', parseInt(e.target.value))}
              min="3"
              max="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Sequence</label>
            <input
              type="number"
              value={numberingSchemes.quotes.currentSequence}
              onChange={(e) => updateScheme('quotes', 'currentSequence', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={numberingSchemes.quotes.includeYear}
              onChange={(e) => updateScheme('quotes', 'includeYear', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Include Year</label>
          </div>
          {numberingSchemes.quotes.includeYear && (
            <div>
              <select
                value={numberingSchemes.quotes.yearFormat}
                onChange={(e) => updateScheme('quotes', 'yearFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="YY">YY (25)</option>
                <option value="YYYY">YYYY (2025)</option>
              </select>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={numberingSchemes.quotes.includeMonth}
              onChange={(e) => updateScheme('quotes', 'includeMonth', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Include Month</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reset Frequency</label>
            <select
              value={numberingSchemes.quotes.resetFrequency}
              onChange={(e) => updateScheme('quotes', 'resetFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="never">Never</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Sample Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 mb-1">Sample Format:</p>
              <p className="text-2xl font-bold text-blue-900 font-mono">{numberingSchemes.quotes.sample}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-blue-600 bg-white rounded-lg hover:bg-blue-50"
                aria-label="View"
               
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-blue-600 bg-white rounded-lg hover:bg-blue-50"
                aria-label="Copy"
               
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Numbering */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <File className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Proposal Numbering</h3>
              <p className="text-sm text-gray-600">Configure automatic proposal number generation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={numberingSchemes.proposals.enabled}
              onChange={(e) => updateScheme('proposals', 'enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Enabled</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
            <input
              type="text"
              value={numberingSchemes.proposals.prefix}
              onChange={(e) => updateScheme('proposals', 'prefix', e.target.value)}
              maxLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Length</label>
            <input
              type="number"
              value={numberingSchemes.proposals.sequenceLength}
              onChange={(e) => updateScheme('proposals', 'sequenceLength', parseInt(e.target.value))}
              min="3"
              max="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Sequence</label>
            <input
              type="number"
              value={numberingSchemes.proposals.currentSequence}
              onChange={(e) => updateScheme('proposals', 'currentSequence', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Format</label>
            <select
              value={numberingSchemes.proposals.yearFormat}
              onChange={(e) => updateScheme('proposals', 'yearFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="YY">YY (25)</option>
              <option value="YYYY">YYYY (2025)</option>
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700 mb-1">Sample Format:</p>
              <p className="text-2xl font-bold text-purple-900 font-mono">{numberingSchemes.proposals.sample}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Numbering */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Contract Numbering</h3>
              <p className="text-sm text-gray-600">Configure automatic contract number generation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={numberingSchemes.contracts.enabled}
              onChange={(e) => updateScheme('contracts', 'enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Enabled</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
            <input
              type="text"
              value={numberingSchemes.contracts.prefix}
              onChange={(e) => updateScheme('contracts', 'prefix', e.target.value)}
              maxLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Separator</label>
            <select
              value={numberingSchemes.contracts.separator}
              onChange={(e) => updateScheme('contracts', 'separator', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="-">Hyphen (-)</option>
              <option value="/">Slash (/)</option>
              <option value="_">Underscore (_)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Length</label>
            <input
              type="number"
              value={numberingSchemes.contracts.sequenceLength}
              onChange={(e) => updateScheme('contracts', 'sequenceLength', parseInt(e.target.value))}
              min="3"
              max="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Sequence</label>
            <input
              type="number"
              value={numberingSchemes.contracts.currentSequence}
              onChange={(e) => updateScheme('contracts', 'currentSequence', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700 mb-1">Sample Format:</p>
              <p className="text-2xl font-bold text-green-900 font-mono">{numberingSchemes.contracts.sample}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Settings className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Advanced Options</h3>
            <p className="text-sm text-gray-600">Additional numbering configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(advancedOptions).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => {
                  setAdvancedOptions({ ...advancedOptions, [key]: e.target.checked })
                  setHasChanges(true)
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Code Lists */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mt-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Hash className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Code Lists</h3>
            <p className="text-sm text-gray-600">Branch and category codes used in numbering</p>
          </div>
        </div>

        {codesLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 p-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : codesError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">{codesError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Branch Codes</p>
              {branchCodes.length === 0 ? (
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">No codes configured</p>
              ) : (
                <div className="space-y-2">
                  {branchCodes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">{c.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Category Codes</p>
              {categoryCodes.length === 0 ? (
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">No codes configured</p>
              ) : (
                <div className="space-y-2">
                  {categoryCodes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">{c.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">Numbering Sequence Warning</p>
          <p className="text-sm text-blue-700 mt-1">
            Changing numbering sequences can affect existing documents. Changes will only apply to new documents created after this update.
          </p>
        </div>
      </div>
    </div>
  )
}
