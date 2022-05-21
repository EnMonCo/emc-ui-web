import BaseEntity from "./BaseEntity";

export default class Role extends BaseEntity {
  constructor({id, name}, __entity = "Role") {
    super(__entity);
    this.id = id;
    this.name = name;
  }
}
