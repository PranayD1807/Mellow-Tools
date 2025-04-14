import { EncryptableEntity } from "./EncryptableEntity";

export class TextNote extends EncryptableEntity {
  id!: string;
  title!: string;
  text!: string;
  user!: string;
  createdAt!: string;
  updatedAt!: string;

  encryptFields(): (keyof this)[] {
    return ["title", "text"];
  }
}

export class CreateTextNoteData extends EncryptableEntity {
  title!: string;
  text!: string;

  encryptFields(): (keyof this)[] {
    return ["title", "text"];
  }
}
