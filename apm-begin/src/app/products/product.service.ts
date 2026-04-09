import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
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
import { toSignal } from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/productss';
  private productUrl = 'api/products/';

  private http = inject(HttpClient);
  private httpErrorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(
    undefined,
  );
  readonly productSelected$ = this.productSelectedSubject.asObservable();

  private products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((p) => console.log(JSON.stringify(p))),
    shareReplay(1),
    tap(() =>
      console.log('After shareReplay in ProductService products$ pipeline'),
    ),
    catchError((err) => this.handleError(err)),
  );
  // products = toSignal(this.products$, { initialValue: [] as Product[] });
  products = computed(() => {
    try {
      return toSignal(this.products$, { initialValue: [] as Product[] })();
    } catch (error) {
      return [] as Product[];
    }
  });

  readonly product$ = this.productSelected$.pipe(
    filter(Boolean),
    switchMap((id) => {
      return this.http.get<Product>(this.productUrl + id).pipe(
        switchMap((product) => this.getProductWithReviews(product)),
        catchError((err) => this.handleError(err)),
      );
    }),
  );

  // product$ = combineLatest([
  //   this.productSelected$, 
  //   this.products$
  // ]).pipe(
  //   map(([selectedProductId, products]) =>
  //     products.find((p) => p.id === selectedProductId),
  //   ),
  //   filter(Boolean),
  //   switchMap((product) => this.getProductWithReviews(product)),
  //   catchError((err) => this.handleError(err)),
  // );

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
