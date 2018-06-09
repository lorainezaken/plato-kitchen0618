export class Order {
    id: string;
    name: string;
    startedMaking: Date;
    orders : any[];
    meals: Meal[];
    constructor(_name, _orders,_meals){ // Make sure you set default value so you dont have to create new class like i did: new Dish('',[]);
        this.name = _name;
        this.orders = _orders;
        this.meals = _meals;
    }
}
export class Meal{
    dishes: Dish[];

    constructor(_dishes){
        this.dishes = _dishes;
    }
}

export class Dish{
    name: string; //OR ID?
    status: string;

    constructor(_name, _status){
        this.name = _name;
        this.status = _status;
    }
}