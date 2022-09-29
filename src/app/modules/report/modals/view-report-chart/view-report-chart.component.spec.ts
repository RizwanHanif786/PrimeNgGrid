import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReportChartComponent } from './view-report-chart.component';

describe('ViewReportChartComponent', () => {
  let component: ViewReportChartComponent;
  let fixture: ComponentFixture<ViewReportChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewReportChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReportChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
