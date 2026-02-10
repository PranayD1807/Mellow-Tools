import { EncryptableEntity } from "./EncryptableEntity";

export class Bookmark extends EncryptableEntity {
  id!: string;
  label!: string;
  note?: string;
  user!: string;
  url!: string;
  logoUrl!: string;
  createdAt!: string;
  updatedAt!: string;

  static encryptFields(): string[] {
    return ["label", "note", "logoUrl", "url"];
  }

  encryptFields(): (keyof this)[] {
    return Bookmark.encryptFields() as (keyof this)[];
  }
}

export class CreateBookmarkData extends EncryptableEntity {
  label!: string;
  note?: string;
  url!: string;
  logoUrl?: string;

  encryptFields(): (keyof this)[] {
    return ["label", "note", "logoUrl", "url"];
  }
}
