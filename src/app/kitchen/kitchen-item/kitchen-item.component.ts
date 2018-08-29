import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FirebaseServiceService } from '../../services/firebaseService/firebase-service.service';
import { KitchenService } from '../../services/kitchen.service';
import { dishStatus } from '../kitchen.component';
import { AuthService } from 'app/services/auth/auth.service';
import { UserInfo } from 'app/services/auth/UserInfo.model';
import { DishesService } from '../../services/dishes.service';

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
  passedColor = 'black';
  remainingTime: number;
  userInfo: UserInfo = null;

  maxMinutesBeforeStartingMaking: number;
  maxSecondsBeforeStartingMaking: number;

  secondsBeforeAlerting = 120;

  toTime = (seconds) => `${seconds < 10 ? '0' : ''}${seconds}`;

  constructor(private fb: FirebaseServiceService, private kitchenService: KitchenService,
    private authService: AuthService, private dishService: DishesService) { }

  ngOnInit() {
    this.authService.getUserInfo().then(x => this.userInfo = x);
    this.restRoot = this.fb.getRestRoot();

    /*CALCULATE TIMES FOR UI*/
    this.maxMinutesBeforeStartingMaking = Math.floor(this.dish.maxSecondsBeforeStartingMaking / 60);
    this.maxSecondsBeforeStartingMaking = this.dish.maxSecondsBeforeStartingMaking - (this.maxMinutesBeforeStartingMaking * 60);
    this.timer = setInterval(() => {
      const orderTime: any = new Date(this.dish.order.time.seconds * 1000);
      this.passedTime = Math.floor((Date.now() - orderTime) / 1000);
      this.passedMinutes = Math.floor(this.passedTime / 60);
      this.passedSeconds = this.passedTime - (this.passedMinutes * 60);
      this.remainingTime = this.dish.maxSecondsBeforeStartingMaking - this.passedTime;

      if (this.remainingTime <= this.secondsBeforeAlerting) {
        this.passedColor = 'red';
      }

    }, 1000);
  }

  //Update dish status to in making
  startMakingDish() {
    this.dishService.startMakingDish(this.restID, this.dish.order.id, this.dish.meal.docId, this.dish.name, this.userInfo.name)
      .catch(x => {
        alert('Error updating meal status');
        console.log(x);
      });
  }

  updateInP(temp: any) {
    const startedMaking = this.onStartedMaking;
    const kitchenService = this.kitchenService;
    const dish = this.dish;
    const restId = this.restID;
    const userInfo = this.userInfo;

    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
      .update({
        "status": dishStatus.inProgress
      }).then(function () {
        kitchenService.startMakingOrder(dish.orderId, restId, dish.mealId, dish.name, userInfo.name)
          .then(x => startedMaking.emit());
        console.log('updateInP success');
      }).catch(function (err) {
        console.log(err);
      });
  }

  //Update status to done
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
