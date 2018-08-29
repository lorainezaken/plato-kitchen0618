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
    this.restID = this.fb.getRest();
    this.init();
  }

  //Init and set all dishes state
  private init() {
    //Check user is logged in
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
          //Declare 3 main arrays. Each dish is going into one of them according to it's state
          this.dishesInMaking = [];
          this.dishesWaitingForMaking = [];
          this.dishesNotInMaking = [];

          //Loop all orders
          orders.forEach(order => {
            order.longestMakingTimeDishInOrder = 0;

            this.mealsService.getAll(this.restID, order.id).subscribe(meals => {
              //Loop all meals for order
              meals.forEach(meal => {
                this.dishesService.getAll(this.restID, order.id, meal.docId).subscribe(dishes => {
                  //Parse total time helper function
                  const getTotalTime = (x: Dish) =>
                    (parseInt(x.totalTime.split(':')[0], 10) * 60) + (parseInt(x.totalTime.split(':')[1], 10));

                  //Add some helpers ui props for all the dishes
                  dishes.forEach(x => {
                    x.totalSeconds = getTotalTime(x);
                    order.longestMakingTimeDishInOrder =
                      order.longestMakingTimeDishInOrder > x.totalSeconds ? order.longestMakingTimeDishInOrder : x.totalSeconds
                  });

                  //Filter all the dishes according to user's role
                  const dishesInRole = this.isAdmin ?
                    dishes :
                    dishes.filter(x => x.category.toLowerCase() === this.userInfo.role.toLowerCase());

                  //Remove dish from array if it's in one of them(in case it's state changed)
                  dishesInRole.forEach(x => {
                    x.order = order;
                    x.meal = meal;
                    x.uuid = `${order.id}-${meal.docId}-${x.name}`;
                    this.removeDishFromCollections(x);
                  })

                  //Insert dish to the correct array according to it's status
                  if (order.status === dishStatus.new) {
                    dishesInRole.forEach(x => this.insertIntoNotInMaking(x));
                  } else if (order.status === dishStatus.inProgress) {
                    dishesInRole.forEach(x => {
                      if (x.status === dishStatus.new) {
                        this.insertIntoWaitingForMaking(x);
                      } else if (x.status === dishStatus.inProgress) {
                        this.insertIntoInMaking(x);
                      }
                    });
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

  //Insert into not in making dish array
  insertIntoNotInMaking(dish: Dish) {
    if (this.dishesNotInMaking.length === 0) {
      this.dishesNotInMaking.push(dish);
      return;
    }
    const indexToInsertIn = this.dishesNotInMaking.findIndex(x => x.totalSeconds <= dish.totalSeconds);
    if (indexToInsertIn === -1) {
      this.dishesNotInMaking.push(dish);
      return;
    }
    this.dishesNotInMaking.splice(indexToInsertIn, 0, dish);
  }

  //Insert into waiting for making dish array
  insertIntoWaitingForMaking(dish: Dish) {
    if (this.dishesWaitingForMaking.length === 0) {
      this.dishesWaitingForMaking.push(dish);
      return;
    }
    const indexToInsertIn = this.dishesWaitingForMaking.findIndex(x => x.totalSeconds <= dish.totalSeconds);
    if (indexToInsertIn === -1) {
      this.dishesWaitingForMaking.push(dish);
      return;
    }
    this.dishesWaitingForMaking.splice(indexToInsertIn, 0, dish);
  }

  //Insert into making dish array
  insertIntoInMaking(dish: Dish) {
    if (this.dishesInMaking.length === 0) {
      this.dishesInMaking.push(dish);
      return;
    }
    const indexToInsertIn = this.dishesInMaking.findIndex(x => x.totalSeconds <= dish.totalSeconds);
    if (indexToInsertIn === -1) {
      this.dishesInMaking.push(dish);
      return;
    }
    this.dishesInMaking.splice(indexToInsertIn, 0, dish);
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
