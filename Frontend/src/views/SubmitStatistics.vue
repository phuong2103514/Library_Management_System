<template>
  <div class="report-container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-line"></i>
        Báo Cáo Thống Kê
      </h1>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <div class="tabs">
        <button
          :class="['tab-button', { active: activeTab === 'submit' }]"
          @click="activeTab = 'submit'"
        >
          <i class="fas fa-upload"></i>
          Nộp Báo Cáo
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'list' }]"
          @click="activeTab = 'list'"
        >
          <i class="fas fa-list-alt"></i>
          Danh Sách Báo Cáo
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Tab Nộp Báo Cáo -->
      <div v-if="activeTab === 'submit'" class="submit-section">
        <div class="form-card">
          <h2 class="section-title">
            <i class="fas fa-file-upload"></i>
            Thông Tin Báo Cáo
          </h2>

          <form @submit.prevent="handleSubmitReport" class="report-form">
            <!-- Tiêu đề -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-heading"></i>
                Tiêu Đề Báo Cáo
                <span class="required">*</span>
              </label>
              <input
                v-model="formData.TieuDe"
                type="text"
                class="form-input"
                placeholder="Nhập tiêu đề báo cáo..."
                required
              />
            </div>

            <!-- Loại báo cáo -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tags"></i>
                Loại Báo Cáo
                <span class="required">*</span>
              </label>
              <select
                v-model="formData.LoaiBaoCao"
                class="form-select"
                required
              >
                <option value="">-- Chọn loại báo cáo --</option>
                <option value="Ngày">Báo Cáo Ngày</option>
                <option value="Tuần">Báo Cáo Tuần</option>
                <option value="Tháng">Báo Cáo Tháng</option>
                <option value="Quý">Báo Cáo Quý</option>
                <option value="Năm">Báo Cáo Năm</option>
              </select>
            </div>

            <!-- File PDF/Excel -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-file-alt"></i>
                File Báo Cáo (PDF hoặc Excel)
                <span class="required">*</span>
              </label>
              <div class="file-upload-wrapper">
                <input
                  ref="fileInput"
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  @change="handleFileChange"
                  class="file-input"
                  id="file-upload"
                  required
                />
                <label for="file-upload" class="file-label">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span v-if="!selectedFile">Chọn file PDF hoặc Excel</span>
                  <span v-else class="file-name">{{ selectedFile.name }}</span>
                </label>
              </div>
              <p class="file-hint">
                <i class="fas fa-info-circle"></i>
                Chấp nhận file PDF, Excel (.xlsx, .xls), tối đa 10MB
              </p>
            </div>

            <!-- Buttons -->
            <div class="form-actions">
              <button
                type="button"
                @click="resetForm"
                class="btn btn-secondary"
                :disabled="isSubmitting"
              >
                <i class="fas fa-redo"></i>
                Làm Mới
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isLoading"
              >
                <i class="fas fa-paper-plane"></i>
                <span v-if="!isLoading">Nộp Báo Cáo</span>
                <span v-else>Đang xử lý...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tab Danh Sách Báo Cáo -->
      <div v-if="activeTab === 'list'" class="list-section">
        <!-- Search & Filter -->
        <div class="filter-card">
          <div class="filter-row">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                v-model="searchKeyword"
                type="text"
                class="search-input"
                placeholder="Tìm kiếm theo tiêu đề..."
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-filter"></i>
                Loại:
              </label>
              <select v-model="filterType" class="filter-select">
                <option value="">Tất cả</option>
                <option value="Ngày">Ngày</option>
                <option value="Tuần">Tuần</option>
                <option value="Tháng">Tháng</option>
                <option value="Quý">Quý</option>
                <option value="Năm">Năm</option>
              </select>
            </div>

            <button @click="loadReports" class="btn btn-refresh">
              <i class="fas fa-sync-alt"></i>
              Làm mới
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredReports.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>Chưa có báo cáo nào</h3>
          <p>Hãy nộp báo cáo đầu tiên của bạn!</p>
        </div>

        <!-- Reports Table -->
        <div v-else class="reports-table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th style="width: 5%">STT</th>
                <th style="width: 10%">Loại</th>
                <th style="width: 25%">Tiêu Đề</th>
                <th style="width: 15%">Người Nộp</th>
                <th style="width: 10%">MSNV</th>
                <th style="width: 12%">Ngày Nộp</th>
                <th style="width: 10%">Trạng Thái</th>
                <th style="width: 13%">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(report, index) in paginatedReports" :key="report._id">
                <td class="text-center">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td>
                  <div
                    class="table-type-badge"
                    :class="getTypeBadgeClass(report.LoaiBaoCao)"
                  >
                    <i :class="getTypeIcon(report.LoaiBaoCao)"></i>
                    {{ report.LoaiBaoCao }}
                  </div>
                </td>
                <td class="report-title-cell" style="min-height: 80px;">
                  <i class="fas fa-file-alt"></i>
                  {{ report.TieuDe }}
                </td>
                <td>{{ report.NguoiNop?.HoTenNV || 'N/A' }}</td>
                <td class="text-center">
                  {{ report.NguoiNop?.Msnv || 'N/A' }}
                </td>
                <td>{{ formatDate(report.createdAt) }}</td>
                <td>
                  <div class="table-status">
                    <i class="fas fa-check-circle"></i>
                    {{ report.TrangThai }}
                  </div>
                </td>
                <td>
                  <div class="table-actions">
                    <a
                      :href="report.TepDinhKem"
                      target="_blank"
                      class="btn-table btn-view"
                      title="Xem"
                    >
                      <i class="fas fa-eye"></i>
                    </a>
                    <button
                      @click="handleDeleteReport(report._id)"
                      class="btn-table btn-delete"
                      title="Xóa"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-wrapper">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-page"
          >
            <i class="fas fa-chevron-left"></i>
            Trước
          </button>

          <div class="page-numbers">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="['btn-page-number', { active: currentPage === page }]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-page"
          >
            Sau
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Overlay -->
  <div
    v-if="isLoading"
    :style="{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }"
  >
    <img :src="loadingGif" alt="loading" style="width: 60px; height: 60px" />
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';
import { userState } from '../assets/js/userState';
import loadingGif from '/image/loading.gif';

