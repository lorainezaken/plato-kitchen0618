import { Component, OnInit, Input } from '@angular/core';
import { Dish } from 'app/order/order.model';
import { DishesService } from '../../services/dishes.service';
import { dishStatus } from '../../kitchen/kitchen.component';

@Component({
  selector: 'app-checker-dish',
  templateUrl: './checker-dish.component.html',
  styleUrls: ['./checker-dish.component.css']
})
export class CheckerDishComponent implements OnInit {

  @Input() restId: string;
  @Input() orderId: string;
  @Input() mealId: string;
  @Input() dish: Dish;

  constructor(private dishService: DishesService) { }

  ngOnInit() {
  }

  returnDish(e: Event) {
    e.stopPropagation();
    this.dishService.substractDishFromStock(this.restId, this.orderId, this.mealId, this.dish.name, 'returned-dish')
      .then(x => {
        this.dishService.changeDishStatus(this.restId, this.orderId, this.mealId, this.dish.name, dishStatus.new)
          .then(x => {
            alert('returned');
          }).catch(x => {
            alert('error');
            console.log(x);
          })
      }).catch(x => {
        if (x.reason) {
          alert(x.reason);
          return;
        }
        alert('error');
        console.log(x);
      })
  }

  complete(e) {
    e.stopPropagation();
    this.dishService.substractDishFromStock(this.restId, this.orderId, this.mealId, this.dish.name, 'completed')
      .then(x => {
        alert('finished');
      }).catch(x => {
        if (x.reason) {
          alert(x.reason);
          return;
        }
        alert('error');
        console.log(x);
      })
  }
}
