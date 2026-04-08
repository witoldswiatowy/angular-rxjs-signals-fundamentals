import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private productUrl = 'api/products/';

  // constructor(private http: HttpClient) { } //zamiast tego lepiej użyć inject() w polu, bo to jest bardziej elastyczne i pozwala na łatwiejsze testowanie, czyli: private http = inject(HttpClient);

  private http = inject(HttpClient);
  private httpErrorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(() => console.log('In http.get pipeline')),
        catchError(err => this.handleError(err))
      );
      //jest to sposób deklaratywny, który jest bardziej elastyczny i łatwiejszy do testowania, ponieważ products$ jest strumieniem Observable, 
      // który można subskrybować w różnych miejscach aplikacji, a jego wartość będzie aktualizowana automatycznie, gdy dane zostaną pobrane. 


      //jest to sposób proceduralny, który jest mniej elastyczny i trudniejszy do testowania, ponieważ metoda getProducts() musi być wywołana, 
      // aby pobrać produkty, a to może prowadzić do problemów z synchronizacją i zarządzaniem stanem. W przeciwieństwie do tego, 
      // użycie strumienia Observable pozwala na łatwiejsze zarządzanie asynchronicznością i lepszą integrację z innymi strumieniami danych w aplikacji.
  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.productsUrl)
  //     .pipe(
  //       tap(() => console.log('In http.get pipeline')),
  //       // catchError(err => {
  //       //   console.error('Error in getProducts: ', err);
  //       //   return of(ProductData.products);
  //       // })
  //       catchError(err => this.handleError(err))
  //     );
  // }

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
        switchMap(product => this.getProductWithReviews(product)),
        //uzyto switchMap, bo przy wyborze innego produktu, chcemy anulować poprzednie żądanie recenzji i rozpocząć nowe dla nowego produktu. Nie musimy czekać aż załaduje się poprzedni produkt, żeby rozpocząć ładowanie recenzji dla nowego produktu. switchMap automatycznie anuluje poprzednie żądanie i rozpoczyna nowe, co jest idealne w tym przypadku.
        
        //dwie inne mapy, to concatMap i mergeMap, ale one nie anulują poprzedniego żądania, więc mogą prowadzić do sytuacji, gdzie mamy wiele żądań recenzji w toku, co może być niepożądane.
        //concatMap: zachowuje kolejność żądań, ale nie anuluje poprzednich, więc jeśli użytkownik szybko wybiera różne produkty, może prowadzić do wielu żądań recenzji w toku. Robi pokolei żądania, więc jeśli użytkownik szybko wybiera różne produkty, może prowadzić do opóźnień w ładowaniu recenzji dla nowych produktów, ponieważ musi czekać aż poprzednie żądanie się zakończy.
        //mergeMap: nie zachowuje kolejności i nie anuluje poprzednich, więc może prowadzić do sytuacji, gdzie recenzje dla różnych produktów są mieszane, co może być mylące dla użytkownika. Robi równolegle żądania, więc jeśli użytkownik szybko wybiera różne produkty, może prowadzić do wielu żądań recenzji w toku i mieszania wyników.
        catchError(err => this.handleError(err))
      );
  }

  getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
      .pipe(
        map(reviews => ({ ...product, reviews }) as Product)
      );
    } else {
      return of(product);
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.httpErrorService.formatError(err);
    return throwError(() => formattedMessage);
  }
}
