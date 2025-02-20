import { EncryptableEntity } from "./EncryptableEntity";

export class Note extends EncryptableEntity {
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

export class CreateNoteData extends EncryptableEntity {
  title!: string;
  text!: string;

  encryptFields(): (keyof this)[] {
    return ["title", "text"];
  }
}
