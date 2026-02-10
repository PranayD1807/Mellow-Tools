import { EncryptableEntity } from "./EncryptableEntity";

export class TextNote extends EncryptableEntity {
  id!: string;
  title!: string;
  text!: string;
  user!: string;
  createdAt!: string;
  updatedAt!: string;

  static encryptFields(): string[] {
    return ["title", "text"];
  }

  encryptFields(): (keyof this)[] {
    return TextNote.encryptFields() as (keyof this)[];
  }
}

export class CreateTextNoteData extends EncryptableEntity {
  title!: string;
  text!: string;

  encryptFields(): (keyof this)[] {
    return ["title", "text"];
  }
}
