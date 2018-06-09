import { Injectable } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase";
import { Observable } from "rxjs/index";
import { AngularFirestore } from 'angularfire2/firestore';
import { UserInfo } from './UserInfo.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;

  constructor(private _firebaseAuth: AngularFireAuth, private router: Router, private afs: AngularFirestore) {
    this.user = _firebaseAuth.authState;
    this.user.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
          console.log(this.userDetails);
        }
        else {
          this.userDetails = null;
        }
      }
    );
  }

  login(email: string, password: string) {
    return this._firebaseAuth.auth.signInWithEmailAndPassword(email, password);
  }

  isLoggedIn(): Observable<boolean> {
    return Observable.create(observer => {
      this.user.subscribe(
        (user) => {
          if (user) {
            this.userDetails = user;
            observer.next(true);
          }
          else {
            this.userDetails = null;
            observer.next(false);
          }
        }
      )
    });
  }
  logout() {
    return this._firebaseAuth.auth.signOut();
  }

  getUserInfo(): Promise<UserInfo> {
    return new Promise<UserInfo>((resolve, reject) => {
      const email = this.userDetails.email;

      this.afs.collection<UserInfo>('/GlobWorkers', ref => ref.where('email', '==', email)).snapshotChanges().subscribe(x => {
        const id = x[0].payload.doc.id;
        const data = x[0].payload.doc.data();
        this.afs.collection(`/GlobWorkers/${id}/Rest`).valueChanges().subscribe(rest => {
          console.log(rest);
          const rests = rest.map(x => Object.keys(x)[0]);
          const userInfo = new UserInfo(data.email, data.name, data.role, rests);
          resolve(userInfo);
        });
      })
    });
  };
}
