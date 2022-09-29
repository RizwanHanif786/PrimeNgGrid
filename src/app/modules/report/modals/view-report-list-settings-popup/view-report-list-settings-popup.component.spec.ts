import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReportListSettingsPopupComponent } from './view-report-list-settings-popup.component';

describe('ViewReportListSettingsPopupComponent', () => {
  let component: ViewReportListSettingsPopupComponent;
  let fixture: ComponentFixture<ViewReportListSettingsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewReportListSettingsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReportListSettingsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
