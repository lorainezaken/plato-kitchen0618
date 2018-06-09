import { Routes, RouterModule, CanActivate } from '@angular/router';
import { NgModule } from '@angular/core';
 import { ChekerComponent } from 'app/cheker/cheker.component';
import { HomeComponent } from 'app/Home/Home.component';
import { KitchenComponent } from "app/kitchen/kitchen.component";
import { LoginPageComponent } from '../login-page/login-page.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'cheker',
    component: ChekerComponent
  },
  {
    path: 'kitchen',
    component: KitchenComponent,
    
  },
  {
    path: 'login',
    component: LoginPageComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class RoutingModule {
}
