export interface ApiResponse<T> {
  status: string;
  results?: number;
  data: T;
  err?: {
    message: string;
    status?: string;
  };
}
