import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  urlApi =
    'https://test-task-7823e-default-rtdb.europe-west1.firebasedatabase.app/images.json';

  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  sendImage(image: any): Observable<any> {
    return this.http
      .post<any>(this.urlApi, JSON.stringify(image), this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occured:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error,
      );
    }
    return throwError('Something went wrong; please try it again.');
  }
}
