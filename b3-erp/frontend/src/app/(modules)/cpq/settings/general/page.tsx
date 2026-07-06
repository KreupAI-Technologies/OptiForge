'use client'

import { useState, useEffect } from 'react'
import { cpqSettingsService } from '@/services/cpq/cpq-settings.service'
import {
  Settings,
  Building2,
  DollarSign,
  Globe,
  FileText,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileCheck,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function CPQSettingsGeneralPage() {
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Company Information
  const [companyInfo, setCompanyInfo] = useState({
    name: 'B3 Manufacturing Solutions',
    legalName: 'B3 Manufacturing Solutions Private Limited',
    taxId: 'GSTIN29XXXXX1234Z5',
    pan: 'AAAAA0000A',
    cin: 'U12345KA2020PTC123456',
    email: 'quotes@b3manufacturing.com',
    phone: '+91 80 1234 5678',
    website: 'www.b3manufacturing.com',
    address: '123 Industrial Area, Phase 2',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India'
  })

  // Currency Settings
  const [currencySettings, setCurrencySettings] = useState({
    baseCurrency: 'INR',
    displayFormat: '₹#,##,##0.00',
    decimalPlaces: 2,
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP', 'AED'],
    exchangeRateSource: 'RBI',
    autoUpdateRates: true,
    rateUpdateFrequency: 'daily'
  })

  // Tax Configuration
  const [taxSettings, setTaxSettings] = useState({
    defaultTaxRate: 18,
    enableGST: true,
    gstType: 'inclusive',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    cessApplicable: false,
    cessRate: 0,
    tdsApplicable: true,
    tdsRate: 2,
    reverseCharge: false
  })

  // Quote Configuration
  const [quoteSettings, setQuoteSettings] = useState({
    defaultValidity: 30,
    validityUnit: 'days',
    autoExpireQuotes: true,
    allowCustomerEdit: false,
    requireDigitalSignature: true,
    enableVersioning: true,
    maxVersions: 10,
    allowPriceOverride: true,
    requireOverrideApproval: true,
    showCostBreakdown: false,
    showMargins: false
  })

  // Document Settings
  const [documentSettings, setDocumentSettings] = useState({
    logoPosition: 'top-left',
    showWatermark: true,
    watermarkText: 'CONFIDENTIAL',
    headerColor: '#1e40af',
    footerText: 'Thank you for your business',
    enableCustomFooter: true,
    pdfPassword: false,
    attachTerms: true,
    attachSpecs: true,
    documentLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  })

  // Terms & Conditions
  const [termsSettings, setTermsSettings] = useState({
    paymentTerms: 'Net 30 days from invoice date',
    deliveryTerms: '4-6 weeks from order confirmation',
    warrantyTerms: '1 year comprehensive warranty on manufacturing defects',
    cancellationPolicy: 'Orders can be cancelled within 24 hours of confirmation',
    returnPolicy: 'Returns accepted within 7 days of delivery',
    shippingTerms: 'FOB Destination',
    insuranceTerms: 'Transit insurance included',
    disputeResolution: 'All disputes subject to Bangalore jurisdiction'
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const s: any = await cpqSettingsService.getSettings()
        if (!active || !s) return
        if (s.defaultCurrency) {
          setCurrencySettings((prev) => ({ ...prev, baseCurrency: s.defaultCurrency }))
        }
        setQuoteSettings((prev) => ({
          ...prev,
          ...(s.defaultValidityDays != null ? { defaultValidity: Number(s.defaultValidityDays) } : {}),
          ...(s.autoExpireQuotes != null ? { autoExpireQuotes: !!s.autoExpireQuotes } : {}),
          ...(s.enableVersioning != null ? { enableVersioning: !!s.enableVersioning } : {}),
          ...(s.enableESignature != null ? { requireDigitalSignature: !!s.enableESignature } : {}),
        }))
      } catch (e) {
        // service handles fallback; ignore
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await cpqSettingsService.updateSettings({
        defaultCurrency: currencySettings.baseCurrency,
        defaultValidityDays: Number(quoteSettings.defaultValidity) || 30,
        autoExpireQuotes: quoteSettings.autoExpireQuotes,
        enableVersioning: quoteSettings.enableVersioning,
        enableESignature: quoteSettings.requireDigitalSignature,
      } as any)
      setSaveStatus('success')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e) {
      setSaveStatus('error')
    }
  }

  const handleReset = () => {
    // Reset to original values
    setHasChanges(false)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure company information, currency, tax, and quote defaults</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          )}
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
      </div>

      {/* Status Banner */}
      {saveStatus === 'success' && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Settings saved successfully!</p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800 font-medium">Failed to save settings. Please try again.</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Company Information</h3>
              <p className="text-sm text-gray-600">Basic company details for quotes and proposals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => {
                  setCompanyInfo({ ...companyInfo, name: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Legal Name</label>
              <input
                type="text"
                value={companyInfo.legalName}
                onChange={(e) => {
                  setCompanyInfo({ ...companyInfo, legalName: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
              <input
                type="text"
                value={companyInfo.taxId}
                onChange={(e) => {
                  setCompanyInfo({ ...companyInfo, taxId: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
              <input
                type="text"
                value={companyInfo.pan}
                onChange={(e) => {
                  setCompanyInfo({ ...companyInfo, pan: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => {
                  setCompanyInfo({ ...companyInfo, email: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => {
                  setCompanyInfo({ ...companyInfo, phone: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              <textarea
                value={`${companyInfo.address}, ${companyInfo.city}, ${companyInfo.state} - ${companyInfo.postalCode}`}
                onChange={(e) => setHasChanges(true)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Currency Settings</h3>
              <p className="text-sm text-gray-600">Configure currency format and exchange rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Currency</label>
              <select
                value={currencySettings.baseCurrency}
                onChange={(e) => {
                  setCurrencySettings({ ...currencySettings, baseCurrency: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Format</label>
              <input
                type="text"
                value={currencySettings.displayFormat}
                onChange={(e) => {
                  setCurrencySettings({ ...currencySettings, displayFormat: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Places</label>
              <input
                type="number"
                value={currencySettings.decimalPlaces}
                onChange={(e) => {
                  setCurrencySettings({ ...currencySettings, decimalPlaces: parseInt(e.target.value) })
                  setHasChanges(true)
                }}
                min="0"
                max="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exchange Rate Source</label>
              <select
                value={currencySettings.exchangeRateSource}
                onChange={(e) => {
                  setCurrencySettings({ ...currencySettings, exchangeRateSource: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="RBI">RBI</option>
                <option value="ECB">ECB</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                checked={currencySettings.autoUpdateRates}
                onChange={(e) => {
                  setCurrencySettings({ ...currencySettings, autoUpdateRates: e.target.checked })
                  setHasChanges(true)
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Auto Update Exchange Rates</label>
            </div>
          </div>
        </div>

        {/* Tax Configuration */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tax Configuration</h3>
              <p className="text-sm text-gray-600">GST and other tax settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
              <input
                type="number"
                value={taxSettings.defaultTaxRate}
                onChange={(e) => {
                  setTaxSettings({ ...taxSettings, defaultTaxRate: parseFloat(e.target.value) })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CGST Rate (%)</label>
              <input
                type="number"
                value={taxSettings.cgstRate}
                onChange={(e) => {
                  setTaxSettings({ ...taxSettings, cgstRate: parseFloat(e.target.value) })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SGST Rate (%)</label>
              <input
                type="number"
                value={taxSettings.sgstRate}
                onChange={(e) => {
                  setTaxSettings({ ...taxSettings, sgstRate: parseFloat(e.target.value) })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={taxSettings.enableGST}
                onChange={(e) => {
                  setTaxSettings({ ...taxSettings, enableGST: e.target.checked })
                  setHasChanges(true)
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Enable GST</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={taxSettings.tdsApplicable}
                onChange={(e) => {
                  setTaxSettings({ ...taxSettings, tdsApplicable: e.target.checked })
                  setHasChanges(true)
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">TDS Applicable</label>
            </div>
          </div>
        </div>

        {/* Quote Configuration */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quote Configuration</h3>
              <p className="text-sm text-gray-600">Default quote settings and behavior</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Validity</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={quoteSettings.defaultValidity}
                  onChange={(e) => {
                    setQuoteSettings({ ...quoteSettings, defaultValidity: parseInt(e.target.value) })
                    setHasChanges(true)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={quoteSettings.validityUnit}
                  onChange={(e) => {
                    setQuoteSettings({ ...quoteSettings, validityUnit: e.target.value })
                    setHasChanges(true)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Versions</label>
              <input
                type="number"
                value={quoteSettings.maxVersions}
                onChange={(e) => {
                  setQuoteSettings({ ...quoteSettings, maxVersions: parseInt(e.target.value) })
                  setHasChanges(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={quoteSettings.autoExpireQuotes}
                  onChange={(e) => {
                    setQuoteSettings({ ...quoteSettings, autoExpireQuotes: e.target.checked })
                    setHasChanges(true)
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Auto Expire Quotes</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={quoteSettings.enableVersioning}
                  onChange={(e) => {
                    setQuoteSettings({ ...quoteSettings, enableVersioning: e.target.checked })
                    setHasChanges(true)
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Enable Versioning</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={quoteSettings.requireDigitalSignature}
                  onChange={(e) => {
                    setQuoteSettings({ ...quoteSettings, requireDigitalSignature: e.target.checked })
                    setHasChanges(true)
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Require Digital Signature</label>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Terms & Conditions</h3>
              <p className="text-sm text-gray-600">Default terms for quotes and contracts</p>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(termsSettings).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <textarea
                  value={value}
                  onChange={(e) => {
                    setTermsSettings({ ...termsSettings, [key]: e.target.value })
                    setHasChanges(true)
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
