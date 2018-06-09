import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FirebaseServiceService } from '../../services/firebaseService/firebase-service.service';
import { KitchenService } from '../../services/kitchen.service';
import { dishStatus } from '../kitchen.component';
import { MatSnackBar } from '@angular/material';


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

  secondsRemainingBeforeStartingMaking: number;
  timer;

  constructor(private fb: FirebaseServiceService, private kitchenService: KitchenService, public snackBar: MatSnackBar) { }

  inSeconds(x) { return Math.floor(x / 1000); }

  ngOnInit() {
    this.restRoot = this.fb.getRestRoot();
    this.timer = setInterval(() => {
      const passed = this.inSeconds(Date.now() - this.dish.startedMaking);
      this.secondsRemainingBeforeStartingMaking = this.dish.longestDishInOrder - this.dish.totalSeconds - passed;
      if (this.secondsRemainingBeforeStartingMaking === 0) {
        this.snackBar.open(`Start Making ${this.dish.name}`, 'Start', { duration: 5000 }).onAction().subscribe(x => {
          this.updateInProgress();
        });
      }
    }, 1000);
  }

  updateInProgress() {
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
