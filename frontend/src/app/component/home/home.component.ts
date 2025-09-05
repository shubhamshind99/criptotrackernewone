import { Component,AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgFor, NgIf } from '@angular/common';
interface CarouselItem {
  title: string;
  price: number;
  discount: number;
  img: string;
  priceDirection: string;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,NgFor,NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {

  isNavVisible: boolean = false;

  // Method to toggle the navigation menu
  toggleNav() {
    this.isNavVisible = !this.isNavVisible;
  }
 
  carouselData: CarouselItem[] = [
    { title: 'Bitcoin', price: 34000, discount: 15, img: './img/bitcoin-icon.png', priceDirection: '' },
    { title: 'Ethereum', price: 25600, discount: 9, img: './img/ethereum-icon.png', priceDirection: '' },
    { title: 'Tether', price: 7000, discount: 4, img: './img/tether-icon.png', priceDirection: '' },
    { title: 'Cardano', price: 0.5, discount: 10, img: './img/cardano-icon.png', priceDirection: '' }, // New Cryptocurrency
    { title: 'Ripple', price: 0.75, discount: 5, img: './img/ripple-icon.png', priceDirection: '' }, // New Cryptocurrency
    { title: 'Litecoin', price: 90, discount: 7, img: './img/litecoin-icon.png', priceDirection: '' } // New Cryptocurrency
  ];
  previousPrices = {   bitcoin: 34000,
    ethereum: 25600,
    tether: 7000,
    cardano: 0.5,
    ripple: 0.75,
    litecoin: 90 };

  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.setupHeader();
    this.setupCarousel();
    this.fetchLivePrices();
    this.simulatePriceUpdates();
  }

  setupHeader(): void {
    const bar = document.getElementById("bar") as HTMLElement;
    const nav = document.getElementById("nav") as HTMLElement;

    if (bar) {
      bar.onclick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const icon = target.getAttribute("class");
        if (icon === "fa-solid fa-bars") {
          target.setAttribute("class", "fa-solid fa-xmark");
        } else {
          target.setAttribute("class", "fa-solid fa-bars");
        }
        if (nav) {
          nav.classList.toggle("showNav");
        }
      };
    }
  }

  setupCarousel(): void {
    const carouselContainer = document.querySelector(".carouselContainer") as HTMLElement;
    const eachCarousel = (document.querySelector(".eachCarousel") as HTMLElement).clientWidth;
    const allEachCarousel = document.querySelectorAll<HTMLElement>(".eachCarousel");
    const allIndicator = document.querySelectorAll<HTMLElement>(".indicator");

    this.slideCarousel = (index: number) => {
      for (let x = 0; x < allEachCarousel.length; x++) {
        if (x === index) {
          allEachCarousel[x].classList.add("eachCarouselBorder");
          allIndicator[x].classList.add("activeIndicator");
        } else {
          allEachCarousel[x].classList.remove("eachCarouselBorder");
          allIndicator[x].classList.remove("activeIndicator");
        }
      }
      carouselContainer.scrollLeft = (index * (eachCarousel + 10));
      console.log(carouselContainer.scrollLeft);
    };

    // Example usage of slideCarousel
    this.slideCarousel(0);
  }

  slideCarousel(index: number): void {
    // This method will be initialized in setupCarousel()
  }



  fetchLivePrices(): void {
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd';

    this.http.get(apiUrl).subscribe((data: any) => {
      this.updateCarouselData(data);
    });
  }

  updateCarouselData(data: any): void {
    this.carouselData = [
      {
        title: 'Bitcoin',
        price: data.bitcoin.usd,
        discount: this.calculateDiscount(this.previousPrices.bitcoin, data.bitcoin.usd),
        img: './img/bitcoin-icon.png',
        priceDirection: this.getPriceDirection(this.previousPrices.bitcoin, data.bitcoin.usd)
      },
      {
        title: 'Ethereum',
        price: data.ethereum.usd,
        discount: this.calculateDiscount(this.previousPrices.ethereum, data.ethereum.usd),
        img: './img/ethereum-icon.png',
        priceDirection: this.getPriceDirection(this.previousPrices.ethereum, data.ethereum.usd)
      },
      {
        title: 'Tether',
        price: data.tether.usd,
        discount: this.calculateDiscount(this.previousPrices.tether, data.tether.usd),
        img: './img/tether-icon.png',
        priceDirection: this.getPriceDirection(this.previousPrices.tether, data.tether.usd)
      },
      {
        title: 'Cardano',
        price: data.cardano.usd,
        discount: this.calculateDiscount(this.previousPrices.cardano, data.cardano.usd),
        img: './img/cardano-icon.png',
        priceDirection: this.getPriceDirection(this.previousPrices.cardano, data.cardano.usd)
      },
      {
        title: 'Ripple',
        price: data.ripple.usd,
        discount: this.calculateDiscount(this.previousPrices.ripple, data.ripple.usd),
        img: './img/ripple-icon.png',
        priceDirection: this.getPriceDirection(this.previousPrices.ripple, data.ripple.usd)
      },
      {
        title: 'Litecoin',
        price: data.litecoin.usd,
        discount: this.calculateDiscount(this.previousPrices.litecoin, data.litecoin.usd),
        img: './img/litecoin-icon.png',
        priceDirection: this.getPriceDirection(this.previousPrices.litecoin, data.litecoin.usd)
      }
    ];

    // Update previous prices for next comparison
    this.previousPrices = {
      bitcoin: data.bitcoin.usd,
      ethereum: data.ethereum.usd,
      tether: data.tether.usd,
      cardano: data.cardano.usd,
      ripple: data.ripple.usd,
      litecoin: data.litecoin.usd
    };
  }


  simulatePriceUpdates(): void {
    setInterval(() => {
      // Simulating random price and discount updates
      this.carouselData.forEach(item => {
        const randomChange = Math.random() > 0.5 ? 1 : -1;
        item.price += randomChange * (Math.random() * 500); // Randomly change the price
        item.discount += randomChange * (Math.random() * 1); // Randomly change the discount

        // Update priceDirection based on whether price increased or decreased
        item.priceDirection = randomChange > 0 ? 'up' : 'down';
      });
    }, 5000); // Update every 5 seconds
  }
  

  calculateDiscount(oldPrice: number, newPrice: number): number {
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  }

  getPriceDirection(oldPrice: number, newPrice: number): string {
    return newPrice > oldPrice ? 'up' : 'down';
  }
}