import { Component, inject } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent],
})
export class ProductListComponent {
  pageTitle = 'Products';
  errorMessage = '';
  // sub!: Subscription;

  private productService = inject(ProductService);

  // Products
  readonly products$ = this.productService.products$.pipe(
    // tap(() => console.log('In ProductListComponent ngOnInit')),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    }),
  );
  // products: Product[] = [];

  // Selected product id to highlight the entry
  // selectedProductId: number = 0;
  readonly selectedProductId$ = this.productService.productSelected$;

  //zmieniliśmy na sposób deklaratywny, który jest bardziej elastyczny i łatwiejszy do testowania, ponieważ products$ jest strumieniem Observable,
  //   ngOnInit(): void {
  //     this.sub = this.productService.products$
  //       .pipe(
  //         tap(() => console.log('In ProductListComponent ngOnInit')),
  //         catchError(err => {
  //           this.errorMessage = err;
  //           return EMPTY;
  //         })
  //       ).
  //       subscribe(products => {
  //           this.products = products;
  //             console.log('log wewnątrz subskrypcji', this.products); //ten log wyświetli już załadowane produkty, ponieważ znajduje się wewnątrz subskrypcji, która jest wywoływana po otrzymaniu danych z serwera.
  //       });
  //     console.log('log poza subskrypcją', this.products); //ten log wyświetli pustą tablicę na początku pojawienia się strony, ponieważ subskrypcja jest asynchroniczna i produkty nie zostały jeszcze załadowane w momencie wyświetlania tego loga.
  //   }
  // //Ta opcja wyżej jest bardziej poprawna, ponieważ pozwala na obsługę błędów bezpośrednio w strumieniu danych i zapewnia, że logowanie produktów odbywa się tylko po ich załadowaniu. Opcja z logowaniem wewnątrz subskrypcji jest bardziej odpowiednia, ponieważ daje pewność, że produkty zostały załadowane przed próbą ich logowania, podczas gdy logowanie poza subskrypcją może prowadzić do nieoczekiwanych wyników, takich jak logowanie pustej tablicy produktów.
  //     // .subscribe({
  //     // next: products => {
  //     // this.products = products;
  //     // console.log('log wewnątrz subskrypcji', this.products);
  //     // },
  //     // error: err => {
  //     // this.errorMessage = err;
  //     // }
  //     // });
  //     // console.log('log poza subskrypcją', this.products);
  //     // }

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
