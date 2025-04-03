import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardngComponent } from './admin-dashboardng.component';

describe('AdminDashboardngComponent', () => {
  let component: AdminDashboardngComponent;
  let fixture: ComponentFixture<AdminDashboardngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardngComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboardngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
