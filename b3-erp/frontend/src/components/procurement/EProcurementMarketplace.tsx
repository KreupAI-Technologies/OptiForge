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

  // Marketplace products (loaded from backend getMarketplaceInsights().products)
  const [marketplaceProducts, setMarketplaceProducts] = useState<Array<{
    id: string;
    name: string;
    supplier: string;
    category: string;
    price: number;
    unit: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    leadTime: string;
    minOrder: number;
    discount: number;
    certifications: string[];
    description: string;
    image?: string;
    ordered?: number;
  }>>([]);

  // Categories (loaded from backend getMarketplaceInsights().categories)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number }>>([]);

  // Supplier stores (connected suppliers) loaded from backend
  const [supplierStores, setSupplierStores] = useState<any[]>([]);

  const loadMarketplaceInsights = React.useCallback(async () => {
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
      setMarketplaceProducts(Array.isArray(data?.products) ? data.products : []);
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
      setRecentOrders(Array.isArray(data?.recentOrders) ? data.recentOrders : []);
      setTrendingProducts(Array.isArray(data?.trendingProducts) ? data.trendingProducts : []);
    } catch (err) {
      console.error('Failed to load marketplace insights', err);
    }
  }, []);

  useEffect(() => {
    void loadMarketplaceInsights();
  }, [loadMarketplaceInsights]);

  // Recent orders (loaded from backend getMarketplaceInsights().recentOrders)
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string;
    date: string;
    supplier: string;
    items: number;
    total: number;
    status: string;
    rating: number;
  }>>([]);

  // Trending products (loaded from backend getMarketplaceInsights().trendingProducts)
  const [trendingProducts, setTrendingProducts] = useState<Array<{
    name: string;
    growth: number;
    orders: number;
  }>>([]);

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
                disabled
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Compare Products — not yet available"
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
    setActiveTab('marketplace');
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleCompareProducts = () => {
    // No product-comparison feature or backend is available yet.
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
    setActiveTab('orders');
  };

  const handleViewProductDetails = (product: any) => {
    // No product-detail modal or backend endpoint exists; keep the user on the catalog.
    setActiveTab('marketplace');
  };

  const handleManageCart = () => {
    // Cart contents surface in the Orders tab; there is no dedicated cart tab.
    setActiveTab('orders');
  };

  const handleSearchProducts = () => {
    // The search box in the marketplace tab already filters live via searchTerm.
    setActiveTab('marketplace');
  };

  const handleViewSupplierProfile = (supplier: string) => {
    setActiveTab('suppliers');
  };

  const handleManageFavorites = () => {
    // No favorites/lists feature or backend is available yet.
  };

  const handleViewOrderHistory = () => {
    setActiveTab('orders');
  };

  const handleRefresh = () => {
    void loadMarketplaceInsights();
  };

  const handleSettings = () => {
    // No settings panel or backend is available yet.
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
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Manage Favorites — not yet available"
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