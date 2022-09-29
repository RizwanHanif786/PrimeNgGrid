import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from '../app/modules/report/pages/reports/reports.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'reports',
    pathMatch: 'full',
},
{ path: 'reports', component: ReportsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
