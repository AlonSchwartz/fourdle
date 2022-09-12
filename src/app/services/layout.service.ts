import { Injectable } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor(private BreakpointObserver: BreakpointObserver) { this.checkLayout() }

  isPortrait: boolean = false;
  public screenLayoutObserver = new BehaviorSubject<boolean>(false);

  checkLayout() {
    this.BreakpointObserver.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.screenLayoutObserver.next(true)
      }
      else {
        this.screenLayoutObserver.next(false)
      }
    })
  }
}