export default {
  name: 'NopBaoCaoThongKe',

  data() {
    return {
      activeTab: 'submit',
      isSubmitting: false,
      isLoading: false,

      // Form data
      formData: {
        TieuDe: '',
        NguoiNop: '', // Sẽ lấy từ user hiện tại
        LoaiBaoCao: '',
      },
      selectedFile: null,

      // List data
      reports: [],
      searchKeyword: '',
      filterType: '',

      loadingGif,
      isLoading: false,

      currentPage: 1,
      itemsPerPage: 30,
    };
  },

  computed: {
    filteredReports() {
      let filtered = this.reports;

      // Filter by search keyword
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        filtered = filtered.filter((report) =>
          report.TieuDe.toLowerCase().includes(keyword)
        );
      }

      // Filter by type
      if (this.filterType) {
        filtered = filtered.filter(
          (report) => report.LoaiBaoCao === this.filterType
        );
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

  mounted() {
    this.formData.NguoiNop = userState._id || '';

    // Load reports khi vào tab danh sách
    if (this.activeTab === 'list') {
      this.loadReports();
    }
  },

  watch: {
    activeTab(newTab) {
      if (newTab === 'list') {
        this.loadReports();
      }
    },

    searchKeyword() {
      this.currentPage = 1;
    },
    filterType() {
      this.currentPage = 1;
    },
  },

  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        // Validate file type
        const validTypes = [
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (!validTypes.includes(file.type)) {
          alert('Vui lòng chọn file PDF hoặc Excel (.xlsx, .xls)!');
          this.$refs.fileInput.value = '';
          return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.');
          this.$refs.fileInput.value = '';
          return;
        }

        this.selectedFile = file;
      }
    },

    async handleSubmitReport() {
      if (!this.selectedFile) {
        alert('Vui lòng chọn file báo cáo!');
        return;
      }

      if (!this.formData.NguoiNop) {
        alert('Không tìm thấy thông tin người dùng!');
        return;
      }

      this.isLoading = true;

      try {
        const formData = new FormData();
        formData.append('TieuDe', this.formData.TieuDe);
        formData.append('NguoiNop', this.formData.NguoiNop);
        formData.append('LoaiBaoCao', this.formData.LoaiBaoCao);
        formData.append('file', this.selectedFile);

        // Kiểm tra loại file để gọi service tương ứng
        const fileType = this.selectedFile.type;
        let result;

        if (fileType === 'application/pdf') {
          result = await bookService.submitFilePdfReportStatistic(formData);
        } else if (
          fileType === 'application/vnd.ms-excel' ||
          fileType ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          result = await bookService.submitFileExcelReportStatistic(formData);
        } else {
          throw new Error('Loại file không được hỗ trợ');
        }

        alert('Nộp báo cáo thành công!');
        this.resetForm();

        this.activeTab = 'list';
        this.loadReports();
      } catch (error) {
        console.error('Lỗi khi nộp báo cáo:', error);
        alert(error.response?.data || 'Nộp báo cáo thất bại!');
      } finally {
        this.isLoading = false;
      }
    },

    resetForm() {
      this.formData.TieuDe = '';
      this.formData.LoaiBaoCao = '';
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async loadReports() {
      if (!this.formData.NguoiNop) {
        alert('Không tìm thấy thông tin người dùng!');
        return;
      }

      // Giữ nguyên isLoading cho phần này (không dùng overlay)
      this.isLoading = true;

      try {
        const reports = await bookService.getReportStatisticByReporter({
          NguoiNop: this.formData.NguoiNop,
        });

        this.reports = reports || [];
      } catch (error) {
        console.error('Lỗi khi tải danh sách báo cáo:', error);
        alert('Không thể tải danh sách báo cáo!');
      } finally {
        this.isLoading = false;
      }
    },

    async handleDeleteReport(reportId) {
      if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
        return;
      }

      this.isLoading = true;

      try {
        await bookService.deleteOneReportStatistic({ reportId });

        alert('Xóa báo cáo thành công!');

        // Reload lại danh sách báo cáo
        await this.loadReports();
      } catch (error) {
        console.error('Lỗi khi xóa báo cáo:', error);
        alert(error.response?.data?.message || 'Xóa báo cáo thất bại!');
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    getTypeBadgeClass(type) {
      const classes = {
        Ngày: 'badge-day',
        Tuần: 'badge-week',
        Tháng: 'badge-month',
        Quý: 'badge-quarter',
        Năm: 'badge-year',
      };
      return classes[type] || '';
    },

    getTypeIcon(type) {
      const icons = {
        Ngày: 'fas fa-calendar-day',
        Tuần: 'fas fa-calendar-week',
        Tháng: 'fas fa-calendar-alt',
        Quý: 'fas fa-calendar-check',
        Năm: 'fas fa-calendar',
      };
      return icons[type] || 'fas fa-calendar';
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        // Scroll lên đầu danh sách
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  },
};
</script>

<style scoped>
.report-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-size: 1.5rem;
}

/* Header */
.page-header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.page-title i {
  color: #4299e1;
}

/* Tabs */
.tabs-wrapper {
  margin-bottom: 2.5rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 3px solid #e2e8f0;
}

.tab-button {
  padding: 1.2rem 2.5rem;
  font-size: 1.6rem;
  font-weight: 600;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: -3px;
}

.tab-button:hover {
  color: #4299e1;
  background: #ebf8ff;
}

.tab-button.active {
  color: #4299e1;
  border-bottom-color: #4299e1;
  background: #ebf8ff;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.section-title i {
  color: #4299e1;
}

/* Form */
.report-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  font-size: 1.6rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.form-label i {
  color: #4299e1;
}

.required {
  color: #e53e3e;
  margin-left: 0.3rem;
}

.form-input,
.form-select {
  padding: 1.2rem 1.5rem;
  font-size: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-select {
  cursor: pointer;
  background-color: white;
}

/* File Upload */
.file-upload-wrapper {
  position: relative;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  border: 3px dashed #cbd5e0;
  border-radius: 1rem;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.6rem;
  color: #4a5568;
}

.file-label:hover {
  border-color: #4299e1;
  background: #ebf8ff;
}

.file-label i {
  font-size: 3.5rem;
  color: #4299e1;
}

.file-name {
  font-weight: 600;
  color: #2d3748;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-hint {
  font-size: 1.4rem;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.file-hint i {
  color: #4299e1;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 1.2rem 2.5rem;
  font-size: 1.6rem;
  font-weight: 600;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3182ce, #2c5282);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1.5rem;
  color: #a0aec0;
  font-size: 1.6rem;
}

.search-input {
  width: 100%;
  padding: 1.2rem 1.5rem 1.2rem 4rem;
  font-size: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-label {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.filter-select {
  padding: 1rem 1.5rem;
  font-size: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.8rem;
  cursor: pointer;
  min-width: 180px;
  font-family: inherit;
}

.btn-refresh {
  background: #48bb78;
  color: white;
  white-space: nowrap;
}

.btn-refresh:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 1.5rem;
}

.loading-state i,
.empty-state i {
  font-size: 5rem;
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.loading-state p,
.empty-state p {
  font-size: 1.6rem;
  color: #718096;
  margin-top: 1rem;
}

.empty-state h3 {
  font-size: 2rem;
  color: #2d3748;
  margin-top: 1rem;
}

/* Reports Grid */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
}

.report-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
}

.report-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #4299e1;
  border-width: 2px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.report-type-badge {
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-day {
  background: #fef5e7;
  color: #d68910;
}

.badge-week {
  background: #ebf8ff;
  color: #3182ce;
}

.badge-month {
  background: #f0fff4;
  color: #38a169;
}

.badge-quarter {
  background: #faf5ff;
  color: #805ad5;
}

.badge-year {
  background: #fff5f5;
  color: #e53e3e;
}

.report-status {
  font-size: 1.4rem;
  color: #38a169;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  line-height: 1.4;
}

.report-title i {
  color: #4299e1;
  margin-top: 0.2rem;
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 0.8rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  color: #4a5568;
}

.info-item i {
  color: #718096;
  width: 20px;
}

.report-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-view {
  background: #4299e1;
  color: white;
  padding: 1rem 1.8rem;
  font-size: 1.4rem;
  text-decoration: none;
}

.btn-view:hover {
  background: #3182ce;
  transform: translateY(-2px);
}

.btn-download {
  background: #48bb78;
  color: white;
  padding: 1rem 1.8rem;
  font-size: 1.4rem;
  text-decoration: none;
}

.btn-download:hover {
  background: #38a169;
  transform: translateY(-2px);
}

.btn-delete {
  background: #fc8181;
  color: white;
  padding: 1rem 1.8rem;
  font-size: 1.4rem;
}

.btn-delete:hover {
  background: #f56565;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .report-container {
    padding: 1.5rem;
    font-size: 1.5rem;
  }

  .page-title {
    font-size: 2.2rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    width: 100%;
    justify-content: center;
  }

  .form-card {
    padding: 2rem;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .report-actions {
    flex-direction: column;
  }

  .btn-view,
  .btn-download,
  .btn-delete {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .form-label {
    font-size: 1.5rem;
  }

  .report-title {
    font-size: 1.6rem;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .pagination-wrapper {
    flex-wrap: wrap;
  }

  .page-numbers {
    order: -1;
    width: 100%;
    margin-bottom: 1rem;
  }
}

@media (max-width: 1400px) {
  .reports-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .reports-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .reports-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-page {
  padding: 1rem 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  background: white;
  border: 2px solid #e2e8f0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-page:hover:not(:disabled) {
  background: #ebf8ff;
  border-color: #4299e1;
  color: #4299e1;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-page-number {
  padding: 0.8rem 1.2rem;
  font-size: 1.5rem;
  font-weight: 600;
  background: white;
  border: 2px solid #e2e8f0;
  color: #2d3748;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 45px;
}

.btn-page-number:hover {
  background: #ebf8ff;
  border-color: #4299e1;
  color: #4299e1;
}

.btn-page-number.active {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  border-color: #3182ce;
  color: white;
}


/* Reports Table */
.reports-table-wrapper {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.5rem;
}

.reports-table thead {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.reports-table th {
  padding: 1.8rem 1.5rem;
  font-weight: 700;
  text-align: left;
  font-size: 1.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reports-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.reports-table tbody tr:hover {
  background: #f7fafc;
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.reports-table td {
  padding: 1.5rem;
  color: #2d3748;
  vertical-align: middle;
}

.text-center {
  text-align: center;
}

.table-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  font-size: 1.4rem;
  font-weight: 600;
  white-space: nowrap;
}

.report-title-cell {
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.report-title-cell i {
  color: #4299e1;
}

.table-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #38a169;
  font-weight: 600;
  font-size: 1.4rem;
}

.table-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}

.btn-table {
  padding: 0.8rem 1.2rem;
  font-size: 1.4rem;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  min-width: 40px;
}

.btn-table:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-table.btn-view {
  background: #4299e1;
  color: white;
}

.btn-table.btn-view:hover {
  background: #3182ce;
}

.btn-table.btn-delete {
  background: #fc8181;
  color: white;
}

.btn-table.btn-delete:hover {
  background: #f56565;
}

/* Responsive Table */
@media (max-width: 1200px) {
  .reports-table {
    font-size: 1.4rem;
  }

  .reports-table th,
  .reports-table td {
    padding: 1.2rem 1rem;
  }

  .reports-table th {
    font-size: 1.5rem;
  }
}

@media (max-width: 900px) {
  .reports-table-wrapper {
    overflow-x: auto;
  }

  .reports-table {
    min-width: 900px;
  }
}

@media (max-width: 768px) {
  .reports-table {
    font-size: 1.3rem;
    min-width: 800px;
  }

  .reports-table th,
  .reports-table td {
    padding: 1rem 0.8rem;
  }

  .table-type-badge {
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
  }

  .btn-table {
    padding: 0.6rem 1rem;
    font-size: 1.3rem;
  }
}
</style>
