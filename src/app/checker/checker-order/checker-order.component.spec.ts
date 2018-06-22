import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckerOrderComponent } from './checker-order.component';

describe('CheckerOrderComponent', () => {
  let component: CheckerOrderComponent;
  let fixture: ComponentFixture<CheckerOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckerOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
