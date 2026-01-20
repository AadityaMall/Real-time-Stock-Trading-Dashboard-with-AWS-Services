'use client';

import { useEffect, useState, useMemo } from 'react';
import { StockCard } from '@/components/features/StockCard';
import { Loading } from '@/components/ui/loading';
import { getAllStockQuotes, subscribeToPriceUpdates } from '@/lib/mockData';
import type { StockQuote } from '@/lib/types';

type SortOption = 'name' | 'price' | 'change' | 'volume';
type FilterOption = 'all' | 'gainers' | 'losers';

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Initial load
    const initialStocks = getAllStockQuotes();
    setStocks(initialStocks);
    setIsLoading(false);

    // Subscribe to price updates for all stocks
    const unsubscribeFunctions = initialStocks.map((stock) =>
      subscribeToPriceUpdates(stock.symbol, (price) => {
        setStocks((prev) =>
          prev.map((s) =>
            s.symbol === stock.symbol ? { ...s, ...price } : s
          )
        );
      }, 3000)
    );

    return () => {
      unsubscribeFunctions.forEach((unsub) => unsub());
    };
  }, []);

  // Filter and sort stocks
  const filteredAndSortedStocks = useMemo(() => {
    let result = [...stocks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query) ||
          stock.sector?.toLowerCase().includes(query)
      );
    }

    // Apply gainers/losers filter
    if (filterBy === 'gainers') {
      result = result.filter((stock) => stock.changePercent >= 0);
    } else if (filterBy === 'losers') {
      result = result.filter((stock) => stock.changePercent < 0);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.symbol.localeCompare(b.symbol);
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.changePercent - a.changePercent;
        case 'volume':
          return b.volume - a.volume;
        default:
          return 0;
      }
    });

    return result;
  }, [stocks, searchQuery, sortBy, filterBy]);

  // Calculate market stats
  const marketStats = useMemo(() => {
    const gainers = stocks.filter((s) => s.changePercent >= 0).length;
    const losers = stocks.filter((s) => s.changePercent < 0).length;
    const avgChange = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length || 0;
    return { gainers, losers, avgChange, total: stocks.length };
  }, [stocks]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* Page Header */}
        <div className="relative mb-8 sm:mb-12 pt-8 sm:pt-12">
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="text-center mb-8">
            {/* Accent line */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 sm:w-16 bg-linear-to-r from-transparent to-blue-400/50" />
              <span className="text-xs uppercase tracking-[0.25em] text-blue-400/70 font-medium">
                Market Overview
              </span>
              <div className="h-px w-12 sm:w-16 bg-linear-to-l from-transparent to-blue-400/50" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
              <span className="bg-linear-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                All Stocks
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              Track real-time prices, discover opportunities, and make informed decisions
            </p>
          </div>

          {/* Market Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 p-4">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Stocks</div>
              <div className="text-2xl font-bold text-white">{marketStats.total}</div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
            </div>
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 p-4">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Gainers</div>
              <div className="text-2xl font-bold text-emerald-400">{marketStats.gainers}</div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
            </div>
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 p-4">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Losers</div>
              <div className="text-2xl font-bold text-red-400">{marketStats.losers}</div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl" />
            </div>
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 p-4">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Avg Change</div>
              <div className={`text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
              </div>
              <div className={`absolute -right-4 -bottom-4 w-16 h-16 ${marketStats.avgChange >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-full blur-xl`} />
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 border border-gray-800/50 backdrop-blur-xl p-4 sm:p-6">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            <div className="relative space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by symbol, name, or sector..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-950/60 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm sm:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                {/* Left side - Filter buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-950/50 border border-gray-800/50">
                    {(['all', 'gainers', 'losers'] as FilterOption[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFilterBy(filter)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-200 ${
                          filterBy === filter
                            ? filter === 'gainers'
                              ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                              : filter === 'losers'
                              ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                              : 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none px-4 py-2 pr-8 rounded-lg bg-gray-950/50 border border-gray-800/50 text-xs font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer hover:border-gray-700 transition-colors"
                    >
                      <option value="name">Sort: A-Z</option>
                      <option value="price">Sort: Price</option>
                      <option value="change">Sort: Change %</option>
                      <option value="volume">Sort: Volume</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right side - View toggle and results count */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Showing <span className="text-gray-300 font-medium">{filteredAndSortedStocks.length}</span> stocks
                  </span>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-950/50 border border-gray-800/50">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                      title="Grid view"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                      title="List view"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stocks Display */}
        {filteredAndSortedStocks.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl" />
              <svg className="relative w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No stocks found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
              className="mt-6 px-6 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredAndSortedStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} showDetails />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/50">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-gray-900/80 border-b border-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div>Stock</div>
              <div className="text-right">Price</div>
              <div className="text-right">Change</div>
              <div className="text-right">Volume</div>
              <div className="text-right">Exchange</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800/30">
              {filteredAndSortedStocks.map((stock) => (
                <StockListItem key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs text-gray-600">
            Prices update in real-time • Data refreshes every 3 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

// Stock List Item Component for List View
function StockListItem({ stock }: { stock: StockQuote }) {
  const isPositive = stock.changePercent >= 0;

  return (
    <a
      href={`/stock/${stock.symbol}`}
      className="group flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-800/30 transition-colors duration-200"
    >
      {/* Stock Info */}
      <div className="flex items-center gap-3">
        <div className={`w-1 h-10 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <div className="min-w-0">
          <div className="font-semibold text-white truncate">{stock.symbol}</div>
          <div className="text-xs text-gray-500 truncate">{stock.name}</div>
        </div>
      </div>

      {/* Mobile: Price and Change inline */}
      <div className="flex sm:hidden items-center justify-between pl-4">
        <div>
          <div className="text-white font-semibold">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500">{stock.exchange}</div>
        </div>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold ${
          isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          <svg className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
          {Math.abs(stock.changePercent).toFixed(2)}%
        </div>
      </div>

      {/* Desktop: Separate columns */}
      <div className="hidden sm:flex items-center justify-end">
        <span className="text-white font-medium">
          ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="hidden sm:flex items-center justify-end">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
          isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          <svg className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </span>
      </div>

      <div className="hidden sm:flex items-center justify-end">
        <span className="text-gray-400 text-sm">
          {(stock.volume / 1000000).toFixed(2)}M
        </span>
      </div>

      <div className="hidden sm:flex items-center justify-end">
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
          stock.exchange === 'NASDAQ' 
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {stock.exchange}
        </span>
      </div>
    </a>
  );
}
