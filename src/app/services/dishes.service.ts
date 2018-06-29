import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from "rxjs";
import { FirebaseServiceService } from "./firebaseService/firebase-service.service";
import { Meal, Dish, Order } from "app/order/order.model";
import { dishStatus } from "../kitchen/kitchen.component";

@Injectable({
    providedIn: 'root'
})
export class DishesService {

    private functions;
    private getDishesForOrderFunction;

    constructor(private fb: FirebaseServiceService, private afs: AngularFirestore) {
    }

    getAll(restId: string, orderId: string, mealId: string): Observable<Dish[]> {
        const ordersCollection = this.afs.collection<Dish>(`/${this.fb.getRestRoot()}/${restId}/Orders/${orderId}/meals/${mealId}/dishes`);
        return ordersCollection.valueChanges();
    }

    startMakingDish(restId: string, orderId: string, mealId: string, dishId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const batch = this.afs.firestore.batch();
            const orderDoc = this.afs.doc(`/${this.fb.getRestRoot()}/${restId}/Orders/${orderId}`).ref;
            this.afs.doc<Order>(orderDoc).valueChanges().subscribe(x => {
                if (x.status === dishStatus.new) {
                    batch.update(orderDoc, { startedMaking: Date.now() });
                }   

                const mealDoc = orderDoc.collection('meals').doc(mealId);
                const dishDoc = mealDoc.collection('dishes').doc(dishId);
                batch.update(orderDoc, { status: dishStatus.inProgress });
                batch.update(mealDoc, { status: dishStatus.inProgress });
                batch.update(dishDoc, { status: dishStatus.inProgress });

                batch.commit().then(resolve).catch(reject);
            });
        })
    }
}