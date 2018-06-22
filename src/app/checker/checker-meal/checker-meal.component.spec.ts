import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckerMealComponent } from './checker-meal.component';

describe('CheckerMealComponent', () => {
  let component: CheckerMealComponent;
  let fixture: ComponentFixture<CheckerMealComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckerMealComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
