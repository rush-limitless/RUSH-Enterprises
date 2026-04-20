import { Product, CaisseSession, Transaction, Task } from "../entities";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: Omit<Product, "id">): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  findLowStock(): Promise<Product[]>;
}

export interface ICaisseRepository {
  findById(id: string): Promise<CaisseSession | null>;
  findOpenByManager(managerId: string): Promise<CaisseSession | null>;
  open(managerId: string, openingBalance: number): Promise<CaisseSession>;
  close(id: string, realBalance: number): Promise<CaisseSession>;
}

export interface ITransactionRepository {
  findByCaisse(caisseId: string): Promise<Transaction[]>;
  create(data: Omit<Transaction, "id" | "createdAt" | "isCancelled">): Promise<Transaction>;
  cancel(id: string): Promise<Transaction>;
}

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findByManager(managerId: string): Promise<Task[]>;
  create(data: Omit<Task, "id">): Promise<Task>;
  complete(id: string): Promise<Task>;
  findDueForReminder(): Promise<Task[]>;
}
