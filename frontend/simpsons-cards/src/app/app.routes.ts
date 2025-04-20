import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { CardDrawComponent } from './components/card-draw/card-draw.component';
import { AdminDashboardngComponent } from './admin-dashboardng/admin-dashboardng.component';
import { ExchangeMarketComponent } from './exchange-market/exchange-market.component';

export const routes: Routes = [
  { path: 'sign-in', component: LoginComponent },
  { path: 'sign-up', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'card-draw', component: CardDrawComponent },
  { path: 'admin', component: AdminDashboardngComponent },
  { path: 'exchanges', component: ExchangeMarketComponent },
  { path: '', component: HomeComponent }
];
