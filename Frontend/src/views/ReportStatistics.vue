<template>
  <div class="bao-cao-container">
    <div class="header-section">
      <h1 class="page-title">Quản Lý Báo Cáo Thống Kê</h1>
      <p class="subtitle">Xem và quản lý các báo cáo từ Thủ Thư</p>
    </div>

    <!-- Bộ lọc và tìm kiếm -->
    <div class="filter-section">
      <div class="search-box">
        <i class="icon-search">🔍</i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm theo tiêu đề, người nộp..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <div class="filter-item">
          <label>Loại báo cáo:</label>
          <select v-model="filterLoai" class="select-input">
            <option value="">Tất cả</option>
            <option value="Ngày">Ngày</option>
            <option value="Tuần">Tuần</option>
            <option value="Tháng">Tháng</option>
            <option value="Quý">Quý</option>
            <option value="Năm">Năm</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Từ ngày:</label>
          <input v-model="filterFromDate" type="date" class="date-input" />
        </div>

        <div class="filter-item">
          <label>Đến ngày:</label>
          <input v-model="filterToDate" type="date" class="date-input" />
        </div>

        <button @click="clearFilters" class="btn-clear">
          <span><i class="fa-solid fa-trash"></i></span> Xóa lọc
        </button>
      </div>
    </div>

    <!-- Thống kê tổng quan -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-number">{{ filteredReports.length }}</div>
          <div class="stat-label">Tổng báo cáo</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-number">{{ filteredReports.length }}</div>
          <div class="stat-label">Đã nộp</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-number">{{ countByType('Ngày') }}</div>
          <div class="stat-label">Báo cáo ngày</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📆</div>
        <div class="stat-content">
          <div class="stat-number">{{ countByType('Tuần') }}</div>
          <div class="stat-label">Báo cáo tuần</div>
        </div>
      </div>
    </div>

    <!-- Bảng danh sách -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else-if="filteredReports.length === 0" class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
        <h3>Không tìm thấy báo cáo</h3>
        <p>Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
      </div>

      <table v-else class="report-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tiêu đề</th>
            <th>Người nộp</th>
            <th>Loại báo cáo</th>
            <th>Ngày nộp</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(report, index) in paginatedReports" :key="report._id" class="table-row">
            <td class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td class="report-title">
              <div class="title-content">
                <span class="title-text">{{ report.TieuDe }}</span>
              </div>
            </td>
            <td>
              <div class="user-info">
                <div class="user-avatar">{{ getInitials(report.NguoiNop.HoTenNV) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ report.NguoiNop.HoTenNV }}</div>
                  <div class="user-position">{{ report.NguoiNop.ChucVu }}</div>
                </div>
              </div>
            </td>
            <td>
              <span :class="['badge-type', `badge-${report.LoaiBaoCao.toLowerCase()}`]">
                {{ report.LoaiBaoCao }}
              </span>
            </td>
            <td class="date-column">
              <div class="date-info">
                <div class="date-day">{{ formatDate(report.createdAt) }}</div>
                <div class="date-time">{{ formatTime(report.createdAt) }}</div>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <a
                  :href="report.TepDinhKem"
                  download
                  class="btn-action btn-download"
                  title="Xem báo cáo"
                  target="_blank"
                >
                  <span><i class="fa-solid fa-eye"></i></span>
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <div v-if="filteredReports.length > itemsPerPage" class="pagination">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="btn-page"
      >
        ← Trước
      </button>
      <div class="page-numbers">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="['btn-page-number', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="btn-page"
      >
        Sau →
      </button>
    </div>
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'BaoCaoThongKe',

  data() {
    return {
      reports: [],
      loading: true,
      searchQuery: '',
      filterLoai: '',
      filterFromDate: '',
      filterToDate: '',
      currentPage: 1,
      itemsPerPage: 10,
    };
  },

  computed: {
    filteredReports() {
      let filtered = [...this.reports];

      // Tìm kiếm theo tiêu đề và người nộp
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.TieuDe.toLowerCase().includes(query) ||
            r.NguoiNop.HoTenNV.toLowerCase().includes(query) ||
            r.NguoiNop.Msnv.toLowerCase().includes(query)
        );
      }

      // Lọc theo loại báo cáo
      if (this.filterLoai) {
        filtered = filtered.filter((r) => r.LoaiBaoCao === this.filterLoai);
      }

      // Lọc theo ngày
      if (this.filterFromDate) {
        filtered = filtered.filter(
          (r) => new Date(r.createdAt) >= new Date(this.filterFromDate)
        );
      }

      if (this.filterToDate) {
        const toDate = new Date(this.filterToDate);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((r) => new Date(r.createdAt) <= toDate);
      }

      return filtered;
    },

    paginatedReports() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredReports.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredReports.length / this.itemsPerPage);
    },
  },

  async mounted() {
    try {
      this.loading = true;
      const data = await bookService.getAllReportStatistic();
      this.reports = data || [];
    } catch (error) {
      console.error('Lỗi tải báo cáo:', error);
      this.reports = [];
    } finally {
      this.loading = false;
    }
  },

  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },

    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    getInitials(name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },

    countByType(type) {
      return this.filteredReports.filter((r) => r.LoaiBaoCao === type).length;
    },

    clearFilters() {
      this.searchQuery = '';
      this.filterLoai = '';
      this.filterFromDate = '';
      this.filterToDate = '';
      this.currentPage = 1;
    },
  },

  watch: {
    filteredReports() {
      this.currentPage = 1;
    },
  },
};
</script>

