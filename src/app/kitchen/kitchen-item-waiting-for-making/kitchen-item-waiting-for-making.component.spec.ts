import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenItemWaitingForMakingComponent } from './kitchen-item-waiting-for-making.component';

describe('KitchenItemWaitingForMakingComponent', () => {
  let component: KitchenItemWaitingForMakingComponent;
  let fixture: ComponentFixture<KitchenItemWaitingForMakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitchenItemWaitingForMakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitchenItemWaitingForMakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
