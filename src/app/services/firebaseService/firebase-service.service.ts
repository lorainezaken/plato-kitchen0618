import { Injectable, Inject } from '@angular/core';
import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase'
import { Observable } from 'rxjs';

@Injectable()
export class FirebaseServiceService {
  fs: firebase.firestore.Firestore;
  private restRoot = 'RestAlfa';
  private restID = '';
  private restIdObservable;
  private restIdObserver;

  constructor(@Inject(FirebaseApp) private FirebaseApp: firebase.app.App) {
    const settings = { timestampsInSnapshots: true }
    this.fs = firebase.firestore(this.FirebaseApp);
    this.fs.settings(settings);
    this.restIdObservable = Observable.create(observer => {
      this.restIdObserver = observer;
    });
    this.restIdObservable.subscribe();
  }

  getRestRoot(): string {
    return this.restRoot;
  }

  setRest(rest: string) {
    this.restID = rest;
    this.restIdObserver.next(this.restID);
  }

  getRestObservable(): Observable<string> {
    return this.restIdObservable;
  }

  getRest(): string {
    return this.restID;
  }
}
