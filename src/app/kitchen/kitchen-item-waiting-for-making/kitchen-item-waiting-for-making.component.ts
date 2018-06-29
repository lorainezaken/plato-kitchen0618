import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FirebaseServiceService } from '../../services/firebaseService/firebase-service.service';
import { KitchenService } from '../../services/kitchen.service';
import { dishStatus } from '../kitchen.component';
import { MatSnackBar } from '@angular/material';
import { DishesService } from 'app/services/dishes.service';
import { AuthService } from 'app/services/auth/auth.service';
import { UserInfo } from 'app/services/auth/UserInfo.model';


@Component({
  selector: 'kitchen-item-waiting-for-making',
  templateUrl: './kitchen-item-waiting-for-making.component.html',
  styleUrls: ['./kitchen-item-waiting-for-making.component.css']
})
export class KitchenItemWaitingForMakingComponent implements OnInit, OnDestroy {

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  @Input() restID;
  @Input() dish;
  @Output() onStartedMaking = new EventEmitter();

  restRoot;

  totalSecondsRemainingBeforeStartingMaking: number;
  secondsRemainingBeforeStartingMaking: string;
  minutesRemainingBeforeStartingMaking: number;

  timer;
  userInfo: UserInfo;

  toTime = (seconds) => `${seconds < 10 ? '0' : ''}${seconds}`;  

  constructor(private fb: FirebaseServiceService, private kitchenService: KitchenService, public snackBar: MatSnackBar,
    private dishService: DishesService, private authService: AuthService) { }

  inSeconds(x) { return Math.floor(x / 1000); }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        return;
      }

      this.authService.getUserInfo().then(userInfo => {
        this.userInfo = userInfo;
      })
    });

    this.restRoot = this.fb.getRestRoot();
    this.timer = setInterval(() => {
      const passed = this.inSeconds(Date.now() - this.dish.order.startedMaking);
      this.totalSecondsRemainingBeforeStartingMaking = this.dish.order.longestMakingTimeDishInOrder - this.dish.totalSeconds - passed;
      this.minutesRemainingBeforeStartingMaking = Math.floor(this.totalSecondsRemainingBeforeStartingMaking / 60);
      this.secondsRemainingBeforeStartingMaking = this.toTime(this.totalSecondsRemainingBeforeStartingMaking - (this.minutesRemainingBeforeStartingMaking * 60));

      if (this.totalSecondsRemainingBeforeStartingMaking === 0) {
        this.snackBar.open(`Start Making ${this.dish.name}`, 'Start', { duration: 5000 }).onAction().subscribe(x => {
          this.startMakingDish();
        });
      }
    }, 1000);
  }

  startMakingDish() {
    this.dishService.startMakingDish(this.restID, this.dish.order.id, this.dish.meal.docId, this.dish.name, this.userInfo.name)
      .catch(x => {
        alert('Error updating meal status');
        console.log(x);
      });
  }

  updateInProgress(temp: any) {
    const startedMaking = this.onStartedMaking;
    const kitchenService = this.kitchenService;
    const dish = this.dish;
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
      .update({
        "status": dishStatus.inProgress
      }).then(function () {
        startedMaking.emit();
        console.log('updateInP success');
      }).catch(function (err) {
        console.log(err);
      });

  }

}
