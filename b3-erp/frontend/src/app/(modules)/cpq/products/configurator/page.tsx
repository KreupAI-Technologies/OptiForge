'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cpqConfigStepService } from '@/services/cpq/cpq-orphans.service'
import {
  Settings,
  ChevronRight,
  Check,
  Plus,
  Minus,
  DollarSign,
  Info,
  ShoppingCart,
  FileText,
  Save
} from 'lucide-react'
import {
  GenerateQuoteModal,
  QuoteSuccessModal,
  SaveConfigModal
} from '@/components/cpq/ConfiguratorModals'

interface ConfigStep {
  id: string
  title: string
  completed: boolean
  active: boolean
}

interface ConfigOption {
  id: string
  name: string
  price: number
  selected: boolean
  image: string
}

export default function CPQProductsConfiguratorPage() {
  const router = useRouter()

  const [steps, setSteps] = useState<ConfigStep[]>([
    { id: '1', title: 'Kitchen Type', completed: true, active: false },
    { id: '2', title: 'Size & Layout', completed: true, active: false },
    { id: '3', title: 'Cabinet Materials', completed: false, active: true },
    { id: '4', title: 'Countertop', completed: false, active: false },
    { id: '5', title: 'Appliances', completed: false, active: false },
    { id: '6', title: 'Accessories', completed: false, active: false },
    { id: '7', title: 'Review & Quote', completed: false, active: false }
  ])

  useEffect(() => {
    let active = true
    cpqConfigStepService
      .findAll()
      .then((rows) => {
        if (!active) return
        if (!Array.isArray(rows) || rows.length === 0) return
        const mapped: ConfigStep[] = rows.map((r, idx) => ({
          id: r.id ?? String(idx + 1),
          title: r.title ?? '',
          completed: !!r.completed,
          active: !!r.active
        }))
        setSteps(mapped)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const [cabinetOptions] = useState<ConfigOption[]>([
    { id: 'CAB-001', name: 'Premium Plywood - Marine Grade', price: 150000, selected: false, image: '🪵' },
    { id: 'CAB-002', name: 'MDF with Laminate Finish', price: 85000, selected: true, image: '📦' },
    { id: 'CAB-003', name: 'Solid Wood - Oak', price: 280000, selected: false, image: '🌳' },
    { id: 'CAB-004', name: 'Acrylic Finish Cabinets', price: 195000, selected: false, image: '✨' }
  ])

  const [countertopOptions] = useState<ConfigOption[]>([
    { id: 'CNT-001', name: 'Granite - Black Galaxy', price: 45000, selected: false, image: '⬛' },
    { id: 'CNT-002', name: 'Quartz - White Carrara', price: 65000, selected: false, image: '⬜' },
    { id: 'CNT-003', name: 'Marble - Italian Statuario', price: 95000, selected: false, image: '💎' },
    { id: 'CNT-004', name: 'Solid Surface - Corian', price: 55000, selected: false, image: '🔲' }
  ])

  // Modal states
  const [isGenerateQuoteModalOpen, setIsGenerateQuoteModalOpen] = useState(false)
  const [isQuoteSuccessModalOpen, setIsQuoteSuccessModalOpen] = useState(false)
  const [isSaveConfigModalOpen, setIsSaveConfigModalOpen] = useState(false)
  const [generatedQuote, setGeneratedQuote] = useState<any>(null)

  const basePrice = 2800000
  const selectedOptionsPrice = cabinetOptions.find(o => o.selected)?.price || 0
  const totalPrice = basePrice + selectedOptionsPrice

  // Handlers
  const handleGenerateQuote = () => {
    setIsGenerateQuoteModalOpen(true)
  }

  const handleSaveQuote = (quoteData: any) => {
    setGeneratedQuote(quoteData)
    setIsGenerateQuoteModalOpen(false)
    setIsQuoteSuccessModalOpen(true)
  }

  const handleSaveConfiguration = () => {
    setIsSaveConfigModalOpen(true)
  }

  const handleSaveConfig = (configData: any) => {
    console.log('Configuration saved:', configData)
    setIsSaveConfigModalOpen(false)
  }

  const handleDownloadQuote = () => {
    console.log('Downloading quote:', generatedQuote)
    // In production, this would generate and download a PDF
    const element = document.createElement('a')
    const file = new Blob(
      [`Quote ${generatedQuote?.quoteNumber}\n\nCustomer: ${generatedQuote?.customerName}\nTotal: ₹${(totalPrice / 100000).toFixed(2)}L`],
      { type: 'text/plain' }
    )
    element.href = URL.createObjectURL(file)
    element.download = `${generatedQuote?.quoteNumber}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleViewQuote = () => {
    router.push(`/cpq/quotes/${generatedQuote?.quoteNumber}`)
  }

  const handleEmailQuote = () => {
    console.log('Emailing quote to:', generatedQuote?.customerEmail)
    setIsQuoteSuccessModalOpen(false)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveConfiguration}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
          <button
            onClick={handleGenerateQuote}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Quote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration Steps</h2>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    step.active
                      ? 'bg-blue-50 border border-blue-200'
                      : step.completed
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-600 text-white'
                        : step.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.completed ? <Check className="h-4 w-4" /> : <span className="text-sm font-semibold">{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${step.active || step.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                  </div>
                  {step.active && <ChevronRight className="h-4 w-4 text-blue-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Price Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Base Price</span>
                <span className="font-semibold text-gray-900">₹{(basePrice / 100000).toFixed(2)}L</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cabinet Material</span>
                <span className="font-semibold text-gray-900">₹{(selectedOptionsPrice / 100000).toFixed(2)}L</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">Total Price</span>
                <span className="text-xl font-bold text-blue-600">₹{(totalPrice / 100000).toFixed(2)}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Configuration Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cabinet Materials</h1>
                <p className="text-sm text-gray-600 mt-1">Choose the material for your kitchen cabinets</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-900">Step 3 of 7</span>
              </div>
            </div>

            {/* Cabinet Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {cabinetOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    option.selected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                      {option.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{option.name}</h3>
                          <p className="text-sm text-blue-600 font-semibold mt-1">
                            +₹{(option.price / 100000).toFixed(2)}L
                          </p>
                        </div>
                        {option.selected && (
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {option.id === 'CAB-001' && 'Waterproof, termite-resistant, long-lasting durability'}
                        {option.id === 'CAB-002' && 'Cost-effective, smooth finish, wide color options'}
                        {option.id === 'CAB-003' && 'Premium quality, natural grain, elegant appearance'}
                        {option.id === 'CAB-004' && 'Modern look, easy to clean, scratch-resistant'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Expert Recommendation</h3>
              <p className="text-sm text-blue-800">
                For humid climates like coastal areas, we recommend Premium Plywood with marine-grade protection.
                For modern aesthetics and easy maintenance, Acrylic Finish Cabinets are an excellent choice.
              </p>
            </div>
          </div>

          {/* Next Configuration Section Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Next: Countertop Selection</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {countertopOptions.map((option) => (
                <div
                  key={option.id}
                  className="border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="text-3xl mb-2">{option.image}</div>
                  <p className="text-xs font-medium text-gray-900">{option.name.split(' - ')[1]}</p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">₹{(option.price / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <ChevronRight className="h-4 w-4 rotate-180" />
              Previous Step
            </button>
            <button className="px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              Next Step
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GenerateQuoteModal
        isOpen={isGenerateQuoteModalOpen}
        onClose={() => setIsGenerateQuoteModalOpen(false)}
        onGenerate={handleSaveQuote}
        configuration={{
          basePrice,
          selectedOptions: cabinetOptions.filter(o => o.selected),
          totalPrice,
          steps
        }}
      />

      <QuoteSuccessModal
        isOpen={isQuoteSuccessModalOpen}
        onClose={() => {
          setIsQuoteSuccessModalOpen(false)
          setGeneratedQuote(null)
        }}
        quote={generatedQuote}
        onDownload={handleDownloadQuote}
        onViewQuote={handleViewQuote}
      />

      <SaveConfigModal
        isOpen={isSaveConfigModalOpen}
        onClose={() => setIsSaveConfigModalOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
