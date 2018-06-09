import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  email = "lorainezaken@gmail.com";
  password = "123456";

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  login() {
    this.authService.login(this.email, this.password)
      .then(x => {
        alert("Logged In");
        this.router.navigate(['home']);
      })
      .catch(e => {
        alert(e.message);
      })
  }

}
