import { Component, OnInit, Input } from '@angular/core';
import { Order, Meal } from 'app/order/order.model';
import { MealsService } from 'app/services/meals.service';
import { FirebaseServiceService } from 'app/services/firebaseService/firebase-service.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { dishStatus } from 'app/kitchen/kitchen.component';

@Component({
  selector: 'app-checker-order',
  templateUrl: './checker-order.component.html',
  styleUrls: ['./checker-order.component.css']
})
export class CheckerOrderComponent implements OnInit {

  @Input() order: Order;
  @Input() restId: string;

  meals: Meal[];

  constructor(private mealsService: MealsService, private fb: FirebaseServiceService, private afs: AngularFirestore) { }

  ngOnInit() {
    this.mealsService.getAll(this.restId, this.order.id).subscribe(x => this.meals = x.filter(meal => meal.status !== dishStatus.done));
  }

  mealIsReady(meal) {
    const restRoot = this.fb.getRestRoot();
    const orderId = this.order.id;
    this.mealsService.mealIsReady(this.restId, this.order.id, meal)
      .catch(x => {
        alert('Error updating meal');
        console.log(x);
      })
  }


}
