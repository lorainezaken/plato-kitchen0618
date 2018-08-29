import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseServiceService } from '../../services/firebaseService/firebase-service.service';
import { KitchenService } from '../../services/kitchen.service';
import { dishStatus } from '../kitchen.component';
import { DishesService } from '../../services/dishes.service';


@Component({
  selector: 'kitchen-item-in-making',
  templateUrl: './kitchen-item-in-making.component.html',
  styleUrls: ['./kitchen-item-in-making.component.css']
})
export class KitchenItemInMakingComponent implements OnInit {

  @Input() restID;
  @Input() dish;
  @Output() onDone = new EventEmitter();
  passedSecondsTotal: number;
  passedMinutes: number;
  passedSeconds: string;
  remainingSecondsTotal: number;
  remainingMinutes: number;
  remainingSeconds: string;

  restRoot;

  toTime = (seconds) => `${seconds < 10 ? '0' : ''}${seconds}`;

  constructor(private fb: FirebaseServiceService, private kitchenService: KitchenService,
    private dishService: DishesService) { }

  ngOnInit() {
    this.restRoot = this.fb.getRestRoot();
    console.log(this.dish);

    /*CALCULATE TIMES FOR UI*/
    const makingDate = this.dish.order.startedMaking;
    setInterval(() => {
      const now = Date.now();
      this.passedSecondsTotal = this.toSeconds(now - makingDate);
      this.passedMinutes = Math.floor(this.passedSecondsTotal / 60);
      this.passedSeconds = this.toTime(this.passedSecondsTotal - (this.passedMinutes * 60));

      this.remainingSecondsTotal = this.dish.totalSeconds - this.passedSecondsTotal;
      this.remainingMinutes = Math.floor(this.remainingSecondsTotal / 60);
      this.remainingSeconds = this.toTime(this.remainingSecondsTotal - (this.remainingMinutes * 60));
    }, 1000);

  }

  private toSeconds(x: number): number { return Math.floor(x / 1000); }

  //Update dish status to done
  updateDone() {
    this.dishService.finishDish(this.restID, this.dish.order.id, this.dish.meal.docId, this.dish.name)
      .catch(x => {
        alert('Error finish dish');
        console.log(x);
      })
  }
}
