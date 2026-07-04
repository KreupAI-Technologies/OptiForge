'use client'

import { useState } from 'react'
import {
  X,
  Check,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  CheckCircle,
  ShoppingCart,
  Sparkles,
  Award,
  Zap
} from 'lucide-react'
import type { ProductRecommendation, Answer } from './GuidedSellingWizard'

interface RecommendationsModalProps {
  isOpen: boolean
  onClose: () => void
  recommendations: ProductRecommendation[]
  answers: Answer[]
  onSelectRecommendation: (recommendation: ProductRecommendation) => void
}

export const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
  isOpen,
  onClose,
  recommendations,
  answers,
  onSelectRecommendation
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (!isOpen) return null

  const sortedRecommendations = [...recommendations].sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Your Personalized Recommendations</h2>
              <p className="text-sm opacity-90">Based on your requirements and preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Configuration Summary</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-blue-700">Questions Answered:</span>
                <span className="font-bold text-blue-900 ml-2">{answers.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Recommendations Found:</span>
                <span className="font-bold text-blue-900 ml-2">{recommendations.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Best Match:</span>
                <span className="font-bold text-blue-900 ml-2">
                  {sortedRecommendations[0]?.matchScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            {sortedRecommendations.map((recommendation, index) => {
              const isSelected = selectedId === recommendation.id
              const isBestMatch = index === 0
              const savings = recommendation.basePrice - recommendation.configuredPrice

              return (
                <div
                  key={recommendation.id}
                  className={`rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 shadow-lg'
                      : isBestMatch
                      ? 'border-green-400 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{recommendation.name}</h3>
                          {isBestMatch && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              BEST MATCH
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{recommendation.description}</p>

                        {/* Match Score */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Match Score</span>
                            <span className="text-sm font-bold text-blue-600">
                              {recommendation.matchScore}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                recommendation.matchScore >= 90
                                  ? 'bg-green-500'
                                  : recommendation.matchScore >= 75
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${recommendation.matchScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="ml-6 text-right">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Base Price</p>
                          <p className="text-lg text-gray-400 line-through">
                            ₹{recommendation.basePrice.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mb-1 mt-2">Configured Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{recommendation.configuredPrice.toLocaleString()}
                          </p>
                          {recommendation.discount > 0 && (
                            <div className="mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              Save {recommendation.discount}% (₹{savings.toLocaleString()})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Key Features
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {recommendation.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Why Recommended */}
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Why We Recommend This
                      </h4>
                      <div className="space-y-1">
                        {recommendation.whyRecommended.map((reason, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => {
                        setSelectedId(recommendation.id)
                        onSelectRecommendation(recommendation)
                      }}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          <span>Select This Package</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* No Recommendations Message */}
          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Found</h3>
              <p className="text-gray-600">
                We couldn't find any packages matching your requirements. Please try adjusting your preferences.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Need help deciding?{' '}
            <a
              href="/crm/contacts"
              onClick={(e) => {
                e.preventDefault();
                // In a real app, this would open a contact form or navigate to contact page
                alert('Contact sales form would open here. You can also call: +1-800-SALES or email: sales@company.com');
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Contact our sales team
            </a>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
            >
              Close
            </button>
            {selectedId && (
              <button
                onClick={() => {
                  const selected = recommendations.find(r => r.id === selectedId)
                  if (selected) {
                    onSelectRecommendation(selected)
                    onClose()
                  }
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Quote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
