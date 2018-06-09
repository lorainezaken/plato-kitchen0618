import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AngularFirestoreModule, AngularFirestore } from 'angularfire2/firestore';
import {environment} from '../environments/environment';
import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from "angularfire2/auth";
import { RoutingModule } from './services/app.router.module';
import { ChekerComponent } from './cheker/cheker.component';
import { HomeComponent } from 'app/Home/Home.component';
import { KitchenComponent } from './kitchen/kitchen.component';
export const firebaseConfig = environment.firebaseConfig;
import { FirebaseServiceService } from './services/firebaseService/firebase-service.service';
import { KitchenItemComponent } from './kitchen/kitchen-item/kitchen-item.component';
import { KitchenItemInMakingComponent } from './kitchen/kitchen-item-in-making/kitchen-item-in-making.component';
import { KitchenItemWaitingForMakingComponent } from './kitchen/kitchen-item-waiting-for-making/kitchen-item-waiting-for-making.component';
import {MatSnackBar, MatSnackBarModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { LoginPageComponent } from './login-page/login-page.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChekerComponent,
    HomeComponent,
    KitchenComponent,
    KitchenItemComponent,
    KitchenItemInMakingComponent,
    KitchenItemWaitingForMakingComponent,
    LoginPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    RoutingModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    MatSnackBarModule
  ],
  providers: [FirebaseServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
