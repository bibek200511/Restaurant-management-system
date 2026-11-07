import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MenuComponent } from './pages/menu/menu.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { TablesComponent } from './pages/tables/tables.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { StaffComponent } from './pages/staff/staff.component';
import { BillingComponent } from './pages/billing/billing.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'staff', component: StaffComponent, canActivate: [roleGuard], data: { roles: ['Admin', 'Manager'] } },
      { path: 'reports', component: ReportsComponent, canActivate: [roleGuard], data: { roles: ['Admin', 'Manager'] } },
      { path: 'settings', component: SettingsComponent, canActivate: [roleGuard], data: { roles: ['Admin'] } },
    ],
  },
  { path: '**', redirectTo: '' },
];
