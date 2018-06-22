import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FirebaseServiceService } from "app/services/firebaseService/firebase-service.service";
import { debug } from 'util';
import { OrdersService } from '../services/orders.service';
import { MealsService } from 'app/services/meals.service';

const enum dishStatus {
  new,
  inProgress,
  done
}

@Component({
  selector: 'app-checker',
  templateUrl: './checker.component.html',
  styleUrls: ['./checker.component.css']
})



export class checkerComponent implements OnInit {
  orders: object;
  dishList: any[];
  warehouse: Object[];
  ordersIds: Object[];
  mealList: Object[];
  stockData: Object[];
  objectKeys = Object.keys;
  restRoot: string;
  restID: string;

  constructor(private fb: FirebaseServiceService, private afs: AngularFirestore, private ordersService: OrdersService,
  private mealsService: MealsService) {
    this.orders = [];
  }


  ngOnInit() {
    this.restRoot = this.fb.getRestRoot();
    this.restID = this.fb.getRest();
    if (this.restID !== '') {
      this.init();
    }

    this.fb.getRestObservable().subscribe(x => {
      this.restID = x;
      this.init();
    });
  }

  private init() {
    this.ordersService.getAll(this.restID).subscribe(x => this.orders = x.filter(order=> order.status !== 2));
  }
}