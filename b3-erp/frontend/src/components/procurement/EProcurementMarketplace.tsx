'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, Search, Filter, Star, Heart,
  TrendingUp, DollarSign, Clock, Truck, Shield, Award,
  ChevronRight, ChevronLeft, Grid, List, Plus, Minus,
  Eye, ShoppingBag, Store, Tag, Zap, Globe, BarChart3,
  CheckCircle, XCircle, AlertCircle, Calendar, Download,
  RefreshCw, Settings, Send, FileText, Share2, MapPin
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { procurementPagesService } from '@/services/procurement-pages.service';

interface EProcurementMarketplaceProps {}

const EProcurementMarketplace: React.FC<EProcurementMarketplaceProps> = () => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Mock data for marketplace products
  const marketplaceProducts = [
    {
      id: 'PRD001',
      name: 'Industrial Grade Steel Plates',
      supplier: 'Metal Works Inc',
      category: 'Raw Materials',
      price: 450,
      unit: 'per ton',
      rating: 4.8,
      reviews: 124,
      image: '/api/placeholder/200/200',
      inStock: true,
      leadTime: '3-5 days',
      minOrder: 5,
      discount: 10,
      certifications: ['ISO 9001', 'CE'],
      description: 'High-quality steel plates suitable for heavy machinery'
    },
    {
      id: 'PRD002',
      name: 'Electronic Control Modules',
      supplier: 'Tech Components Ltd',
      category: 'Electronics',
      price: 1250,
      unit: 'per unit',
      rating: 4.9,
      reviews: 89,
      image: '/api/placeholder/200/200',
      inStock: true,
      leadTime: '7-10 days',
      minOrder: 10,
      discount: 15,
      certifications: ['RoHS', 'CE', 'UL'],
      description: 'Advanced control modules for automation systems'
    },
    {
      id: 'PRD003',
      name: 'Industrial Chemicals Bundle',
      supplier: 'Chemical Supply Co',
      category: 'Chemicals',
      price: 890,
      unit: 'per barrel',
      rating: 4.6,
      reviews: 67,
      image: '/api/placeholder/200/200',
      inStock: false,
      leadTime: '14-21 days',
      minOrder: 20,
      discount: 5,
      certifications: ['REACH', 'GHS'],
      description: 'Premium grade industrial chemicals for manufacturing'
    },
    {
      id: 'PRD004',
      name: 'Precision Ball Bearings',
      supplier: 'Global Bearings Ltd',
      category: 'Components',
      price: 125,
      unit: 'per pack',
      rating: 4.7,
      reviews: 156,
      image: '/api/placeholder/200/200',
      inStock: true,
      leadTime: '2-3 days',
      minOrder: 50,
      discount: 20,
      certifications: ['ISO 9001', 'DIN'],
      description: 'High-precision bearings for industrial applications'
    },
    {
      id: 'PRD005',
      name: 'Safety Equipment Kit',
      supplier: 'SafetyFirst Inc',
      category: 'Safety',
      price: 350,
      unit: 'per kit',
      rating: 4.9,
      reviews: 203,
      image: '/api/placeholder/200/200',
      inStock: true,
      leadTime: '1-2 days',
      minOrder: 10,
      discount: 12,
      certifications: ['OSHA', 'ANSI', 'CE'],
      description: 'Complete safety equipment kit for industrial workers'
    },
    {
      id: 'PRD006',
      name: 'Hydraulic Pumps',
      supplier: 'HydroTech Systems',
      category: 'Machinery',
      price: 2850,
      unit: 'per unit',
      rating: 4.5,
      reviews: 45,
      image: '/api/placeholder/200/200',
      inStock: true,
      leadTime: '10-15 days',
      minOrder: 2,
      discount: 8,
      certifications: ['ISO 9001', 'API'],
      description: 'Heavy-duty hydraulic pumps for industrial machinery'
    }
  ];

  // Mock data for categories
  const categories = [
    { id: 'all', name: 'All Categories', count: 2456 },
    { id: 'raw_materials', name: 'Raw Materials', count: 423 },
    { id: 'electronics', name: 'Electronics', count: 567 },
    { id: 'chemicals', name: 'Chemicals', count: 234 },
    { id: 'components', name: 'Components', count: 789 },
    { id: 'safety', name: 'Safety Equipment', count: 156 },
    { id: 'machinery', name: 'Machinery', count: 287 }
  ];

  // Supplier stores (connected suppliers) loaded from backend
  const [supplierStores, setSupplierStores] = useState<any[]>([]);

  useEffect(() => {
    const loadMarketplaceInsights = async () => {
      try {
        const data = await procurementPagesService.getMarketplaceInsights();
        const catalogs = data?.catalogs ?? [];
        if (Array.isArray(catalogs) && catalogs.length > 0) {
          setSupplierStores(
            catalogs.map((c: any) => ({
              id: c?.vendorId ?? '',
              name: c?.vendorName ?? '',
              rating: c?.rating ?? 0,
              products: c?.catalogItems ?? 0,
              responseTime: c?.punchoutEnabled ? 'Punch-out enabled' : 'Standard',
              onTimeDelivery: 0,
              categories: [],
              certifications: [],
              joinedDate: '',
              orders: c?.ordersYtd ?? 0,
              punchout: c?.punchoutEnabled ?? false,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load marketplace insights', err);
      }
    };
    loadMarketplaceInsights();
  }, []);

  // Mock data for recent orders
  const recentOrders = [
    {
      id: 'ORD001',
      date: '2024-12-15',
      supplier: 'Metal Works Inc',
      items: 3,
      total: 4500,
      status: 'delivered',
      rating: 5
    },
    {
      id: 'ORD002',
      date: '2024-12-10',
      supplier: 'Tech Components Ltd',
      items: 5,
      total: 12500,
      status: 'in_transit',
      rating: null
    },
    {
      id: 'ORD003',
      date: '2024-12-05',
      supplier: 'Chemical Supply Co',
      items: 2,
      total: 8900,
      status: 'processing',
      rating: null
    }
  ];

  // Mock data for trending products
  const trendingProducts = [
    { name: 'Steel Plates', growth: 45, orders: 234 },
    { name: 'Control Modules', growth: 38, orders: 189 },
    { name: 'Ball Bearings', growth: 32, orders: 156 },
    { name: 'Safety Kits', growth: 28, orders: 142 },
    { name: 'Hydraulic Pumps', growth: 25, orders: 98 }
  ];

  const addToCart = (product: any) => {
    setCartItems([...cartItems, { ...product, quantity: product.minOrder }]);
  };

  const renderMarketplace = () => (
    <div className="flex gap-3">
      {/* Filters Sidebar */}
      {showFilters && (
        <div className="w-64 bg-white rounded-lg shadow p-3">
          <h3 className="font-semibold mb-2">Filters</h3>

          {/* Categories */}
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-3">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => setSelectedCategory(category.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-3">Price Range</h4>
            <div className="space-y-2">
              <input type="range" min="0" max="5000" className="w-full" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>$0</span>
                <span>$5,000+</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-3">Availability</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">In Stock</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Ships within 7 days</span>
              </label>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center gap-2">
                  <input type="radio" name="rating" className="rounded" />
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm ml-1">& up</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-3">Certifications</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">ISO 9001</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">CE Certified</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">RoHS Compliant</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="flex-1">
        {/* Search and View Controls */}
        <div className="bg-white rounded-lg shadow p-3 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Toggle Filters"
              >
                <Filter className="h-5 w-5" />
              </button>
              <div className="flex items-center border rounded-lg px-3 py-2 w-96">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search products, suppliers, or categories..."
                  className="outline-none flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleCompareProducts}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                title="Compare Products"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Compare</span>
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Place Order"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Place Order</span>
              </button>
              <button
                onClick={handleTrackDelivery}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                title="Track Delivery"
              >
                <Truck className="h-4 w-4" />
                <span>Track</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>Sort by: Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
                <option>Newest First</option>
              </select>

              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                  title="Grid View"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                  title="List View"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Display */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}>
          {marketplaceProducts.map((product) => (
            <div key={product.id} className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
              viewMode === 'list' ? 'flex gap-3 p-3' : 'p-6'
            }`}>
              {/* Product Image */}
              <div className={viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48 mb-2'}>
                <div className="bg-gray-200 rounded-lg w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              </div>

              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                {/* Product Info */}
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{product.name}</h4>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Heart className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Favorite</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{product.supplier}</p>
                  <p className="text-xs text-gray-500">{product.description}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                </div>

                {/* Price and Stock */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${product.price}</span>
                    <span className="text-sm text-gray-600">{product.unit}</span>
                    {product.discount > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className={`flex items-center gap-1 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-600">Lead: {product.leadTime}</span>
                    <span className="text-gray-600">Min: {product.minOrder}</span>
                  </div>
                </div>

                {/* Certifications */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {product.certifications.map((cert, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {cert}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleViewProductDetails(product)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    title="View Product Details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Previous</span>
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`px-4 py-2 border rounded ${
                page === 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded hover:bg-gray-50">
            <span className="text-gray-700">Next</span>
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuppliers = () => (
    <div className="space-y-3">
      {/* Featured Suppliers */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 text-white">
        <h3 className="text-xl font-semibold mb-2">Featured Suppliers</h3>
        <p className="mb-2">Discover top-rated suppliers with excellent track records</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {supplierStores.slice(0, 3).map((store) => (
            <div key={store.id} className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{store.name}</h4>
                <Award className="h-5 w-5 text-yellow-300" />
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(store.rating) ? 'text-yellow-300 fill-current' : 'text-white/30'
                    }`}
                  />
                ))}
                <span className="text-sm ml-1">{store.rating}</span>
              </div>
              <p className="text-sm mb-2">{store.products} Products</p>
              <button className="text-sm underline">Visit Store →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Directory */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Supplier Directory</h3>
          <div className="flex gap-2">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search suppliers..."
                className="outline-none"
              />
            </div>
            <select className="px-3 py-2 border rounded-lg">
              <option>All Categories</option>
              <option>Raw Materials</option>
              <option>Electronics</option>
              <option>Components</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {supplierStores.map((store) => (
            <div key={store.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Store className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{store.name}</h4>
                    <p className="text-sm text-gray-600">Member since {store.joinedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(store.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm ml-1">{store.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="font-semibold">{store.products}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="font-semibold">{store.responseTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">On-Time Delivery</p>
                  <p className="font-semibold">{store.onTimeDelivery}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-sm">{store.categories.join(', ')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {store.certifications.map((cert: any, index: number) => (
                  <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {cert}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewSupplierProfile(store.name)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  title="View Supplier Profile"
                >
                  Visit Store
                </button>
                <button
                  onClick={() => handleViewSupplierProfile(store.name)}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                  title="Contact Supplier"
                >
                  Contact Supplier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Top Suppliers by Category</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { category: 'Electronics', suppliers: 45 },
              { category: 'Raw Materials', suppliers: 38 },
              { category: 'Components', suppliers: 32 },
              { category: 'Chemicals', suppliers: 28 },
              { category: 'Machinery', suppliers: 24 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="suppliers" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Supplier Rating Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={[
                  { name: '4.5-5.0', value: 45, color: '#10B981' },
                  { name: '4.0-4.5', value: 32, color: '#3B82F6' },
                  { name: '3.5-4.0', value: 18, color: '#F59E0B' },
                  { name: '< 3.5', value: 5, color: '#EF4444' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { color: '#10B981' },
                  { color: '#3B82F6' },
                  { color: '#F59E0B' },
                  { color: '#EF4444' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-3">
      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="h-8 w-8 text-blue-500" />
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <p className="text-2xl font-bold">23</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Truck className="h-8 w-8 text-green-500" />
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-bold">7</p>
          <p className="text-sm text-gray-600">In Transit</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold">$125,430</p>
          <p className="text-sm text-gray-600">Order Value</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <span className="text-sm text-gray-500">Savings</span>
          </div>
          <p className="text-2xl font-bold">$8,750</p>
          <p className="text-sm text-gray-600">This Month</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button className="text-blue-600 hover:text-blue-800">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Supplier</th>
                <th className="text-left py-2">Items</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Rating</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{order.id}</td>
                  <td className="py-2">{order.date}</td>
                  <td className="py-2">{order.supplier}</td>
                  <td className="py-2">{order.items} items</td>
                  <td className="py-2">${order.total.toLocaleString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">
                    {order.rating ? (
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Rate
                      </button>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Download className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Order Trends</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={[
              { month: 'Jul', orders: 18, value: 85000 },
              { month: 'Aug', orders: 22, value: 95000 },
              { month: 'Sep', orders: 19, value: 88000 },
              { month: 'Oct', orders: 25, value: 112000 },
              { month: 'Nov', orders: 28, value: 128000 },
              { month: 'Dec', orders: 23, value: 125430 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="value" stroke="#10B981" name="Value ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Category Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={[
                  { name: 'Electronics', value: 35, color: '#3B82F6' },
                  { name: 'Raw Materials', value: 28, color: '#10B981' },
                  { name: 'Components', value: 20, color: '#F59E0B' },
                  { name: 'Chemicals', value: 10, color: '#EF4444' },
                  { name: 'Other', value: 7, color: '#8B5CF6' }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { color: '#3B82F6' },
                  { color: '#10B981' },
                  { color: '#F59E0B' },
                  { color: '#EF4444' },
                  { color: '#8B5CF6' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { name: 'Electronics', value: 35, color: '#3B82F6' },
              { name: 'Raw Materials', value: 28, color: '#10B981' },
              { name: 'Components', value: 20, color: '#F59E0B' },
              { name: 'Chemicals', value: 10, color: '#EF4444' },
              { name: 'Other', value: 7, color: '#8B5CF6' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-3">
      {/* Trending Products */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Trending Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {trendingProducts.map((product, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-200 rounded-lg h-24 mb-2 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-gray-600">{product.orders} orders</p>
              <p className="text-xs text-green-600">+{product.growth}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marketplace Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Price Trends</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[
              { month: 'Jul', steel: 420, electronics: 1180, chemicals: 850 },
              { month: 'Aug', steel: 430, electronics: 1200, chemicals: 860 },
              { month: 'Sep', steel: 435, electronics: 1220, chemicals: 870 },
              { month: 'Oct', steel: 440, electronics: 1230, chemicals: 880 },
              { month: 'Nov', steel: 445, electronics: 1245, chemicals: 885 },
              { month: 'Dec', steel: 450, electronics: 1250, chemicals: 890 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="steel" stroke="#3B82F6" name="Steel ($/ton)" />
              <Line type="monotone" dataKey="electronics" stroke="#10B981" name="Electronics ($/unit)" />
              <Line type="monotone" dataKey="chemicals" stroke="#F59E0B" name="Chemicals ($/barrel)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Supplier Performance</h4>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={[
              { metric: 'Quality', value: 92 },
              { metric: 'Delivery', value: 88 },
              { metric: 'Price', value: 85 },
              { metric: 'Service', value: 90 },
              { metric: 'Flexibility', value: 87 },
              { metric: 'Innovation', value: 82 }
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Average Score" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Analysis */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Savings Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border rounded-lg p-3">
            <Tag className="h-8 w-8 text-green-500 mb-2" />
            <h4 className="font-semibold mb-2">Volume Discounts</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">$12,450</p>
            <p className="text-sm text-gray-600">Potential savings by consolidating orders</p>
          </div>
          <div className="border rounded-lg p-3">
            <Zap className="h-8 w-8 text-blue-500 mb-2" />
            <h4 className="font-semibold mb-2">Early Payment</h4>
            <p className="text-2xl font-bold text-blue-600 mb-1">$8,200</p>
            <p className="text-sm text-gray-600">Available discounts for early payment</p>
          </div>
          <div className="border rounded-lg p-3">
            <Globe className="h-8 w-8 text-purple-500 mb-2" />
            <h4 className="font-semibold mb-2">Alternative Suppliers</h4>
            <p className="text-2xl font-bold text-purple-600 mb-1">$15,300</p>
            <p className="text-sm text-gray-600">Savings from competitive pricing</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Plus = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  // Handler functions
  const handleBrowseCatalog = () => {
    console.log('Browsing catalog...');
    alert(`Browse Product Catalog\n\nCategories Available:\n• Raw Materials (${Math.floor(Math.random() * 500 + 200)} items)\n• Electronic Components (${Math.floor(Math.random() * 300 + 150)} items)\n• Office Supplies (${Math.floor(Math.random() * 400 + 100)} items)\n• Industrial Equipment (${Math.floor(Math.random() * 200 + 50)} items)\n• IT Hardware (${Math.floor(Math.random() * 250 + 80)} items)\n\nFilters:\n☐ Price range: $[____] to $[____]\n☐ Supplier rating: ⭐ 4+ only\n☐ Delivery time: Next day | 2-3 days | 1 week\n☐ Location: Local | Regional | Global\n☐ Certifications: ISO, RoHS, CE, etc.\n\nSort By:\n○ Relevance\n○ Price (Low to High)\n○ Price (High to Low)\n○ Rating\n○ Delivery Time\n\nView: [Grid] [List]`);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleCompareProducts = () => {
    console.log('Comparing products...');
    alert(`Compare Products\n\nSelect 2-4 products to compare:\n\nComparison Criteria:\n☑ Price\n☑ Supplier rating\n☑ Delivery time\n☑ Specifications\n☑ Certifications\n☑ Warranty terms\n☑ Payment terms\n☑ Volume discounts\n\nCurrently Selected: 0 products\n\nClick products in catalog to add to comparison.\nThen click 'Compare' to see side-by-side view.\n\nComparison Table Format:\nFeature | Product A | Product B | Product C\nPrice   | $X       | $Y       | $Z\nRating  | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐\n...`);
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      alert('Your cart is empty. Add products before placing an order.');
      return;
    }
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? item.minOrder ?? 1),
      0,
    );
    const proceed = window.confirm(
      `Place Order\n\nItems: ${cartItems.length}\nSubtotal: $${subtotal.toFixed(2)}\n\nThis creates a Purchase Requisition from your cart. Continue?`,
    );
    if (!proceed) return;
    try {
      const pr = await procurementPagesService.placeMarketplaceOrder(cartItems, {
        purpose: 'E-Marketplace cart checkout',
      });
      const prNumber = pr?.prNumber ?? pr?.data?.prNumber ?? pr?.id ?? 'created';
      setCartItems([]);
      alert(`Order placed. Purchase Requisition ${prNumber} created.`);
    } catch (err: any) {
      alert(`Failed to place order: ${err?.message ?? 'Unknown error'}`);
    }
  };

  const handleTrackDelivery = () => {
    console.log('Tracking delivery...');
    alert(`Track Delivery\n\nRecent Orders:\n\nOrder #${Math.floor(Math.random() * 10000)}:\n• Status: In Transit\n• Shipped: 2 days ago\n• Expected: Tomorrow\n• Carrier: FedEx\n• Tracking: ${Math.floor(Math.random() * 1e12)}\n• Location: Distribution Center (150 mi away)\n\nOrder #${Math.floor(Math.random() * 10000)}:\n• Status: Delivered\n• Delivered: Yesterday, 2:45 PM\n• Received by: Receiving Dept\n• POD: Signed\n\nOrder #${Math.floor(Math.random() * 10000)}:\n• Status: Preparing for Shipment\n• Ordered: 3 days ago\n• Expected Ship: Today\n\nTracking Options:\n[View Map] [Contact Carrier] [Report Issue]\n[Delivery Notifications] [Proof of Delivery]`);
  };

  const handleViewProductDetails = (product: any) => {
    console.log('Viewing product details:', product);
    alert(`Product Details\n\n${product?.name || 'Product Name'}\nSKU: ${product?.id || 'N/A'}\nCategory: ${product?.category || 'N/A'}\n\nPrice: $${product?.price || '0.00'} per ${product?.unit || 'unit'}\nMin Order: ${product?.minOrder || 1} ${product?.unit || 'units'}\n\nSupplier: ${product?.supplier || 'N/A'}\nRating: ${'⭐'.repeat(Math.floor(Math.random() * 2) + 3)}\nReviews: ${Math.floor(Math.random() * 500) + 50}\n\nAvailability: ${Math.random() > 0.3 ? 'In Stock ✓' : 'Out of Stock'}\nLead Time: ${Math.floor(Math.random() * 10) + 1} days\n\nSpecifications:\n• Weight: ${(Math.random() * 50).toFixed(1)} lbs\n• Dimensions: ${Math.floor(Math.random() * 20)}x${Math.floor(Math.random() * 20)}x${Math.floor(Math.random() * 20)} in\n• Material: [Product specific]\n• Certifications: ISO 9001, RoHS\n\nDocuments:\n☐ Datasheet\n☐ Safety Data Sheet (SDS)\n☐ Certification Documents\n☐ User Manual\n\n[Add to Cart] [Add to Favorites] [Share]`);
  };

  const handleManageCart = () => {
    console.log('Managing cart...');
    const itemCount = Math.floor(Math.random() * 8) + 1;
    alert(`Shopping Cart (${itemCount} items)\n\nCart Actions:\n\n1. Review Items:\n   • Edit quantities\n   • Remove items\n   • Save for later\n   • Add notes/specifications\n\n2. Apply Discounts:\n   • Volume discounts (auto-applied)\n   • Promotional codes: [Enter code]\n   • Contract pricing (if applicable)\n   • Bundle deals\n\n3. Split Cart:\n   • Ship to multiple locations\n   • Different delivery dates\n   • Separate POs by department\n\n4. Request Quotes:\n   • Get bulk pricing\n   • Negotiate terms\n   • Request alternatives\n\n5. Save & Share:\n   • Save cart for later\n   • Share with team for approval\n   • Export cart as list\n   • Create requisition from cart\n\nCurrent Total: $${(Math.random() * 10000 + 1000).toFixed(2)}\n\n[Proceed to Checkout] [Continue Shopping] [Clear Cart]`);
  };

  const handleSearchProducts = () => {
    console.log('Searching products...');
    alert(`Product Search\n\nSearch Options:\n\n1. KEYWORD SEARCH\n   [________________]\n   Examples: "steel pipes", "laptop i7", "safety gloves"\n\n2. ADVANCED SEARCH\n   Product Name: [________]\n   SKU/Part #: [________]\n   Category: [Select]\n   Supplier: [Select]\n   Price Range: $[___] to $[___]\n   Certifications: [Select]\n\n3. SMART SEARCH\n   • Search by image (upload photo)\n   • Search by specification\n   • Search similar products\n   • Search replacements/alternatives\n\n4. SAVED SEARCHES\n   • "Monthly office supplies"\n   • "Raw materials - steel"\n   • "IT equipment refresh"\n   [Create new saved search]\n\n5. RECENT SEARCHES\n   • ${['Industrial gloves', 'LED bulbs', 'Printer toner'][Math.floor(Math.random() * 3)]}\n   • ${['Safety equipment', 'Cleaning supplies', 'Cables'][Math.floor(Math.random() * 3)]}\n\nSearch Tips:\n• Use quotation marks for exact phrases\n• Use * as wildcard\n• Filter by "in stock" for immediate availability\n\n[Search] [Advanced] [Clear]`);
  };

  const handleViewSupplierProfile = (supplier: string) => {
    console.log('Viewing supplier profile:', supplier);
    alert(`Supplier Profile: ${supplier}\n\nOverview:\n• Rating: ${'⭐'.repeat(4)}${Math.random() > 0.5 ? '⭐' : ''}  (${(Math.random() * 2 + 3).toFixed(1)}/5)\n• Reviews: ${Math.floor(Math.random() * 500) + 100}\n• Products: ${Math.floor(Math.random() * 300) + 50}\n• Years in Business: ${Math.floor(Math.random() * 20) + 5}\n\nPerformance Metrics:\n• On-Time Delivery: ${Math.floor(Math.random() * 10) + 90}%\n• Quality Rating: ${Math.floor(Math.random() * 5) + 95}%\n• Response Time: <${Math.floor(Math.random() * 24) + 1} hours\n• Order Fulfillment: ${Math.floor(Math.random() * 5) + 95}%\n\nCertifications:\n✓ ISO 9001:2015\n✓ ISO 14001\n${Math.random() > 0.5 ? '✓ AS9100' : ''}\n${Math.random() > 0.5 ? '✓ IATF 16949' : ''}\n\nServices:\n• Custom Manufacturing\n• Just-in-Time Delivery\n• Technical Support\n• Volume Discounts\n• Consignment Inventory\n\nContact:\n• Email: sales@${supplier.toLowerCase().replace(/\s+/g, '')}.com\n• Phone: 1-800-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}\n• Website: www.${supplier.toLowerCase().replace(/\s+/g, '')}.com\n\n[Contact Supplier] [View All Products] [Add to Favorites]`);
  };

  const handleManageFavorites = () => {
    console.log('Managing favorites...');
    alert(`Favorites & Lists\n\nMy Lists:\n\n1. Frequently Ordered (${Math.floor(Math.random() * 20) + 10} items)\n   Quick reorder of common items\n   Last ordered: Last week\n\n2. Office Supplies Quarterly (${Math.floor(Math.random() * 15) + 5} items)\n   Recurring order list\n   Next order: In 2 weeks\n\n3. Manufacturing - Raw Materials (${Math.floor(Math.random() * 25) + 8} items)\n   Production materials\n   Last ordered: 3 days ago\n\n4. Wishlist - Equipment Upgrade (${Math.floor(Math.random() * 10) + 3} items)\n   Future purchases for budget planning\n\nList Actions:\n• Create new list\n• Share list with team\n• Set up auto-reorder\n• Export list to Excel\n• Convert list to requisition\n• Compare prices across lists\n\nFavorite Suppliers (${Math.floor(Math.random() * 10) + 5}):\n☆ Get notifications of new products\n☆ Receive special offers\n☆ Priority customer service\n\n[Create List] [Manage Suppliers] [Reorder from List]`);
  };

  const handleViewOrderHistory = () => {
    console.log('Viewing order history...');
    alert(`Order History\n\nFilters:\n• Date Range: [Last 90 days ▼]\n• Status: [All ▼]\n• Supplier: [All ▼]\n• Category: [All ▼]\n\nRecent Orders:\n\nPO-${Math.floor(Math.random() * 10000)}\n• Date: ${Math.floor(Math.random() * 30) + 1} days ago\n• Items: ${Math.floor(Math.random() * 10) + 1}\n• Total: $${(Math.random() * 5000 + 500).toFixed(2)}\n• Status: Delivered ✓\n• [View] [Reorder] [Return] [Invoice]\n\nPO-${Math.floor(Math.random() * 10000)}\n• Date: ${Math.floor(Math.random() * 60) + 30} days ago\n• Items: ${Math.floor(Math.random() * 5) + 1}\n• Total: $${(Math.random() * 3000 + 200).toFixed(2)}\n• Status: Delivered ✓\n• [View] [Reorder]\n\nOrder Statistics:\n• Total Orders (YTD): ${Math.floor(Math.random() * 100) + 50}\n• Total Spend (YTD): $${(Math.random() * 100000 + 50000).toFixed(2)}\n• Average Order Value: $${(Math.random() * 2000 + 500).toFixed(2)}\n• Most Ordered Category: ${['Office Supplies', 'Raw Materials', 'IT Equipment'][Math.floor(Math.random() * 3)]}\n\nQuick Actions:\n[Reorder Favorites] [Export History] [Generate Report]`);
  };

  const handleRefresh = () => {
    console.log('Refreshing marketplace data...');
    alert(`Refresh Marketplace\n\nSyncing data:\n✓ Product catalog (${Math.floor(Math.random() * 5000) + 1000} products)\n✓ Supplier information (${Math.floor(Math.random() * 100) + 50} suppliers)\n✓ Pricing updates\n✓ Availability status\n✓ Cart contents\n✓ Order status\n✓ Notifications\n\nLast Refresh: ${new Date(Date.now() - Math.random() * 600000).toLocaleTimeString()}\n\nNew Since Last Visit:\n• ${Math.floor(Math.random() * 20)} new products\n• ${Math.floor(Math.random() * 5)} price updates\n• ${Math.floor(Math.random() * 3)} new suppliers\n• ${Math.floor(Math.random() * 10)} special offers\n\n[Refresh Now]`);
  };

  const handleSettings = () => {
    console.log('Opening marketplace settings...');
    alert(`Marketplace Settings\n\n1. PREFERENCES\n   • Default delivery address\n   • Preferred suppliers\n   • Budget alerts\n   • Approval thresholds\n\n2. NOTIFICATIONS\n   ☑ New product alerts\n   ☑ Price changes\n   ☑ Order status updates\n   ☑ Delivery notifications\n   ☐ Special offers\n\n3. DISPLAY\n   • View: ${['Grid', 'List'][Math.floor(Math.random() * 2)]}\n   • Products per page: 24\n   • Currency: USD\n   • Language: English\n\n4. INTEGRATION\n   • ERP sync: Enabled\n   • Approval workflow: Active\n   • Budget check: Real-time\n\n5. PAYMENT\n   • Default: Corporate Account\n   • P-Card: Enabled\n   • Credit limit: $${Math.floor(Math.random() * 50000) + 10000}\n\n[Save Settings] [Reset Defaults]`);
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">E-Procurement Marketplace</h2>
            <p className="text-gray-600">Discover products, connect with suppliers, and manage orders</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBrowseCatalog}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              title="Browse Catalog"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Browse</span>
            </button>
            <button
              onClick={handleSearchProducts}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              title="Search Products"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
            <button
              onClick={handleManageCart}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Manage Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart ({cartItems.length})</span>
            </button>
            <button
              onClick={handleViewOrderHistory}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
              title="View Order History"
            >
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </button>
            <button
              onClick={handleManageFavorites}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Manage Favorites"
            >
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh Marketplace"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Marketplace Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['marketplace', 'suppliers', 'orders', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'marketplace' && renderMarketplace()}
      {activeTab === 'suppliers' && renderSuppliers()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default EProcurementMarketplace;