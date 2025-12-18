import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, catchError, throwError } from 'rxjs';

interface LoginResponse {
  message: string;
  token: string;
  user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:5000/api/users';
  private tokenKey = 'km_token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem('km_user', JSON.stringify(res.user));
        }
      }),
      catchError(err => {
        console.error('AuthService.login error:', err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('km_user');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
