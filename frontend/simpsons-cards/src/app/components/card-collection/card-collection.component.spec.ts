import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCollectionComponent } from './card-collection.component';

describe('CardCollectionComponent', () => {
  let component: CardCollectionComponent;
  let fixture: ComponentFixture<CardCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
