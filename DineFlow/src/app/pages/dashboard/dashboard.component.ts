import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import { CustomerService } from '../../services/customer.service';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { InrPipe } from '../../shared/inr.pipe';
import { dateKey } from '../../shared/utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BarChartComponent, DatePipe, InrPipe, RouterLink],
  template: `
    <div class="page-header">
      <div><h1>Dashboard</h1><p>Today's kitchen and sales at a glance.</p></div>
      <a routerLink="/orders" class="btn btn-primary"><i class="fa-solid fa-plus"></i> New order</a>
    </div>

    <div class="stats">
      <div class="stat"><i class="fa-solid fa-receipt"></i><div><span>Total orders</span><h3>{{ totalOrders() }}</h3></div></div>
      <div class="stat"><i class="fa-solid fa-indian-rupee-sign"></i><div><span>Total revenue</span><h3>{{ revenue() | inr }}</h3></div></div>
      <div class="stat"><i class="fa-solid fa-users"></i><div><span>Total customers</span><h3>{{ customers.items().length }}</h3></div></div>
      <div class="stat"><i class="fa-solid fa-burger"></i><div><span>Menu items</span><h3>{{ menu.items().length }}</h3></div></div>
    </div>

    <div class="two-col">
      <div class="card">
        <h3>Sales overview (last 7 days)</h3>
        <app-bar-chart [labels]="chart().labels" [values]="chart().values" />
      </div>
      <div class="card">
        <h3>Popular food items</h3>
        @for (p of popular(); track p.name) {
          <div class="pop">
            <div class="spread"><b>{{ p.name }}</b><span class="muted">{{ p.qty }} sold</span></div>
            <div class="meter"><div [style.width.%]="p.pct"></div></div>
          </div>
        } @empty { <div class="empty">No sales yet.</div> }
      </div>
    </div>

    <div class="card">
      <h3>Recent orders</h3>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Order</th><th>Customer</th><th>Table</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            @for (o of recent(); track o.id) {
              <tr>
                <td><b>#{{ o.orderNo }}</b></td><td>{{ o.customerName }}</td><td>{{ o.tableName }}</td>
                <td>{{ o.total | inr }}</td>
                <td><span [class]="'badge badge-' + o.status.toLowerCase()">{{ o.status }}</span></td>
                <td class="muted">{{ o.createdAt | date: 'dd MMM, h:mm a' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .stat { display: flex; gap: 14px; align-items: center; padding: 18px; border-radius: var(--radius); color: #fff; background: linear-gradient(145deg, #101f38, #0a1426); box-shadow: var(--shadow); }
    .stat:nth-child(2) { background: linear-gradient(145deg, #101f38, #0a1426); }
    .stat:nth-child(3) { background: linear-gradient(145deg, #101f38, #0a1426); }
    .stat:nth-child(4) { background: linear-gradient(145deg, #101f38, #0a1426); }
    .stat > i { font-size: 22px; width: 46px; height: 46px; border-radius: 50%; background: rgba(40,120,240,.18); display: grid; place-items: center; }
    .stat span { font-size: 12px; opacity: .85; } .stat h3 { color: #fff; font-size: 24px; }
    .pop { margin-bottom: 14px; }
    .meter { height: 8px; background: #172640; border-radius: 8px; margin-top: 6px; overflow: hidden; }
    .meter div { height: 100%; background: linear-gradient(90deg, #2878f0, #16c79a); border-radius: 8px; }
  `],
})
export class DashboardComponent {
  private orders = inject(OrderService);
  customers = inject(CustomerService);
  menu = inject(MenuService);

  private active = computed(() => this.orders.items().filter((o) => o.status !== 'Cancelled'));
  totalOrders = computed(() => this.orders.items().length);
  revenue = computed(() => this.orders.items().filter((o) => o.status === 'Completed').reduce((s, o) => s + o.total, 0));

  recent = computed(() =>
    [...this.orders.items()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6));

  chart = computed(() => {
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      labels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
      values.push(this.orders.items().filter((o) => o.status === 'Completed' && dateKey(o.createdAt) === key).reduce((s, o) => s + o.total, 0));
    }
    return { labels, values };
  });

  popular = computed(() => {
    const map = new Map<string, number>();
    this.active().forEach((o) => o.items.forEach((i) => map.set(i.name, (map.get(i.name) ?? 0) + i.qty)));
    const list = [...map.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const max = list[0]?.qty ?? 1;
    return list.map((p) => ({ ...p, pct: (p.qty / max) * 100 }));
  });
}
