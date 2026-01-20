'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getMarketSummary, getAllStockQuotes } from '@/lib/mockData';
import type { StockQuote, MarketIndex } from '@/types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const marketSummary = getMarketSummary();
  const allStocks = getAllStockQuotes();
  const trendingStocks = allStocks
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 6);

  const filteredStocks = searchQuery
    ? allStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex justify-center pt-30 bg-linear-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        {/* Hero glow effect */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full -z-10" />
        
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-950/50 border border-teal-800/30 mb-6">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse-teal" />
            <span className="text-sm font-medium text-teal-400">Live Market Data</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-100 mb-6 leading-tight">
            Invest in Stocks,{' '}
            <span className="gradient-text-teal">
              Grow Your Wealth
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Start your investment journey with zero brokerage. Trade stocks, IPOs, futures, and options all in one place.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
            >
              Start Trading Now
            </Link>
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 border border-teal-500/30 text-teal-400 font-semibold rounded-xl hover:bg-teal-500/10 hover:border-teal-400/50 transition-all duration-300"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {[
            { label: 'Stocks', href: '/dashboard', icon: '📈' },
            { label: 'IPOs', href: '/ipos', icon: '🚀' },
            { label: 'Futures', href: '/futures', icon: '⚡' },
            { label: 'Options', href: '/options', icon: '🎯' },
            { label: 'Mutual Funds', href: '/mutual-funds', icon: '💼' },
            { label: 'Gold', href: '/gold', icon: '🥇' },
          ].map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="group px-5 py-3 bg-[#0d1414]/80 border border-teal-900/30 rounded-xl hover:border-teal-500/50 hover:bg-teal-950/30 transition-all duration-300 flex items-center gap-3"
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium text-slate-300 group-hover:text-teal-400 transition-colors">
                {category.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search stocks, ETFs, or mutual funds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-lg border border-teal-900/40 rounded-2xl focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all bg-[#0d1414]/80 text-slate-100 placeholder-slate-500"
            />
            {searchQuery && filteredStocks.length > 0 && (
              <div className="absolute z-10 w-full mt-3 bg-[#0d1414] border border-teal-900/40 rounded-2xl shadow-2xl shadow-black/50 max-h-96 overflow-y-auto">
                {filteredStocks.slice(0, 10).map((stock) => (
                  <Link
                    key={stock.symbol}
                    href={`/stock/${stock.symbol}`}
                    className="flex items-center justify-between p-4 hover:bg-teal-950/30 transition-colors border-b border-teal-900/20 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">{stock.symbol}</div>
                      <div className="text-sm text-slate-400">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-100">₹{stock.price.toFixed(2)}</div>
                      <div
                        className={`text-sm font-medium ${
                          stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16">
          {marketSummary.indices.map((index: MarketIndex) => (
            <div
              key={index.symbol}
              className="relative group bg-[#0d1414]/80 border border-teal-900/30 rounded-2xl p-6 hover:border-teal-700/50 transition-all duration-300 card-glow overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="text-sm font-medium text-slate-400 mb-1">{index.name}</div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
                  {index.value.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold flex items-center gap-1 ${
                      index.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    <span>{index.changePercent >= 0 ? '↑' : '↓'}</span>
                    {index.changePercent >= 0 ? '+' : ''}
                    {index.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-sm text-slate-500">
                    ({index.change >= 0 ? '+' : ''}
                    {index.change.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Stocks */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Trending Stocks</h2>
              <p className="text-slate-400 mt-1">Most active stocks today</p>
            </div>
            <Link
              href="/dashboard"
              className="text-teal-400 hover:text-teal-300 font-semibold text-sm sm:text-base flex items-center gap-2 group"
            >
              View All 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trendingStocks.map((stock: StockQuote) => (
              <Link
                key={stock.symbol}
                href={`/stock/${stock.symbol}`}
                className="group relative bg-[#0d1414]/80 border border-teal-900/30 rounded-2xl p-6 hover:border-teal-600/50 transition-all duration-300 card-glow overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg text-slate-100 group-hover:text-teal-400 transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-sm text-slate-400 line-clamp-1">{stock.name}</div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium bg-teal-950/50 text-teal-400 border border-teal-800/30 rounded-lg">
                      {stock.exchange}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-bold text-2xl text-slate-100">
                        ₹{stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm font-semibold flex items-center gap-1 mt-1 ${
                          stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        <span>{stock.changePercent >= 0 ? '↑' : '↓'}</span>
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>Vol: {(stock.volume / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Real-time Data',
              description: 'Get instant price updates and live market feeds for informed decisions.'
            },
            {
              icon: '🔒',
              title: 'Secure Trading',
              description: 'Bank-grade security with end-to-end encryption for your investments.'
            },
            {
              icon: '📊',
              title: 'Advanced Analytics',
              description: 'Powerful charts and AI-driven insights to optimize your portfolio.'
            }
          ].map((feature, idx) => (
            <div key={idx} className="text-center p-8 rounded-2xl bg-[#0d1414]/50 border border-teal-900/20">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
