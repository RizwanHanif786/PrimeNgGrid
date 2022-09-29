import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule , } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import {CheckboxModule} from 'primeng/checkbox';
import { AppComponent } from './app.component';
import { ReportModule } from './modules/report/report.module';
import { DragDropModule } from "@angular/cdk/drag-drop";
import {DialogModule,} from 'primeng/dialog';




@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReportModule,
    HttpClientModule, 
    FormsModule,
    CheckboxModule,  
    DragDropModule,
    DialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
