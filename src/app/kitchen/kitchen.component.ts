import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FirebaseServiceService } from "app/services/firebaseService/firebase-service.service";
import { KitchenService } from '../services/kitchen.service';
import { OrdersService } from '../services/orders.service';
import { Order } from '../order/order';
import { UserInfo } from 'app/services/auth/UserInfo.model';
import { AuthService } from 'app/services/auth/auth.service';
import { Router } from '@angular/router';

export const enum dishStatus {
  new,
  inProgress,
  done
}
@Component({
  selector: 'app-kitchen',
  templateUrl: './kitchen.component.html',
  styleUrls: ['./kitchen.component.css']
})
export class KitchenComponent implements OnInit {
  dishList: any[];
  orders: any[];
  warehouse: Object[];
  ordersIds: Object[];
  mealList: Object[];
  stockData: Object[];

  userInfo: UserInfo;
  isAdmin: boolean;
  dishesForOrder: {};
  dishesInMaking = [];
  dishesWaitingForMaking = [];
  dishesNotInMaking = [];
  restID;
  restRoot;

  constructor(private router: Router, private fb: FirebaseServiceService, private kitchenService: KitchenService, private ordersService: OrdersService, private authService: AuthService) {
    this.ordersIds = [];
    this.mealList = [];
    this.warehouse = [];
    this.stockData = [];
    this.orders = [];
    this.dishList = [];
  }

  ngOnInit() {
    this.fb.getRestObservable().subscribe(rest => {
      this.restID = rest;
      this.init();
    });
    this.restID = this.fb.getRest();
    this.init();
  }

