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

    //Get all dishes
    getAll(restId: string, orderId: string, mealId: string): Observable<Dish[]> {
        const ordersCollection = this.afs.collection<Dish>(`/${this.fb.getRestRoot()}/${restId}/Orders/${orderId}/meals/${mealId}/dishes`);
        return ordersCollection.valueChanges();
    }

    //Change dish status to in making
    startMakingDish(restId: string, orderId: string, mealId: string, dishId: string, cookName: string): Promise<void> {
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
                batch.update(dishDoc, { status: dishStatus.inProgress, cookName });

                batch.commit().then(resolve).catch(reject);
            });
        })
    }

    //Change dish status
    changeDishStatus(restId: string, orderId: string, mealId: string, dishId: string, newStatus: dishStatus): Promise<void> {
        return this.afs.doc(`/RestAlfa/${restId}/Orders/${orderId}/meals/${mealId}/dishes/${dishId}`).update({ status: newStatus })
    }

    //Update stock according to dish materials
    substractDishFromStock(restId: string, orderId: string, mealId: string, dishId: string, reason: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.afs.collection(`/RestAlfa/${restId}/Orders/${orderId}/meals/${mealId}/dishes/${dishId}/groceries`).ref.get()
                .then(groceriesDocs => {
                    const materials = {};

                    //Count groceries raw material and put into materials object
                    groceriesDocs.docs.forEach(grocery => {
                        const rawMaterials = grocery.data().rawMaterial;
                        Object.keys(rawMaterials).forEach(rawMaterial => {
                            if (materials[rawMaterial]) {
                                materials[rawMaterial] += rawMaterials[rawMaterial];
                            }
                            else {
                                materials[rawMaterial] = rawMaterials[rawMaterial];
                            }
                        })
                    });

                    const updatesToMake = Object.keys(materials).length;
                    let updatesMade = 0;

                    //Loop all material validate there is enough to make the dish
                    Object.keys(materials).forEach(material => {
                        this.afs.doc(`/RestAlfa/${restId}/WarehouseStock/${material}`).ref.get()
                            .then(materialDoc => {
                                const data = materialDoc.data();
                                if (data.value.amount - materials[material] < 0) {
                                    reject({ reason: 'You dont have enough ' + material });
                                    return;
                                }
                            }).catch(reject);
                    });

                    //Loop all the meterials and update it's amount
                    Object.keys(materials).forEach(material => {
                        //Get raw material
                        this.afs.doc(`/RestAlfa/${restId}/WarehouseStock/${material}`).ref.get()
                            .then(materialDoc => {
                                const data = materialDoc.data();
                                data.value.amount -= materials[material];
                                //Update amount in db
                                this.afs.doc(`/RestAlfa/${restId}/WarehouseStock/${material}`).set(data).then(x => {
                                    this.afs.collection(`/RestAlfa/${restId}/WarehouseStock/${material}/Activities`).add({
                                        diff: materials[material],
                                        reason
                                    }).then(x => {
                                        updatesMade++;
                                        if (updatesMade === updatesToMake) {
                                            resolve();
                                        }
                                    }).catch(reject);
                                }).catch(reject);
                            }).catch(reject);
                    })
                }).catch(reject);
        });
    }

    //Update dish is done
    finishDish(restId: string, orderId: string, mealId: string, dishId: string) {
        const batch = this.afs.firestore.batch();
        const dish = this.afs.doc(`/RestAlfa/${restId}/Orders/${orderId}/meals/${mealId}/dishes/${dishId}`);
        batch.update(dish.ref, { status: dishStatus.done });
        return batch.commit();
    }
}
