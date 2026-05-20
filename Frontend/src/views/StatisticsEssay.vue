<template>
  <div class="admin-dashboard d-flex">
    <div class="main d-flex flex-column flex-grow-1 min-vh-100">
      <div class="content-wrapper flex-grow-1 p-4" style="background: #f5f7fa">
        <div class="container-fluid">
          <!-- Header -->
          <div class="page-header mb-4">
            <h2 class="fw-bold text-dark mb-2" style="font-size: 2.5rem">
              <i class="bi bi-file-earmark-text me-2"></i>Thống kê niên luận
            </h2>
            <p>
              Quản lý và theo dõi chi tiết các niên luận đã nộp trong hệ thống
            </p>
          </div>

          <!-- Bộ lọc -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="row g-3">
                <!-- Thời gian thống kê -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold"
                    >Thời gian thống kê</label
                  >
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
                      />
                    </div>
                    <div class="col-6">
                      <input
                        type="date"
                        v-model="customDateRange.to"
                        class="form-control"
                        @change="applyFilters"
                      />
                    </div>
                  </div>
                </div>

                <!-- Trạng thái -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Trạng thái</label>
                  <select
                    v-model="selectedStatus"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã duyệt">Đã duyệt</option>
                    <option value="Từ chối">Từ chối</option>
                  </select>
                </div>

                <!-- Khoa -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Khoa</label>
                  <select
                    v-model="selectedKhoa"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả khoa</option>
                    <option
                      v-for="khoa in khoaList"
                      :key="khoa._id"
                      :value="khoa._id"
                    >
                      {{ khoa.TenKhoa }}
                    </option>
                  </select>
                </div>

                <!-- Ngành học -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Ngành học</label>
                  <select
                    v-model="selectedNganh"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả ngành học</option>
                    <option
                      v-for="nganh in filteredNganhList"
                      :key="nganh._id"
                      :value="nganh._id"
                    >
                      {{ nganh.TenNganh }}
                    </option>
                  </select>
                </div>

                <!-- Kỳ học -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Kỳ học</label>
                  <select
                    v-model="selectedKyHoc"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả kỳ học</option>
                    <option
                      v-for="ky in kyHocList"
                      :key="ky._id"
                      :value="ky._id"
                    >
                      {{ ky.TenKyHoc }}
                    </option>
                  </select>
                </div>

                <!-- Năm học -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Năm học</label>
                  <select
                    v-model="selectedNamHoc"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả năm học</option>
                    <option
                      v-for="nam in namHocList"
                      :key="nam._id"
                      :value="nam._id"
                    >
                      {{ nam.TenNamHoc }}
                    </option>
                  </select>
                </div>

                <!-- Giảng viên -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Giảng viên HD</label>
                  <select
                    v-model="selectedGiangVien"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả giảng viên</option>
                    <option
                      v-for="gv in filteredGiangVienList"
                      :key="gv._id"
                      :value="gv._id"
                    >
                      {{ gv.HoLot }} {{ gv.Ten }}
                    </option>
                  </select>
                </div>

                <!-- Tìm kiếm -->
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Tìm kiếm</label>
                  <input
                    type="text"
                    v-model="searchKeyword"
                    class="form-control"
                    placeholder="Tên đề tài, sinh viên..."
                    @input="applyFilters"
                  />
                </div>

                <!-- Nút xuất báo cáo -->
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

          <!-- Cards thống kê -->
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
                      <p class="mb-1 text-white-50">Tổng niên luận</p>
                      <h3 class="fw-bold mb-0">{{ filteredData.length }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-file-earmark-text"></i>
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
                      <p class="mb-1 text-white-50">Đã duyệt</p>
                      <h3 class="fw-bold mb-0">
                        {{ countByStatus('Đã duyệt') }}
                      </h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-check-circle"></i>
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
                      <p class="mb-1 text-white-50">Chờ duyệt</p>
                      <h3 class="fw-bold mb-0">
                        {{ countByStatus('Chờ duyệt') }}
                      </h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-hourglass-split"></i>
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
                      <p class="mb-1 text-white-50">Từ chối</p>
                      <h3 class="fw-bold mb-0">
                        {{ countByStatus('Từ chối') }}
                      </h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-x-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bảng thống kê theo đợt nộp -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-bottom py-3">
              <h5 class="mb-0 fw-semibold" style="font-size: 1.7rem">
                <i class="bi bi-calendar-check text-success me-2"></i>
                Thống kê theo đợt nộp
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên đợt nộp</th>
                      <th>Giảng viên</th>
                      <th>Khoa</th>
                      <th>Kỳ học</th>
                      <th>Năm học</th>
                      <th>Chỉ tiêu</th>
                      <th>Đã nộp</th>
                      <th>Đã duyệt</th>
                      <th>Chờ duyệt</th>
                      <th>Từ chối</th>
                      <th>Trạng thái</th>
                      <th>Tỷ lệ hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(dot, index) in paginatedDotStatistics"
                      :key="dot._id"
                    >
                      <td>{{ dotStartIndex + index + 1 }}</td>
                      <td>{{ dot.TenDot }}</td>
                      <td>
                        {{ dot.MaGiangVien?.HoLot }} {{ dot.MaGiangVien?.Ten }}
                      </td>
                      <td>{{ getKhoaName(dot) }}</td>
                      <td>{{ dot.KyHoc?.TenKyHoc || 'N/A' }}</td>
                      <td>{{ dot.NamHoc?.TenNamHoc || 'N/A' }}</td>
                      <td style="text-align: center">
                        {{ dot.SoLuongPhaiNop }}
                      </td>
                      <td style="text-align: center">{{ dot.tongDaNop }}</td>
                      <td style="text-align: center">{{ dot.daDuyet }}</td>
                      <td style="text-align: center">{{ dot.choDuyet }}</td>
                      <td style="text-align: center">{{ dot.tuChoi }}</td>
                      <td style="text-align: center">
                        {{ dot.TrangThai }}
                      </td>
                      <td style="text-align: center; font-weight: 600">
                        {{ dot.tyLeHoanThanh }}%
                      </td>
                    </tr>
                    <tr v-if="filteredDotStatistics.length === 0">
                      <td
                        colspan="13"
                        style="text-align: center; padding: 30px; color: #999"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Pagination cho đợt nộp -->
          <div class="pagination-wrapper">
            <div class="pagination-info">
              <label>Hiển thị:</label>
              <select
                v-model="dotItemsPerPage"
                @change="changeDotPage(1)"
                class="items-select"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
              <span>/ trang</span>
            </div>
            <div class="pagination-controls">
              <button
                class="pagination-btn"
                :disabled="dotCurrentPage === 1"
                @click="changeDotPage(dotCurrentPage - 1)"
              >
                <i class="fa-solid fa-arrow-left"></i>
              </button>
              <button
                v-for="page in dotVisiblePages"
                :key="page"
                class="pagination-btn"
                :class="{ active: dotCurrentPage === page }"
                @click="changeDotPage(page)"
              >
                {{ page }}
              </button>
              <button
                class="pagination-btn"
                :disabled="dotCurrentPage === dotTotalPages"
                @click="changeDotPage(dotCurrentPage + 1)"
              >
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Bảng chi tiết niên luận -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-semibold" style="font-size: 1.7rem">
                  <i class="bi bi-table text-info me-2"></i>
                  Chi tiết niên luận
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
                      <th>Mã sinh viên</th>
                      <th>Họ tên</th>
                      <th>Khoa</th>
                      <th>Ngành học</th>
                      <th>Tên đề tài</th>
                      <th>Giảng viên HD</th>
                      <th>Kỳ học</th>
                      <th>Năm học</th>
                      <th>Ngày nộp</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in paginatedData" :key="item._id">
                      <td>{{ startIndex + index + 1 }}</td>
                      <td>
                        {{ item.MaDocGia?.SinhVien?.MaSinhVien || 'N/A' }}
                      </td>
                      <td>
                        {{ item.MaDocGia?.HoLot }} {{ item.MaDocGia?.Ten }}
                      </td>
                      <td>
                        {{
                          item.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa ||
                          'N/A'
                        }}
                      </td>
                      <td>
                        {{
                          item.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh || 'N/A'
                        }}
                      </td>
                      <td style="max-width: 350px">{{ item.TenDeTai }}</td>
                      <td>
                        {{ item.MaDotNop?.MaGiangVien?.HoLot }}
                        {{ item.MaDotNop?.MaGiangVien?.Ten }}
                      </td>
                      <td>{{ item.MaDotNop?.KyHoc?.TenKyHoc || 'N/A' }}</td>
                      <td>{{ item.MaDotNop?.NamHoc?.TenNamHoc || 'N/A' }}</td>
                      <td>{{ formatDate(item.NgayNop) }}</td>
                      <td>{{ item.TrangThai }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
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
            <i class="bi bi-download me-2"></i>Xuất báo cáo niên luận
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
                Xuất dữ liệu đang hiển thị ({{ filteredData.length }} niên luận)
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
                Xuất tất cả dữ liệu ({{ statisticData.length }} niên luận)
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
                <label class="form-label small">Từ ngày:</label>
                <input
                  type="date"
                  v-model="exportDateRange.from"
                  class="form-control"
                />
              </div>
              <div class="col-6">
                <label class="form-label small">Đến ngày:</label>
                <input
                  type="date"
                  v-model="exportDateRange.to"
                  class="form-control"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            style="font-size: 1.5rem"
            @click="showExportModal = false"
          >
            Hủy
          </button>
          <button
            type="button"
            class="btn btn-danger"
            style="font-size: 1.5rem"
            @click="confirmExport('pdf')"
          >
            <i class="bi bi-file-pdf me-2"></i>Xuất PDF
          </button>
          <button
            type="button"
            class="btn btn-success"
            style="font-size: 1.5rem"
            @click="confirmExport('excel')"
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
  name: 'StatisticsEssay',

  data() {
    return {
      statisticData: [], // Tất cả niên luận
      filteredData: [], // Dữ liệu sau khi filter
      dotStatistics: [], // Thống kê theo đợt

      // Filter options
      selectedPeriod: 'all',
      selectedStatus: '',
      selectedKhoa: '',
      selectedNganh: '',
      selectedKyHoc: '',
      selectedNamHoc: '',
      selectedGiangVien: '',
      searchKeyword: '',
      customDateRange: {
        from: '',
        to: '',
      },

      // Danh sách cho dropdown
      khoaList: [],
      nganhList: [],
      kyHocList: [],
      namHocList: [],
      giangVienList: [],

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

      dotCurrentPage: 1,
      dotItemsPerPage: 10,
    };
  },

  computed: {
    // Danh sách ngành theo khoa đã chọn
    filteredNganhList() {
      if (!this.selectedKhoa) return this.nganhList;
      return this.nganhList.filter(
        (n) => n.Khoa?._id === this.selectedKhoa || n.Khoa === this.selectedKhoa
      );
    },

    // THÊM COMPUTED MỚI Ở ĐÂY
    filteredGiangVienList() {
      // Nếu không chọn gì, hiển thị tất cả
      if (!this.selectedKhoa && !this.selectedNganh) {
        return this.giangVienList;
      }

      return this.giangVienList.filter((gv) => {
        // Lấy ID khoa của giảng viên (qua Bộ môn)
        const gvKhoaId =
          gv.GiangVien?.MaBoMon?.MaKhoa?._id || gv.GiangVien?.MaBoMon?.MaKhoa;

        // Nếu không có thông tin khoa của giảng viên, bỏ qua
        if (!gvKhoaId) return false;

        // TH1: Chọn cả Ngành (ưu tiên lọc theo ngành)
        if (this.selectedNganh) {
          // Tìm ngành đã chọn để lấy khoa của nó
          const selectedNganh = this.nganhList.find(
            (n) => String(n._id) === String(this.selectedNganh)
          );
          if (!selectedNganh) return false;

          const nganhKhoaId = selectedNganh.Khoa?._id || selectedNganh.Khoa;

          // Giảng viên phải thuộc cùng khoa với ngành
          return String(gvKhoaId) === String(nganhKhoaId);
        }

        // TH2: Chỉ chọn Khoa (không chọn ngành)
        if (this.selectedKhoa) {
          return String(gvKhoaId) === String(this.selectedKhoa);
        }

        return true;
      });
    },

    // Tổng số trang
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },

    // Index bắt đầu
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },

    // Index kết thúc
    endIndex() {
      return Math.min(
        this.startIndex + this.itemsPerPage,
        this.filteredData.length
      );
    },

    // Dữ liệu phân trang
    paginatedData() {
      return this.filteredData.slice(this.startIndex, this.endIndex);
    },

    // Các trang hiển thị
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

    // Thống kê đợt đã filter
    filteredDotStatistics() {
      let dots = [...this.dotStatistics];

      // Filter theo khoa
      if (this.selectedKhoa) {
        dots = dots.filter((dot) => {
          const khoaId = this.getKhoaIdFromDot(dot);
          return khoaId && String(khoaId) === String(this.selectedKhoa);
        });
      }

      // Filter theo kỳ học
      if (this.selectedKyHoc) {
        dots = dots.filter((dot) => {
          const kyHocId =
            typeof dot.KyHoc === 'object' ? dot.KyHoc?._id : dot.KyHoc;
          return String(kyHocId) === String(this.selectedKyHoc);
        });
      }

      // Filter theo năm học
      if (this.selectedNamHoc) {
        dots = dots.filter((dot) => {
          const namHocId =
            typeof dot.NamHoc === 'object' ? dot.NamHoc?._id : dot.NamHoc;
          return String(namHocId) === String(this.selectedNamHoc);
        });
      }

      // Filter theo giảng viên
      if (this.selectedGiangVien) {
        dots = dots.filter((dot) => {
          const gvId =
            typeof dot.MaGiangVien === 'object'
              ? dot.MaGiangVien?._id
              : dot.MaGiangVien;
          return String(gvId) === String(this.selectedGiangVien);
        });
      }

      return dots;
    },

    // Tổng số trang cho đợt
    dotTotalPages() {
      return Math.ceil(
        this.filteredDotStatistics.length / this.dotItemsPerPage
      );
    },

    // Index bắt đầu cho đợt
    dotStartIndex() {
      return (this.dotCurrentPage - 1) * this.dotItemsPerPage;
    },

    // Index kết thúc cho đợt
    dotEndIndex() {
      return Math.min(
        this.dotStartIndex + this.dotItemsPerPage,
        this.filteredDotStatistics.length
      );
    },

    // Dữ liệu phân trang cho đợt
    paginatedDotStatistics() {
      return this.filteredDotStatistics.slice(
        this.dotStartIndex,
        this.dotEndIndex
      );
    },

    // Các trang hiển thị cho đợt
    dotVisiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.dotCurrentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.dotTotalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  watch: {
    selectedKhoa(newVal) {
      // Reset ngành nếu không thuộc khoa đã chọn
      if (this.selectedNganh) {
        const isNganhInKhoa = this.filteredNganhList.some(
          (n) => String(n._id) === String(this.selectedNganh)
        );
        if (!isNganhInKhoa) {
          this.selectedNganh = '';
        }
      }

      // Reset giảng viên nếu không thuộc khoa đã chọn
      if (this.selectedGiangVien) {
        const isGvInKhoa = this.filteredGiangVienList.some(
          (gv) => String(gv._id) === String(this.selectedGiangVien)
        );
        if (!isGvInKhoa) {
          this.selectedGiangVien = '';
        }
      }
    },

    selectedNganh(newVal) {
      // Reset giảng viên nếu không thuộc ngành đã chọn
      if (this.selectedGiangVien) {
        const isGvInNganh = this.filteredGiangVienList.some(
          (gv) => String(gv._id) === String(this.selectedGiangVien)
        );
        if (!isGvInNganh) {
          this.selectedGiangVien = '';
        }
      }
    },
  },

  async mounted() {
    await this.loadData();
    await this.loadFilterOptions();
  },
  methods: {
    // Load dữ liệu chính
    async loadData() {
      try {
        // Load niên luận
        this.statisticData = await bookService.getAllNienLuanForAdmin();
        // Load thống kê theo đợt
        this.dotStatistics = await bookService.getStatisticsByDot();

        this.applyFilters();
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Không thể tải dữ liệu thống kê');
      }
    },

    // Load các danh sách cho filter
    async loadFilterOptions() {
      try {
        this.khoaList = await bookService.getAllFaculty();
        this.kyHocList = await bookService.getAllKyHoc();
        this.namHocList = await bookService.getAllNamHoc();
        this.giangVienList = await bookService.getAllGiangVienForAdmin();
        this.nganhList = await bookService.getAllNganhHoc();
      } catch (error) {
        console.error('Lỗi khi tải danh sách filter:', error);
      }
    },

    // Áp dụng bộ lọc
    applyFilters() {
      let data = [...this.statisticData];

      // Filter theo thời gian
      if (this.selectedPeriod !== 'all') {
        data = this.filterByPeriod(data);
      }

      // Filter theo trạng thái
      if (this.selectedStatus) {
        data = data.filter((item) => item.TrangThai === this.selectedStatus);
      }

      // Filter theo khoa
      if (this.selectedKhoa) {
        data = data.filter((item) => {
          const khoaId = item.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?._id;
          return khoaId && String(khoaId) === String(this.selectedKhoa);
        });
      }

      // Filter theo ngành
      if (this.selectedNganh) {
        data = data.filter((item) => {
          const nganhId = item.MaDocGia?.SinhVien?.MaNganhHoc?._id;
          return nganhId && String(nganhId) === String(this.selectedNganh);
        });
      }

      // Filter theo kỳ học
      if (this.selectedKyHoc) {
        data = data.filter((item) => {
          const kyHocId =
            typeof item.MaDotNop?.KyHoc === 'object'
              ? item.MaDotNop?.KyHoc?._id
              : item.MaDotNop?.KyHoc;
          return String(kyHocId) === String(this.selectedKyHoc);
        });
      }

      // Filter theo năm học
      if (this.selectedNamHoc) {
        data = data.filter((item) => {
          const namHocId =
            typeof item.MaDotNop?.NamHoc === 'object'
              ? item.MaDotNop?.NamHoc?._id
              : item.MaDotNop?.NamHoc;
          return String(namHocId) === String(this.selectedNamHoc);
        });
      }

      // Filter theo giảng viên
      if (this.selectedGiangVien) {
        data = data.filter((item) => {
          const gvId =
            typeof item.MaDotNop?.MaGiangVien === 'object'
              ? item.MaDotNop?.MaGiangVien?._id
              : item.MaDotNop?.MaGiangVien;
          return String(gvId) === String(this.selectedGiangVien);
        });
      }

      // Search keyword
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        data = data.filter((item) => {
          const title = (item.TenDeTai || '').toLowerCase();
          const studentName = `${item.MaDocGia?.HoLot || ''} ${
            item.MaDocGia?.Ten || ''
          }`.toLowerCase();
          const studentCode = (
            item.MaDocGia?.SinhVien?.MaSinhVien || ''
          ).toLowerCase();
          return (
            title.includes(keyword) ||
            studentName.includes(keyword) ||
            studentCode.includes(keyword)
          );
        });
      }

      this.filteredData = data;
      this.currentPage = 1;
    },

    // Filter theo thời gian
    filterByPeriod(data) {
      if (this.selectedPeriod === 'custom') {
        if (!this.customDateRange.from || !this.customDateRange.to) return data;
        const fromDate = new Date(this.customDateRange.from);
        const toDate = new Date(this.customDateRange.to);
        toDate.setHours(23, 59, 59, 999);

        return data.filter((item) => {
          const itemDate = new Date(item.NgayNop || item.createdAt);
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
        const itemDate = new Date(item.NgayNop || item.createdAt);
        return itemDate >= limitDate;
      });
    },

    // Xử lý thay đổi period
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

    // Đếm theo trạng thái
    countByStatus(status) {
      return this.filteredData.filter((item) => item.TrangThai === status)
        .length;
    },

    // Format ngày
    formatDate(dateStr) {
      if (!dateStr) return '--';
      return new Date(dateStr).toLocaleDateString('vi-VN');
    },

    // Chuyển trang
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Lấy tên khoa từ đợt
    getKhoaName(dot) {
      return dot.MaGiangVien?.GiangVien?.MaBoMon?.MaKhoa?.TenKhoa || 'N/A';
    },

    // Lấy ID khoa từ đợt
    getKhoaIdFromDot(dot) {
      return (
        dot.MaGiangVien?.GiangVien?.MaBoMon?.MaKhoa?._id ||
        dot.MaGiangVien?.GiangVien?.MaBoMon?.MaKhoa
      );
    },

    // Mở modal export
    openExportModal() {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);

      this.exportDateRange.to = today.toISOString().split('T')[0];
      this.exportDateRange.from = oneMonthAgo.toISOString().split('T')[0];
      this.exportOption = 'current';
      this.showExportModal = true;
    },

    // Xác nhận export
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

    // Lấy dữ liệu export
    getExportData() {
      if (this.exportOption === 'current') {
        return this.filteredData;
      } else if (this.exportOption === 'all') {
        return this.statisticData;
      } else {
        const fromDate = new Date(this.exportDateRange.from);
        const toDate = new Date(this.exportDateRange.to);
        toDate.setHours(23, 59, 59, 999);

        return this.statisticData.filter((item) => {
          const itemDate = new Date(item.NgayNop || item.createdAt);
          return itemDate >= fromDate && itemDate <= toDate;
        });
      }
    },

    // Lấy tiêu đề export
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

    // Export PDF
    // Export PDF
    exportPDF() {
      const exportData = this.getExportData();
      const subtitle = this.getExportTitle();

      const content = [
        {
          text: 'BÁO CÁO THỐNG KÊ NIÊN LUẬN',
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
          text: `Tổng số: ${exportData.length} niên luận`,
          style: 'summary',
          margin: [0, 0, 0, 15],
        },
      ];

      // Thêm bảng thống kê đợt nộp nếu có
      if (this.filteredDotStatistics.length > 0) {
        content.push({
          text: 'THỐNG KÊ THEO ĐỢT NỘP',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10],
        });

        const dotTableBody = [
          [
            { text: 'STT', style: 'tableHeader' },
            { text: 'Tên đợt', style: 'tableHeader' },
            { text: 'Giảng viên', style: 'tableHeader' },
            { text: 'Khoa', style: 'tableHeader' },
            { text: 'Kỳ học', style: 'tableHeader' },
            { text: 'Năm học', style: 'tableHeader' },
            { text: 'Chỉ tiêu', style: 'tableHeader' },
            { text: 'Đã nộp', style: 'tableHeader' },
            { text: 'Đã duyệt', style: 'tableHeader' },
            { text: 'Chờ duyệt', style: 'tableHeader' },
            { text: 'Từ chối', style: 'tableHeader' },
            { text: 'Trạng thái', style: 'tableHeader' },
            { text: 'Tỷ lệ (%)', style: 'tableHeader' },
          ],
        ];

        this.filteredDotStatistics.forEach((dot, index) => {
          dotTableBody.push([
            { text: (index + 1).toString(), style: 'tableCell' },
            { text: dot.TenDot || '', style: 'tableCell' },
            {
              text: `${dot.MaGiangVien?.HoLot || ''} ${
                dot.MaGiangVien?.Ten || ''
              }`,
              style: 'tableCell',
            },
            { text: this.getKhoaName(dot), style: 'tableCell' },
            { text: dot.KyHoc?.TenKyHoc || 'N/A', style: 'tableCell' },
            { text: dot.NamHoc?.TenNamHoc || 'N/A', style: 'tableCell' },
            {
              text: dot.SoLuongPhaiNop.toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            {
              text: dot.tongDaNop.toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            {
              text: dot.daDuyet.toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            {
              text: dot.choDuyet.toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            {
              text: dot.tuChoi.toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            {
              text: dot.TrangThai || 'N/A',
              style: 'tableCell',
              alignment: 'center',
            },
            {
              text: `${dot.tyLeHoanThanh}%`,
              style: 'tableCell',
              alignment: 'center',
              bold: true,
            },
          ]);
        });

        content.push({
          table: {
            headerRows: 1,
            widths: [
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
              'auto',
            ],
            body: dotTableBody,
          },
          layout: {
            fillColor: function (rowIndex) {
              if (rowIndex === 0) return '#667eea';
              return rowIndex % 2 === 0 ? '#f5f7fa' : null;
            },
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#dee2e6',
            vLineColor: () => '#dee2e6',
          },
          margin: [0, 0, 0, 20],
        });
      }

      // Thêm bảng chi tiết
      content.push({
        text: 'CHI TIẾT NIÊN LUẬN',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
      });

      const tableBody = [
        [
          { text: 'STT', style: 'tableHeader' },
          { text: 'Mã SV', style: 'tableHeader' },
          { text: 'Họ tên', style: 'tableHeader' },
          { text: 'Khoa', style: 'tableHeader' },
          { text: 'Ngành', style: 'tableHeader' },
          { text: 'Tên đề tài', style: 'tableHeader' },
          { text: 'GVHD', style: 'tableHeader' },
          { text: 'Kỳ học', style: 'tableHeader' },
          { text: 'Năm học', style: 'tableHeader' },
          { text: 'Ngày nộp', style: 'tableHeader' },
          { text: 'Trạng thái', style: 'tableHeader' },
          { text: 'Link PDF', style: 'tableHeader' },
        ],
      ];

      exportData.forEach((item, index) => {
        tableBody.push([
          { text: (index + 1).toString(), style: 'tableCell' },
          {
            text: item.MaDocGia?.SinhVien?.MaSinhVien || 'N/A',
            style: 'tableCell',
          },
          {
            text: `${item.MaDocGia?.HoLot || ''} ${item.MaDocGia?.Ten || ''}`,
            style: 'tableCell',
          },
          {
            text: item.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa || 'N/A',
            style: 'tableCell',
          },
          {
            text: item.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh || 'N/A',
            style: 'tableCell',
          },
          { text: item.TenDeTai || 'N/A', style: 'tableCell' },
          {
            text: `${item.MaDotNop?.MaGiangVien?.HoLot || ''} ${
              item.MaDotNop?.MaGiangVien?.Ten || ''
            }`,
            style: 'tableCell',
          },
          { text: item.MaDotNop?.KyHoc?.TenKyHoc || 'N/A', style: 'tableCell' },
          {
            text: item.MaDotNop?.NamHoc?.TenNamHoc || 'N/A',
            style: 'tableCell',
          },
          { text: this.formatDate(item.NgayNop), style: 'tableCell' },
          { text: item.TrangThai || '', style: 'tableCell' },
          {
            text: item.Pdf || 'N/A',
            style: 'tableCell',
            link: item.Pdf || '',
            color: item.Pdf ? '#0066cc' : '#000000',
            decoration: item.Pdf ? 'underline' : 'none',
          },
        ]);
      });

      content.push({
        table: {
          headerRows: 1,
          widths: [
            'auto',
            'auto',
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
          ],
          body: tableBody,
        },
        layout: {
          fillColor: function (rowIndex) {
            if (rowIndex === 0) return '#667eea';
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
          sectionHeader: {
            fontSize: 13,
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
        .download(`bao-cao-nien-luan-${new Date().getTime()}.pdf`);
    },

    // Export Excel
    // Export Excel
    exportExcel() {
      const wb = XLSX.utils.book_new();
      const exportData = this.getExportData();
      const subtitle = this.getExportTitle();

      const excelData = [
        ['BÁO CÁO THỐNG KÊ NIÊN LUẬN'],
        [],
        ['Khoảng dữ liệu:', subtitle],
        ['Tổng số niên luận:', exportData.length],
        ['Xuất ngày:', new Date().toLocaleString('vi-VN')],
        [],
      ];

      // Thêm bảng thống kê đợt
      if (this.filteredDotStatistics.length > 0) {
        excelData.push(['THỐNG KÊ THEO ĐỢT NỘP']);
        excelData.push([
          'STT',
          'Tên đợt',
          'Giảng viên',
          'Khoa',
          'Kỳ học',
          'Năm học',
          'Chỉ tiêu',
          'Đã nộp',
          'Đã duyệt',
          'Chờ duyệt',
          'Từ chối',
          'Trạng thái',
          'Tỷ lệ hoàn thành (%)',
        ]);

        this.filteredDotStatistics.forEach((dot, index) => {
          excelData.push([
            index + 1,
            dot.TenDot || '',
            `${dot.MaGiangVien?.HoLot || ''} ${dot.MaGiangVien?.Ten || ''}`,
            this.getKhoaName(dot),
            dot.KyHoc?.TenKyHoc || 'N/A',
            dot.NamHoc?.TenNamHoc || 'N/A',
            dot.SoLuongPhaiNop,
            dot.tongDaNop,
            dot.daDuyet,
            dot.choDuyet,
            dot.tuChoi,
            dot.TrangThai || 'N/A',
            dot.tyLeHoanThanh,
          ]);
        });

        excelData.push([]);
      }

      // Thêm bảng chi tiết
      excelData.push(['CHI TIẾT NIÊN LUẬN']);
      excelData.push([
        'STT',
        'Mã sinh viên',
        'Họ tên',
        'Khoa',
        'Ngành học',
        'Tên đề tài',
        'Giảng viên HD',
        'Kỳ học',
        'Năm học',
        'Ngày nộp',
        'Trạng thái',
        'Link PDF',
      ]);

      exportData.forEach((item, index) => {
        excelData.push([
          index + 1,
          item.MaDocGia?.SinhVien?.MaSinhVien || 'N/A',
          `${item.MaDocGia?.HoLot || ''} ${item.MaDocGia?.Ten || ''}`,
          item.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa || 'N/A',
          item.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh || 'N/A',
          item.TenDeTai || 'N/A',
          `${item.MaDotNop?.MaGiangVien?.HoLot || ''} ${
            item.MaDotNop?.MaGiangVien?.Ten || ''
          }`,
          item.MaDotNop?.KyHoc?.TenKyHoc || 'N/A',
          item.MaDotNop?.NamHoc?.TenNamHoc || 'N/A',
          this.formatDate(item.NgayNop),
          item.TrangThai || '',
          item.Pdf || 'N/A',
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 30 },
        { wch: 50 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 60 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Thống kê niên luận');
      XLSX.writeFile(wb, `bao-cao-nien-luan-${new Date().getTime()}.xlsx`);
    },

    // Chuyển trang cho đợt
    changeDotPage(page) {
      if (page < 1 || page > this.dotTotalPages) return;
      this.dotCurrentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

/* Table Styles */
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
