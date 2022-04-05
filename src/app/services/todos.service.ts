import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { TODO, TODO_STATUS } from '../types/todo';
import { switchMap, map, catchError } from 'rxjs/operators';
import { config } from '../data/config';
import { convertPropertyBindingBuiltins } from '@angular/compiler/src/compiler_util/expression_converter';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private TODOS_URL = 'https://jsonplaceholder.typicode.com/todos';

  constructor(private http: HttpClient) {}

  /**
   * Fetches todos from the TODOS_URL property
   *
   * @remarks
   * This method is part of the Todos Service
   *
   * @param none
   * @returns An Observable TODO array
   */
  getTodos(): Observable<TODO[]> {
    return this.http.get<any[]>(this.TODOS_URL).pipe(
      switchMap((todos) => {
        const timeNow = Date.now();

        // To check if the last digit of the time epoch is a prime number
        const lastDigit = timeNow % 10;
        if (this.isPrime(lastDigit)) {
          return throwError(`Error Message: "Last Digit is a prime number"`);
        }

        console.log(todos);
        return of(todos);
      }),
      map((todos) =>
        todos.slice(0, config.todos.fetch.count).map(this.hydrateTodo)
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Handles errors on http request
   *
   * @remarks
   * This method is part of the Todos Service
   *
   * @param error - Error returned by the http client
   * @returns A throwError function with the error message
   */
  private handleError(error: any): Observable<TODO[]> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error) {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    } else {
      console.log(error);
      errorMessage = error;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }

  /**
   * Create a single TODO
   *
   * @remarks
   * This method is part of the Todos Service
   *
   * @param todo - The number to be checked
   * @returns A TODO
   */
  private hydrateTodo(todo: any): TODO {
    return {
      title: todo.title,
      status: todo.completed ? TODO_STATUS.COMPLETED : TODO_STATUS.IN_PROGRESS,
    };
  }

  /**
   * Checks if a number is a prime number
   *
   * @remarks
   * This method is part of the Todos Service
   *
   * @param number - The number to be checked
   * @returns A boolean matching if the number is a prime number or not
   */
  private isPrime(number: number) {
    if (number < 2) return false;

    for (let divisor: number = 2; divisor < number; divisor++) {
      if (number % divisor == 0) {
        return false;
      }
    }
    return true;
  }
}
