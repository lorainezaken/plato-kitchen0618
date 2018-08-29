import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from "rxjs";
import { FirebaseServiceService } from "./firebaseService/firebase-service.service";
import { Meal } from "app/order/order.model";
import * as firebase from 'firebase';
import * as firebaseFunctions from 'firebase/functions';

@Injectable({
    providedIn: 'root'
})
export class MealsService {

    private functions;
    private finishMealFunction;

    constructor(private fb: FirebaseServiceService, private afs: AngularFirestore) {
        this.functions = firebase.functions();
        this.finishMealFunction = this.functions.httpsCallable('finishMeal');
    }

    //Get All Meals
    getAll(restId: string, orderId: string): Observable<Meal[]> {
        const ordersCollection = this.afs.collection<Meal>(`/${this.fb.getRestRoot()}/${restId}/Orders/${orderId}/meals`);
        return Observable.create(observer => {
            ordersCollection.snapshotChanges().subscribe(mealsSnapshots => {
                const meals = [];
                mealsSnapshots.forEach(x => {
                    const meal = x.payload.doc.data();
                    meal.docId = x.payload.doc.id;
                    meals.push(meal);
                })
                observer.next(meals);
            })
        });
    }

    //Update that meal is ready
    mealIsReady(restId: string, orderId: string, meal: Meal): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fb.fs.doc(`/RestAlfa/${restId}/Orders/${orderId}/meals/${meal.docId}`).update({ status: 2 })
                .then(() => {
                    this.fb.fs.collection(`/RestAlfa/${restId}/CompleteOrders/orders/${meal.tableId}`).doc(meal.docId).set(meal)
                        .then(() => {
                            this.fb.fs.collection(`/RestAlfa/${restId}/Orders/${orderId}/meals`).get()
                                .then(x => {
                                    const docs = x.docs.map(x => x.data());
                                    //If all meals are ready then update order status to done
                                    if (x.docs.findIndex(x => x.data().status !== 2) !== -1) {
                                        resolve();
                                        return;
                                    } else {
                                        this.fb.fs.doc(`/RestAlfa/${restId}/Orders/${orderId}`).update({ status: 2 })
                                            .then(resolve).catch(reject);
                                    }
                                }).catch(reject);
                        });
                }).catch(reject);
        })
    }

}
