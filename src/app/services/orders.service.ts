import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from "rxjs";
import { FirebaseServiceService } from "./firebaseService/firebase-service.service";
import { Order, Meal } from "app/order/order.model";

@Injectable({
    providedIn: 'root'
})
export class OrdersService {

    private functions;
    private getDishesForOrderFunction;

    constructor(private fb: FirebaseServiceService, private afs: AngularFirestore) {
    }

    //Get All Orders
    getAll(restId: string): Observable<Order[]> {
        const ordersCollection = this.afs.collection<Order>(`/${this.fb.getRestRoot()}/${restId}/Orders`);
        return ordersCollection.valueChanges();
    }
}
