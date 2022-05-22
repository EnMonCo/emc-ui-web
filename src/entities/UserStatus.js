import BaseEntity from "./BaseEntity";

export default class UserStatus extends BaseEntity {
  constructor({id, name}, __entity = "Status") {
    super(__entity);
    this.id = id;
    this.name = name;
  }
}
