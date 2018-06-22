import { Component, OnInit, Input } from '@angular/core';
import { Dish } from 'app/order/order.model';

@Component({
  selector: 'app-checker-dish',
  templateUrl: './checker-dish.component.html',
  styleUrls: ['./checker-dish.component.css']
})
export class CheckerDishComponent implements OnInit {

  @Input() restId: string;
  @Input() dish: Dish;
  
  constructor() { }

  ngOnInit() {
  }

}
