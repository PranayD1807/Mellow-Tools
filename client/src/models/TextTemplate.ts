export interface TextTemplate {
  id: string;
  title: string;
  content: string;
  placeholders: Array<{
    tag: string;
    defaultValue?: string;
  }>;
  user: string;
  createdAt: string;
  updatedAt: string;
}
