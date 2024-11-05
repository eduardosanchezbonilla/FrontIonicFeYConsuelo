import { NotificationRequestDto } from "src/app/models/notification/NotificationRequestDto";

export class SendNotification {
  static readonly type = '[Notification] SendNotification';
  constructor(public payload: {notificationRequest: NotificationRequestDto}) { }
}

export class GetNotificationUserTokens {
  static readonly type = '[Notification] GetNotificationUserTokens';
  constructor(public payload: {}) { }
}

export class GetNotificationTopics {
  static readonly type = '[Notification] GetNotificationUTopics';
  constructor(public payload: {}) { }
}

export class ResetNotification {
  static readonly type = '[Notification] ResetNotification';
  constructor(public payload: {}) { }
}