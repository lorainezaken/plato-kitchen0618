import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from "rxjs";
import { FirebaseServiceService } from "./firebaseService/firebase-service.service";
import { Meal, Dish } from "app/order/order.model";

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
}