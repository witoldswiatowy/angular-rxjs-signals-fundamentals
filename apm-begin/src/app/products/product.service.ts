import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Product } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private productUrl = 'api/products/';

  private http = inject(HttpClient);
  private httpErrorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(
    undefined,
  );
  readonly productSelected$ = this.productSelectedSubject.asObservable();

  readonly products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((p) => console.log(JSON.stringify(p))),
    shareReplay(1),
    tap(() =>
      console.log('After shareReplay in ProductService products$ pipeline'),
    ),
    catchError((err) => this.handleError(err)),
  );

  readonly product$ = this.productSelected$
  .pipe(
    filter(Boolean),
    switchMap((id) => {
      return this.http.get<Product>(this.productUrl + id)
        .pipe(
          switchMap((product) => this.getProductWithReviews(product)),
          catchError((err) => this.handleError(err)),
      );
    }),
  );

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(this.productUrl + id).pipe(
      tap(() => console.log(`In http.get pipeline for id=${id}`)),
      switchMap((product) => this.getProductWithReviews(product)),
      catchError((err) => this.handleError(err)),
    );
  }

  productSelected(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(map((reviews) => ({ ...product, reviews }) as Product));
    } else {
      return of(product);
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.httpErrorService.formatError(err);
    return throwError(() => formattedMessage);
  }
}
