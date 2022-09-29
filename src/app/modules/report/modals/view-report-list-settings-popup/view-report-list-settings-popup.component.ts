import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { PickList } from 'primeng/picklist';

@Component({
  selector: 'app-view-report-list-settings-popup',
  templateUrl: './view-report-list-settings-popup.component.html',
  styleUrls: ['./view-report-list-settings-popup.component.scss'],
})
export class ViewReportListSettingsPopupComponent implements OnInit {
  public availableFields: any[] = [];
  public visibleFields: any[] = [];
  public columnTemplates: any[] = [];
  public count:number = 0;
  public templateName: string = '';

  sourceFilterValue: string = '';
    
  targetFilterValue: string = '';
  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.getColumnTemplates()
    this.availableFields = [
      {
        headerName: 'ID',
        field: 'id',
        type: 'numeric',
      },
      {
        headerName: 'Name',
        field: 'name',
        type: 'text',
      },

      {
        headerName: 'Code',
        field: 'code',
        type: 'numeric',
      },
      {
        headerName: 'Description',
        field: 'description',
        type: 'text',
      },
      {
        headerName: 'Price',
        field: 'price',
        type: 'numeric',
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        type: 'numeric',
      },

      {
        headerName: 'Category',
        field: 'category',
        type: 'text',
      },
      {
        headerName: 'Status',
        field: 'inventoryStatus',
        type: 'text',
      },
    ];
    let settings = JSON.parse(localStorage.getItem('columnSettings') as any);
    if (settings?.length) {
      this.visibleFields = settings;
      this.visibleFields.forEach((item) => [
        (this.availableFields = this.availableFields.filter(
          (x) => item.field !== x.field
        )),
      ]);
    }
  }
  getColumnTemplates() {
    let savedColumnTemplates = JSON.parse(localStorage.getItem('ColumnTemplates') as any) || [];
    if(savedColumnTemplates) {
      this.columnTemplates = savedColumnTemplates;
    }
    
  }


  /**
   * closes confimation model && return true
   */
  Save(colTemplates?: any) {
    if (!this.visibleFields?.length) {
      this.visibleFields = this.availableFields;
    }
    localStorage.setItem('columnSettings', JSON.stringify(this.visibleFields));
    this.dialogRef?.close({visibleFields: this.visibleFields, colTemplates});
  }

  /**
   * closes confimation model && return false
   */
  decline() {
    this.dialogRef?.close(false);
  }

  SaveTemplate() {

    console.log(this.visibleFields, 'this.visibleFields')
    if(this.templateName) {
      const template = {
        templateName: this.templateName,
        columnTemplates: this.visibleFields
      }
      this.columnTemplates.push(template)
      localStorage.setItem('ColumnTemplates', JSON.stringify( this.columnTemplates));
      this.dialogRef?.close({colTemplates:this.columnTemplates});

    }else{
      alert('Please enter Template Name')
    }
  

  }

}
