export interface ICreateGearInput {
  name: string;
  description: string;
  brand: string;
  dailyRate: number;
  stock: number;
  availableStock: number;
  condition: string;
  image?: string;
  specifications?: string;
  status?: "AVAILABLE" | "OUT_OF_STOCK" | "RENTED";
  categoryId?: string;
}

export interface IUpdateGearInput
  extends Partial<ICreateGearInput> {}

export interface IGearQuery {
  searchTerm?: string;
  categoryId?: string;
  brand?: string;
  status?: "AVAILABLE" | "OUT_OF_STOCK" | "RENTED";
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}