import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, of, range, generate } from 'rxjs';
import { concatMap, delay, concatAll } from 'rxjs/operators';
import { config } from '../../data/config';
import { BUTTON_STATE } from '../../types/btn-state';

@Component({
  selector: 'app-todo-button',
  templateUrl: './todo-button.component.html',
  styleUrls: ['./todo-button.component.scss'],
})
export class TodoButtonComponent implements OnInit {
  BUTTON_STATE: typeof BUTTON_STATE = BUTTON_STATE;

  @Output() stateChange = new EventEmitter<BUTTON_STATE>();

  private delaySecs: number = config.todos.delayAfterLoadSecs;

  private _state: BUTTON_STATE;
  /**
   * Sets the current state of the component
   */
  set state(state) {
    this._state = state;
    this.reflectState();
    this.stateChange.emit(state);
  }

  /**
   * Fetches the current state of the component
   */
  get state() {
    return this._state;
  }

  btnText: string;
  btnDisabled: boolean;

  ngOnInit() {
    this.state = BUTTON_STATE.LOADING;
  }

  /**
   * Updates the Button State to its Loading State
   *
   * @remarks
   * This method is part of the TodoButton Component
   *
   * @param none
   * @returns undefined
   */
  onClick() {
    this.state = BUTTON_STATE.LOADING;
  }

  /**
   * Updates the Button UI according to the current state
   *
   * @remarks
   * This method is part of the TodoButton Component
   *
   * @param none
   * @returns undefined
   */
  private reflectState() {
    switch (this.state) {
      case BUTTON_STATE.LOADING:
        this.btnText = 'loading...';
        this.btnDisabled = true;
        break;
      case BUTTON_STATE.ERROR:
        this.btnText = 'Load Error.Retry';
        this.btnDisabled = false;
        break;
      case BUTTON_STATE.LOADED_AND_DELAYING:
        this.btnDisabled = true;
        this.delay().subscribe({
          next: (remainingTime) => {
            this.btnText = `wait ${remainingTime} sec${
              remainingTime > 1 ? 's' : ''
            } `;
          },
          complete: () => {
            this.state = BUTTON_STATE.LOADED;
          },
        });
        break;
      case BUTTON_STATE.LOADED:
        this.btnDisabled = false;
        this.btnText = 'reload';
        break;
    }
  }

  /**
   * Emits a countdown beginning from the delaySecs property
   *
   * @remarks
   * This method is part of the TodoButton Component
   *
   * @param none
   * @returns An Observable
   */
  private delay(): Observable<number> {
    const delaySecs = this.delaySecs;

    return of(
      generate(
        delaySecs,
        (x) => x > 1,
        (x) => x - 1,
        (x) => x
      )
    ).pipe(
      concatAll(),
      concatMap((item) => of(item).pipe(delay(1000)))
    );
  }
}
