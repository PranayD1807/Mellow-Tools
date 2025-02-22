import { EncryptableEntity } from "./EncryptableEntity";

export class TextTemplate extends EncryptableEntity {
  id!: string;
  title!: string;
  content!: string;
  placeholders!: Array<{
    tag: string;
    defaultValue?: string;
  }>;
  user!: string;
  createdAt!: string;
  updatedAt!: string;

  encryptFields(): (keyof this)[] {
    return ["title", "content", "placeholders"];
  }
}

export class CreateTextTemplateData extends EncryptableEntity {
  title!: string;
  content!: string;
  placeholders!: Array<{
    tag: string;
    defaultValue?: string;
  }>;

  encryptFields(): (keyof this)[] {
    return ["title", "content", "placeholders"];
  }
}
