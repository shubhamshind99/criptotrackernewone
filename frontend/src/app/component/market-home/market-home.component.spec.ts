import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketHomeComponent } from './market-home.component';

describe('MarketHomeComponent', () => {
  let component: MarketHomeComponent;
  let fixture: ComponentFixture<MarketHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
