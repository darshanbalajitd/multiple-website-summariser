import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ScraperService {
  private backendUrl = 'http://localhost:5000';
  private apiUrl = `${this.backendUrl}/api/summarize`;

  constructor(private http: HttpClient) {}

  getSummary(urls: string[], keyword: string): Observable<{ summary: string }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<{ summary: string }>(
      this.apiUrl, 
      { urls, keyword },
      { headers }
    ).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.status === 0) {
      errorMessage = 'Cannot connect to backend. Is it running on http://localhost:5000?';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error ${error.status}: ${error.message}`;
    }

    console.error('❌ API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
