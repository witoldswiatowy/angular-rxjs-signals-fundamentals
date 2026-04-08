import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private productUrl = 'api/products/';

  // constructor(private http: HttpClient) { } //zamiast tego lepiej użyć inject() w polu, bo to jest bardziej elastyczne i pozwala na łatwiejsze testowanie, czyli: private http = inject(HttpClient);

  private http = inject(HttpClient);
  private httpErrorService = inject(HttpErrorService);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(() => console.log('In http.get pipeline')),
        // catchError(err => {
        //   console.error('Error in getProducts: ', err);
        //   return of(ProductData.products);
        // })
        catchError(err => this.handleError(err))
      );
  }

  // getProduct(id: number) {
  //   const productUrl = this.productsUrl + '/' + id;
  //   return this.http.get<Product>(productUrl);
  // }

  //   getProduct(id: number): Observable<Produc> {
  //   return this.http.get<Product>(this.productUrl + id);
  // }

  getProduct(id: number): Observable<Product> {
    return this.http
      .get<Product>(this.productUrl + id)
      .pipe(
        tap(() => console.log(`In http.get pipeline for id=${id}`)),
        catchError(err => this.handleError(err))
      );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.httpErrorService.formatError(err);
    return throwError(() => formattedMessage);
  }
}
