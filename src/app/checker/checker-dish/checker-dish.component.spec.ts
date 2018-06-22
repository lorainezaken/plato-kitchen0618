import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckerDishComponent } from './checker-dish.component';

describe('CheckerDishComponent', () => {
  let component: CheckerDishComponent;
  let fixture: ComponentFixture<CheckerDishComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckerDishComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
