import { Product } from "./product";

export interface OrderItem {
  product: Product;

  quantity: number;

  price: number;
}

export interface Order {
  _id: string;

  items: OrderItem[];

  totalItems: number;

  totalAmount: number;

  paymentMethod: string;

  paymentStatus: string;

  orderStatus: string;

  createdAt: string;
}