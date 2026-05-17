import { apiService } from '../api.service';

export const bookService = {
  async getAllGenre() {
    return apiService.get('book/getAllGenre');
  },

  async addGenre(data) {
    return apiService.post('book/addGenre', data);
  },

  async getAllFaculty() {
    return apiService.get('book/getAllFaculty');
  },

  async addFaculty(data) {
    return apiService.post('book/addFaculty', data);
  },

  async getAllBook() {
    return apiService.get('book/getAllBook');
  },

  async getOneBook(keyword) {
    return apiService.post('book/getOneBook', { keyword });
  },

  async getOneTextBook(keyword) {
    return apiService.post('book/getOneTextBook', { keyword });
  },

  async getBookById(id) {
    return apiService.post('book/getBookById', { id });
  },

  async addBook(data) {
    return apiService.post('book/addbook', data);
  },

  async updateBook(id, data) {
    return apiService.post(`book/updateBook/${id}`, data);
  },

  async addTextBook(data) {
    return apiService.post('book/addTextBook', data);
  },

  async updateTextBook(id, data) {
    return apiService.post(`book/updateTextBook/${id}`, data);
  },

  async deleteBook(id) {
    return apiService.post(`book/deleteBook/${id}`);
  },

  async lendBook(data) {
    return apiService.post('book/lendBook', data);
  },

  async getInfoLendBook(data) {
    return apiService.post('book/getInfoLendBook', data);
  },

  async getTrackBorrowBook() {
    const response = await apiService.get('book/getTrackBorrowBook');
    return response;
  },

  async updateBorrowStatus(data) {
    return apiService.post('book/updateBorrowStatus', data);
  },

  async updateReturnStatus(data) {
    return apiService.post('book/updateReturnStatus', data);
  },

  async confirmPaidCompensation(data) {
    return apiService.post('book/confirmPaidCompensation', data);
  },

  async updateOverdueFee(data) {
    return apiService.post('book/updateOverdueFee', data);
  },

  async extendBorrowTime(data) {
    return apiService.post('book/extendBorrowTime', data);
  },

  async getBorrowBookOfUser(id) {
    return apiService.get(`book/getBorrowBookOfUser/${id}`);
  },

  async countCurrentBorrowing(data) {
    return apiService.post('book/countCurrentBorrowing', data);
  },

  async countCurrentBorrowingToday(data) {
    return apiService.post('book/countCurrentBorrowingToday', data);
  },

  async countCurrentPending(data) {
    return apiService.post('book/countCurrentPending', data);
  },

  async countCurrentPendingToday(data) {
    return apiService.post('book/countCurrentPendingToday', data);
  },

  async deletePending(data) {
    return apiService.delete('book/deletePending', { data });
  },

  async addFavoriteBook(data) {
    return apiService.post('book/addFavoriteBook', data);
  },

  async getFavoriteBooks(readerId) {
    const res = await apiService.get(`book/getFavoriteBooks/${readerId}`);
    return res;
  },

  async deleteFavoriteBook(data) {
    return apiService.delete('book/deleteFavoriteBook', { data });
  },

  async addRatingBook(data) {
    return apiService.post('book/addRatingBook', data);
  },

  async getRatingByBookAndReader(data) {
    return apiService.post('book/getRatingByBookAndReader', data);
  },

  async getRatingByBook(data) {
    return apiService.post('book/getRatingByBook', data);
  },

  async getAllCommentRating(data) {
    return apiService.post('book/getAllCommentRating', data);
  },

  async deleteRatingBook(data) {
    return apiService.delete('book/deleteRatingBook', { data });
  },

  async updateRatingComment(data) {
    return apiService.patch('book/updateRatingComment', data);
  },

  async addBookView(data) {
    return apiService.post('book/addBookView', data);
  },

  async getMostViewBook() {
    return apiService.get('book/getMostViewBook');
  },

  async getTodayBook() {
    return apiService.get('book/getTodayBook');
  },

  async getTopTenWeekBook() {
    return apiService.get('book/getTopTenWeekBook');
  },

  async getTrendingBook() {
    return apiService.get('book/getTrendingBook');
  },

  async getPopularBook() {
    return apiService.get('book/getPopularBook');
  },

  async getPopularBookFilter() {
    return apiService.get('book/getPopularBookFilter');
  },

  async getBookPenaltyRule() {
    return await apiService.get('book/getBookPenaltyRule');
  },

  async updateBookPenaltyRule(data) {
    return apiService.post('book/updateBookPenaltyRule', data);
  },

  async getBookBorrowRule() {
    return await apiService.get('book/getBookBorrowRule');
  },

  async updateBookBorrowRule(data) {
    return apiService.post('book/updateBookBorrowRule', data);
  },

  async confirmRepaired(data) {
    return apiService.post('book/confirmRepaired', data);
  },

  async addThesis(data) {
    return apiService.post('book/addThesis', data);
  },

  async getOneThesis(data) {
    return apiService.post('book/getOneThesis', data);
  },

  async getAllThesis() {
    return apiService.get('book/getAllThesis');
  },

  async approveThesis(data) {
    return apiService.post('book/approveThesis', data);
  },

  async rejectThesis(data) {
    return apiService.post('book/rejectThesis', data);
  },

  async updatePenaltyFee(data) {
    return apiService.post('book/updatePenaltyFee', data);
  },

  async createDotNop(data) {
    return apiService.post('book/createDotNop', data);
  },

  async getAllDotNop() {
    return apiService.get('book/getAllDotNop');
  },

  async updateDotNop(data) {
    return apiService.post('book/updateDotNop', data);
  },

  async deleteDotNop(data) {
    return apiService.post('book/deleteDotNop', data);
  },

  async getActiveDotNop() {
    return apiService.get('book/getActiveDotNop');
  },

  async getAllNamHoc() {
    return apiService.get('book/getAllNamHoc');
  },

  async getAllKyHoc() {
    return apiService.get('book/getAllKyHoc');
  },

  async addKyHoc(data) {
    return apiService.post('book/addKyHoc', data);
  },

  async addNamHoc(data) {
    return apiService.post('book/addNamHoc', data);
  },

  async addNienLuan(formData) {
    return apiService.post('book/addNienLuan', formData);
  },

  async getOneNienLuan(data) {
    return apiService.post('book/getOneNienLuan', data);
  },

  // Giảng viên - Quản lý đợt nộp
  async createDotNopNienLuan(data) {
    return apiService.post('book/createDotNopNienLuan', data);
  },

  async getAllDotNopNienLuan(data) {
    return apiService.post('book/getAllDotNopNienLuan', data);
  },

  async updateDotNopNienLuan(data) {
    return apiService.post('book/updateDotNopNienLuan', data);
  },

  async deleteDotNopNienLuan(data) {
    return apiService.post('book/deleteDotNopNienLuan', data);
  },

  async getActiveDotNopNienLuan(data) {
    return apiService.post('book/getActiveDotNopNienLuan', data);
  },

  // Giảng viên - Quản lý danh sách niên luận
  async getAllNienLuanByGiangVien(data) {
    return apiService.post('book/getAllNienLuanByGiangVien', data);
  },

  async approveNienLuan(data) {
    return apiService.post('book/approveNienLuan', data);
  },

  async rejectNienLuan(data) {
    return apiService.post('book/rejectNienLuan', data);
  },

  async getAllGiangVien() {
    return apiService.get('book/getAllGiangVien');
  },

  async getAllActiveDotNopNienLuan(maDocGia) {
    return apiService.get(`/book/getAllActiveDotNopNienLuan/${maDocGia}`);
  },

  async checkNienLuanSubmission() {
    return apiService.get(
      `/book/checkNienLuanSubmission/${userId}/${dotNopId}`
    );
  },

  async getAllNienLuanCuaKhoa(data) {
    return apiService.post('book/getAllNienLuanCuaKhoa', data);
  },

  async getStatisticBook() {
    return apiService.get('book/getStatisticBook');
  },

  async getAllNXB() {
    return apiService.get('book/getAllNXB');
  },

  async getAllGiangVien() {
    return apiService.get('book/getAllGiangVien');
  },

  async submitFilePdfReportStatistic(data) {
    return apiService.post('book/submitFilePdfReportStatistic', data);
  },

  async submitFileExcelReportStatistic(data) {
    return apiService.post('book/submitFileExcelReportStatistic', data);
  },

  async getReportStatisticByReporter(data) {
    return apiService.post('book/getReportStatisticByReporter', data);
  },

  async deleteOneReportStatistic(data) {
    return apiService.delete('book/deleteOneReportStatistic', { data });
  },

  async getAllReportStatistic(data) {
    return apiService.get('book/getAllReportStatistic', data);
  },

  async getAllNienLuanForAdmin(data) {
    return apiService.get('book/getAllNienLuanForAdmin', data);
  },

  async getAllDotNopForAdmin(data) {
    return apiService.get('book/getAllDotNopForAdmin', data);
  },

  async getStatisticsByDot(data) {
    return apiService.get('book/getStatisticsByDot', data);
  },

  async getAllNganhHoc(data) {
    return apiService.get('book/getAllNganhHoc', data);
  },

  async getAllGiangVienForAdmin(data) {
    return apiService.get('book/getAllGiangVienForAdmin', data);
  },

  async addBookIntoShelf(data) {
    return apiService.post('book/addBookIntoShelf', data);
  },

  async getAllBooksOnShelf(readerId) {
    const res = await apiService.get(`book/getAllBooksOnShelf/${readerId}`);
    if (res && res.DanhSachSach) {
      return res.DanhSachSach.map((item) => item.MaSach).filter((book) => book);
    }
    return [];
  },

  async removeBookFromShelf(data) {
    return apiService.post('book/removeBookFromShelf', data);
  },
  
  async checkBookInShelf(data) {
    return apiService.post('book/checkBookInShelf', data);
  },

  async createBorrowingSlip(data) {
    return apiService.post('book/createBorrowingSlip', data);
  },

  async importBookApi() {
    return apiService.get('book/importBookApi');
  },
};