<style scoped>
.bao-cao-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  font-size: 1.5rem;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.6rem;
  opacity: 0.95;
  font-weight: 300;
}

/* Bộ lọc */
.filter-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.search-box {
  position: relative;
  margin-bottom: 2rem;
}

.icon-search {
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
}

.search-input {
  width: 100%;
  padding: 1.5rem 2rem 1.5rem 5.5rem;
  font-size: 1.6rem;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.filter-item label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 600;
  color: #333;
  font-size: 1.5rem;
}

.select-input,
.date-input {
  width: 100%;
  padding: 1.3rem 1.5rem;
  font-size: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s;
  background: white;
}

.select-input:focus,
.date-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-clear {
  padding: 1.3rem 2.5rem;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  white-space: nowrap;
}

.btn-clear:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Thống kê */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  border-radius: 18px;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 3.5rem;
  width: 7rem;
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 15px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1.5rem;
  color: #666;
  margin-top: 0.5rem;
}

/* Bảng */
.table-container {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow-x: auto;
  margin-bottom: 2.5rem;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.5rem;
}

.report-table thead tr {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.report-table th {
  padding: 2rem 1.5rem;
  text-align: left;
  font-weight: 700;
  font-size: 1.6rem;
  white-space: nowrap;
}

.report-table td {
  padding: 1.8rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.table-row {
  transition: all 0.3s;
}

.table-row:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  transform: scale(1.01);
}

.text-center {
  text-align: center;
  font-weight: 600;
  color: #667eea;
}

.report-title {
  max-width: 350px;
}

.title-text {
  font-weight: 600;
  color: #333;
  display: block;
  line-height: 1.5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.user-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.6rem;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.3rem;
}

.user-position {
  font-size: 1.3rem;
  color: #999;
}

.badge-type {
  padding: 0.8rem 1.8rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.4rem;
  display: inline-block;
}

.badge-ngày {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.badge-tuần {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.badge-tháng {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.badge-quý {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: white;
}

.badge-năm {
  background: linear-gradient(135deg, #fa709a, #fee140);
  color: white;
}

.date-column {
  white-space: nowrap;
}

.date-day {
  font-weight: 600;
  color: #333;
}

.date-time {
  font-size: 1.3rem;
  color: #999;
  margin-top: 0.3rem;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.8rem;
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.4rem;
}

.status-dot {
  width: 0.8rem;
  height: 0.8rem;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-action {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.7rem;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-view {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.btn-download {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.btn-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Loading & Empty state */
.loading-state,
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
}

.spinner {
  width: 5rem;
  height: 5rem;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 6rem;
  margin-bottom: 2rem;
}

.empty-state h3 {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.6rem;
  color: #999;
}

/* Phân trang */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.btn-page,
.btn-page-number {
  padding: 1.2rem 2rem;
  font-size: 1.5rem;
  border: none;
  border-radius: 12px;
  background: white;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-page:hover:not(:disabled),
.btn-page-number:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page-number.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.page-numbers {
  display: flex;
  gap: 0.8rem;
}

@media (max-width: 768px) {
  .bao-cao-container {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .filter-group {
    flex-direction: column;
  }

  .filter-item {
    width: 100%;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .report-table {
    font-size: 1.3rem;
  }

  .report-table th,
  .report-table td {
    padding: 1.2rem 1rem;
  }
}
</style>