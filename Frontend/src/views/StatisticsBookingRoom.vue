<template>
  <div class="admin-dashboard d-flex">
    <div class="main d-flex flex-column flex-grow-1 min-vh-100">
      <div class="content-wrapper flex-grow-1 p-4" style="background: #f5f7fa">
        <div class="container-fluid">
          <!-- Header Section -->
          <div class="page-header mb-4">
            <h2 class="fw-bold text-dark mb-2" style="font-size: 2.5rem">
              <i class="bi bi-door-open me-2"></i>Thống kê tình trạng đặt phòng
            </h2>
            <p>
              Theo dõi và quản lý tình trạng đặt phòng của từng phòng học trong hệ thống
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
                  <label class="form-label fw-semibold">Loại phòng</label>
                  <select
                    v-model="selectedRoomType"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả</option>
                    <option value="Nhóm">Phòng nhóm</option>
                    <option value="Cá nhân">Phòng cá nhân</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Sắp xếp theo</label>
                  <select
                    v-model="sortBy"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="totalBookings">Số lần đặt (Cao → Thấp)</option>
                    <option value="approved">Đã duyệt (Cao → Thấp)</option>
                    <option value="checkedIn">Đã nhận phòng (Cao → Thấp)</option>
                    <option value="noShow">Không nhận phòng (Cao → Thấp)</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Tìm kiếm</label>
                  <input
                    type="text"
                    v-model="searchKeyword"
                    class="form-control"
                    placeholder="Tên phòng, mã phòng..."
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
                      <p class="mb-1 text-white-50">Tổng số phòng</p>
                      <h3 class="fw-bold mb-0">{{ filteredData.length }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-door-closed"></i>
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
                      <p class="mb-1 text-white-50">Tổng lượt đặt</p>
                      <h3 class="fw-bold mb-0">{{ totalBookings }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-calendar-check"></i>
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
                      <p class="mb-1 text-white-50">Đã nhận phòng</p>
                      <h3 class="fw-bold mb-0">{{ totalCheckedIn }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-check-circle-fill"></i>
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
                      <p class="mb-1 text-white-50">Không nhận phòng</p>
                      <h3 class="fw-bold mb-0">{{ totalNoShow }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-x-circle-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table with Pagination -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-semibold" style="font-size: 1.7rem">
                  <i class="bi bi-table text-info me-2"></i>
                  Chi tiết tình trạng đặt phòng
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
                      <th>Mã phòng</th>
                      <th>Tên phòng</th>
                      <th>Loại phòng</th>
                      <th>Số lần đặt</th>
                      <th>Đã duyệt</th>
                      <th>Đã nhận phòng</th>
                      <th>Không nhận phòng</th>
                      <th>Đã hủy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in paginatedData" :key="item.roomId">
                      <td>{{ startIndex + index + 1 }}</td>
                      <td>{{ item.maPhong }}</td>
                      <td>{{ item.tenPhong }}</td>
                      <td>{{ item.loaiPhong }}</td>
                      <td style="text-align: center; font-weight: 600">{{ item.totalBookings }}</td>
                      <td style="text-align: center; font-weight: 600">{{ item.approved }}</td>
                      <td style="text-align: center; font-weight: 600">{{ item.checkedIn }}</td>
                      <td style="text-align: center; font-weight: 600; color: #dc3545">{{ item.noShow }}</td>
                      <td style="text-align: center; font-weight: 600">{{ item.canceled }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" style="text-align: right; font-weight: bold; font-size: 1.5rem">
                        TỔNG CỘNG:
                      </td>
                      <td style="text-align: center; font-weight: bold; font-size: 1.5rem">
                        {{ totalBookings }}
                      </td>
                      <td style="text-align: center; font-weight: bold; font-size: 1.5rem">
                        {{ totalApproved }}
                      </td>
                      <td style="text-align: center; font-weight: bold; font-size: 1.5rem">
                        {{ totalCheckedIn }}
                      </td>
                      <td style="text-align: center; font-weight: bold; font-size: 1.5rem; color: #dc3545">
                        {{ totalNoShow }}
                      </td>
                      <td style="text-align: center; font-weight: bold; font-size: 1.5rem">
                        {{ totalCanceled }}
                      </td>
                    </tr>
                  </tfoot>
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
            <i class="bi bi-download me-2"></i>Xuất báo cáo tình trạng đặt phòng
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
                Xuất dữ liệu đang hiển thị ({{ filteredData.length }} phòng)
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
                Xuất tất cả dữ liệu ({{ roomStats.length }} phòng)
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
import { roomService } from '../services/room/room.service';

export default {
  name: 'StatisticsRoomStatus',

  data() {
    return {
      statisticData: [],
      roomStats: [],
      filteredData: [],
      selectedPeriod: 'all',
      selectedRoomType: '',
      sortBy: 'totalBookings',
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

    totalBookings() {
      return this.filteredData.reduce((sum, item) => sum + item.totalBookings, 0);
    },

    totalApproved() {
      return this.filteredData.reduce((sum, item) => sum + item.approved, 0);
    },

    totalCheckedIn() {
      return this.filteredData.reduce((sum, item) => sum + item.checkedIn, 0);
    },

    totalNoShow() {
      return this.filteredData.reduce((sum, item) => sum + item.noShow, 0);
    },

    totalCanceled() {
      return this.filteredData.reduce((sum, item) => sum + item.canceled, 0);
    },
  },

  async mounted() {
    await this.loadData();
  },

  methods: {
    async loadData() {
      try {
        this.statisticData = await roomService.getStatisticRoom();
        this.processRoomStats();
        this.applyFilters();
        console.log('✅ Đã tải dữ liệu:', this.statisticData.length, 'bản ghi');
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        alert('Không thể tải dữ liệu thống kê');
      }
    },

    processRoomStats() {
      const roomMap = {};

      this.statisticData.forEach(item => {
        const roomId = item.PhongHoc?._id;
        if (!roomId) return;

        if (!roomMap[roomId]) {
          roomMap[roomId] = {
            roomId: roomId,
            maPhong: item.PhongHoc?.MaPhong || 'N/A',
            tenPhong: item.PhongHoc?.TenPhong || 'N/A',
            loaiPhong: item.PhongHoc?.LoaiPhong || 'N/A',
            totalBookings: 0,
            approved: 0,
            checkedIn: 0,
            noShow: 0,
            canceled: 0,
            records: [], // Lưu tất cả các bản ghi để lọc theo thời gian
          };
        }

        const room = roomMap[roomId];
        room.records.push(item);
        room.totalBookings++;

        if (item.TrangThai === 'approved') {
          room.approved++;
        } else if (item.TrangThai === 'checked_in') {
          room.checkedIn++;
        } else if (item.TrangThai === 'no_show') {
          room.noShow++;
        } else if (item.TrangThai === 'canceled') {
          room.canceled++;
        }
      });

      this.roomStats = Object.values(roomMap);
    },

    applyFilters() {
      let data = [...this.roomStats];

      // Filter by period (tính lại stats dựa trên thời gian)
      if (this.selectedPeriod !== 'all') {
        data = this.filterByPeriod(data);
      }

      // Filter by room type
      if (this.selectedRoomType) {
        data = data.filter(item => item.loaiPhong === this.selectedRoomType);
      }

      // Search
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        data = data.filter(item => {
          const roomName = item.tenPhong.toLowerCase();
          const roomCode = item.maPhong.toLowerCase();

          return (
            roomName.includes(keyword) ||
            roomCode.includes(keyword)
          );
        });
      }

      // Sort
      data.sort((a, b) => {
        switch (this.sortBy) {
          case 'totalBookings':
            return b.totalBookings - a.totalBookings;
          case 'approved':
            return b.approved - a.approved;
          case 'checkedIn':
            return b.checkedIn - a.checkedIn;
          case 'noShow':
            return b.noShow - a.noShow;
          default:
            return 0;
        }
      });

      this.filteredData = data;
      this.currentPage = 1;
    },

    filterByPeriod(data) {
      if (this.selectedPeriod === 'custom') {
        if (!this.customDateRange.from || !this.customDateRange.to) {
          return data;
        }
        const fromDate = new Date(this.customDateRange.from);
        const toDate = new Date(this.customDateRange.to);
        toDate.setHours(23, 59, 59, 999);

        return data.map(room => {
          const filteredRecords = room.records.filter(record => {
            const recordDate = new Date(record.NgayDat || record.createdAt);
            return recordDate >= fromDate && recordDate <= toDate;
          });

          return this.recalculateStats(room, filteredRecords);
        }).filter(room => room.totalBookings > 0);
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

      return data.map(room => {
        const filteredRecords = room.records.filter(record => {
          const recordDate = new Date(record.NgayDat || record.createdAt);
          return recordDate >= limitDate;
        });

        return this.recalculateStats(room, filteredRecords);
      }).filter(room => room.totalBookings > 0);
    },

    recalculateStats(room, records) {
      const newRoom = { ...room };
      newRoom.totalBookings = 0;
      newRoom.approved = 0;
      newRoom.checkedIn = 0;
      newRoom.noShow = 0;
      newRoom.canceled = 0;

      records.forEach(record => {
        newRoom.totalBookings++;

        if (record.TrangThai === 'approved') {
          newRoom.approved++;
        } else if (record.TrangThai === 'checked_in') {
          newRoom.checkedIn++;
        } else if (record.TrangThai === 'no_show') {
          newRoom.noShow++;
        } else if (record.TrangThai === 'canceled') {
          newRoom.canceled++;
        }
      });

      return newRoom;
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
        return this.roomStats;
      } else {
        // custom
        const fromDate = new Date(this.exportDateRange.from);
        const toDate = new Date(this.exportDateRange.to);
        toDate.setHours(23, 59, 59, 999);

        return this.roomStats.map(room => {
          const filteredRecords = room.records.filter(record => {
            const recordDate = new Date(record.NgayDat || record.createdAt);
            return recordDate >= fromDate && recordDate <= toDate;
          });

          return this.recalculateStats(room, filteredRecords);
        }).filter(room => room.totalBookings > 0);
      }
    },

    getExportTitle() {
      if (this.exportOption === 'current') {
        return 'Dữ liệu đang hiển thị';
      } else if (this.exportOption === 'all') {
        return 'Tất cả dữ liệu';
      } else {
        const fromDate = new Date(this.exportDateRange.from).toLocaleDateString('vi-VN');
        const toDate = new Date(this.exportDateRange.to).toLocaleDateString('vi-VN');
        return `Từ ${fromDate} đến ${toDate}`;
      }
    },

    exportPDF() {
      const exportData = this.getExportData();
      const subtitle = this.getExportTitle();

      const content = [
        {
            text: 'BÁO CÁO TÌNH TRẠNG ĐẶT PHÒNG',
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
             text: `Tổng số phòng: ${exportData.length}`,
            style: 'summary',
            margin: [0, 0, 0, 20],
        },
        ];
        const tableBody = [
    [
      { text: 'STT', style: 'tableHeader' },
      { text: 'Mã phòng', style: 'tableHeader' },
      { text: 'Tên phòng', style: 'tableHeader' },
      { text: 'Loại phòng', style: 'tableHeader' },
      { text: 'Số lần đặt', style: 'tableHeader' },
      { text: 'Đã duyệt', style: 'tableHeader' },
      { text: 'Đã nhận phòng', style: 'tableHeader' },
      { text: 'Không nhận', style: 'tableHeader' },
      { text: 'Đã hủy', style: 'tableHeader' },
    ],
  ];

  exportData.forEach((item, index) => {
    tableBody.push([
      { text: (index + 1).toString(), style: 'tableCell' },
      { text: item.maPhong, style: 'tableCell' },
      { text: item.tenPhong, style: 'tableCell' },
      { text: item.loaiPhong, style: 'tableCell' },
      { text: item.totalBookings.toString(), style: 'tableCell', alignment: 'center' },
      { text: item.approved.toString(), style: 'tableCell', alignment: 'center' },
      { text: item.checkedIn.toString(), style: 'tableCell', alignment: 'center' },
      { text: item.noShow.toString(), style: 'tableCell', alignment: 'center' },
      { text: item.canceled.toString(), style: 'tableCell', alignment: 'center' },
    ]);
  });

  // Tổng cộng
  const sumTotal = exportData.reduce((sum, item) => sum + item.totalBookings, 0);
  const sumApproved = exportData.reduce((sum, item) => sum + item.approved, 0);
  const sumCheckedIn = exportData.reduce((sum, item) => sum + item.checkedIn, 0);
  const sumNoShow = exportData.reduce((sum, item) => sum + item.noShow, 0);
  const sumCanceled = exportData.reduce((sum, item) => sum + item.canceled, 0);

  tableBody.push([
    { text: 'TỔNG CỘNG', colSpan: 4, style: 'tableCellBold', alignment: 'right' },
    {},
    {},
    {},
    { text: sumTotal.toString(), style: 'tableCellBold', alignment: 'center' },
    { text: sumApproved.toString(), style: 'tableCellBold', alignment: 'center' },
    { text: sumCheckedIn.toString(), style: 'tableCellBold', alignment: 'center' },
    { text: sumNoShow.toString(), style: 'tableCellBold', alignment: 'center' },
    { text: sumCanceled.toString(), style: 'tableCellBold', alignment: 'center' },
  ]);

  content.push({
    table: {
      headerRows: 1,
      widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
    .download(`bao-cao-tinh-trang-dat-phong-${new Date().getTime()}.pdf`);
},

exportExcel() {
  const wb = XLSX.utils.book_new();
  const exportData = this.getExportData();
  const subtitle = this.getExportTitle();

  const excelData = [
    ['BÁO CÁO TÌNH TRẠNG ĐẶT PHÒNG'],
    [],
    ['Khoảng dữ liệu:', subtitle],
    ['Tổng số phòng:', exportData.length],
    ['Xuất ngày:', new Date().toLocaleString('vi-VN')],
    [],
    [
      'STT',
      'Mã phòng',
      'Tên phòng',
      'Loại phòng',
      'Số lần đặt',
      'Đã duyệt',
      'Đã nhận phòng',
      'Không nhận phòng',
      'Đã hủy',
    ],
  ];

  exportData.forEach((item, index) => {
    excelData.push([
      index + 1,
      item.maPhong,
      item.tenPhong,
      item.loaiPhong,
      item.totalBookings,
      item.approved,
      item.checkedIn,
      item.noShow,
      item.canceled,
    ]);
  });

  // Tổng cộng
  const sumTotal = exportData.reduce((sum, item) => sum + item.totalBookings, 0);
  const sumApproved = exportData.reduce((sum, item) => sum + item.approved, 0);
  const sumCheckedIn = exportData.reduce((sum, item) => sum + item.checkedIn, 0);
  const sumNoShow = exportData.reduce((sum, item) => sum + item.noShow, 0);
  const sumCanceled = exportData.reduce((sum, item) => sum + item.canceled, 0);

  excelData.push([
    '',
    '',
    '',
    'TỔNG CỘNG:',
    sumTotal,
    sumApproved,
    sumCheckedIn,
    sumNoShow,
    sumCanceled,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 30 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Tình trạng đặt phòng');
  XLSX.writeFile(
    wb,
    `bao-cao-tinh-trang-dat-phong-${new Date().getTime()}.xlsx`
  );
},},
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