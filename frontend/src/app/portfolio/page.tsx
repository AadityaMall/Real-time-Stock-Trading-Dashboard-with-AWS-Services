'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { formatRupee } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { generateMockPortfolio } from '@/lib/mockData';
import type { Portfolio, Holding } from '@/types';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    const loadPortfolio = () => {
      const mockPortfolio = generateMockPortfolio();
      setPortfolio(mockPortfolio);
    };

    loadPortfolio();
    const interval = setInterval(loadPortfolio, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!portfolio) {
    return <Loading />;
  }

  const totalProfitLoss = portfolio.totalProfitLoss;
  const isPositive = totalProfitLoss >= 0;

  // Calculate allocation percentages
  const holdingsWithAllocation = portfolio.holdings.map((holding) => ({
    ...holding,
    allocationPercent:
      (holding.currentValue / portfolio.totalInvested) * 100,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <h1 className="mb-4 sm:mb-6 lg:mb-8 text-2xl sm:text-3xl font-bold text-white">Portfolio</h1>

        {/* Portfolio Summary Cards */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="transition-transform duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatRupee(portfolio.totalValue)}
              </div>
            </CardContent>
          </Card>

          <Card className="transition-transform duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                Cash Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatRupee(portfolio.cashBalance)}
              </div>
            </CardContent>
          </Card>

          <Card className="transition-transform duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                Total Invested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatRupee(portfolio.totalInvested)}
              </div>
            </CardContent>
          </Card>

          <Card className="transition-transform duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                Total P/L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl sm:text-2xl font-bold flex items-center gap-1 ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{isPositive ? '+' : ''}{formatRupee(totalProfitLoss)}</span>
              </div>
              <div
                className={`text-xs sm:text-sm font-medium mt-1 ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {portfolio.totalProfitLossPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card className="mb-6 sm:mb-8 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Holdings</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Symbol</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Qty</TableHead>
                    <TableHead className="hidden lg:table-cell text-right text-xs sm:text-sm">Avg. Price</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Price</TableHead>
                    <TableHead className="hidden md:table-cell text-right text-xs sm:text-sm">Cost</TableHead>
                    <TableHead className="hidden md:table-cell text-right text-xs sm:text-sm">Value</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">P/L</TableHead>
                    <TableHead className="hidden lg:table-cell text-right text-xs sm:text-sm">Alloc.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdingsWithAllocation.map((holding) => {
                    const isHoldingPositive = holding.profitLoss >= 0;
                    return (
                      <TableRow key={holding.symbol}>
                        <TableCell className="text-xs sm:text-sm">
                          <Link
                            href={`/stock/${holding.symbol}`}
                            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {holding.symbol}
                          </Link>
                          <div className="sm:hidden text-[10px] text-gray-500 mt-0.5">{holding.stockName}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm text-gray-400">
                          {holding.stockName}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm text-white font-medium">
                          {holding.quantity}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right text-xs sm:text-sm text-gray-300">
                          {formatRupee(holding.averagePrice)}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm text-white font-medium">
                          {formatRupee(holding.currentPrice)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right text-xs sm:text-sm text-gray-300">
                          {formatRupee(holding.totalCost)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right text-xs sm:text-sm text-white font-medium">
                          {formatRupee(holding.currentValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`text-xs sm:text-sm font-semibold flex items-center justify-end gap-1 ${
                              isHoldingPositive ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            <span>{isHoldingPositive ? '↑' : '↓'}</span>
                            <span>{isHoldingPositive ? '+' : ''}{formatRupee(holding.profitLoss)}</span>
                          </div>
                          <div
                            className={`text-[10px] sm:text-xs mt-0.5 ${
                              isHoldingPositive ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {isHoldingPositive ? '+' : ''}
                            {holding.profitLossPercent.toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right">
                          <Badge variant="info" className="text-[10px] sm:text-xs">
                            {holding.allocationPercent.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Allocation Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {holdingsWithAllocation.map((holding) => {
                const isHoldingPositive = holding.profitLoss >= 0;
                return (
                  <div key={holding.symbol}>
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {holding.symbol}
                        </span>
                        <Badge
                          variant={isHoldingPositive ? 'success' : 'danger'}
                          className="text-[10px] sm:text-xs"
                        >
                          {isHoldingPositive ? '+' : ''}
                          {holding.profitLossPercent.toFixed(2)}%
                        </Badge>
                      </div>
                      <span className="text-gray-400">
                        {holding.allocationPercent.toFixed(1)}% • {formatRupee(holding.currentValue)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isHoldingPositive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${holding.allocationPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
