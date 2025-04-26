import { ContactRequest } from "src/app/models/contact/contact-request";

export class CreateContactRequest {
  static readonly type = '[Contact] Create ContactRequest';
  constructor(public payload: {contactRequest: ContactRequest}) { }
}

export class GetContactRequest {
  static readonly type = '[Contact] Get ContactRequest';
  constructor(public payload: {all: boolean}) { }
}

export class MarkReadUnread {
  static readonly type = '[Contact] MarkReadUnread';
  constructor(public payload: {contactRequest: ContactRequest}) { }
}

export class ResetContactRequest {
  static readonly type = '[Contact] Reset ContactRequest';
  constructor(public payload: {}) { }
}