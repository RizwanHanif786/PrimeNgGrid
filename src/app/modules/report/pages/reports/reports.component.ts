import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { ViewReportListSettingsPopupComponent } from '../../modals/view-report-list-settings-popup/view-report-list-settings-popup.component';
import { Product } from '../../models/products.model';
import { ReportDataService } from '../../service/report-data.service';
import * as FileSaver from 'file-saver';
import { Table } from 'primeng/table';
import { ViewReportChartComponent } from '../../modals/view-report-chart/view-report-chart.component';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  public columnDefs: any[] = [];
  columnTemplates: any[] = [];
  selectedTemplate: any;
  productDialog: boolean = false;

  products: Product[] = [];

  product: Product = new Product();

  selectedProducts: Product[] = [];

  exportColumns: any[] = [];

  submitted: boolean = false;

  constructor(
    private reportDataService: ReportDataService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getRowsData();
    this.setColumnsDefinition();
    this.getColumnTemplates();
    this.exportColumns = this.columnDefs.map((col) => ({
      title: col.headerName,
      dataKey: col.field,
    }));
  }

  setColumnsDefinition() {
    let settings = JSON.parse(localStorage.getItem('columnSettings') as any);
    if (settings?.length) {
      this.columnDefs = settings;
    } else {
      this.columnDefs = [
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
    }
  }

  getRowsData() {
    this.reportDataService.getProducts().then((data) => (this.products = data));
  }

  onViewChange(list: any) {
    this.columnDefs = this.selectedTemplate;

  }

  refreshList() {
    localStorage.removeItem('columnSettings');
    this.setColumnsDefinition();
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(
          (val) => !this.selectedProducts.includes(val)
        );
        this.selectedProducts = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Products Deleted',
          life: 3000,
        });
      },
    });
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter((val) => val.id !== product.id);
        this.product = {};
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Deleted',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }
  getColumnTemplates() {
    let savedCOlumnTemplates =
      JSON.parse(localStorage.getItem('ColumnTemplates') as any) || [];
    if (savedCOlumnTemplates) {
      this.columnTemplates = savedCOlumnTemplates;
    }
  }
  saveProduct() {
    this.submitted = true;

    if (this.product.name!.trim()) {
      if (this.product.id) {
        this.products[this.findIndexById(this.product.id)] = this.product;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Updated',
          life: 3000,
        });
      } else {
        this.product.id = this.createId();
        this.product.image = 'product-placeholder.svg';
        this.products.push(this.product);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Created',
          life: 3000,
        });
      }

      this.products = [...this.products];
      this.productDialog = false;
      this.product = {};
    }
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  createId(): string {
    let id = '';
    var chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.products);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  showListViewSetting() {
    const dialogRef = this.dialogService.open(
      ViewReportListSettingsPopupComponent,
      {
        header: 'Select Field To Display',
        closeOnEscape: true,
      }
    );

    dialogRef.onClose.subscribe((data) => {
      if (data) {
        if(data?.visibleFields){
        this.columnDefs = data?.visibleFields;
        }
        this.columnTemplates = data.colTemplates

      }
    });
  }

  showReportCharts() {
    const dialogRef = this.dialogService.open(
      ViewReportChartComponent,
      {
        closeOnEscape: true,
        width: '1000px',
        height: '1000px',
        data: {
        }
      }
    );

    dialogRef.onClose.subscribe((data) => {
   
    });
  }



  applyFilterGlobal($event:any, stringVal:any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
}
