import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FirebaseServiceService } from "app/services/firebaseService/firebase-service.service";
import { KitchenService } from '../services/kitchen.service';
import { OrdersService } from '../services/orders.service';
import { UserInfo } from 'app/services/auth/UserInfo.model';
import { AuthService } from 'app/services/auth/auth.service';
import { Router } from '@angular/router';
import { MealsService } from '../services/meals.service';
import { DishesService } from '../services/dishes.service';
import { Dish } from 'app/order/order.model';
// const uuidv4 = require('uuid/v4');

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
export class KitchenComponent implements OnInit, OnChanges {
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

  constructor(private router: Router, private fb: FirebaseServiceService, private kitchenService: KitchenService,
    private ordersService: OrdersService, private authService: AuthService, private mealsService: MealsService, private dishesService: DishesService) {
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
        this.ordersService.getAll(this.restID).subscribe(orders => {
          this.dishesInMaking = [];
          this.dishesWaitingForMaking = [];
          this.dishesNotInMaking = [];

          orders.forEach(order => {
            this.mealsService.getAll(this.restID, order.id).subscribe(meals => {
              meals.forEach(meal => {
                this.dishesService.getAll(this.restID, order.id, meal.docId).subscribe(dishes => {
                  dishes.forEach(x => {
                    x.order = order;
                    x.meal = meal;
                    x.uuid = `${order.id}-${meal.docId}-${x.name}`;
                    this.removeDishFromCollections(x);
                  })

                  if (order.status == 0) {
                    dishes.forEach(x => this.insertIntoNotInMaking(x));
                  } else if (order.status === 1) {
                    dishes.forEach(x => this.insertIntoWaitingForMaking(x));
                  } 
                })
              })
            })
          })
        })
      });
    });
  }

  removeDishFromCollections(dishToRemove: Dish) {
    const collections = [this.dishesNotInMaking, this.dishesInMaking, this.dishesWaitingForMaking];
    collections.forEach(x => {
      const index = x.findIndex(dish => dish.uuid === dishToRemove.uuid);
      if (index !== -1) {
        x.splice(index, 1);
      }
    })
  }

  insertIntoNotInMaking(dish: Dish) {
    const getTotalTime = (x) => (parseInt(x.totalTime.split(':')[0]) * 60) + (parseInt(x.totalTime.split(':')[1]))
    if (this.dishesNotInMaking.length === 0) {
      this.dishesNotInMaking.push(dish);
      return;
    }
    const indexToInsertIn = this.dishesNotInMaking.findIndex(x => getTotalTime(x) <= getTotalTime(dish));
    if (indexToInsertIn === -1) {
      this.dishesNotInMaking.push(dish);
      return;
    }
    this.dishesNotInMaking.splice(indexToInsertIn, 0, dish);
  }

  insertIntoWaitingForMaking(dish: Dish) {
    const getTotalTime = (x) => (parseInt(x.totalTime.split(':')[0]) * 60) + (parseInt(x.totalTime.split(':')[1]))
    if (this.dishesWaitingForMaking.length === 0) {
      this.dishesWaitingForMaking.push(dish);
      return;
    }
    const indexToInsertIn = this.dishesWaitingForMaking.findIndex(x => getTotalTime(x) <= getTotalTime(dish));
    if (indexToInsertIn === -1) {
      this.dishesWaitingForMaking.push(dish);
      return;
    }
    this.dishesWaitingForMaking.splice(indexToInsertIn, 0, dish);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    debugger;
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

  alertStartMaking(dish) {
    // const index = this.dishesNotInMaking.findIndex(x => x.uuid === dish.uuid);
    // this.dishesNotInMaking[index].alerted = true;
    // this.orderDishesNotInMaking();
  }

  orderDishesNotInMaking() {
    const alerted = this.dishesNotInMaking.filter(x => x.alerted);
    const notAlerted = this.dishesNotInMaking.filter(x => !x.alerted).sort((x, y) => y.totalSeconds - x.totalSeconds);
    this.dishesNotInMaking = [];
    if (alerted) {
      alerted.forEach(x => this.dishesNotInMaking.push(x));
    }
    if (notAlerted) {
      notAlerted.forEach(x => this.dishesNotInMaking.push(x));
    }
  }

}
