import { apiService } from '../api.service';

export const notificationService = {
  async createNotification(data) {
    return apiService.post('notification/createNotification', data);
  },

  async getAllNotificationByUserId(data) {
    return apiService.post('notification/getAllNotificationByUserId', data);
  },

  async markMultipleAsRead(data) {
    return apiService.post('notification/markMultipleAsRead', data);
  }
};
