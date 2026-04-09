import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem } from './cart';
import { Product } from '../products/product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
// Manage state with signals
  cartItems = signal<CartItem[]>([]);

  // Number of items in the cart
  cartCount = computed(() => this.cartItems()
    .reduce((accQty, item) => accQty + item.quantity, 0)
  );

  // Total up the extended price for each item
  subTotal = computed(() => this.cartItems().reduce((accTotal, item) =>
    accTotal + (item.quantity * item.product.price), 0));

  // Delivery is free if spending more than $50
  deliveryFee = computed<number>(() => this.subTotal() < 50 ? 5.99 : 0);

  // Tax could be based on shipping address zip code
  tax = computed(() => Math.round(this.subTotal() * 10.75) / 100);

  // Total price
  totalPrice = computed(() => this.subTotal() + this.deliveryFee() + this.tax());

  eLenght = effect(() =>
    console.log('Cart array length:', this.cartItems().length),
  );

  addToCart(product: Product): void {
    this.cartItems.update((items) => [...items, { product, quantity: 1 }]);
  }
}
