<template>
  <div class="admin-dashboard d-flex">
    <div class="main d-flex flex-column flex-grow-1 min-vh-100">
      <div class="content-wrapper flex-grow-1 p-4" style="background: #f5f7fa">
        <div class="container-fluid">
          <!-- Header Section -->
          <div class="page-header mb-4">
            <h2 class="fw-bold text-dark mb-2" style="font-size: 2.5rem">
              <i class="bi bi-door-open me-2"></i>Thống kê tổng hợp đặt phòng học
            </h2>
            <p>
              Theo dõi tình trạng đặt phòng và sử dụng phòng học theo thời gian
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
                <div class="col-md-6" v-if="selectedPeriod === 'custom'">
                  <label class="form-label fw-semibold">Khoảng thời gian</label>
                  <div class="row g-2">
                    <div class="col-6">
                      <input
                        type="date"
                        v-model="customDateRange.from"
                        class="form-control"
                        @change="updateChart"
                        style="font-size: 1.3rem"
                      />
                    </div>
                    <div class="col-6">
                      <input
                        type="date"
                        v-model="customDateRange.to"
                        class="form-control"
                        @change="updateChart"
                        style="font-size: 1.3rem"
                      />
                    </div>
                  </div>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold"
                    >Trạng thái đặt phòng</label
                  >
                  <select
                    v-model="selectedStatus"
                    class="form-select"
                    @change="updateChart"
                  >
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="denied">Bị từ chối</option>
                    <option value="checked_in">Đã nhận phòng</option>
                    <option value="no_show">Không nhận phòng</option>
                    <option value="canceled">Đã hủy</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Loại phòng</label>
                  <select
                    v-model="selectedRoomType"
                    class="form-select"
                    @change="updateChart"
                  >
                    <option value="">Tất cả</option>
                    <option value="Nhóm">Phòng nhóm</option>
                    <option value="Cá nhân">Phòng cá nhân</option>
                  </select>
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
                      <p class="mb-1 text-white-50">Tổng lượt đặt</p>
                      <h3 class="fw-bold mb-0">{{ totalBookings }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-calendar-check"></i>
                    </div>
                  </div>
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small
                      ><i class="bi bi-clock-history me-1"></i>Tất cả thời
                      gian</small
                    >
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
                      <h3 class="fw-bold mb-0">{{ approvedBookings }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-check-circle"></i>
                    </div>
                  </div>
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small>Tỷ lệ: {{ approvalRate }}%</small>
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
                      <h3 class="fw-bold mb-0">{{ pendingBookings }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-hourglass-split"></i>
                    </div>
                  </div>
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small
                      ><i class="bi bi-clock me-1"></i>Đang chờ xử lý</small
                    >
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
                      <h3 class="fw-bold mb-0">{{ noShowBookings }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-x-circle"></i>
                    </div>
                  </div>
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small>Bị từ chối: {{ deniedBookings }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="row g-3 mb-4">
            <div class="col-xl-8">
              <div class="card shadow-sm border-0">
                <div class="card-header bg-white border-bottom py-3">
                  <h5 class="mb-0 fw-semibold">
                    <i class="bi bi-graph-up text-primary me-2"></i>
                    Xu hướng đặt phòng
                  </h5>
                </div>
                <div class="card-body">
                  <canvas ref="mainChart"></canvas>
                </div>
              </div>
            </div>

            <div class="col-xl-4">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white border-bottom py-3">
                  <h5 class="mb-0 fw-semibold">
                    <i class="bi bi-pie-chart text-success me-2"></i>
                    Phân bố trạng thái
                  </h5>
                </div>
                <div class="card-body">
                  <canvas ref="pieChart" height="200"></canvas>
                  <div class="status-legend mt-3">
                    <div
                      v-for="(item, index) in statusDistribution"
                      :key="index"
                      class="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div class="d-flex align-items-center">
                        <span
                          class="legend-color me-2"
                          :style="{ backgroundColor: item.color }"
                        ></span>
                        <span>{{ item.label }}</span>
                      </div>
                      <span class="fw-semibold"
                        >{{ item.value }} ({{ item.percent }}%)</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Table -->
          <div class="card shadow-sm border-0 mt-4">
            <div class="card-header bg-white border-bottom py-3">
              <h5 class="mb-0 fw-semibold" style="font-size: 1.7rem">
                <i class="bi bi-table text-info me-2"></i>
                Chi tiết thống kê
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Thời gian</th>
                      <th class="text-center">Tổng đặt</th>
                      <th class="text-center">Chờ duyệt</th>
                      <th class="text-center">Đã duyệt</th>
                      <th class="text-center">Bị từ chối</th>
                      <th class="text-center">Đã nhận phòng</th>
                      <th class="text-center">Không nhận</th>
                      <th class="text-center">Đã hủy</th>
                      <th class="text-center">Tỷ lệ sử dụng</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in detailDataFull" :key="index">
                      <td class="fw-semibold">{{ row.period }}</td>
                      <td class="text-center">
                        <span class="">{{ row.total }}</span>
                      </td>
                      <td class="text-center">{{ row.pending }}</td>
                      <td class="text-center">{{ row.approved }}</td>
                      <td class="text-center">{{ row.denied }}</td>
                      <td class="text-center">{{ row.checkedIn }}</td>
                      <td class="text-center">{{ row.noShow }}</td>
                      <td class="text-center">{{ row.canceled }}</td>
                      <td class="text-center">
                        <span class="text-success fw-semibold"
                          >{{ row.approvalRate }}%</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
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
    id="exportModal"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" style="font-size: 2rem">
            <i class="bi bi-download me-2"></i>Tùy chọn xuất báo cáo
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
                id="exportAll"
                value="all"
                v-model="exportOption"
              />
              <label class="form-check-label" for="exportAll">
                Xuất tất cả dữ liệu
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                id="exportDisplay"
                value="display"
                v-model="exportOption"
              />
              <label class="form-check-label" for="exportDisplay">
                Xuất dữ liệu đang hiển thị
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
                Xuất theo khoảng thời gian
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
  name: 'ThongKePhong',

  data() {
    return {
      selectedPeriod: 'month',
      selectedStatus: '',
      selectedRoomType: '',
      chartInstance: null,
      pieChartInstance: null,
      roomUsageChartInstance: null,
      statisticData: [],

      customDateRange: {
        from: '',
        to: '',
      },
      showExportModal: false,
      exportDateRange: {
        from: '',
        to: '',
      },
      exportOption: 'all',
    };
  },

  computed: {
    currentData() {
      let filtered = this.statisticData;

      // Lọc theo trạng thái
      if (this.selectedStatus) {
        filtered = filtered.filter(
          (item) => item.TrangThai === this.selectedStatus
        );
      }

      // Lọc theo loại phòng
      if (this.selectedRoomType) {
        filtered = filtered.filter(
          (item) => item.PhongHoc?.LoaiPhong === this.selectedRoomType
        );
      }

      return this.groupDataByPeriod(filtered, this.selectedPeriod);
    },

    totalBookings() {
      return this.statisticData.length;
    },

    approvedBookings() {
      return this.statisticData.filter(
        (item) =>
          item.TrangThai === 'approved' || item.TrangThai === 'checked_in'
      ).length;
    },

    pendingBookings() {
      return this.statisticData.filter(
        (item) =>
          item.TrangThai === 'pending' || item.TrangThai === 'waiting_members'
      ).length;
    },

    noShowBookings() {
      return this.statisticData.filter((item) => item.TrangThai === 'no_show')
        .length;
    },

    deniedBookings() {
      return this.statisticData.filter((item) => item.TrangThai === 'denied')
        .length;
    },

    approvalRate() {
      if (this.totalBookings === 0) return 0;
      return Math.round((this.approvedBookings / this.totalBookings) * 100);
    },

    statusDistribution() {
      const total = this.statisticData.length;

      const pending = this.statisticData.filter(
        (item) =>
          item.TrangThai === 'pending' || item.TrangThai === 'waiting_members'
      ).length;
      const approved = this.statisticData.filter(
        (item) => item.TrangThai === 'approved'
      ).length;
      const denied = this.statisticData.filter(
        (item) => item.TrangThai === 'denied'
      ).length;
      const checkedIn = this.statisticData.filter(
        (item) => item.TrangThai === 'checked_in'
      ).length;
      const noShow = this.statisticData.filter(
        (item) => item.TrangThai === 'no_show'
      ).length;
      const canceled = this.statisticData.filter(
        (item) => item.TrangThai === 'canceled'
      ).length;

      return [
        {
          label: 'Chờ duyệt',
          value: pending,
          percent: total > 0 ? Math.round((pending / total) * 100) : 0,
          color: '#feca57',
        },
        {
          label: 'Đã duyệt',
          value: approved,
          percent: total > 0 ? Math.round((approved / total) * 100) : 0,
          color: '#4facfe',
        },
        {
          label: 'Đã nhận phòng',
          value: checkedIn,
          percent: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
          color: '#48dbfb',
        },
        {
          label: 'Không nhận phòng',
          value: noShow,
          percent: total > 0 ? Math.round((noShow / total) * 100) : 0,
          color: '#f5576c',
        },
        {
          label: 'Bị từ chối',
          value: denied,
          percent: total > 0 ? Math.round((denied / total) * 100) : 0,
          color: '#ff6b6b',
        },
        {
          label: 'Đã hủy',
          value: canceled,
          percent: total > 0 ? Math.round((canceled / total) * 100) : 0,
          color: '#95a5a6',
        },
      ];
    },

    detailData() {
      return this.currentData.map((item) => ({
        period: item.date,
        total: item.total,
        pending: item.pending,
        approved: item.approved,
        denied: item.denied,
        checkedIn: item.checkedIn,
        noShow: item.noShow,
        canceled: item.canceled,
        approvalRate:
          item.total > 0 ? Math.round((item.checkedIn / item.total) * 100) : 0,
      }));
    },

    detailDataFull() {
      if (this.selectedPeriod !== 'custom') {
        return this.detailData;
      }

      let filtered = this.statisticData;

      if (this.selectedStatus) {
        filtered = filtered.filter(
          (item) => item.TrangThai === this.selectedStatus
        );
      }

      if (this.selectedRoomType) {
        filtered = filtered.filter(
          (item) => item.PhongHoc?.LoaiPhong === this.selectedRoomType
        );
      }

      const fullData = this.groupDataByCustomRangeForTable(filtered);

      return fullData.map((item) => ({
        period: item.date,
        total: item.total,
        pending: item.pending,
        approved: item.approved,
        denied: item.denied,
        checkedIn: item.checkedIn,
        noShow: item.noShow,
        canceled: item.canceled,
        approvalRate:
          item.total > 0 ? Math.round((item.checkedIn / item.total) * 100) : 0,
      }));
    },
  },

  async mounted() {
    await this.loadData();
    this.initCharts();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    if (this.chartInstance) this.chartInstance.destroy();
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    if (this.roomUsageChartInstance) this.roomUsageChartInstance.destroy();
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    async loadData() {
      try {
        this.statisticData = await roomService.getStatisticRoom();
        console.log('✅ Đã tải dữ liệu:', this.statisticData.length, 'bản ghi');
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        alert('Không thể tải dữ liệu thống kê');
      }
    },

    initCharts() {
      this.createMainChart();
      this.createPieChart();
      this.createRoomUsageChart();
    },

    createMainChart() {
      const ctx = this.$refs.mainChart.getContext('2d');
      if (this.chartInstance) this.chartInstance.destroy();

      const data = this.currentData;
      const labels = data.map((item) => item.date);
      const totals = data.map((item) => item.total);
      const approved = data.map((item) => item.approved + item.checkedIn);
      const pending = data.map((item) => item.pending);

      this.chartInstance = this.drawLineChart(ctx, labels, [
        {
          label: 'Tổng đặt',
          data: totals,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Đã duyệt',
          data: approved,
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Chờ duyệt',
          data: pending,
          borderColor: '#feca57',
          backgroundColor: 'rgba(254, 202, 87, 0.1)',
          tension: 0.4,
        },
      ]);
    },

    createPieChart() {
      const ctx = this.$refs.pieChart.getContext('2d');
      if (this.pieChartInstance) this.pieChartInstance.destroy();

      const data = this.statusDistribution;
      this.pieChartInstance = this.drawPieChart(
        ctx,
        data.map((item) => item.label),
        data.map((item) => item.value),
        data.map((item) => item.color)
      );
    },

    createRoomUsageChart() {
      const ctx = this.$refs.roomUsageChart.getContext('2d');
      if (this.roomUsageChartInstance) this.roomUsageChartInstance.destroy();

      // Thống kê theo phòng
      const roomStats = {};
      this.statisticData.forEach((item) => {
        const roomName = item.PhongHoc?.TenPhong || 'Không xác định';
        if (!roomStats[roomName]) {
          roomStats[roomName] = { total: 0, approved: 0 };
        }
        roomStats[roomName].total++;
        if (item.TrangThai === 'approved' || item.TrangThai === 'checked_in') {
          roomStats[roomName].approved++;
        }
      });

      const labels = Object.keys(roomStats);
      const totals = labels.map((room) => roomStats[room].total);
      const approved = labels.map((room) => roomStats[room].approved);

      this.roomUsageChartInstance = this.drawLineChart(ctx, labels, [
        {
          label: 'Tổng lượt đặt',
          data: totals,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Đã duyệt',
          data: approved,
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          tension: 0.4,
        },
      ]);
    },

    drawLineChart(ctx, labels, datasets) {
      const maxValue = Math.max(...datasets.flatMap((ds) => ds.data));
      const yMax = Math.ceil(maxValue * 1.2) || 10;
      const yStep = Math.ceil(yMax / 5) || 2;

      const canvas = ctx.canvas;
      canvas.width = canvas.offsetWidth || canvas.parentElement.offsetWidth;
      canvas.height = 400;
      const width = canvas.width;
      const height = canvas.height;
      const padding = { top: 30, right: 30, bottom: 50, left: 60 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const draw = () => {
        ctx.clearRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + (chartHeight / 5) * i;
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(padding.left + chartWidth, y);
          ctx.stroke();

          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(Math.round(yMax - yStep * i), padding.left - 10, y + 4);
        }

        // X axis labels
        const xStep = chartWidth / (labels.length - 1 || 1);
        labels.forEach((label, i) => {
          const x = padding.left + xStep * i;
          ctx.fillStyle = '#666';
          ctx.font = '11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(label, x, height - padding.bottom + 20);
        });

        // Draw datasets
        datasets.forEach((dataset) => {
          const points = dataset.data.map((value, i) => ({
            x: padding.left + xStep * i,
            y: padding.top + chartHeight - ((value / yMax) * chartHeight || 0),
          }));

          // Fill area
          ctx.fillStyle = dataset.backgroundColor;
          ctx.beginPath();
          ctx.moveTo(points[0].x, height - padding.bottom);
          points.forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
          ctx.closePath();
          ctx.fill();

          // Draw line
          ctx.strokeStyle = dataset.borderColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();

          // Draw points
          points.forEach((p) => {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = dataset.borderColor;
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        });

        // Legend
        let legendX = padding.left;
        datasets.forEach((dataset) => {
          ctx.fillStyle = dataset.borderColor;
          ctx.fillRect(legendX, 10, 15, 15);
          ctx.fillStyle = '#333';
          ctx.font = '12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(dataset.label, legendX + 20, 22);
          legendX += ctx.measureText(dataset.label).width + 50;
        });
      };

      draw();
      return { destroy: () => {} };
    },

    drawPieChart(ctx, labels, data, colors) {
      const canvas = ctx.canvas;
      canvas.width = canvas.offsetWidth || canvas.parentElement.offsetWidth;
      canvas.height = 400;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;

      const total = data.reduce((sum, val) => sum + val, 0);
      let currentAngle = -Math.PI / 2;

      const draw = () => {
        ctx.clearRect(0, 0, width, height);

        if (total === 0) {
          ctx.fillStyle = '#ccc';
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        data.forEach((value, i) => {
          const sliceAngle = (value / total) * Math.PI * 2;

          ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(
            centerX,
            centerY,
            radius,
            currentAngle,
            currentAngle + sliceAngle
          );
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.stroke();

          currentAngle += sliceAngle;
        });
      };

      draw();
      return { destroy: () => {} };
    },

    updateChart() {
      this.createMainChart();
      this.createPieChart();
      this.createRoomUsageChart();
    },

    handleResize() {
      this.createMainChart();
      this.createPieChart();
      this.createRoomUsageChart();
    },

    groupDataByPeriod(data, period) {
      if (period === 'custom') {
        return this.groupDataByCustomRange(data);
      }

      const now = new Date();
      const grouped = {};

      data.forEach((item) => {
        const date = new Date(item.NgayDat || item.createdAt);
        let key = '';

        if (period === 'day') {
          key = this.formatDate(date, 'dd/MM');
        } else if (period === 'week') {
          key = `Tuần ${this.getWeekNumber(date)}`;
        } else if (period === 'month') {
          key = `T${date.getMonth() + 1}/${date.getFullYear()}`;
        } else if (period === 'quarter') {
          const quarter = Math.ceil((date.getMonth() + 1) / 3);
          key = `Q${quarter}/${date.getFullYear()}`;
        } else if (period === 'year') {
          key = date.getFullYear().toString();
        }

        if (!grouped[key]) {
          grouped[key] = {
            date: key,
            total: 0,
            pending: 0,
            approved: 0,
            denied: 0,
            checkedIn: 0,
            noShow: 0,
            canceled: 0,
          };
        }

        grouped[key].total++;
        if (
          item.TrangThai === 'pending' ||
          item.TrangThai === 'waiting_members'
        )
          grouped[key].pending++;
        if (item.TrangThai === 'approved') grouped[key].approved++;
        if (item.TrangThai === 'denied') grouped[key].denied++;
        if (item.TrangThai === 'checked_in') grouped[key].checkedIn++;
        if (item.TrangThai === 'no_show') grouped[key].noShow++;
        if (item.TrangThai === 'canceled') grouped[key].canceled++;
      });

      const result = Object.values(grouped);
      return this.filterByTimeRange(result, period, now);
    },

    formatDate(date, format) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      if (format === 'dd/MM') return `${day}/${month}`;
      if (format === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
      return date.toISOString().split('T')[0];
    },

    getWeekNumber(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },

    filterByTimeRange(data, period, now) {
      const limits = {
        day: 7,
        week: 8,
        month: 12,
        quarter: 4,
        year: 5,
      };

      const parseKeyDate = (key, period) => {
        if (period === 'day') {
          const [day, month] = key.split('/').map(Number);
          return new Date(now.getFullYear(), month - 1, day);
        } else if (period === 'week') {
          const weekNum = parseInt(key.match(/\d+/)[0]);
          const date = new Date(now.getFullYear(), 0, 1);
          date.setDate(date.getDate() + (weekNum - 1) * 7);
          return date;
        } else if (period === 'month') {
          const [month, year] = key.match(/\d+/g);
          return new Date(year, month - 1, 1);
        } else if (period === 'quarter') {
          const match = key.match(/Q(\d)\/(\d+)/);
          const quarter = parseInt(match[1]);
          const year = parseInt(match[2]);
          return new Date(year, (quarter - 1) * 3, 1);
        } else if (period === 'year') {
          return new Date(parseInt(key), 0, 1);
        }
        return new Date(0);
      };

      const limit = limits[period];
      const filtered = data.filter((item) => {
        const itemDate = parseKeyDate(item.date, period);
        const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

        if (period === 'day') {
          return daysDiff >= 0 && daysDiff < limit;
        } else if (period === 'week') {
          const weeksDiff = Math.floor(daysDiff / 7);
          return weeksDiff >= 0 && weeksDiff < limit;
        } else if (period === 'month') {
          const monthsDiff =
            (now.getFullYear() - itemDate.getFullYear()) * 12 +
            (now.getMonth() - itemDate.getMonth());
          return monthsDiff >= 0 && monthsDiff < limit;
        } else if (period === 'quarter') {
          const monthsDiff =
            (now.getFullYear() - itemDate.getFullYear()) * 12 +
            (now.getMonth() - itemDate.getMonth());
          const quartersDiff = Math.floor(monthsDiff / 3);
          return quartersDiff >= 0 && quartersDiff < limit;
        } else if (period === 'year') {
          const yearsDiff = now.getFullYear() - itemDate.getFullYear();
          return yearsDiff >= 0 && yearsDiff < limit;
        }
        return true;
      });

      const sorted = filtered.sort((a, b) => {
        const dateA = parseKeyDate(a.date, period);
        const dateB = parseKeyDate(b.date, period);
        return dateA - dateB;
      });

      return sorted;
    },

    exportPDF() {
      const exportData = this.getFilteredDataForExport();

      // Tạo subtitle
      let subtitle = '';
      if (this.exportOption === 'all') {
        subtitle = 'Tất cả dữ liệu';
      } else if (this.exportOption === 'display') {
        const periodTexts = {
          day: '7 ngày gần nhất',
          week: '8 tuần gần nhất',
          month: '12 tháng gần nhất',
          quarter: '4 quý gần nhất',
          year: '5 năm gần nhất',
          custom: `Từ ${new Date(this.customDateRange.from).toLocaleDateString(
            'vi-VN'
          )} đến ${new Date(this.customDateRange.to).toLocaleDateString(
            'vi-VN'
          )}`,
        };

        subtitle = `Dữ liệu đang hiển thị (${
          periodTexts[this.selectedPeriod]
        })`;

        if (this.selectedStatus) {
          const statusMap = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            denied: 'Bị từ chối',
            checked_in: 'Đã nhận phòng',
            no_show: 'Không nhận phòng',
            canceled: 'Đã hủy',
          };
          subtitle += ` - Trạng thái: ${statusMap[this.selectedStatus]}`;
        }

        if (this.selectedRoomType) {
          subtitle += ` - Loại phòng: ${
            this.selectedRoomType === 'Nhóm' ? 'Phòng nhóm' : 'Phòng cá nhân'
          }`;
        }
      } else {
        const fromDate = new Date(this.exportDateRange.from).toLocaleDateString(
          'vi-VN'
        );
        const toDate = new Date(this.exportDateRange.to).toLocaleDateString(
          'vi-VN'
        );
        subtitle = `Từ ${fromDate} đến ${toDate}`;
      }

      // Thống kê tổng quan
      const totalBookings = exportData.length;
      const pendingCount = exportData.filter(
        (b) => b.TrangThai === 'pending' || b.TrangThai === 'waiting_members'
      ).length;
      const approvedCount = exportData.filter(
        (b) => b.TrangThai === 'approved'
      ).length;
      const deniedCount = exportData.filter(
        (b) => b.TrangThai === 'denied'
      ).length;
      const checkedInCount = exportData.filter(
        (b) => b.TrangThai === 'checked_in'
      ).length;
      const noShowCount = exportData.filter(
        (b) => b.TrangThai === 'no_show'
      ).length;
      const canceledCount = exportData.filter(
        (b) => b.TrangThai === 'canceled'
      ).length;

      // Thống kê theo loại phòng
      const nhomBookings = exportData.filter(
        (b) => b.PhongHoc?.LoaiPhong === 'Nhóm'
      ).length;
      const canhanBookings = exportData.filter(
        (b) => b.PhongHoc?.LoaiPhong === 'Cá nhân'
      ).length;

      // Thống kê theo phòng
      const roomStats = {};
      exportData.forEach((item) => {
        const roomKey = item.PhongHoc?._id;
        if (roomKey) {
          if (!roomStats[roomKey]) {
            roomStats[roomKey] = {
              maPhong: item.PhongHoc?.MaPhong || 'N/A',
              tenPhong: item.PhongHoc?.TenPhong || 'N/A',
              loaiPhong: item.PhongHoc?.LoaiPhong || 'N/A',
              total: 0,
              approved: 0,
              checkedIn: 0,
            };
          }
          roomStats[roomKey].total++;
          if (item.TrangThai === 'approved') roomStats[roomKey].approved++;
          if (item.TrangThai === 'checked_in') roomStats[roomKey].checkedIn++;
        }
      });

      const content = [
        {
          text: 'BÁO CÁO TỔNG HỢP THỐNG KÊ ĐẶT PHÒNG',
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

        // PHẦN 1: THỐNG KÊ TỔNG QUAN
        {
          text: 'I. THỐNG KÊ TỔNG QUAN',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10],
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: `Tổng số lượt đặt: ${totalBookings}`,
                  style: 'summaryText',
                },
                { text: `Chờ duyệt: ${pendingCount}`, style: 'summaryText' },
                { text: `Đã duyệt: ${approvedCount}`, style: 'summaryText' },
                {
                  text: `Đã nhận phòng: ${checkedInCount}`,
                  style: 'summaryText',
                },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: `Bị từ chối: ${deniedCount}`, style: 'summaryText' },
                {
                  text: `Không nhận phòng: ${noShowCount}`,
                  style: 'summaryText',
                },
                { text: `Đã hủy: ${canceledCount}`, style: 'summaryText' },
                {
                  text: `Tỷ lệ thành công: ${
                    totalBookings > 0
                      ? Math.round(
                          ((approvedCount + checkedInCount) / totalBookings) *
                            100
                        )
                      : 0
                  }%`,
                  style: 'summaryText',
                  bold: true,
                },
              ],
            },
          ],
          margin: [0, 0, 0, 15],
        },

        // PHẦN 2: THỐNG KÊ THEO LOẠI PHÒNG
        {
          text: 'II. THỐNG KÊ THEO LOẠI PHÒNG',
          style: 'sectionHeader',
          margin: [0, 15, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              [
                { text: 'Loại phòng', style: 'tableHeader' },
                { text: 'Số lượt đặt', style: 'tableHeader' },
                { text: 'Tỷ lệ', style: 'tableHeader' },
              ],
              [
                { text: 'Phòng nhóm', style: 'tableCell' },
                {
                  text: nhomBookings.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((nhomBookings / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
              [
                { text: 'Phòng cá nhân', style: 'tableCell' },
                {
                  text: canhanBookings.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((canhanBookings / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
            ],
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
        },

        // PHẦN 3: TOP 10 PHÒNG ĐƯỢC ĐẶT NHIỀU NHẤT
        {
          text: 'III. TOP 10 PHÒNG ĐƯỢC ĐẶT NHIỀU NHẤT',
          style: 'sectionHeader',
          margin: [0, 15, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'STT', style: 'tableHeader' },
                { text: 'Mã phòng', style: 'tableHeader' },
                { text: 'Tên phòng', style: 'tableHeader' },
                { text: 'Loại', style: 'tableHeader' },
                { text: 'Tổng đặt', style: 'tableHeader' },
                { text: 'Thành công', style: 'tableHeader' },
                { text: 'Tỷ lệ', style: 'tableHeader' },
              ],
              ...Object.values(roomStats)
                .sort((a, b) => b.total - a.total)
                .slice(0, 10)
                .map((room, index) => [
                  {
                    text: (index + 1).toString(),
                    style: 'tableCell',
                    alignment: 'center',
                  },
                  { text: room.maPhong, style: 'tableCell' },
                  { text: room.tenPhong, style: 'tableCell' },
                  { text: room.loaiPhong, style: 'tableCell' },
                  {
                    text: room.total.toString(),
                    style: 'tableCell',
                    alignment: 'center',
                  },
                  {
                    text: (room.approved + room.checkedIn).toString(),
                    style: 'tableCell',
                    alignment: 'center',
                  },
                  {
                    text: `${
                      room.total > 0
                        ? Math.round(
                            ((room.approved + room.checkedIn) / room.total) *
                              100
                          )
                        : 0
                    }%`,
                    style: 'tableCell',
                    alignment: 'center',
                  },
                ]),
            ],
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
        },

        // PHẦN 4: THỐNG KÊ THEO TRẠNG THÁI
        {
          text: 'IV. PHÂN BỐ THEO TRẠNG THÁI',
          style: 'sectionHeader',
          margin: [0, 15, 0, 10],
          pageBreak: 'before',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              [
                { text: 'Trạng thái', style: 'tableHeader' },
                { text: 'Số lượng', style: 'tableHeader' },
                { text: 'Tỷ lệ', style: 'tableHeader' },
              ],
              [
                { text: 'Chờ duyệt', style: 'tableCell' },
                {
                  text: pendingCount.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((pendingCount / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
              [
                { text: 'Đã duyệt', style: 'tableCell' },
                {
                  text: approvedCount.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((approvedCount / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
              [
                { text: 'Đã nhận phòng', style: 'tableCell' },
                {
                  text: checkedInCount.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((checkedInCount / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
              [
                { text: 'Bị từ chối', style: 'tableCell' },
                {
                  text: deniedCount.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((deniedCount / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
              [
                { text: 'Không nhận phòng', style: 'tableCell' },
                {
                  text: noShowCount.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((noShowCount / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
              [
                { text: 'Đã hủy', style: 'tableCell' },
                {
                  text: canceledCount.toString(),
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `${
                    totalBookings > 0
                      ? Math.round((canceledCount / totalBookings) * 100)
                      : 0
                  }%`,
                  style: 'tableCell',
                  alignment: 'center',
                },
              ],
            ],
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
        },

        {
          text: `Xuất ngày: ${new Date().toLocaleString('vi-VN')}`,
          style: 'footer',
          alignment: 'right',
          margin: [0, 20, 0, 0],
        },
      ];

      const documentDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 40, 40, 40],
        content: content,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            color: '#2c3e50',
          },
          subtitle: {
            fontSize: 12,
            italics: true,
            color: '#666',
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#667eea',
          },
          summaryText: {
            fontSize: 11,
            margin: [0, 3, 0, 3],
          },
          tableHeader: {
            fontSize: 10,
            bold: true,
            color: 'white',
            alignment: 'center',
          },
          tableCell: {
            fontSize: 9,
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
        .download(`bao-cao-tong-hop-${new Date().getTime()}.pdf`);
    },

    exportExcel() {
      const wb = XLSX.utils.book_new();
      const exportData = this.getFilteredDataForExport();

      // Tạo subtitle
      let subtitle = '';
      if (this.exportOption === 'all') {
        subtitle = 'Tất cả dữ liệu';
      } else if (this.exportOption === 'display') {
        const periodTexts = {
          day: '7 ngày gần nhất',
          week: '8 tuần gần nhất',
          month: '12 tháng gần nhất',
          quarter: '4 quý gần nhất',
          year: '5 năm gần nhất',
          custom: `Từ ${new Date(this.customDateRange.from).toLocaleDateString(
            'vi-VN'
          )} đến ${new Date(this.customDateRange.to).toLocaleDateString(
            'vi-VN'
          )}`,
        };

        subtitle = `Dữ liệu đang hiển thị (${
          periodTexts[this.selectedPeriod]
        })`;

        if (this.selectedStatus) {
          const statusMap = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            denied: 'Bị từ chối',
            checked_in: 'Đã nhận phòng',
            no_show: 'Không nhận phòng',
            canceled: 'Đã hủy',
          };
          subtitle += ` - Trạng thái: ${statusMap[this.selectedStatus]}`;
        }

        if (this.selectedRoomType) {
          subtitle += ` - Loại phòng: ${
            this.selectedRoomType === 'Nhóm' ? 'Phòng nhóm' : 'Phòng cá nhân'
          }`;
        }
      } else {
        const fromDate = new Date(this.exportDateRange.from).toLocaleDateString(
          'vi-VN'
        );
        const toDate = new Date(this.exportDateRange.to).toLocaleDateString(
          'vi-VN'
        );
        subtitle = `Từ ${fromDate} đến ${toDate}`;
      }

      // ==================== SHEET 1: TỔNG QUAN ====================
      const totalBookings = exportData.length;
      const pendingCount = exportData.filter(
        (b) => b.TrangThai === 'pending' || b.TrangThai === 'waiting_members'
      ).length;
      const approvedCount = exportData.filter(
        (b) => b.TrangThai === 'approved'
      ).length;
      const deniedCount = exportData.filter(
        (b) => b.TrangThai === 'denied'
      ).length;
      const checkedInCount = exportData.filter(
        (b) => b.TrangThai === 'checked_in'
      ).length;
      const noShowCount = exportData.filter(
        (b) => b.TrangThai === 'no_show'
      ).length;
      const canceledCount = exportData.filter(
        (b) => b.TrangThai === 'canceled'
      ).length;

      const overviewData = [
        ['BÁO CÁO TỔNG HỢP THỐNG KÊ ĐẶT PHÒNG'],
        ['Khoảng thời gian:', subtitle],
        ['Xuất ngày:', new Date().toLocaleString('vi-VN')],
        [],
        ['I. THỐNG KÊ TỔNG QUAN'],
        ['Tổng số lượt đặt:', totalBookings],
        ['Chờ duyệt:', pendingCount],
        ['Đã duyệt:', approvedCount],
        ['Đã nhận phòng:', checkedInCount],
        ['Bị từ chối:', deniedCount],
        ['Không nhận phòng:', noShowCount],
        ['Đã hủy:', canceledCount],
        [
          'Tỷ lệ thành công:',
          `${
            totalBookings > 0
              ? Math.round(
                  ((approvedCount + checkedInCount) / totalBookings) * 100
                )
              : 0
          }%`,
        ],
        [],
        ['II. THỐNG KÊ THEO LOẠI PHÒNG'],
        ['Loại phòng', 'Số lượt đặt', 'Tỷ lệ'],
        [
          'Phòng nhóm',
          exportData.filter((b) => b.PhongHoc?.LoaiPhong === 'Nhóm').length,
          `${
            totalBookings > 0
              ? Math.round(
                  (exportData.filter((b) => b.PhongHoc?.LoaiPhong === 'Nhóm')
                    .length /
                    totalBookings) *
                    100
                )
              : 0
          }%`,
        ],
        [
          'Phòng cá nhân',
          exportData.filter((b) => b.PhongHoc?.LoaiPhong === 'Cá nhân').length,
          `${
            totalBookings > 0
              ? Math.round(
                  (exportData.filter((b) => b.PhongHoc?.LoaiPhong === 'Cá nhân')
                    .length /
                    totalBookings) *
                    100
                )
              : 0
          }%`,
        ],
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
      ws1['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

      // ==================== SHEET 2: THEO PHÒNG ====================
      const roomStats = {};
      exportData.forEach((item) => {
        const roomKey = item.PhongHoc?._id;
        if (roomKey) {
          if (!roomStats[roomKey]) {
            roomStats[roomKey] = {
              maPhong: item.PhongHoc?.MaPhong || 'N/A',
              tenPhong: item.PhongHoc?.TenPhong || 'N/A',
              loaiPhong: item.PhongHoc?.LoaiPhong || 'N/A',
              total: 0,
              pending: 0,
              approved: 0,
              denied: 0,
              checkedIn: 0,
              noShow: 0,
              canceled: 0,
            };
          }
          roomStats[roomKey].total++;
          if (
            item.TrangThai === 'pending' ||
            item.TrangThai === 'waiting_members'
          )
            roomStats[roomKey].pending++;
          if (item.TrangThai === 'approved') roomStats[roomKey].approved++;
          if (item.TrangThai === 'denied') roomStats[roomKey].denied++;
          if (item.TrangThai === 'checked_in') roomStats[roomKey].checkedIn++;
          if (item.TrangThai === 'no_show') roomStats[roomKey].noShow++;
          if (item.TrangThai === 'canceled') roomStats[roomKey].canceled++;
        }
      });

      const roomData = [
        ['THỐNG KÊ THEO PHÒNG HỌC'],
        ['Khoảng thời gian:', subtitle],
        [],
        [
          'STT',
          'Mã phòng',
          'Tên phòng',
          'Loại phòng',
          'Tổng đặt',
          'Chờ duyệt',
          'Đã duyệt',
          'Bị từ chối',
          'Đã nhận',
          'Không nhận',
          'Đã hủy',
          'Tỷ lệ thành công',
        ],
      ];

      let stt = 1;
      Object.values(roomStats)
        .sort((a, b) => b.total - a.total)
        .forEach((room) => {
          roomData.push([
            stt++,
            room.maPhong,
            room.tenPhong,
            room.loaiPhong,
            room.total,
            room.pending,
            room.approved,
            room.denied,
            room.checkedIn,
            room.noShow,
            room.canceled,
            `${
              room.total > 0
                ? Math.round(
                    ((room.approved + room.checkedIn) / room.total) * 100
                  )
                : 0
            }%`,
          ]);
        });

      const ws2 = XLSX.utils.aoa_to_sheet(roomData);
      ws2['!cols'] = [
        { wch: 5 },
        { wch: 12 },
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 10 },
        { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'Theo phòng học');

      // ==================== SHEET 3: THEO TRẠNG THÁI ====================
      const statusData = [
        ['THỐNG KÊ THEO TRẠNG THÁI'],
        ['Khoảng thời gian:', subtitle],
        [],
        ['Trạng thái', 'Số lượng', 'Tỷ lệ (%)'],
        [
          'Chờ duyệt',
          pendingCount,
          totalBookings > 0
            ? Math.round((pendingCount / totalBookings) * 100)
            : 0,
        ],
        [
          'Đã duyệt',
          approvedCount,
          totalBookings > 0
            ? Math.round((approvedCount / totalBookings) * 100)
            : 0,
        ],
        [
          'Đã nhận phòng',
          checkedInCount,
          totalBookings > 0
            ? Math.round((checkedInCount / totalBookings) * 100)
            : 0,
        ],
        [
          'Bị từ chối',
          deniedCount,
          totalBookings > 0
            ? Math.round((deniedCount / totalBookings) * 100)
            : 0,
        ],
        [
          'Không nhận phòng',
          noShowCount,
          totalBookings > 0
            ? Math.round((noShowCount / totalBookings) * 100)
            : 0,
        ],
        [
          'Đã hủy',
          canceledCount,
          totalBookings > 0
            ? Math.round((canceledCount / totalBookings) * 100)
            : 0,
        ],
      ];

      const ws3 = XLSX.utils.aoa_to_sheet(statusData);
      ws3['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Theo trạng thái');

      XLSX.writeFile(wb, `bao-cao-tong-hop-${new Date().getTime()}.xlsx`);
    },

    isItemInPeriod(itemDate, periodKey, period) {
      if (period === 'day') {
        const [day, month] = periodKey.split('/').map(Number);
        return itemDate.getDate() === day && itemDate.getMonth() + 1 === month;
      } else if (period === 'week') {
        const weekNum = parseInt(periodKey.match(/\d+/)[0]);
        return this.getWeekNumber(itemDate) === weekNum;
      } else if (period === 'month') {
        const [month, year] = periodKey.match(/\d+/g);
        return (
          itemDate.getMonth() + 1 === parseInt(month) &&
          itemDate.getFullYear() === parseInt(year)
        );
      } else if (period === 'quarter') {
        const match = periodKey.match(/Q(\d)\/(\d+)/);
        const quarter = Math.ceil((itemDate.getMonth() + 1) / 3);
        return (
          quarter === parseInt(match[1]) &&
          itemDate.getFullYear() === parseInt(match[2])
        );
      } else if (period === 'year') {
        return itemDate.getFullYear() === parseInt(periodKey);
      }
      return false;
    },

    handlePeriodChange() {
      if (this.selectedPeriod === 'custom') {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        this.customDateRange.to = today.toISOString().split('T')[0];
        this.customDateRange.from = oneMonthAgo.toISOString().split('T')[0];
      }
      this.updateChart();
    },

    parseCustomDate(dateStr, groupBy) {
      if (groupBy === 'day') {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
      } else if (groupBy === 'week') {
        const [day, month] = dateStr.split('/');
        return new Date(new Date().getFullYear(), month - 1, day);
      } else if (groupBy === 'month') {
        const [month, year] = dateStr.match(/\d+/g);
        return new Date(year, month - 1, 1);
      }
      return new Date(dateStr);
    },

    openExportModal() {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);

      this.exportDateRange.to = today.toISOString().split('T')[0];
      this.exportDateRange.from = oneMonthAgo.toISOString().split('T')[0];
      this.exportOption = 'all';
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

    getFilteredDataForExport() {
      let data = this.statisticData;

      if (this.exportOption === 'all') {
        return data;
      }

      // THÊM MỚI: Xử lý export dữ liệu đang hiển thị
      if (this.exportOption === 'display') {
        // Áp dụng các bộ lọc hiện tại
        if (this.selectedStatus) {
          data = data.filter((item) => item.TrangThai === this.selectedStatus);
        }
        if (this.selectedRoomType) {
          data = data.filter(
            (item) => item.PhongHoc?.LoaiPhong === this.selectedRoomType
          );
        }

        // Lọc theo khoảng thời gian hiện tại
        if (
          this.selectedPeriod === 'custom' &&
          this.customDateRange.from &&
          this.customDateRange.to
        ) {
          const fromDate = new Date(this.customDateRange.from);
          const toDate = new Date(this.customDateRange.to);
          toDate.setHours(23, 59, 59, 999);

          data = data.filter((item) => {
            const itemDate = new Date(item.NgayDat || item.createdAt);
            return itemDate >= fromDate && itemDate <= toDate;
          });
        } else {
          // Lọc theo period mặc định (day/week/month/quarter/year)
          const now = new Date();
          const limits = { day: 7, week: 8, month: 12, quarter: 4, year: 5 };
          const limit = limits[this.selectedPeriod];

          data = data.filter((item) => {
            const itemDate = new Date(item.NgayDat || item.createdAt);
            const daysDiff = Math.floor(
              (now - itemDate) / (1000 * 60 * 60 * 24)
            );

            if (this.selectedPeriod === 'day') {
              return daysDiff >= 0 && daysDiff < limit;
            } else if (this.selectedPeriod === 'week') {
              return Math.floor(daysDiff / 7) < limit;
            } else if (this.selectedPeriod === 'month') {
              const monthsDiff =
                (now.getFullYear() - itemDate.getFullYear()) * 12 +
                (now.getMonth() - itemDate.getMonth());
              return monthsDiff >= 0 && monthsDiff < limit;
            } else if (this.selectedPeriod === 'quarter') {
              const monthsDiff =
                (now.getFullYear() - itemDate.getFullYear()) * 12 +
                (now.getMonth() - itemDate.getMonth());
              return Math.floor(monthsDiff / 3) < limit;
            } else if (this.selectedPeriod === 'year') {
              return now.getFullYear() - itemDate.getFullYear() < limit;
            }
            return true;
          });
        }

        return data;
      }

      // Xử lý export theo custom date range
      const fromDate = new Date(this.exportDateRange.from);
      const toDate = new Date(this.exportDateRange.to);
      toDate.setHours(23, 59, 59, 999);

      return data.filter((item) => {
        const itemDate = new Date(item.NgayDat || item.createdAt);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    },

    groupDataByCustomRangeForTable(data) {
      if (!this.customDateRange.from || !this.customDateRange.to) {
        return [];
      }

      const fromDate = new Date(this.customDateRange.from);
      const toDate = new Date(this.customDateRange.to);
      const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

      let groupBy = 'day';

      if (diffDays > 365) {
        groupBy = 'month';
      } else if (diffDays > 90) {
        groupBy = 'week';
      } else if (diffDays > 30) {
        groupBy = 'day';
      }

      const grouped = {};

      data.forEach((item) => {
        const date = new Date(item.NgayDat || item.createdAt);

        if (date < fromDate || date > toDate) return;

        let key = '';

        if (groupBy === 'day') {
          key = this.formatDate(date, 'dd/MM/yyyy');
        } else if (groupBy === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${this.formatDate(weekStart, 'dd/MM')}`;
        } else if (groupBy === 'month') {
          key = `T${date.getMonth() + 1}/${date.getFullYear()}`;
        }

        if (!grouped[key]) {
          grouped[key] = {
            date: key,
            total: 0,
            pending: 0,
            approved: 0,
            denied: 0,
            checkedIn: 0,
            noShow: 0,
            canceled: 0,
          };
        }

        grouped[key].total++;
        if (
          item.TrangThai === 'pending' ||
          item.TrangThai === 'waiting_members'
        )
          grouped[key].pending++;
        if (item.TrangThai === 'approved') grouped[key].approved++;
        if (item.TrangThai === 'denied') grouped[key].denied++;
        if (item.TrangThai === 'checked_in') grouped[key].checkedIn++;
        if (item.TrangThai === 'no_show') grouped[key].noShow++;
        if (item.TrangThai === 'canceled') grouped[key].canceled++;
      });

      const result = Object.values(grouped).sort((a, b) => {
        const dateA = this.parseCustomDate(a.date, groupBy);
        const dateB = this.parseCustomDate(b.date, groupBy);
        return dateA - dateB;
      });

      return result;
    },

    groupDataByCustomRange(data) {
      if (!this.customDateRange.from || !this.customDateRange.to) {
        return [];
      }

      const fromDate = new Date(this.customDateRange.from);
      const toDate = new Date(this.customDateRange.to);
      const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

      let groupBy = 'day';
      let maxPoints = 10;

      if (diffDays > 365) {
        groupBy = 'month';
        maxPoints = 10;
      } else if (diffDays > 90) {
        groupBy = 'week';
        maxPoints = 10;
      } else if (diffDays > 30) {
        groupBy = 'day';
        maxPoints = 10;
      }

      const grouped = {};

      data.forEach((item) => {
        const date = new Date(item.NgayDat || item.createdAt);

        if (date < fromDate || date > toDate) return;

        let key = '';

        if (groupBy === 'day') {
          key = this.formatDate(date, 'dd/MM/yyyy');
        } else if (groupBy === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${this.formatDate(weekStart, 'dd/MM')}`;
        } else if (groupBy === 'month') {
          key = `T${date.getMonth() + 1}/${date.getFullYear()}`;
        }

        if (!grouped[key]) {
          grouped[key] = {
            date: key,
            total: 0,
            pending: 0,
            approved: 0,
            denied: 0,
            checkedIn: 0,
            noShow: 0,
            canceled: 0,
          };
        }

        grouped[key].total++;
        if (
          item.TrangThai === 'pending' ||
          item.TrangThai === 'waiting_members'
        )
          grouped[key].pending++;
        if (item.TrangThai === 'approved') grouped[key].approved++;
        if (item.TrangThai === 'denied') grouped[key].denied++;
        if (item.TrangThai === 'checked_in') grouped[key].checkedIn++;
        if (item.TrangThai === 'no_show') grouped[key].noShow++;
        if (item.TrangThai === 'canceled') grouped[key].canceled++;
      });

      let result = Object.values(grouped).sort((a, b) => {
        const dateA = this.parseCustomDate(a.date, groupBy);
        const dateB = this.parseCustomDate(b.date, groupBy);
        return dateA - dateB;
      });

      if (result.length > maxPoints) {
        const step = Math.floor(result.length / maxPoints);
        const sampled = [];
        for (let i = 0; i < result.length; i += step) {
          sampled.push(result[i]);
        }
        if (sampled[sampled.length - 1] !== result[result.length - 1]) {
          sampled.push(result[result.length - 1]);
        }
        result = sampled.slice(0, maxPoints);
      }

      return result;
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

.table {
  margin-bottom: 0;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  font-size: 1.5rem;
  padding: 1rem 0.75rem;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table tbody td {
  padding: 0.875rem 0.75rem;
  vertical-align: middle;
  font-size: 1.5rem;
}

.legend-color {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.status-legend {
  max-height: 250px;
  overflow-y: auto;
}

.status-legend::-webkit-scrollbar {
  width: 6px;
}

.status-legend::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.status-legend::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.status-legend::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.badge {
  padding: 0.4em 0.8em;
  font-weight: 500;
  font-size: 1.5rem;
}

.form-select {
  font-size: 1.3rem;
}

.form-select:focus,
.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-group .btn {
  flex: 1;
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

canvas {
  max-width: 100%;
  height: auto !important;
  width: 100% !important;
}

.card-body canvas {
  min-height: 400px;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 1rem;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .table {
    font-size: 0.85rem;
  }
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

.small {
  font-size: 0.9rem;
}
</style>
