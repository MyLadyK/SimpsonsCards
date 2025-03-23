import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDrawComponent } from './card-draw.component';

describe('CardDrawComponent', () => {
  let component: CardDrawComponent;
  let fixture: ComponentFixture<CardDrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardDrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
