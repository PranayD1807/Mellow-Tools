export interface ApiResponse<T> {
  status: string;
  results?: number;
  totalResults?: number;
  totalPages?: number;
  page?: number;
  data: T;
  err?: {
    message: string;
    status?: string;
  };
}
