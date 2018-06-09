import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as firebaseFunctions from 'firebase/functions';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { FirebaseServiceService } from './firebaseService/firebase-service.service';

@Injectable({
  providedIn: 'root'
})
export class KitchenService {

  private functions;
  private getDishesForOrderFunction;

  constructor(private afs: AngularFirestore, private fb: FirebaseServiceService) {
    this.functions = firebase.functions();
    this.getDishesForOrderFunction = this.functions.httpsCallable('getDishesForKitchen');
  }

  // getDishesForOrder(): Observable<{}> {
  //   return Observable.create(observer => {
  //     debugger;
  //     this.getDishesForOrderFunction({ restId: 'kibutz-222' })
  //       .then(x => {
  //         console.log(x);
  //         observer.next(x);
  //       })
  //       .catch(x => {
  //         console.log(x);
  //       });
  //   })
  // }

  getDishesForOrder(restId: string): Observable<{}> {
    const orders = {};
    let ordersCount = 0;
    let ordersInitialized = 0;
    return Observable.create(observer => {

      this.fb.fs.collection(`/RestAlfa/${restId}/Orders`).get().then(ordersQuerySnapshot => {

        ordersQuerySnapshot.forEach(orderQueryDocSnapshot => {
          orders[orderQueryDocSnapshot.id] = {
            dishes: {}
          };
          ordersCount++;
        });
        console.log('orders count', ordersCount);
        if(ordersCount === 0) {
          observer.next({});
          return;
        }

        for (let orderDoc of ordersQuerySnapshot.docs) {
          this.fb.fs.collection(`${orderDoc.ref.path}/meals`).get().then(mealsQuerySnapshot => {
            for (let mealDoc of mealsQuerySnapshot.docs) {
              this.fb.fs.collection(`${mealDoc.ref.path}/dishes`).get().then(dishesQuerySnapshot => {
                dishesQuerySnapshot.forEach(dishQueryDocSnapshot => {
                  const dish = dishQueryDocSnapshot.data();
                  dish.mealId = mealDoc.id;
                  const minutes = parseInt(dish.totalTime.substring(0, 2));
                  const seconds = parseInt(dish.totalTime.substring(3, 5));
                  dish.totalSeconds = (minutes * 60) + seconds;
                  orders[orderDoc.id].dishes[dishQueryDocSnapshot.id] = dish;
                });

                const longestDishTime = Object.keys(orders[orderDoc.id].dishes).reduce((max, dishId) => {
                  const value = orders[orderDoc.id].dishes[dishId];
                  return value.totalSeconds > max.seconds ? { seconds: value.totalSeconds, dishId } : max;
                }, { seconds: 0, dishId: '' });
                orders[orderDoc.id].longestDishTime = longestDishTime;

                ordersInitialized++;
                console.log('order initialized', ordersInitialized);
                if (ordersInitialized === ordersCount) {
                  console.log('resolving');
                  observer.next(orders);
                }
              })
            }
          })
        }
      }).catch(x => {
        console.log(x);
      });
    });
  }

  startMakingOrder(orderId: string) {
    return new Promise((resolve, reject) => {
      const doc = this.afs.doc(`/${this.fb.getRestRoot()}/kibutz-222/Orders/${orderId}`);
      doc.valueChanges().subscribe((x: { startedMaking?: Date }) => {
        debugger;
        if (!x.startedMaking) {
          doc.update({
            startedMaking: Date.now()
          }).then(x => {
            resolve();
            console.log(x);
          }).catch(x => {
            reject(x);
            console.log(x);
          })
        }
        resolve();
      });
    });
  }
}
