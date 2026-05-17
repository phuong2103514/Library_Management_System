import { apiService } from '../api.service';

export const libraryService = {
  async getLibraryCard(data) {
    return apiService.post('library/getLibraryCard', data);
  },

  async getAllInfoExpireCard() {
    return apiService.get('library/getAllInfoExpireCard');
  },

  async renewLibraryCard(data) {
    return apiService.post('library/renewLibraryCard', data);
  },

  async updateAvatar(data) {
    return apiService.post('library/updateAvatar', data);
  },

  async requestCardReprint(data) {
    return apiService.post('library/requestCardReprint', data);
  },

  async getStatusCardReprint(data) {
    return apiService.post('library/getStatusCardReprint', data);
  },

  async getAllInfoRenewCard() {
    return apiService.get('library/getAllInfoRenewCard');
  },

  async approveReissueCard(data) {
    return apiService.post('library/approveReissueCard', data);
  },

  async denyReissueCard(data) {
    return apiService.post('library/denyReissueCard', data);
  },

  async printCard(data) {
    return apiService.post('library/printCard', data);
  },

  async getCardRule() {
    return apiService.get('library/getCardRule');
  },

  async updateCardRule(data) {
    return apiService.post('library/updateCardRule', data);
  },

  async getCardRule() {
    return apiService.get('library/getCardRule');
  },

  async getAllLibraryCards() {
    return apiService.get('library/getAllLibraryCards');
  },

  async uploadLibraryCardsExcelForLecturers(data) {
    return apiService.post('library/uploadLibraryCardsExcelForLecturers', data);
  },

  async uploadLibraryCardsExcelForStudents(data) {
    return apiService.post('library/uploadLibraryCardsExcelForStudents', data);
  },


  async updateOneLibraryCardStudent(cardId, data) {
    return apiService.put(`library/updateOneLibraryCardStudent/${cardId}`, data);
  },

  async updateOneLibraryCardLecturer(cardId, data) {
    return apiService.put(`library/updateOneLibraryCardLecturer/${cardId}`, data);
  },

  async getAllNganhHoc(data) {
    return apiService.get('book/getAllNganhHoc', data);
  },

  async getAllFaculty() {
    return apiService.get('book/getAllFaculty');
  },

  async getAllBoMon() {
    return apiService.get('book/getAllBoMon');
  },
};
