import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './pages/reports/reports.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ViewReportListSettingsPopupComponent } from './modals/view-report-list-settings-popup/view-report-list-settings-popup.component';
import {DialogModule,} from 'primeng/dialog';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ViewReportChartComponent } from './modals/view-report-chart/view-report-chart.component';
import {MenubarModule} from 'primeng/menubar';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {ContextMenuModule} from 'primeng/contextmenu';
import {ProgressBarModule} from 'primeng/progressbar';
import {FileUploadModule} from 'primeng/fileupload';
import {ToolbarModule} from 'primeng/toolbar';
import {RatingModule} from 'primeng/rating';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputNumberModule} from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ReportDataService } from './service/report-data.service';
import { DialogService } from 'primeng/dynamicdialog';
import {PickListModule} from 'primeng/picklist';
import {ChartModule} from 'primeng/chart';

@NgModule({
  declarations: [
    ReportsComponent,
    ViewReportListSettingsPopupComponent,
    ViewReportChartComponent,    
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,  
    ContextMenuModule,
    CalendarModule,
    SliderModule,
    ProgressBarModule,
    
    ToolbarModule,
    DialogModule,
    DragDropModule,
    InputTextModule,
    MenubarModule,   
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    ConfirmDialogModule,
    InputNumberModule,
    RatingModule,
    RadioButtonModule,
    ToastModule,
    TableModule,
    FileUploadModule,
    MultiSelectModule,
    PickListModule,
    ChartModule
    

  ],
  providers:[MessageService, ConfirmationService, ReportDataService, DialogService]
  
})
export class ReportModule { }
