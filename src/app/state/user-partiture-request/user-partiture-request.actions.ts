import { UserRequestPartitureRequest } from "src/app/models/user-partiture-request/user-request-partiture-request";

export class CreateUserPartitureRequest {
  static readonly type = '[UserPartitureRequest] Create UserPartitureRequest';
  constructor(public payload: {userPartitureRequest: UserRequestPartitureRequest}) { }
}

export class GetUserRequestPartitureGroupByUser {
  static readonly type = '[UserPartitureRequest] Get UserRequestPartitureGroupByUser';
  constructor(public payload: {all: boolean}) { }
}

export class MarkReadUnreadNotificationMessage {
  static readonly type = '[UserPartitureGroup] MarkReadUnreadNotificationMessage';
  constructor(public payload: {userRequestPartitureRequest: UserRequestPartitureRequest}) { }
}

export class ResetUserPartitureRequest {
  static readonly type = '[UserPartitureRequest] Rest UserPartitureRequest';
  constructor(public payload: {}) { }
}