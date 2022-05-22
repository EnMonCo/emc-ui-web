import BaseEntity from './BaseEntity';
import UserStatus from './UserStatus';
import Role from './UserRole';

export default class User extends BaseEntity {
  constructor(
    { id, email, bearerToken, firstName, lastName, createdAt, updatedAt, deletedAt, photo, role, status },
    __entity = 'User'
  ) {
    super(__entity);
    this.bearerToken = bearerToken;
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.photo = photo;
    this.role = new Role({ id: role.id, name: role.name }, role.__entity);
    this.status = new UserStatus({ id: status.id, name: status.name }, status.__entity);
  }
}
