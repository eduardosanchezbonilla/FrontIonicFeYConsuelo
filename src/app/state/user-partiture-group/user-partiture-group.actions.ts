import { UserPartitureGroup } from "src/app/models/user-partiture-group/user-partiture-group";

export class CreateUserPartitureGroup {
  static readonly type = '[UserPartitureGroup] Create UserPartitureGroup';
  constructor(public payload: {userPartitureGroup: UserPartitureGroup}) { }
}

export class GetUserPartitureGroups {
  static readonly type = '[UserPartitureGroup] Get UserPartitureGroup';
  constructor(public payload: {username: string}) { }
}

export class DeleteUserPartitureGroup {
  static readonly type = '[UserPartitureGroup] Delete UserPartitureGroup';
  constructor(public payload: {userPartitureGroup: UserPartitureGroup}) { }
}

export class ResetUserPartitureGroup {
  static readonly type = '[UserPartitureGroup] Rest UserPartitureGroup';
  constructor(public payload: {}) { }
}