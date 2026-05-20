<template>
  <div class="admin-dashboard d-flex">
    <div class="main d-flex flex-column flex-grow-1 min-vh-100">
      <div class="content-wrapper flex-grow-1 p-4" style="background: #f5f7fa">
        <div class="container-fluid">
          <!-- Header Section -->
          <div class="page-header mb-4">
            <h2 class="fw-bold text-dark mb-2" style="font-size: 2.5rem">
              <i class="bi bi-journal-text me-2"></i>Thống kê chi tiết phiếu
              mượn sách theo độc giả
            </h2>
            <p>
              Quản lý và theo dõi chi tiết từng phiếu mượn sách theo độc giả của
              thư viện
            </p>
          </div>

          <!-- Filter Section -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Thời gian thống kê</label>
                  <select
                    v-model="selectedPeriod"
                    class="form-select"
                    @change="handlePeriodChange"
                  >
                    <option value="all">Tất cả</option>
                    <option value="day">Theo ngày (7 ngày gần nhất)</option>
                    <option value="week">Theo tuần (8 tuần gần nhất)</option>
                    <option value="month">
                      Theo tháng (12 tháng gần nhất)
                    </option>
                    <option value="quarter">Theo quý (4 quý gần nhất)</option>
                    <option value="year">Theo năm (5 năm gần nhất)</option>
                    <option value="custom">Tùy chỉnh khoảng thời gian</option>
                  </select>
                </div>

                <!-- Custom Date Range -->
                <div class="col-md-6" v-if="selectedPeriod === 'custom'">
                  <label class="form-label fw-semibold">Khoảng thời gian</label>
                  <div class="row g-2">
                    <div class="col-6">
                      <input
                        type="date"
                        v-model="customDateRange.from"
                        class="form-control"
                        @change="applyFilters"
                        style="font-size: 1.3rem"
                      />
                    </div>
                    <div class="col-6">
                      <input
                        type="date"
                        v-model="customDateRange.to"
                        class="form-control"
                        @change="applyFilters"
                        style="font-size: 1.3rem"
                      />
                    </div>
                  </div>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Trạng thái mượn</label>
                  <select
                    v-model="selectedStatus"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="processing">Chờ lấy sách</option>
                    <option value="approved">Đang mượn</option>
                    <option value="returned">Đã trả</option>
                    <option value="overdue">Quá hạn</option>
                    <option value="denied">Từ chối</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Tình trạng sách</label>
                  <select
                    v-model="selectedCondition"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả</option>
                    <option value="Nguyên vẹn">Nguyên vẹn</option>
                    <option value="Hư sách">Hư sách</option>
                    <option value="Mất sách">Mất sách</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Loại sách</label>
                  <select
                    v-model="selectedBookType"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả</option>
                    <option value="GiaoTrinh">Giáo trình</option>
                    <option value="ThamKhao">Tham khảo</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Tìm kiếm</label>
                  <input
                    type="text"
                    v-model="searchKeyword"
                    class="form-control"
                    placeholder="Tên sách, mã sách, độc giả..."
                    @input="applyFilters"
                    style="font-size: 1.3rem"
                  />
                </div>

                <div class="col-md-3 d-flex align-items-end">
                  <button
                    class="btn btn-primary w-100"
                    @click="openExportModal"
                    style="font-size: 1.5rem"
                  >
                    <i class="bi bi-download me-2"></i>Xuất báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div
                class="card stat-card shadow-sm border-0 h-100"
                style="
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                "
              >
                <div class="card-body text-white">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p class="mb-1 text-white-50">Tổng phiếu mượn</p>
                      <h3 class="fw-bold mb-0">{{ filteredData.length }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-journal-text"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div
                class="card stat-card shadow-sm border-0 h-100"
                style="
                  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                "
              >
                <div class="card-body text-white">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p class="mb-1 text-white-50">Đang mượn</p>
                      <h3 class="fw-bold mb-0">
                        {{
                          countByStatus('approved') + countByStatus('overdue')
                        }}
                      </h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-book"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div
                class="card stat-card shadow-sm border-0 h-100"
                style="
                  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                "
              >
                <div class="card-body text-white">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p class="mb-1 text-white-50">Tổng phí phạt</p>
                      <h3 class="fw-bold mb-0">
                        {{ formatMoney(totalFines) }}
                      </h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-cash-coin"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div
                class="card stat-card shadow-sm border-0 h-100"
                style="
                  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                "
              >
                <div class="card-body text-white">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p class="mb-1 text-white-50">Quá hạn</p>
                      <h3 class="fw-bold mb-0">
                        {{ countByStatus('overdue') }}
                      </h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Table with Pagination -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-semibold" style="font-size: 1.7rem">
                  <i class="bi bi-table text-info me-2"></i>
                  Chi tiết phiếu mượn
                </h5>
                <span style="font-size: 1.3rem">
                  Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
                  {{ filteredData.length }}
                </span>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã phiếu</th>
                      <th>Độc giả</th>
                      <th>Tên sách</th>
                      <th>Mã sách</th>
                      <th>Ngày mượn</th>
                      <th>Hạn trả</th>
                      <th>Ngày trả</th>
                      <th>Trạng thái</th>
                      <th>Tình trạng sách</th>
                      <th>Tổng phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in paginatedData" :key="item._id">
                      <td>{{ startIndex + index + 1 }}</td>
                      <td>
  {{ (item.MaPhieuMuon?._id || item.MaPhieuMuon).slice(-6).toUpperCase() }}
</td>
                      <td>
                        <div>
                          <div>
                            {{ item.MaDocGia?.HoLot }} {{ item.MaDocGia?.Ten }}
                          </div>
                          <div style="font-size: 1.2rem; color: #6c757d">
                            {{ item.MaDocGia?.MaDocGia }}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style="max-width: 280px">
                          <div>{{ item.MaSach?.TenSach || 'N/A' }}</div>
                          <div style="font-size: 1.2rem; color: #6c757d">
                            {{ item.MaSach?.TacGia }}
                          </div>
                        </div>
                      </td>
                      <td>{{ item.MaSach?.MaSach || 'N/A' }}</td>
                      <td>{{ formatDate(item.NgayMuon) }}</td>
                      <td>{{ formatDate(item.NgayTra) }}</td>
                      <td>
                        {{
                          item.NgayGhiNhanTra
                            ? formatDate(item.NgayGhiNhanTra)
                            : '-'
                        }}
                      </td>
                      <td>{{ getStatusText(item.TrangThai) }}</td>
                      <td>{{ item.TinhTrangSach || '-' }}</td>
                      <td
                        style="text-align: right; font-weight: 600"
                        :style="{
                          color:
                            item.PhiBoiThuong + item.PhiQuaHan > 0
                              ? '#dc3545'
                              : '#28a745',
                        }"
                      >
                        {{
                          formatMoney(
                            (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0)
                          )
                        }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colspan="10"
                        style="
                          text-align: right;
                          font-weight: bold;
                          font-size: 1.5rem;
                        "
                      >
                        TỔNG CỘNG:
                      </td>
                      <td
                        style="
                          text-align: right;
                          font-weight: bold;
                          color: #dc3545;
                          font-size: 1.5rem;
                        "
                      >
                        {{ formatMoney(totalFines) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Custom Pagination -->
              <div class="pagination-wrapper">
                <div class="pagination-info">
                  <label>Hiển thị:</label>
                  <select
                    v-model="itemsPerPage"
                    @change="changePage(1)"
                    class="items-select"
                  >
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                  </select>
                  <span>/ trang</span>
                </div>
                <div class="pagination-controls">
                  <button
                    class="pagination-btn"
                    :disabled="currentPage === 1"
                    @click="changePage(currentPage - 1)"
                  >
                    <i class="fa-solid fa-arrow-left"></i>
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    class="pagination-btn"
                    :class="{ active: currentPage === page }"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                  <button
                    class="pagination-btn"
                    :disabled="currentPage === totalPages"
                    @click="changePage(currentPage + 1)"
                  >
                    <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Export Modal -->
  <div
    v-if="showExportModal"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" style="font-size: 2rem">
            <i class="bi bi-download me-2"></i>Xuất báo cáo phiếu mượn
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="showExportModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label fw-semibold">Chọn dữ liệu xuất:</label>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                id="exportCurrent"
                value="current"
                v-model="exportOption"
              />
              <label class="form-check-label" for="exportCurrent">
                Xuất dữ liệu đang hiển thị ({{ filteredData.length }} phiếu)
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                id="exportAll"
                value="all"
                v-model="exportOption"
              />
              <label class="form-check-label" for="exportAll">
                Xuất tất cả dữ liệu ({{ statisticData.length }} phiếu)
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                id="exportCustom"
                value="custom"
                v-model="exportOption"
              />
              <label class="form-check-label" for="exportCustom">
                Xuất theo khoảng thời gian khác
              </label>
            </div>
          </div>

          <div v-if="exportOption === 'custom'" class="mb-3">
            <label class="form-label fw-semibold">Khoảng thời gian:</label>
            <div class="row g-2">
              <div class="col-6">
                <label class="form-label small" style="font-size: 1.5rem"
                  >Từ ngày:</label
                >
                <input
                  type="date"
                  v-model="exportDateRange.from"
                  class="form-control"
                  style="font-size: 1.5rem"
                />
              </div>
              <div class="col-6">
                <label class="form-label small" style="font-size: 1.5rem"
                  >Đến ngày:</label
                >
                <input
                  type="date"
                  v-model="exportDateRange.to"
                  class="form-control"
                  style="font-size: 1.5rem"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="showExportModal = false"
            style="font-size: 1.5rem; padding: 7px"
          >
            Hủy
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="confirmExport('pdf')"
            style="font-size: 1.5rem; padding: 7px"
          >
            <i class="bi bi-file-pdf me-2"></i>Xuất PDF
          </button>
          <button
            type="button"
            class="btn btn-success"
            @click="confirmExport('excel')"
            style="font-size: 1.5rem; padding: 7px"
          >
            <i class="bi bi-file-excel me-2"></i>Xuất Excel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.vfs;
import * as XLSX from 'xlsx';
import { bookService } from '../services/book/book.service';

export default {
  name: 'StatisticsBorrowBookWithReader',

  data() {
    return {
      statisticData: [],
      filteredData: [],
      selectedPeriod: 'all',
      selectedStatus: '',
      selectedCondition: '',
      selectedBookType: '',
      searchKeyword: '',
      customDateRange: {
        from: '',
        to: '',
      },

      // Pagination
      currentPage: 1,
      itemsPerPage: 25,

      // Export
      showExportModal: false,
      exportOption: 'current',
      exportDateRange: {
        from: '',
        to: '',
      },
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },

    endIndex() {
      return Math.min(
        this.startIndex + this.itemsPerPage,
        this.filteredData.length
      );
    },

    paginatedData() {
      return this.filteredData.slice(this.startIndex, this.endIndex);
    },

    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },

    totalFines() {
      return this.filteredData.reduce(
        (sum, item) => sum + (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
        0
      );
    },

    totalCompensationFee() {
      return this.filteredData.reduce(
        (sum, item) => sum + (item.PhiBoiThuong || 0),
        0
      );
    },

    totalOverdueFee() {
      return this.filteredData.reduce(
        (sum, item) => sum + (item.PhiQuaHan || 0),
        0
      );
    },
  },

  async mounted() {
    await this.loadData();
  },

  methods: {
    async loadData() {
      try {
        this.statisticData = await bookService.getStatisticBook();
        this.applyFilters();
        console.log('✅ Đã tải dữ liệu:', this.statisticData.length, 'bản ghi');
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        alert('Không thể tải dữ liệu thống kê');
      }
    },

    applyFilters() {
      let data = [...this.statisticData];

      // Filter by period
      if (this.selectedPeriod !== 'all') {
        data = this.filterByPeriod(data);
      }

      // Filter by status
      if (this.selectedStatus) {
        data = data.filter((item) => item.TrangThai === this.selectedStatus);
      }

      // Filter by condition
      if (this.selectedCondition) {
        data = data.filter(
          (item) => item.TinhTrangSach === this.selectedCondition
        );
      }

      // Filter by book type
      if (this.selectedBookType) {
        data = data.filter(
          (item) => item.MaSach?.LoaiSach === this.selectedBookType
        );
      }

      // Search
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        data = data.filter((item) => {
          const bookName = (item.MaSach?.TenSach || '').toLowerCase();
          const bookCode = (item.MaSach?.MaSach || '').toLowerCase();
          const readerName = `${item.MaDocGia?.HoLot || ''} ${
            item.MaDocGia?.Ten || ''
          }`.toLowerCase();
          const readerCode = (item.MaDocGia?.MaDocGia || '').toLowerCase();

          return (
            bookName.includes(keyword) ||
            bookCode.includes(keyword) ||
            readerName.includes(keyword) ||
            readerCode.includes(keyword)
          );
        });
      }

      this.filteredData = data;
      this.currentPage = 1; // Reset to first page
    },

    filterByPeriod(data) {
      if (this.selectedPeriod === 'custom') {
        if (!this.customDateRange.from || !this.customDateRange.to) {
          return data;
        }
        const fromDate = new Date(this.customDateRange.from);
        const toDate = new Date(this.customDateRange.to);
        toDate.setHours(23, 59, 59, 999);

        return data.filter((item) => {
          const itemDate = new Date(item.NgayMuon || item.createdAt);
          return itemDate >= fromDate && itemDate <= toDate;
        });
      }

      const now = new Date();
      const periods = {
        day: 7,
        week: 8 * 7,
        month: 12 * 30,
        quarter: 4 * 90,
        year: 5 * 365,
      };

      const days = periods[this.selectedPeriod];
      const limitDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      return data.filter((item) => {
        const itemDate = new Date(item.NgayMuon || item.createdAt);
        return itemDate >= limitDate;
      });
    },

    handlePeriodChange() {
      if (this.selectedPeriod === 'custom') {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        this.customDateRange.to = today.toISOString().split('T')[0];
        this.customDateRange.from = oneMonthAgo.toISOString().split('T')[0];
      }
      this.applyFilters();
    },

    countByStatus(status) {
      return this.filteredData.filter((item) => item.TrangThai === status)
        .length;
    },

    formatDate(dateStr) {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('vi-VN');
    },

    formatMoney(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    getStatusText(status) {
      const statusMap = {
        pending: 'Chờ duyệt',
        processing: 'Chờ lấy sách',
        approved: 'Đang mượn',
        returned: 'Đã trả',
        overdue: 'Quá hạn',
        denied: 'Từ chối',
      };
      return statusMap[status] || status;
    },

    getStatusBadgeClass(status) {
      const classes = {
        pending: 'badge bg-warning',
        processing: 'badge bg-info',
        approved: 'badge bg-primary',
        returned: 'badge bg-success',
        overdue: 'badge bg-danger',
        denied: 'badge bg-secondary',
      };
      return classes[status] || 'badge bg-secondary';
    },

    getConditionBadgeClass(condition) {
      const classes = {
        'Nguyên vẹn': 'badge bg-success',
        'Hư sách': 'badge bg-warning',
        'Mất sách': 'badge bg-danger',
      };
      return classes[condition] || 'badge bg-secondary';
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    openExportModal() {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);

      this.exportDateRange.to = today.toISOString().split('T')[0];
      this.exportDateRange.from = oneMonthAgo.toISOString().split('T')[0];
      this.exportOption = 'current';
      this.showExportModal = true;
    },

    confirmExport(type) {
      if (this.exportOption === 'custom') {
        if (!this.exportDateRange.from || !this.exportDateRange.to) {
          alert('Vui lòng chọn khoảng thời gian!');
          return;
        }
        if (
          new Date(this.exportDateRange.from) >
          new Date(this.exportDateRange.to)
        ) {
          alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
          return;
        }
      }

      this.showExportModal = false;

      if (type === 'pdf') {
        this.exportPDF();
      } else {
        this.exportExcel();
      }
    },

    getExportData() {
      if (this.exportOption === 'current') {
        return this.filteredData;
      } else if (this.exportOption === 'all') {
        return this.statisticData;
      } else {
        // custom
        const fromDate = new Date(this.exportDateRange.from);
        const toDate = new Date(this.exportDateRange.to);
        toDate.setHours(23, 59, 59, 999);

        return this.statisticData.filter((item) => {
          const itemDate = new Date(item.NgayMuon || item.createdAt);
          return itemDate >= fromDate && itemDate <= toDate;
        });
      }
    },

    getExportTitle() {
      if (this.exportOption === 'current') {
        return 'Dữ liệu đang hiển thị';
      } else if (this.exportOption === 'all') {
        return 'Tất cả dữ liệu';
      } else {
        const fromDate = new Date(this.exportDateRange.from).toLocaleDateString(
          'vi-VN'
        );
        const toDate = new Date(this.exportDateRange.to).toLocaleDateString(
          'vi-VN'
        );
        return `Từ ${fromDate} đến ${toDate}`;
      }
    },

    exportPDF() {
      const exportData = this.getExportData();
      const subtitle = this.getExportTitle();

      const content = [
        {
          text: 'BÁO CÁO CHI TIẾT PHIẾU MƯỢN SÁCH THEO ĐỘC GIẢ',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: subtitle,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        {
          text: `Tổng số: ${exportData.length} phiếu mượn`,
          style: 'summary',
          margin: [0, 0, 0, 20],
        },
      ];

      const tableBody = [
        [
          { text: 'STT', style: 'tableHeader' },
          { text: 'Mã phiếu', style: 'tableHeader' },
          { text: 'Độc giả', style: 'tableHeader' },
          { text: 'Tên sách', style: 'tableHeader' },
          { text: 'Mã sách', style: 'tableHeader' },
          { text: 'SL', style: 'tableHeader' },
          { text: 'Ngày mượn', style: 'tableHeader' },
          { text: 'Hạn trả', style: 'tableHeader' },
          { text: 'Ngày trả', style: 'tableHeader' },
          { text: 'Trạng thái', style: 'tableHeader' },
          { text: 'Tình trạng', style: 'tableHeader' },
          { text: 'Phí BT', style: 'tableHeader' },
          { text: 'Phí QH', style: 'tableHeader' },
          { text: 'Tổng phí', style: 'tableHeader' },
        ],
      ];

      exportData.forEach((item, index) => {
        tableBody.push([
          { text: (index + 1).toString(), style: 'tableCell' },
         {
  text: (item.MaPhieuMuon?._id || item.MaPhieuMuon).slice(-6).toUpperCase(),
  style: 'tableCell',
},
          {
            text: `${item.MaDocGia?.HoLot || ''} ${item.MaDocGia?.Ten || ''}\n${
              item.MaDocGia?.MaDocGia || ''
            }`,
            style: 'tableCell',
          },
          { text: item.MaSach?.TenSach || 'N/A', style: 'tableCell' },
          { text: item.MaSach?.MaSach || 'N/A', style: 'tableCell' },
          {
            text: item.SoLuong.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          { text: this.formatDate(item.NgayMuon), style: 'tableCell' },
          { text: this.formatDate(item.NgayTra), style: 'tableCell' },
          {
            text: item.NgayGhiNhanTra
              ? this.formatDate(item.NgayGhiNhanTra)
              : '-',
            style: 'tableCell',
          },
          { text: this.getStatusText(item.TrangThai), style: 'tableCell' },
          { text: item.TinhTrangSach || '-', style: 'tableCell' },
          {
            text: (item.PhiBoiThuong || 0).toLocaleString('vi-VN') + 'đ',
            style: 'tableCell',
            alignment: 'right',
          },
          {
            text: (item.PhiQuaHan || 0).toLocaleString('vi-VN') + 'đ',
            style: 'tableCell',
            alignment: 'right',
          },
          {
            text:
              ((item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0)).toLocaleString(
                'vi-VN'
              ) + 'đ',
            style: 'tableCell',
            alignment: 'right',
          },
        ]);
      });

      // Tổng cộng
      const totalComp = exportData.reduce(
        (sum, item) => sum + (item.PhiBoiThuong || 0),
        0
      );
      const totalOver = exportData.reduce(
        (sum, item) => sum + (item.PhiQuaHan || 0),
        0
      );
      const totalAll = totalComp + totalOver;

      tableBody.push([
        { text: '', colSpan: 11, style: 'tableCell' },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: totalComp.toLocaleString('vi-VN') + 'đ',
          style: 'tableCellBold',
          alignment: 'right',
        },
        {
          text: totalOver.toLocaleString('vi-VN') + 'đ',
          style: 'tableCellBold',
          alignment: 'right',
        },
        {
          text: totalAll.toLocaleString('vi-VN') + 'đ',
          style: 'tableCellBold',
          alignment: 'right',
        },
      ]);

      content.push({
        table: {
          headerRows: 1,
          widths: [
            'auto',
            'auto',
            'auto',
            '*',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
          ],
          body: tableBody,
        },
        layout: {
          fillColor: function (rowIndex) {
            if (rowIndex === 0) return '#667eea';
            if (rowIndex === tableBody.length - 1) return '#e8eaf6';
            return rowIndex % 2 === 0 ? '#f5f7fa' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#dee2e6',
          vLineColor: () => '#dee2e6',
        },
        margin: [0, 0, 0, 15],
      });

      content.push({
        text: `Xuất ngày: ${new Date().toLocaleString('vi-VN')}`,
        style: 'footer',
        alignment: 'right',
        margin: [0, 20, 0, 0],
      });

      const documentDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [30, 40, 30, 40],
        content: content,
        styles: {
          header: {
            fontSize: 16,
            bold: true,
            color: '#2c3e50',
          },
          subtitle: {
            fontSize: 11,
            italics: true,
            color: '#666',
          },
          summary: {
            fontSize: 12,
            bold: true,
            color: '#2c3e50',
          },
          tableHeader: {
            fontSize: 9,
            bold: true,
            color: 'white',
            alignment: 'center',
          },
          tableCell: {
            fontSize: 8,
          },
          tableCellBold: {
            fontSize: 8,
            bold: true,
          },
          footer: {
            fontSize: 9,
            italics: true,
            color: '#6c757d',
          },
        },
        defaultStyle: {
          font: 'Roboto',
        },
      };

      pdfMake
        .createPdf(documentDefinition)
        .download(`bao-cao-phieu-muon-${new Date().getTime()}.pdf`);
    },

    exportExcel() {
      const wb = XLSX.utils.book_new();
      const exportData = this.getExportData();
      const subtitle = this.getExportTitle();

      const excelData = [
        ['BÁO CÁO CHI TIẾT PHIẾU MƯỢN SÁCH THEO ĐỘC GIẢ'],
        [],
        ['Khoảng dữ liệu:', subtitle],
        ['Tổng số phiếu:', exportData.length],
        ['Xuất ngày:', new Date().toLocaleString('vi-VN')],
        [],
        [
          'STT',
          'Mã phiếu',
          'Mã độc giả',
          'Họ tên độc giả',
          'Mã sách',
          'Tên sách',
          'Tác giả',
          'Số lượng',
          'Ngày mượn',
          'Hạn trả',
          'Ngày trả thực tế',
          'Trạng thái',
          'Tình trạng sách',
          'Phí bồi thường',
          'Phí quá hạn',
          'Tổng phí',
        ],
      ];

      exportData.forEach((item, index) => {
        excelData.push([
          index + 1,
          (item.MaPhieuMuon?._id || item.MaPhieuMuon).slice(-6).toUpperCase(),
          item.MaDocGia?.MaDocGia || '',
          `${item.MaDocGia?.HoLot || ''} ${item.MaDocGia?.Ten || ''}`,
          item.MaSach?.MaSach || 'N/A',
          item.MaSach?.TenSach || 'N/A',
          item.MaSach?.TacGia || '',
          item.SoLuong,
          this.formatDate(item.NgayMuon),
          this.formatDate(item.NgayTra),
          item.NgayGhiNhanTra ? this.formatDate(item.NgayGhiNhanTra) : '-',
          this.getStatusText(item.TrangThai),
          item.TinhTrangSach || '-',
          item.PhiBoiThuong || 0,
          item.PhiQuaHan || 0,
          (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
        ]);
      });

      // Tổng cộng
      const totalComp = exportData.reduce(
        (sum, item) => sum + (item.PhiBoiThuong || 0),
        0
      );
      const totalOver = exportData.reduce(
        (sum, item) => sum + (item.PhiQuaHan || 0),
        0
      );

      excelData.push([
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'TỔNG CỘNG:',
        totalComp,
        totalOver,
        totalComp + totalOver,
      ]);

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 5 },
        { wch: 12 },
        { wch: 12 },
        { wch: 25 },
        { wch: 12 },
        { wch: 40 },
        { wch: 25 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết phiếu mượn');
      XLSX.writeFile(wb, `bao-cao-phieu-muon-${new Date().getTime()}.xlsx`);
    },
  },
};
</script>

<style scoped>
.content-wrapper {
  min-height: calc(100vh - 120px);
}

.page-header h2 {
  color: #2c3e50;
  font-size: 1.75rem;
}

.stat-card {
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.7;
}

.card {
  border-radius: 12px;
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
}

.form-select,
.form-control {
  font-size: 1.3rem;
}

.form-select:focus,
.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-danger {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-danger:hover,
.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal.show {
  display: block !important;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.form-check-label {
  font-size: 1.5rem;
  cursor: pointer;
}

/* New Table Styles */
.table-wrapper {
  overflow-x: auto;
  margin: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.4rem;
}

.data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.data-table thead th {
  padding: 15px 12px;
  font-weight: 600;
  text-align: left;
  border: none;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.data-table tbody td {
  padding: 14px 12px;
  color: #212529;
  vertical-align: middle;
}

.data-table tbody td:first-child,
.data-table thead th:first-child {
  padding-left: 20px;
}

.data-table tbody td:last-child,
.data-table thead th:last-child {
  padding-right: 20px;
}

.data-table tfoot {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
}

.data-table tfoot td {
  padding: 15px 12px;
}

/* Pagination Styles */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background-color: #fff;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  color: #495057;
}

.items-select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1.3rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.items-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.pagination-controls {
  display: flex;
  gap: 6px;
}

.pagination-btn {
  min-width: 38px;
  height: 38px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #495057;
  border-radius: 6px;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.pagination-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  font-weight: 600;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 1rem;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .data-table {
    font-size: 1.2rem;
  }

  .data-table thead th,
  .data-table tbody td {
    padding: 10px 8px;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 15px;
  }

  .pagination-btn {
    min-width: 34px;
    height: 34px;
    font-size: 1.2rem;
  }
}
</style>
