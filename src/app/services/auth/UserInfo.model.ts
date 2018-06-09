import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";

export class UserInfo {
    email: string = '';
    name: string = '';
    role: string = '';
    rests: string[] = [];

    constructor(email, name, role, rests) {
        this.email = email;
        this.name = name;
        this.role = role;
        this.rests = rests;
    }
}