import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseServiceService } from '../../services/firebaseService/firebase-service.service';
import { KitchenService } from '../../services/kitchen.service';
import { dishStatus } from '../kitchen.component';


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
  remainingSecondsTotal: number;
  remainingMinutes: number;
  remainingSeconds: number;

  restRoot;

  constructor(private fb: FirebaseServiceService, private kitchenService: KitchenService) { }

  ngOnInit() {
      this.restRoot = this.fb.getRestRoot();
      console.log(this.dish);
      const makingDate = this.dish.startedMaking;
      setInterval(() => {
        const now = Date.now();
        this.passedSecondsTotal = this.toSeconds(now - makingDate);
        this.remainingSecondsTotal = this.dish.totalSeconds - this.passedSecondsTotal;
      }, 1000);

  }

  private toSeconds(x: number): number { return Math.floor(x / 1000); }

  // updateInP(dish) {
  //   this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
  //     .update({
  //       "status": dishStatus.inProgress
  //     }).then(function () {
  //       console.log('updateInP success');
  //     }).catch(function (err) {
  //       console.log(err);
  //     });

  //   this.kitchenService.startMakingOrder(this.dish.orderId, this.restID);
  // }
  updateDone(dish) {
    const done = this.onDone;
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
      .update({
        "status": dishStatus.done
      }).then(function () {
        console.log('updateDone success');
        done.emit();
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

}