  private init() {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['login']);
        return;
      }

      this.authService.getUserInfo().then(userInfo => {
        this.userInfo = userInfo;
        this.isAdmin = this.userInfo.role === 'kitchen-manager';

        this.restRoot = this.fb.getRestRoot();
        this.newIncomingOrder();
        this.warehouseStockData();
        this.kitchenService.getDishesForOrder(this.restID).subscribe((x: { data: {} }) => {
          console.log(x);
          this.dishesForOrder = x;
          this.dishesInMaking = [];
          this.dishesWaitingForMaking = [];
          this.dishesNotInMaking = [];
          this.ordersService.getAll(this.restID).subscribe(x => {
            const ordersInMaking = x.filter(order => order.startedMaking);
            const ordersNotInMaking = x.filter(order => !order.startedMaking);
            this.dishesWaitingForMaking = [];
            this.dishesInMaking = [];
            ordersInMaking.forEach(order => {
              Object.keys(this.dishesForOrder[order.id].dishes).forEach(dishName => {
                const dish = this.dishesForOrder[order.id].dishes[dishName];
                if (!this.isAdmin && dish.category.toLowerCase() !== this.userInfo.role) {
                  return;
                }
                dish.startedMaking = order.startedMaking;
                dish.orderId = order.id;
                dish.longestDishInOrder = this.dishesForOrder[order.id].longestDishTime.seconds;

                if (dish.status === dishStatus.inProgress) {
                  console.log(dish);
                  this.dishesInMaking.push(dish);
                }
                else if (dish.status === dishStatus.new) {
                  console.log(dish);
                  this.dishesWaitingForMaking.push(dish);
                }
              })
            })
            this.dishesNotInMaking = [];
            ordersNotInMaking.forEach(order => {
              Object.keys(this.dishesForOrder[order.id].dishes).forEach(dishName => {
                const dish = this.dishesForOrder[order.id].dishes[dishName];
                console.log(dish);
                if (!this.isAdmin && dish.category.toLowerCase() !== this.userInfo.role) {
                  console.log(dish);
                  return;
                }
                dish.startedMaking = order.startedMaking;
                dish.orderId = order.id;
                dish.isLongest = this.dishesForOrder[order.id].longestDishTime.dishId === dishName;
                this.dishesNotInMaking.push(this.dishesForOrder[order.id].dishes[dishName]);
              });
            });

            this.dishesNotInMaking = this.dishesNotInMaking.sort((x, y) => y.totalSeconds - x.totalSeconds);
          });
        });
      });
    });
  }
  /*.onSnapshot(function(snapshot) {
          snapshot.docChanges().forEach(function(change) {
              if (change.type === "added") {*/
  newIncomingOrder() {
    const ref = this.fb.fs.collection(this.restRoot + '/' + this.restID + '/Orders');
    ref.onSnapshot(docs => {
      docs.docChanges().forEach(doc => {
        switch (doc.type) {
          case 'added':
            console.log('added ', doc.doc.id);
            const ordersVal = doc.doc.data();
            this.orders[`${doc.doc.id}`] = {
              orderTable: ordersVal.tableId,
              orderTime: ordersVal.time
            }
            this.diveInOrders({ orderID: doc.doc.id, ordersVal: ordersVal });
            break;
          case 'modified':
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
    ref.get()
      .then(docs => {
        docs.forEach(doc => {
          const mealVals = doc.data();
          this.orders[`${order.orderID}`][`${doc.id}`] = {
            pic: mealVals.pic,
            status: mealVals.status
          }
          this.diveInMeals({ mealsID: doc.id, mealVal: doc.data(), order: order });
        })
      });
  }
  diveInMeals(meal) {
    const ref = this.fb.fs.collection(this.restRoot + '/' + this.restID + '/Orders/' + meal.order.orderID + '/meals/' + meal.mealsID + '/dishes');
    ref.get()
      .then(docs => {
        docs.forEach(doc => {
          const dishVals = doc.data();
          this.orders[`${meal.order.orderID}`][`${meal.mealsID}`][`${doc.id}`] = {
            category: dishVals.category,
            description: dishVals.description,
            name: dishVals.name,
            pic: dishVals.pic,
            status: dishVals.status,
            totalTime: dishVals.totalTime
          }
          this.dishList.push({
            name: doc.id,
            totalTime: dishVals.totalTime,
            description: dishVals.description,
            status: dishVals.status,
            table: meal.order.ordersVal.tableId,
            time: meal.order.ordersVal.time,
            pic: dishVals.pic,
            orderID: meal.order.orderID,
            mealsID: meal.mealsID
          });
          this.diveInDishes({ dish: { dishID: doc.id, dishsVal: dishVals }, mealsID: meal.mealsID, order: meal.order, mealVal: meal.mealVal });
        });
      });
  }
  diveInDishes(dish) {
    const ref = this.fb.fs.collection(this.restRoot + '/' + this.restID + '/Orders/' + dish.order.orderID + '/meals/' + dish.mealsID + '/dishes/' + dish.dish.dishID + '/groceries');
    ref.get()
      .then(docs => {
        docs.forEach(doc => {
          const groceriesVal = doc.data();
          const dishVals = dish.dish.dishsVal;
          const mealVals = dish.mealVal;
          this.orders[`${dish.order.orderID}`][`${dish.mealsID}`][`${dish.dish.dishID}`][`${doc.id}`] = {
            cookingTime: groceriesVal.cookingTime,
            cookingType: groceriesVal.cookingType,
            rawMaterial: groceriesVal.rawMaterial
          }
          this.showOnScreen();
        });
      });
  }
  showOnScreen() {

    // const dishVals = groceries.dish.dishsVal;

    // if (dishVals.status < 2 && dishVals.category == 'Hotplate') {


    //   console.log('time: ', groceries.order.orderTime);
    //   this.warehouse.push(
    //     {
    //       rawMaterial: groceries.rawMaterial
    //     }
    //   );
    //   this.mealList.push(
    //     {
    //       name: groceries.dish.dishID,
    //       totalTime: dishVals.totalTime,
    //       description: dishVals.description,
    //       status: dishVals.status,
    //       table: groceries.order.orderTable,
    //       time: groceries.order.orderTime.Time,
    //       pic: dishVals.pic,
    //       orderID: groceries.order.orderID,
    //       mealsID: groceries.mealsID
    //     });
    // }
  }



  warehouseStockData() {
    const ref = this.fb.fs.collection(this.restRoot + '/' + this.restID + '/WarehouseStock');
    ref.get()
      .then(docs => {
        docs.forEach(doc => {
          console.log('StockData ', doc.id);
          const StockDataVal = doc.data();
          this.stockData.push(doc.data());
          console.log('stockData ', doc.data());
          console.log('StockDataVal ', doc.data());
        })
      });
  }
  updateInP(dish) {
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + dish.orderID + '/meals/' + dish.mealsID + '/dishes/' + dish.name)
      .update({
        "status": dishStatus.inProgress
      }).then(function () {
        console.log('updateInP success');
      }).catch(function (err) {
        console.log(err);
      });

    this.kitchenService.startMakingOrder(dish.orderID, this.restID);
  }
  updateDone(dish) {
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + dish.orderID + '/meals/' + dish.mealsID + '/dishes/' + dish.name)
      .update({
        "status": dishStatus.done
      }).then(function () {
        console.log('updateDone success');
      }).catch(function (err) {
        console.log(err);
      });
  }

  deleteDish(dish) {
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + dish.orderID + '/meals/' + dish.mealsID + '/dishes/' + dish.name)
      .delete().then(function () {
        console.log('delete success');
      }).catch(function (err) {
        console.log(err);
      });
  }

  dishInMakingCompleted(dish) {
    const dishIndex = this.dishesInMaking.findIndex(x => x.name === dish.name && x.orderId === dish.orderId)
    if (dishIndex > -1) {
      this.dishesInMaking.splice(dishIndex, 1);
    }
  }

  startedMakingDish(dish) {
    const dishIndex = this.dishesNotInMaking.findIndex(x => x.name === dish.name && x.orderId === dish.orderId)
    this.dishesForOrder[dish.orderId].dishes[dish.name].status = dishStatus.inProgress;
    if (dishIndex > -1) {
      this.dishesNotInMaking.splice(dishIndex, 1);
    }
  }

  startedMakingWaitingDish(dish) {
    const dishIndex = this.dishesWaitingForMaking.findIndex(x => x.name === dish.name && x.orderId === dish.orderId)
    this.dishesForOrder[dish.orderId].dishes[dish.name].status = dishStatus.inProgress;
    if (dishIndex > -1) {
      this.dishesWaitingForMaking.splice(dishIndex, 1);
      this.dishesInMaking.push(dish);
    }
  }
}
