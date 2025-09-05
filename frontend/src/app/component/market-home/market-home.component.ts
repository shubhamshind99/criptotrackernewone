import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

@Component({
  selector: 'app-market-home',
  templateUrl: './market-home.component.html',
  styleUrls: ['./market-home.component.css']
})
export class MarketHomeComponent implements OnInit {
  itemsPerPage: number = 10;
  currentPage: number = 1;
  cryptoData: CryptoData[] = [];
  isBrowser: boolean;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

   ngOnInit(): void {
    if (this.isBrowser) {
      this.fetchCryptoData();
      this.loadTradingViewWidget();
    }
  }
  loadTradingViewWidget() {
    throw new Error('Method not implemented.');
  }

  async fetchCryptoData(): Promise<void> {
    this.showLoader(true);
    try {
      const response = await fetch('http://localhost:3000/crypto');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data found');
      }

      this.cryptoData = data;
      this.displayPage(this.currentPage);
      this.setupPagination();
    } catch (error) {
      console.error('Error fetching cryptocurrency data:', error);
    } finally {
      this.showLoader(false);
    }
  }

  displayPage(page: number): void {
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageData = this.cryptoData.slice(start, end);

    const cryptoList = document.getElementById('crypto-list');
    if (cryptoList) {
      cryptoList.innerHTML = '';

      pageData.forEach((coin, index) => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'green' : 'red';

        const row = document.createElement('tr');
        row.classList.add('table-row');
        row.innerHTML = `
          <div class="wrapper">
            <button class="add-to-fav" aria-label="Add to favourite" data-add-to-fav>
              <i class="fa-regular fa-star"></i>
              <i class="fa-solid fa-star" style="display: none;"></i>
            </button>
            <td><span class="rank">${start + index + 1}</span></td>
            <td class="name">
              <img src="${coin.image}" width="20" height="20" alt="${coin.name} logo" class="logo">
              <h3>
                <a class="coin-name" href="#" data-coin-id="${coin.id}" data-symbol="${coin.symbol.toUpperCase()}USDT" data-name="${coin.name}">${coin.name} <span class="span">${coin.symbol.toUpperCase()}</span></a>
              </h3>
            </td>
            <td class="last-p"><span class="last-price">${coin.current_price.toFixed(2)}</span></td>
            <span id="last-update" class="last-update ${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</span>
            <span class="market-cap">${(coin.market_cap / 1e6).toFixed(2)}M</span>
            <img src="image (31).png" width="100" height="40" alt="profit/loss chart" class="chart">
            <button class="trade">Trade</button>
          </div>
        `;
        cryptoList.appendChild(row);
      });

      // Add event listeners for favorite functionality
      document.querySelectorAll('.add-to-fav').forEach(button => {
        button.addEventListener('click', (event) => {
          const btn = event.currentTarget as HTMLButtonElement;
          btn.classList.toggle('filled');
      
          const regularStar = btn.querySelector('.fa-regular.fa-star') as HTMLElement;
          const solidStar = btn.querySelector('.fa-solid.fa-star') as HTMLElement;
          regularStar.style.display = btn.classList.contains('filled') ? 'none' : 'inline';
          solidStar.style.display = btn.classList.contains('filled') ? 'inline' : 'none';
        });
      });

      // Use Angular routing for navigation
      document.querySelectorAll('.coin-name').forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          const coinSymbol = link.getAttribute('data-symbol');
          const coinName = link.getAttribute('data-name');
          this.router.navigate(['/market-chart'], { queryParams: { symbol: coinSymbol, name: coinName } });
        });
      });
    }
  }

  setupPagination(): void {
    const pageCount = Math.ceil(this.cryptoData.length / this.itemsPerPage);
    const pagination = document.getElementById('pagination');
    if (pagination) {
      pagination.innerHTML = '';

      const createButton = (text: string | number, page: number, active: boolean = false, disabled: boolean = false): HTMLButtonElement => {
        const button = document.createElement('button');
        button.textContent = text.toString();
        if (active) button.classList.add('active');
        if (disabled) button.classList.add('disabled');
        button.addEventListener('click', () => {
          if (!disabled) {
            this.currentPage = page;
            this.displayPage(this.currentPage);
            this.setupPagination();
          }
        });
        return button;
      };

      if (this.currentPage > 1) {
        pagination.appendChild(createButton('<', this.currentPage - 1));
      } else {
        pagination.appendChild(createButton('<', this.currentPage - 1, false, true));
      }

      if (pageCount <= 10) {
        for (let i = 1; i <= pageCount; i++) {
          pagination.appendChild(createButton(i, i, i === this.currentPage));
        }
      } else {
        pagination.appendChild(createButton(1, 1, 1 === this.currentPage));
        if (this.currentPage > 4) {
          const ellipsisStart = document.createElement('span');
          ellipsisStart.textContent = '...';
          ellipsisStart.classList.add('ellipsis');
          pagination.appendChild(ellipsisStart);
        }

        const startPage = Math.max(2, this.currentPage - 2);
        const endPage = Math.min(pageCount - 1, this.currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
          pagination.appendChild(createButton(i, i, i === this.currentPage));
        }

        if (this.currentPage < pageCount - 3) {
          const ellipsisEnd = document.createElement('span');
          ellipsisEnd.textContent = '...';
          ellipsisEnd.classList.add('ellipsis');
          pagination.appendChild(ellipsisEnd);
        }
        pagination.appendChild(createButton(pageCount, pageCount, pageCount === this.currentPage));
      }

      if (this.currentPage < pageCount) {
        pagination.appendChild(createButton('>', this.currentPage + 1));
      } else {
        pagination.appendChild(createButton('>', this.currentPage + 1, false, true));
      }
    }
  }

  showLoader(show: boolean): void {
    if (!this.isBrowser) return;

    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.toggle('hidden', !show);
    }
  }
}
