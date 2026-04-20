export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export enum ProductType {
  DIGITAL = "DIGITAL",
  PHYSICAL = "PHYSICAL",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  type: ProductType;
  price: number;
  stock: number | null;
  alertLimit: number;
}

export interface CaisseSession {
  id: string;
  managerId: string;
  openedAt: Date;
  closedAt: Date | null;
  openingBalance: number;
  theoreticalBal: number;
  realBalance: number | null;
}

export interface Transaction {
  id: string;
  caisseId: string;
  amount: number;
  type: "SALE" | "EXPENSE";
  description: string;
  isCancelled: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  isCompleted: boolean;
  remindAt: Date | null;
  managerId: string | null;
}
