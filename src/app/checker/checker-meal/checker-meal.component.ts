import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Meal, Dish } from 'app/order/order.model';
import { DishesService } from 'app/services/dishes.service';
import { FirebaseServiceService } from 'app/services/firebaseService/firebase-service.service';
import { dishStatus } from 'app/kitchen/kitchen.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-checker-meal',
  templateUrl: './checker-meal.component.html',
  styleUrls: ['./checker-meal.component.css']
})
export class CheckerMealComponent implements OnInit {

  @Input() restId: string;
  @Input() orderId: string;
  @Input() meal: Meal;
  @Input() isExpanded: boolean;

  @Output() mealIsReady: EventEmitter<Meal> = new EventEmitter<Meal>();

  dishes: Dish[] = [];
  readyDishes: number;

  constructor(private dishesService: DishesService, private fb: FirebaseServiceService, private afs: AngularFirestore, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.dishesService.getAll(this.restId, this.orderId, this.meal.docId).subscribe(x => {
      this.dishes = x;
      this.readyDishes = this.dishes.filter(dish => dish.status === 2).length;
      if (this.readyDishes === this.dishes.length) {
        this.snackBar.open(`Meal ${this.meal.mealId} from order id ${this.orderId} Is Ready`, null, { duration: 5000 });
      }
    });
  }


  mealIsReadyEvent(e: Event) {
    e.stopPropagation();
    if (this.readyDishes !== this.dishes.length) {
      alert('Cant Finish Meal Until All Dishes Are Ready!');
      return;
    }
    let returnedDishes = 0;

    this.dishes.forEach(x => {
      this.dishesService.substractDishFromStock(this.restId, this.orderId, this.meal.docId, x.name, 'completed')
        .then(x => {
          returnedDishes++;
          if (returnedDishes === this.dishes.length) {
            this.mealIsReady.emit(this.meal);
          }
        }).catch(x => {
          console.log(x);
          alert('error');
        })
    });
  }

  returnMeal(e: Event) {
    e.stopPropagation();
    let returnedDishes = 0;

    this.dishes.forEach(x => {
      this.dishesService.substractDishFromStock(this.restId, this.orderId, this.meal.docId, x.name, 'returned-dish')
        .then(x => {
          returnedDishes++;
          if (returnedDishes === this.dishes.length) {
            alert('All Dishes Returned');
          }
        }).catch(x => {
          console.log(x);
          alert('error');
        })
    });
  }
}
