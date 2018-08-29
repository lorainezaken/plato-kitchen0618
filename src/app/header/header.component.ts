import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { UserInfo } from '../services/auth/UserInfo.model';
import { FirebaseServiceService } from '../services/firebaseService/firebase-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userInfo: UserInfo | any = {};
  selectedRest;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService, private firebaseSettings: FirebaseServiceService) {
    console.log('nana--> ', this.router.url === '/cold'); // array of states
    console.log(activatedRoute.snapshot.url)

  }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(x => {
      if (!x) {
        this.router.navigate(['login']);
        return;
      }
      this.authService.getUserInfo().then(x => {
        this.userInfo = x;
        this.selectedRest = x.rests[0];
        this.restChanged(event);
      }).catch(x => this.router.navigate(['login']));
    });

  }

  //Handle Rest change event
  restChanged(event) {
    this.firebaseSettings.setRest(this.selectedRest);
  }

  logout() {
    this.authService.logout().then(x => {
      this.router.navigate(['login']);
    })
  }

}
