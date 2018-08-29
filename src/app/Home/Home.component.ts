import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireModule } from 'angularfire2';
import { DocumentChangeAction } from 'angularfire2/firestore/interfaces';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { UserInfo } from '../services/auth/UserInfo.model';

const enum dishStatus {
    new,
    inProgress,
    done
}


@Component({
    selector: 'dish-list',
    templateUrl: './Home.component.html',
    styleUrls: ['./Home.component.css']
})

export class HomeComponent implements OnInit {
    restsCollection: AngularFirestoreCollection<any>;
    orderCollection: AngularFirestoreCollection<any>;
    orderDocItem$: Subscription;
    test: any;
    email: string;
    userInfo: UserInfo = new UserInfo('', '', '', []);
    possibleRoles = ['checker', 'oven', 'stove', 'hot', 'cold', 'drinks', 'kitchen-manager'];
    @Output() titleChanged: EventEmitter<string> = new EventEmitter<string>();

    constructor(private afs: AngularFirestore, private router: Router, private authService: AuthService) {
    }

    ngOnInit() {
        this.authService.isLoggedIn().subscribe(x => {
            if (!x) {
                this.router.navigate(['login']);
                return;
            }
            this.authService.getUserInfo()
                .then(x => this.userInfo = x)
        });
    }

    //Navigate to user's role page(checker/cook)
    goToRolePage() {
        if (this.userInfo.role === 'checker') {
            this.router.navigate(['checker']);
        }
        else {
            this.router.navigate(['kitchen']);
        }
    }
}

