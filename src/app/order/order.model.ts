export class Order {
    id: string;
    name: string;
    startedMaking: Date;
    meals: Meal[] = [];
    tableId: string;
    status: number;
    longestMakingTimeDishInOrder: number;
}
export class Meal {
    mealId: string;
    docId: string;
    status: number;
    tableId: string;
    dishes: Dish[];
    pic: string;

    constructor(_dishes) {
        this.dishes = _dishes;
    }
}

export class Dish {
    category: string;
    totalSeconds: number;
    name: string;
    status: number;
    order: Order;
    meal: Meal;
    totalTime: string;
    uuid: string;

    constructor(_name, _status) {
        this.name = _name;
        this.status = _status;
    }
}