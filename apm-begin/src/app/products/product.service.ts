import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private productUrl = 'api/products/';

  // constructor(private http: HttpClient) { } //zamiast tego lepiej użyć inject() w polu, bo to jest bardziej elastyczne i pozwala na łatwiejsze testowanie, czyli: private http = inject(HttpClient);

  private http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.productsUrl)
      .pipe(tap(() => console.log('In http.get pipeline')));
  }

  // getProduct(id: number) {
  //   const productUrl = this.productsUrl + '/' + id;
  //   return this.http.get<Product>(productUrl);
  // }

  //   getProduct(id: number): Observable<Product> {
  //   return this.http.get<Product>(this.productUrl + id);
  // }

  getProduct(id: number): Observable<Product> {
    return this.http
      .get<Product>(this.productUrl + id)
      .pipe(
        tap(() => console.log(`In http.get pipeline for id=${id}`))
      );
  }
}
