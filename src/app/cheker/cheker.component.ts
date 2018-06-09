import { Order, Meal, Dish } from '../order/order';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FirebaseServiceService } from "app/services/firebaseService/firebase-service.service";
import { debug } from 'util';

const enum dishStatus {
  new,
  inProgress,
  done
}

@Component({
  selector: 'app-cheker',
  templateUrl: './cheker.component.html',
  styleUrls: ['./cheker.component.css']
})



export class ChekerComponent implements OnInit {
  orders: object;
  dishList: any[];
  warehouse: Object[];
  ordersIds: Object[];
  mealList: Object[];
  stockData: Object[];
  objectKeys = Object.keys;
  restRoot: string;
  restID: string;

  constructor(private fb: FirebaseServiceService, private afs: AngularFirestore) {
    this.ordersIds = [];
    this.mealList = [];
    this.dishList = [];
    this.warehouse = [];
    this.stockData = [];
    this.orders = {};
    setTimeout(() => console.log(this.orders), 10000);
  }


  ngOnInit() {
    this.fb.getRest().subscribe(x => {
      this.restRoot = this.fb.getRestRoot();
      this.restID = x;
      this.newIncomingOrder();
    })
  }

  newIncomingOrder() {
    const ref = this.fb.fs.collection(this.fb.getRestRoot() + '/' + this.restID + '/Orders');
    ref.onSnapshot(docs => {
      docs.docChanges().forEach(doc => {
        switch (doc.type) {
          case 'added':
            console.log('added ', doc.doc.id);
            const ordersVal = doc.doc.data();
            this.orders[`${doc.doc.id}`] = {
              showExtendedDetails: false,
              orderTable: ordersVal.tableId,
              orderTime: ordersVal.time,
              meals: {}
            }
            this.diveInOrders({ orderID: doc.doc.id, ordersVal: ordersVal });
            break;
          case 'modified':
            debugger;
            console.log('modified ', doc.doc.id);
            break;
          case 'removed':
            console.log('removed ', doc.doc.id);
            break;
        }
      })
    });
  }
  diveInOrders(order) {
    const ref = this.fb.fs.collection(this.restRoot + '/' + this.restID + '/Orders/' + order.orderID + '/meals');
    ref.onSnapshot(docs => {
      docs.docChanges().forEach(x => {
        if (x.type === "added") {
          const mealVals = x.doc.data();
          this.orders[`${order.orderID}`].meals[x.doc.id] = {
            mealId: x.doc.id,
            pic: mealVals.pic,
            status: mealVals.status,
            dishes: {},
            readyDishes: 0
          };
          this.diveInMeals({ mealsID: x.doc.id, mealVal: x.doc.data(), order: order });
        }
      });
    });
  }
  diveInMeals(meal) {
    const ref = this.fb.fs.collection(this.restRoot + '/' + this.restID + '/Orders/' + meal.order.orderID + '/meals/' + meal.mealsID + '/dishes');
    ref.onSnapshot(docs => {
      docs.docChanges().forEach(x => {
        if (x.type === "added") {
          const dishVals = x.doc.data();
          this.orders[`${meal.order.orderID}`].meals[`${meal.mealsID}`].dishes[`${x.doc.id}`] = {
            category: dishVals.category,
            description: dishVals.description,
            name: dishVals.name,
            pic: dishVals.pic,
            status: dishVals.status,
            totalTime: dishVals.totalTime
          }
          if (dishVals.status === dishStatus.done) {
            this.orders[`${meal.order.orderID}`].meals[`${meal.mealsID}`].readyDishes++;
          }
          this.dishList.push({
            name: x.doc.id,
            totalTime: dishVals.totalTime,
            description: dishVals.description,
            status: dishVals.status,
            table: meal.order.ordersVal.tableId,
            time: meal.order.ordersVal.time,
            pic: dishVals.pic,
            orderID: meal.order.orderID,
            mealsID: meal.mealsID
          });
          this.diveInDishes({ dish: { dishID: x.doc.id, dishsVal: dishVals }, mealsID: meal.mealsID, order: meal.order, mealVal: meal.mealVal });
        }
        else if (x.type === "modified") {
          if (x.doc.data().status === dishStatus.done) {
            this.orders[`${meal.order.orderID}`].meals[`${meal.mealsID}`].readyDishes++;
          }
          else if (x.doc.data().status === dishStatus.new) {
            this.orders[`${meal.order.orderID}`].meals[`${meal.mealsID}`].readyDishes -= 1;
            console.log(this.orders);
          }

          const readyDishes = this.orders[`${meal.order.orderID}`].meals[`${meal.mealsID}`].readyDishes;
          if (readyDishes === this.objectKeys(this.orders[`${meal.order.orderID}`].meals[`${meal.mealsID}`].dishes).length) {
            alert("meal is ready");
          }
        }

      });
    });
  }
  diveInDishes(dish) {
    const ref = this.fb.fs.collection(this.restRoot + '/' + this.restID + '/Orders/' + dish.order.orderID + '/meals/' + dish.mealsID + '/dishes/' + dish.dish.dishID + '/groceries');
    ref.onSnapshot(docs => {
      docs.forEach(doc => {
        const groceriesVal = doc.data();
        const dishVals = dish.dish.dishsVal;
        const mealVals = dish.mealVal;
        this.orders[`${dish.order.orderID}`].meals[`${dish.mealsID}`].dishes[`${dish.dish.dishID}`][`${doc.id}`] = {
          cookingTime: groceriesVal.cookingTime,
          cookingType: groceriesVal.cookingType,
          rawMaterial: groceriesVal.rawMaterial
        }
      });
    });
  }

  showExtendedOrderDetails(orderId: string) {
   // debugger;
    this.orders[orderId].showExtendedDetails = !this.orders[orderId].showExtendedDetails;
  }

  mealIsReady(orderId: string, mealId: string) {
    const meal = this.orders[orderId].meals[mealId];
    delete meal.dishes;
    const table = this.orders[orderId].orderTable;

    const ref = this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + orderId + '/meals/' + mealId);
    ref.update({
      status: dishStatus.done
    }).then(x => {
      this.afs.collection(`/${this.restRoot}/${this.restID}/CompleteOrders/orders/${table}`).doc(mealId).set(meal)
        .then(() => {
          delete this.orders[orderId].meals[mealId];
        })
    });
  }
}