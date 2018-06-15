import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FirebaseServiceService } from '../../services/firebaseService/firebase-service.service';
import { KitchenService } from '../../services/kitchen.service';
import { dishStatus } from '../kitchen.component';

@Component({
  selector: 'kitchen-item',
  templateUrl: './kitchen-item.component.html',
  styleUrls: ['./kitchen-item.component.css']
})
export class KitchenItemComponent implements OnInit, OnDestroy {


  @Input() dish;
  @Input() restID;
  @Output() onStartedMaking = new EventEmitter();
  @Output() onAlertStartMaking = new EventEmitter();

  timer;
  restRoot;
  passedTime: number;
  passedMinutes: number;
  passedSeconds: number;
  passedColor = 'red';
  remainingTime: number;

  maxMinutesBeforeStartingMaking: number;
  maxSecondsBeforeStartingMaking: number;

  secondsBeforeAlerting = 120;

  toTime = (seconds) => `${seconds < 10 ? '0' : ''}${seconds}`;

  constructor(private fb: FirebaseServiceService, private kitchenService: KitchenService) { }

  ngOnInit() {
    this.restRoot = this.fb.getRestRoot();
    this.maxMinutesBeforeStartingMaking = Math.floor(this.dish.maxSecondsBeforeStartingMaking / 60);
    this.maxSecondsBeforeStartingMaking = this.dish.maxSecondsBeforeStartingMaking - (this.maxMinutesBeforeStartingMaking * 60);
    this.timer = setInterval(() => {
      this.passedTime = Math.floor((Date.now() - this.dish.orderTime) / 1000);
      this.passedMinutes = Math.floor(this.passedTime / 60);
      this.passedSeconds = this.passedTime - (this.passedMinutes * 60);
      this.passedColor = this.dish.alerted ? 'red' : 'black';
      this.remainingTime = this.dish.maxSecondsBeforeStartingMaking - this.passedTime;

      if (this.remainingTime <= this.secondsBeforeAlerting) {
        this.onAlertStartMaking.emit(this.dish);
      }

    }, 1000);
  }

  updateInP(temp: any) {
    const startedMaking = this.onStartedMaking;
    const kitchenService = this.kitchenService;
    const dish = this.dish;
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
      .update({
        "status": dishStatus.inProgress
      }).then(function () {
        kitchenService.startMakingOrder(dish.orderId, this.restID)
          .then(x => startedMaking.emit());
        console.log('updateInP success');
      }).catch(function (err) {
        console.log(err);
      });
  }
  updateDone(dish) {
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
      .update({
        "status": dishStatus.done
      }).then(function () {
        console.log('updateDone success');
      }).catch(function (err) {
        console.log(err);
      });
  }

  deleteDish(dish) {
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
      .delete().then(function () {
        console.log('delete success');
      }).catch(function (err) {
        console.log(err);
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
