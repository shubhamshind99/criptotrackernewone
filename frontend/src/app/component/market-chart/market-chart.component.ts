import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { interval, Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

declare var TradingView: any;

interface Trade {
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  date: Date;
  status?: 'executed' | 'cancelled' | 'pending';
  note?: string;
}

interface UserTradeData {
  balance: number;
  holdings: Record<string, number>;
  purchasePrice: Record<string, number>;
  tradeHistory: Trade[];
}

@Component({
  selector: 'app-market-chart',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './market-chart.component.html',
  styleUrls: ['./market-chart.component.css']
})
export class MarketChartComponent implements OnInit, AfterViewInit, OnDestroy {
  coinSymbol?: string;
  coinName?: string;
  demoBalance = 10000;
  holdings: Record<string, number> = {};
  purchasePrice: Record<string, number> = {};
  tradeAmount = 0;
  currentPrice = 50;
  uid: string | null = null;
  currentProfitOrLoss = 0;
  tradeHistory: Trade[] = [];
  tradeFilter = '';
  sortField: keyof Trade | '' = '';
  currentPage = 1;
  tradesPerPage = 5;

  private priceSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    let userReady = false;
    let paramsReady = false;

    this.route.queryParams.subscribe(params => {
      this.coinSymbol = params['symbol'];
      this.coinName = params['name'];
      paramsReady = true;

      if (userReady && this.coinSymbol) {
        this.loadUserData();
        this.loadTradingViewChart();
      }
    });

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.uid = user.uid;
        userReady = true;

        if (paramsReady && this.coinSymbol) {
          this.loadUserData();
          this.loadTradingViewChart();
        }
      }
    });

    this.priceSubscription = interval(5000).subscribe(() => {
      this.updateCurrentPrice();
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.coinSymbol) {
      this.loadTradingViewChart();
    }
  }

  ngOnDestroy(): void {
    this.priceSubscription?.unsubscribe();
  }

  loadTradingViewChart(): void {
    if (!this.coinSymbol || !isPlatformBrowser(this.platformId)) return;

    const tvScriptId = 'tradingview-widget-script';
    if (!document.getElementById(tvScriptId)) {
      const script = document.createElement('script');
      script.id = tvScriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => this.createWidget();
      document.body.appendChild(script);
    } else {
      this.createWidget();
    }
  }

  private createWidget(): void {
    new TradingView.widget({
      width: '100%',
      height: '100%',
      symbol: this.coinSymbol!,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      hide_side_toolbar: false,
      hotlist: true,
      details: true,
      show_popup_button: true,
      allow_symbol_change: true,
      container_id: 'tradingview-chart'
    });
  }

  updateCurrentPrice(): void {
    const delta = +(Math.random() * 10 - 5).toFixed(2);
    this.currentPrice = Math.max(1, +(this.currentPrice + delta).toFixed(2));
    this.calculateProfitOrLoss();
    this.cdRef.markForCheck(); // triggers UI update
  }

  calculateProfitOrLoss(): void {
    const amount = this.holdings[this.coinSymbol!] || 0;
    const buyPrice = this.purchasePrice[this.coinSymbol!] ?? this.currentPrice;
    this.currentProfitOrLoss = amount * (this.currentPrice - buyPrice);
  }

  loadUserData(): void {
    if (!this.uid) return;

    this.firestore
      .collection<UserTradeData>('users')
      .doc(this.uid)
      .valueChanges()
      .subscribe(data => {
        if (data) {
          this.demoBalance = data.balance ?? this.demoBalance;
          this.holdings = data.holdings ?? {};
          this.purchasePrice = data.purchasePrice ?? {};
          this.tradeHistory = (data.tradeHistory ?? []).map(trade => ({
            ...trade,
            date: this.convertToDate(trade.date)
          }));

          this.calculateProfitOrLoss();
          this.cdRef.markForCheck(); // refresh data on fetch
        }
      });
  }

  convertToDate(input: any): Date {
    if (input instanceof Timestamp) return input.toDate();
    if (input instanceof Date) return input;
    if (input?.seconds) return new Timestamp(input.seconds, input.nanoseconds || 0).toDate();
    return new Date(input);
  }

  saveUserData(): void {
    if (!this.uid) return;

    this.firestore.collection('users').doc(this.uid).set({
      balance: this.demoBalance,
      holdings: this.holdings,
      purchasePrice: this.purchasePrice,
      tradeHistory: this.tradeHistory
    }, { merge: true });
  }

  executeTrade(type: 'buy' | 'sell'): void {
  if (!this.tradeAmount || this.tradeAmount <= 0 || !this.coinSymbol) {
    alert('Please enter a valid amount');
    return;
  }

  const total = this.tradeAmount * this.currentPrice;

  if (type === 'buy') {
    if (this.demoBalance >= total) {
      // Deduct balance
      this.demoBalance -= total;

      const oldAmount = this.holdings[this.coinSymbol] || 0;
      const oldBuyPrice = this.purchasePrice[this.coinSymbol] || 0;

      // Update holdings
      const newAmount = oldAmount + this.tradeAmount;
      this.holdings[this.coinSymbol] = newAmount;

      // Weighted average price calculation
      const newAvgBuyPrice =
        ((oldAmount * oldBuyPrice) + (this.tradeAmount * this.currentPrice)) / newAmount;

      this.purchasePrice[this.coinSymbol] = newAvgBuyPrice;

      // Record the trade
      this.finalizeTrade('buy', this.tradeAmount, this.currentPrice, total);
      alert(`✅ Bought ${this.tradeAmount} ${this.coinSymbol} for ${this.formatUSD(total)}`);
    } else {
      alert('❌ Insufficient balance.');
    }
  } else {
    const holding = this.holdings[this.coinSymbol] || 0;
    if (holding >= this.tradeAmount) {
      this.demoBalance += total;
      this.holdings[this.coinSymbol] -= this.tradeAmount;

      this.finalizeTrade('sell', this.tradeAmount, this.currentPrice, total);

      const pnl =
        (this.currentPrice - (this.purchasePrice[this.coinSymbol] ?? 0)) * this.tradeAmount;
      const result = pnl >= 0 ? 'profit' : 'loss';

      alert(
        `✅ Sold ${this.tradeAmount} ${this.coinSymbol} for ${this.formatUSD(
          total
        )} with a ${result} of ${this.formatUSD(Math.abs(pnl))}`
      );
    } else {
      alert('❌ Not enough holdings.');
    }
  }

  this.calculateProfitOrLoss();
}


  finalizeTrade(type: 'buy' | 'sell', amount: number, price: number, total: number): void {
    const trade: Trade = {
      type, amount, price, total, date: new Date(), status: 'executed', note: ''
    };
    this.tradeHistory.unshift(trade);
    this.saveUserData();
  }

  performTrade(): void {
    alert('Trade Submitted!');
  }

  formatUSD(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  deleteTrade(index: number): void {
    if (confirm('Delete this trade?')) {
      this.tradeHistory.splice(index, 1);
      this.saveUserData();
      this.calculateProfitOrLoss();
    }
  }

  calculateTradePL(trade: Trade): number {
    return (this.currentPrice - trade.price) * trade.amount;
  }

  getTradeClass(trade: Trade): string {
    const pl = this.calculateTradePL(trade);
    return pl >= 0 ? 'profit' : 'loss';
  }

  exportHistory(): void {
    const rows = [
      ['Type', 'Amount', 'Price', 'Total', 'Date', 'Note'],
      ...this.tradeHistory.map(t => [
        t.type, t.amount, t.price, t.total,
        t.date.toLocaleString(), t.note || ''
      ])
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trade-history.csv';
    a.click();
  }

  get filteredHistory(): Trade[] {
    let trades = [...this.tradeHistory];
    if (this.tradeFilter) trades = trades.filter(t => t.type === this.tradeFilter);

    if (this.sortField) {
      const sortKey = this.sortField as keyof Trade;
      trades.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return valB - valA;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          return valB.localeCompare(valA);
        } else if (valA instanceof Date && valB instanceof Date) {
          return valB.getTime() - valA.getTime();
        }
        return 0;
      });
    }

    return trades.slice((this.currentPage - 1) * this.tradesPerPage, this.currentPage * this.tradesPerPage);
  }

  totalPages(): number {
    const total = this.tradeFilter
      ? this.tradeHistory.filter(t => t.type === this.tradeFilter).length
      : this.tradeHistory.length;
    return Math.ceil(total / this.tradesPerPage);
  }
}
