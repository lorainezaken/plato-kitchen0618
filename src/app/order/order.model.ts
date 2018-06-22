export class Order {
    id: string;
    name: string;
    startedMaking: Date;
    meals: Meal[] = [];
    tableId: string;
    status: number;
}
export class Meal {
    docId: string;
    status: number;
    tableId: string;
    dishes: Dish[];

    constructor(_dishes) {
        this.dishes = _dishes;
    }
}

export class Dish {
    name: string;
    status: number;

    constructor(_name, _status) {
        this.name = _name;
        this.status = _status;
    }
}