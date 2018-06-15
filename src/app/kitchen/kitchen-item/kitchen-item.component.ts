import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FirebaseServiceService } from '../../services/firebaseService/firebase-service.service';
import { KitchenService } from '../../services/kitchen.service';
import { dishStatus } from '../kitchen.component';

@Component({
  selector: 'kitchen-item',
  templateUrl: './kitchen-item.component.html',
  styleUrls: ['./kitchen-item.component.css']
})
export class KitchenItemComponent implements OnInit {

  @Input() dish;
  @Input() restID;
  @Output() onStartedMaking = new EventEmitter();

  restRoot;

  constructor(private fb: FirebaseServiceService, private kitchenService: KitchenService) { }

  ngOnInit() {
    this.restRoot = this.fb.getRestRoot();
  }


  updateInP(temp: any) {
    const startedMaking = this.onStartedMaking;
    const kitchenService = this.kitchenService;
    const dish = this.dish;
    this.fb.fs.doc(this.restRoot + '/' + this.restID + '/Orders/' + this.dish.orderId + '/meals/' + this.dish.mealId + '/dishes/' + this.dish.name)
      .update({
        "status": dishStatus.inProgress
      }).then(function () {
        kitchenService.startMakingOrder(dish.orderId)
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


}
