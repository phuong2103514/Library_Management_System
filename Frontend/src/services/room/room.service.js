import { apiService } from '../api.service';

export const roomService = {
  async addRoom(data) {
    return apiService.post('room/addRoom', data);
  },

  async getAllRoom() {
    return apiService.get('room/getAllRoom');
  },

  async updateRoom(data) {
    return apiService.post('room/updateRoom', data);
  },

  async deleteRoom(id) {
    return apiService.delete(`room/deleteRoom/${id}`);
  },

  async getAllBookRoomByUserId(data) {
    return apiService.post('room/getAllBookRoomByUserId', data);s
  },

  async getAllBookRoomAdmin() {
    return apiService.get('room/getAllBookRoomAdmin');
  },

  async createBooking(data) {
    return apiService.post('room/createBooking', data);
  },

  async approveBooking(data) {
    return apiService.post('room/approveBooking', data);
  },

  async denyBooking(data) {
    return apiService.post('room/denyBooking', data);
  },

  async cancelBooking(data) {
    return apiService.post('room/cancelBooking', data);
  },

  async checkInRoom(data) {
    return apiService.post('room/checkInRoom', data);
  },

  async getBookedTimeSlotForRoom(data) {
    return apiService.post('room/getBookedTimeSlotForRoom', data);
  },

  async getRoomRule() {
    return apiService.get('room/getRoomRule');
  },

  async updateRoomRule(data) {
    return apiService.post('room/updateRoomRule', data);
  },

  async searchMemberByCode(data) {
    return apiService.post('room/searchMemberByCode', data);
  },

  async getMyInvitations(data) {
    return apiService.post('room/getMyInvitations', data);
  },

  async respondToInvitation(data) {
    return apiService.post('room/respondToInvitation', data);
  },

  async checkMemberConflict(data) {
    return apiService.post('room/checkMemberConflict', data);
  },

  async getBookingsAsMember(data) {
    return apiService.post('room/getBookingsAsMember', data);
  },

  async getAvailableSeats(data) {
    return apiService.post('room/getAvailableSeats', data);
  },

  async getRoomById(data) {
    return apiService.post('room/getRoomById', data);
  },

  async getBookingsByRoom(data) {
    return apiService.post('room/getBookingsByRoom', data);
  },

  async getStatisticRoom() {
    return apiService.get('room/getStatisticRoom');
  },
};
