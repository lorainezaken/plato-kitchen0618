import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Meal, Dish } from 'app/order/order.model';
import { DishesService } from 'app/services/dishes.service';
import { FirebaseServiceService } from 'app/services/firebaseService/firebase-service.service';
import { dishStatus } from 'app/kitchen/kitchen.component';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-checker-meal',
  templateUrl: './checker-meal.component.html',
  styleUrls: ['./checker-meal.component.css']
})
export class CheckerMealComponent implements OnInit {

  @Input() restId: string;
  @Input() orderId: string;
  @Input() meal: Meal;

  @Output() mealIsReady: EventEmitter<Meal> = new EventEmitter<Meal>();

  dishes: Dish[] = [];
  readyDishes: number;

  constructor(private dishesService: DishesService, private fb: FirebaseServiceService, private afs: AngularFirestore) {
  }

  ngOnInit() {
    this.dishesService.getAll(this.restId, this.orderId, this.meal.docId).subscribe(x => {
      this.dishes = x;
      this.readyDishes = this.dishes.filter(dish => dish.status === 2).length;
    });
  }

  mealIsReadyEvent() {
    this.mealIsReady.emit(this.meal);
  }
}
