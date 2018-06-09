import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from "rxjs";
import { Order } from "../order/order";
import { FirebaseServiceService } from "./firebaseService/firebase-service.service";

@Injectable({
    providedIn: 'root'
})
export class OrdersService {

    private functions;
    private getDishesForOrderFunction;

    constructor(private fb: FirebaseServiceService, private afs: AngularFirestore) {
    }

    getAll(restId: string): Observable<Order[]> {
        return this.afs.collection<Order>(`/${this.fb.getRestRoot()}/${restId}/Orders`).valueChanges();
    }
}