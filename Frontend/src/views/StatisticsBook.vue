<template>
  <div class="admin-dashboard d-flex">
    <div class="main d-flex flex-column flex-grow-1 min-vh-100">
      <div class="content-wrapper flex-grow-1 p-4" style="background: #f5f7fa">
        <div class="container-fluid">
          <!-- Header Section -->
          <div class="page-header mb-4">
            <h2 class="fw-bold text-dark mb-2" style="font-size: 2.5rem">
              <i class="bi bi-book-half me-2"></i>Thống kê tổng hợp mượn sách
            </h2>
            <p>Theo dõi tình trạng mượn trả sách và phí phạt theo thời gian</p>
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

                <!-- Thêm phần Date Range Picker (hiện khi chọn "Tùy chỉnh") -->
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
                  <label class="form-label fw-semibold">Trạng thái mượn</label>
                  <select
                    v-model="selectedStatus"
                    class="form-select"
                    @change="updateChart"
                  >
                    <option value="">Tất cả</option>
                    <option value="approved">Đang mượn</option>
                    <option value="returned">Đã trả</option>
                    <option value="overdue">Quá hạn</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Tình trạng sách</label>
                  <select
                    v-model="selectedCondition"
                    class="form-select"
                    @change="updateChart"
                  >
                    <option value="">Tất cả</option>
                    <option value="Nguyên vẹn">Nguyên vẹn</option>
                    <option value="Hư sách">Hư sách</option>
                    <option value="Mất sách">Mất sách</option>
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
                      <p class="mb-1 text-white-50">Tổng lượt mượn</p>
                      <h3 class="fw-bold mb-0">{{ totalBorrows }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-journals"></i>
                    </div>
                  </div>
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small
                      ><i class="bi bi-calendar-check me-1"></i>Tất cả thời
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
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small>Đã thu: {{ formatMoney(paidFines) }}</small>
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
                      <h3 class="fw-bold mb-0">{{ currentlyBorrowing }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-book"></i>
                    </div>
                  </div>
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small
                      ><i class="bi bi-clock-history me-1"></i>Hiện tại</small
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
                      <p class="mb-1 text-white-50">Sách bị hỏng</p>
                      <h3 class="fw-bold mb-0">{{ damagedBooks }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                  </div>
                  <div class="mt-3 pt-2 border-top border-white-50">
                    <small>Mất: {{ lostBooks }} | Hư: {{ brokenBooks }}</small>
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
                  <h5 class="mb-0 fw-semibold" style="font-size: 1.8rem">
                    <i class="bi bi-graph-up text-primary me-2"></i>
                    Xu hướng mượn trả sách
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
                  <h5 class="mb-0 fw-semibold" style="font-size: 1.8rem">
                    <i class="bi bi-pie-chart text-success me-2"></i>
                    Phân bố tình trạng sách
                  </h5>
                </div>
                <div class="card-body">
                  <canvas ref="pieChart" height="200"></canvas>
                  <div class="status-legend mt-3">
                    <div
                      v-for="(item, index) in conditionDistribution"
                      :key="index"
                      class="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div class="d-flex align-items-center">
                        <span
                          class="legend-color me-2"
                          :style="{ backgroundColor: item.color }"
                        ></span>
                        <span class="">{{ item.label }}</span>
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

          <!-- Fee Chart -->
          <div class="row g-3 mb-4">
            <div class="col-12">
              <div class="card shadow-sm border-0">
                <div class="card-header bg-white border-bottom py-3">
                  <h5 class="mb-0 fw-semibold" style="font-size: 1.8rem">
                    <i class="bi bi-cash-stack text-warning me-2"></i>
                    Thống kê phí phạt
                  </h5>
                </div>
                <div class="card-body">
                  <canvas ref="feeChart"></canvas>
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
                      <th class="text-center">Tổng mượn</th>
                      <th class="text-center">Đang mượn</th>
                      <th class="text-center">Đã trả</th>
                      <th class="text-center">Quá hạn</th>
                      <th class="text-center">Nguyên vẹn</th>
                      <th class="text-center">Hư sách</th>
                      <th class="text-center">Mất sách</th>
                      <th class="text-center">Tỷ lệ trả đúng hạn</th>
                      <th class="text-center">Phí phạt</th>
                      <th class="text-center">Đã thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in detailDataFull" :key="index">
                      <td class="fw-semibold">{{ row.period }}</td>
                      <td class="text-center">
                        <span class="">{{ row.total }}</span>
                      </td>
                      <td class="text-center">{{ row.borrowing }}</td>
                      <td class="text-center">{{ row.returned }}</td>
                      <td class="text-center">
                        <span>{{ row.overdue }}</span>
                      </td>
                      <td class="text-center">{{ row.perfect }}</td>
                      <td class="text-center">{{ row.damaged }}</td>
                      <td class="text-center">{{ row.lost }}</td>
                      <td class="text-center">
                        <span class="text-success fw-semibold"
                          >{{ row.onTimeRate }}%</span
                        >
                      </td>
                      <td class="text-center">
                        <span class="text-danger fw-semibold">{{
                          formatMoney(row.totalFee)
                        }}</span>
                      </td>
                      <td class="text-center">
                        <span class="text-success fw-semibold">{{
                          formatMoney(row.paidFee)
                        }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Top Books & Category Demand -->
          <div class="row g-3 mt-4">
            <!-- Top Borrowed Books -->
            <!-- <div class="col-xl-8">
              <div class="card shadow-sm border-0">
                <div class="card-header bg-white border-bottom py-3">
                  <h5 class="mb-0 fw-semibold" style="font-size: 1.8rem">
                    <i class="bi bi-trophy text-warning me-2"></i>
                    Top 10 sách được mượn nhiều nhất
                  </h5>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover align-middle">
                      <thead class="table-light">
                        <tr>
                          <th style="width: 50px">#</th>
                          <th style="width: 80px">Ảnh</th>
                          <th>Tên sách</th>
                          <th>Mã sách</th>
                          <th>Tác giả</th>
                          <th class="text-center">Lượt mượn</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(book, index) in topBorrowedBooks"
                          :key="book.id"
                        >
                          <td>
                            <span>
                              {{ index + 1 }}
                            </span>
                          </td>
                          <td>
                            <img
                              :src="book.image"
                              :alt="book.tenSach"
                              class="img-thumbnail"
                              style="
                                width: 50px;
                                height: 70px;
                                object-fit: cover;
                              "
                            />
                          </td>
                          <td class="fw-semibold">{{ book.tenSach }}</td>
                          <td>{{ book.maSach }}</td>
                          <td class="">{{ book.tacGia }}</td>
                          <td class="text-center">
                            <span>{{ book.borrowCount }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div> -->

            <!-- Category Demand -->
            <!-- <div class="col-xl-4">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white border-bottom py-3">
                  <h5 class="mb-0 fw-semibold" style="font-size: 1.8rem">
                    <i class="bi bi-bar-chart-line text-info me-2"></i>
                    Nhu cầu tài liệu theo thể loại
                  </h5>
                </div>
                <div class="card-body">
                  <div class="category-list">
                    <div
                      v-for="(cat, index) in categoryDemand"
                      :key="index"
                      class="category-item mb-3"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center mb-1"
                      >
                        <span class="fw-semibold">{{ cat.name }}</span>
                        <span
                          >{{ cat.percentage }}% ({{ cat.count }} lượt)</span
                        >
                      </div>
                      <div class="progress" style="height: 25px">
                        <div
                          class="progress-bar"
                          :style="{
                            width: cat.percentage + '%',
                            background: `linear-gradient(135deg, 
                       ${getColorByIndex(index)}, 
                       ${getColorByIndex(index, true)})`,
                          }"
                          role="progressbar"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
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
import { bookService } from '../services/book/book.service';

export default {
  name: 'ThongKe',

  data() {
    return {
      selectedPeriod: 'month',
      selectedStatus: '',
      selectedCondition: '',
      chartInstance: null,
      pieChartInstance: null,
      feeChartInstance: null,
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

      // Lọc theo tình trạng sách
      if (this.selectedCondition) {
        filtered = filtered.filter(
          (item) => item.TinhTrangSach === this.selectedCondition
        );
      }

      return this.groupDataByPeriod(filtered, this.selectedPeriod);
    },

    totalBorrows() {
      // Chỉ tính approved, overdue, returned (không tính pending, processing, denied)
      return this.statisticData.filter((item) =>
        ['approved', 'overdue', 'returned'].includes(item.TrangThai)
      ).length;
    },

    totalFines() {
      return this.statisticData.reduce(
        (sum, item) => sum + (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
        0
      );
    },

    paidFines() {
      return this.statisticData
        .filter((item) => item.DaThanhToan)
        .reduce(
          (sum, item) => sum + (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
          0
        );
    },

    currentlyBorrowing() {
      // Đang mượn = approved + overdue
      return this.statisticData.filter(
        (item) => item.TrangThai === 'approved' || item.TrangThai === 'overdue'
      ).length;
    },

    damagedBooks() {
      return this.statisticData.filter(
        (item) =>
          item.TinhTrangSach === 'Hư sách' || item.TinhTrangSach === 'Mất sách'
      ).length;
    },

    lostBooks() {
      return this.statisticData.filter(
        (item) => item.TinhTrangSach === 'Mất sách'
      ).length;
    },

    brokenBooks() {
      return this.statisticData.filter(
        (item) => item.TinhTrangSach === 'Hư sách'
      ).length;
    },

    periodLabel() {
      const labels = {
        day: 'ngày',
        week: 'tuần',
        month: 'tháng',
        quarter: 'quý',
        year: 'năm',
      };
      return labels[this.selectedPeriod];
    },

    periodText() {
      const texts = {
        day: '7 ngày gần nhất',
        week: '8 tuần gần nhất',
        month: '12 tháng gần nhất',
        quarter: '4 quý gần nhất',
        year: '5 năm gần nhất',
      };
      return texts[this.selectedPeriod];
    },

    conditionDistribution() {
      const returned = this.statisticData.filter(
        (item) => item.TrangThai === 'returned'
      );
      const total = returned.length;

      const perfect = returned.filter(
        (item) => item.TinhTrangSach === 'Nguyên vẹn'
      ).length;
      const damaged = returned.filter(
        (item) => item.TinhTrangSach === 'Hư sách'
      ).length;
      const lost = returned.filter(
        (item) => item.TinhTrangSach === 'Mất sách'
      ).length;
      const noInfo = returned.filter((item) => !item.TinhTrangSach).length;

      return [
        {
          label: 'Nguyên vẹn',
          value: perfect,
          percent: total > 0 ? Math.round((perfect / total) * 100) : 0,
          color: '#4facfe',
        },
        {
          label: 'Hư sách',
          value: damaged,
          percent: total > 0 ? Math.round((damaged / total) * 100) : 0,
          color: '#feca57',
        },
        {
          label: 'Mất sách',
          value: lost,
          percent: total > 0 ? Math.round((lost / total) * 100) : 0,
          color: '#f5576c',
        },
        {
          label: 'Chưa xác định',
          value: noInfo,
          percent: total > 0 ? Math.round((noInfo / total) * 100) : 0,
          color: '#95a5a6',
        },
      ];
    },

    detailData() {
      return this.currentData.map((item) => ({
        period: item.date,
        total: item.total,
        borrowing: item.borrowing,
        returned: item.returned,
        overdue: item.overdue,
        perfect: item.perfect,
        damaged: item.damaged,
        lost: item.lost,
        totalFee: item.totalFee,
        paidFee: item.paidFee,
        onTimeRate:
          item.returned > 0
            ? Math.round((item.onTime / item.returned) * 100)
            : 0,
      }));
    },

    topBorrowedBooks() {
      const bookStats = {};

      // Chỉ tính các lần mượn thực sự (approved, overdue, returned)
      this.statisticData
        .filter((item) =>
          ['approved', 'overdue', 'returned'].includes(item.TrangThai)
        )
        .forEach((item) => {
          const bookId = item.MaSach?._id;
          if (bookId) {
            if (!bookStats[bookId]) {
              bookStats[bookId] = {
                id: bookId,
                maSach: item.MaSach?.MaSach || 'N/A',
                tenSach: item.MaSach?.TenSach || 'N/A',
                tacGia: item.MaSach?.TacGia || 'N/A',
                image: item.MaSach?.Image || '',
                borrowCount: 0,
                currentlyBorrowed: 0,
              };
            }
            bookStats[bookId].borrowCount++;
            if (item.TrangThai === 'approved' || item.TrangThai === 'overdue') {
              bookStats[bookId].currentlyBorrowed++;
            }
          }
        });

      return Object.values(bookStats)
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 10);
    },

    categoryDemand() {
      const categoryStats = {};

      // Lấy dữ liệu đã lọc theo bộ lọc hiện tại
      let filtered = this.statisticData.filter((item) =>
        ['approved', 'overdue', 'returned'].includes(item.TrangThai)
      );

      // Lọc theo trạng thái
      if (this.selectedStatus) {
        filtered = filtered.filter(
          (item) => item.TrangThai === this.selectedStatus
        );
      }

      // Lọc theo tình trạng sách
      if (this.selectedCondition) {
        filtered = filtered.filter(
          (item) => item.TinhTrangSach === this.selectedCondition
        );
      }

      // Tính toán thống kê theo thể loại
      filtered.forEach((item) => {
        let category;

        // Kiểm tra nếu là Giáo trình
        if (item.MaSach?.LoaiSach === 'GiaoTrinh') {
          category = 'Giáo trình';
        } else if (item.MaSach?.MaTheLoai?.TenTheLoai) {
          category = item.MaSach.MaTheLoai.TenTheLoai;
        } else {
          category = 'Chưa phân loại';
        }

        if (!categoryStats[category]) {
          categoryStats[category] = {
            name: category,
            count: 0,
            percentage: 0,
          };
        }
        categoryStats[category].count++;
      });

      const total = filtered.length;
      Object.values(categoryStats).forEach((cat) => {
        cat.percentage =
          total > 0 ? ((cat.count / total) * 100).toFixed(2) : '0.00';
      });

      // Trả về TẤT CẢ thể loại, sắp xếp theo số lượng giảm dần
      return Object.values(categoryStats).sort((a, b) => b.count - a.count);
    },

    detailDataFull() {
      if (this.selectedPeriod !== 'custom') {
        return this.detailData;
      }

      // Với custom period, trả về dữ liệu đầy đủ không bị sampling
      let filtered = this.statisticData.filter((item) =>
        ['approved', 'overdue', 'returned'].includes(item.TrangThai)
      );

      if (this.selectedStatus) {
        filtered = filtered.filter(
          (item) => item.TrangThai === this.selectedStatus
        );
      }

      if (this.selectedCondition) {
        filtered = filtered.filter(
          (item) => item.TinhTrangSach === this.selectedCondition
        );
      }

      // Gọi hàm nhóm nhưng không áp dụng sampling
      const fullData = this.groupDataByCustomRangeForTable(filtered);

      return fullData.map((item) => ({
        period: item.date,
        total: item.total,
        borrowing: item.borrowing,
        returned: item.returned,
        overdue: item.overdue,
        perfect: item.perfect,
        damaged: item.damaged,
        lost: item.lost,
        totalFee: item.totalFee,
        paidFee: item.paidFee,
        onTimeRate:
          item.returned > 0
            ? Math.round((item.onTime / item.returned) * 100)
            : 0,
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
    if (this.feeChartInstance) this.feeChartInstance.destroy();
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    async loadData() {
      try {
        this.statisticData = await bookService.getStatisticBook();
        console.log('✅ Đã tải dữ liệu:', this.statisticData.length, 'bản ghi');
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        alert('Không thể tải dữ liệu thống kê');
      }
    },

    initCharts() {
      this.createMainChart();
      this.createPieChart();
      this.createFeeChart();
    },

    createMainChart() {
      const ctx = this.$refs.mainChart.getContext('2d');
      if (this.chartInstance) this.chartInstance.destroy();

      const data = this.currentData;
      const labels = data.map((item) => item.date);
      const totals = data.map((item) => item.total);
      const borrowing = data.map((item) => item.borrowing);
      const returned = data.map((item) => item.returned);
      const overdue = data.map((item) => item.overdue);

      this.chartInstance = this.drawLineChart(ctx, labels, [
        {
          label: 'Tổng mượn',
          data: totals,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Đang mượn',
          data: borrowing,
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Đã trả',
          data: returned,
          borderColor: '#00f2fe',
          backgroundColor: 'rgba(0, 242, 254, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Quá hạn',
          data: overdue,
          borderColor: '#f5576c',
          backgroundColor: 'rgba(245, 87, 108, 0.1)',
          tension: 0.4,
        },
      ]);
    },

    createPieChart() {
      const ctx = this.$refs.pieChart.getContext('2d');
      if (this.pieChartInstance) this.pieChartInstance.destroy();

      const data = this.conditionDistribution;
      this.pieChartInstance = this.drawPieChart(
        ctx,
        data.map((item) => item.label),
        data.map((item) => item.value),
        data.map((item) => item.color)
      );
    },

    createFeeChart() {
      const ctx = this.$refs.feeChart.getContext('2d');
      if (this.feeChartInstance) this.feeChartInstance.destroy();

      const data = this.currentData;
      const labels = data.map((item) => item.date);
      const totalFees = data.map((item) => item.totalFee / 1000);
      const paidFees = data.map((item) => item.paidFee / 1000);

      this.feeChartInstance = this.drawLineChart(ctx, labels, [
        {
          label: 'Tổng phí (nghìn đồng)',
          data: totalFees,
          borderColor: '#f5576c',
          backgroundColor: 'rgba(245, 87, 108, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Đã thu (nghìn đồng)',
          data: paidFees,
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          tension: 0.4,
        },
      ]);
    },

    drawLineChart(ctx, labels, datasets) {
      const maxValue = Math.max(...datasets.flatMap((ds) => ds.data));
      const yMax = Math.ceil(maxValue * 1.2);
      const yStep = Math.ceil(yMax / 5);

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
            y: padding.top + chartHeight - (value / yMax) * chartHeight,
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
      this.createFeeChart();
    },

    handleResize() {
      this.createMainChart();
      this.createPieChart();
      this.createFeeChart();
    },

    formatMoney(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    groupDataByPeriod(data, period) {
      if (period === 'custom') {
        return this.groupDataByCustomRange(data);
      }

      const now = new Date();
      const grouped = {};

      data.forEach((item) => {
        // Chỉ tính các lần mượn thực sự
        if (!['approved', 'overdue', 'returned'].includes(item.TrangThai)) {
          return;
        }

        const date = new Date(item.NgayMuon || item.createdAt);
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
            borrowing: 0,
            returned: 0,
            overdue: 0,
            perfect: 0,
            damaged: 0,
            lost: 0,
            totalFee: 0,
            paidFee: 0,
            onTime: 0,
          };
        }

        grouped[key].total++;

        // Đang mượn = approved + overdue
        if (item.TrangThai === 'approved') grouped[key].borrowing++;
        if (item.TrangThai === 'overdue') {
          grouped[key].borrowing++;
          grouped[key].overdue++;
        }
        if (item.TrangThai === 'returned') {
          grouped[key].returned++;

          // Kiểm tra trả đúng hạn hay muộn
          if (item.NgayGhiNhanTra) {
            const returnDate = new Date(item.NgayGhiNhanTra);
            const dueDate = new Date(item.NgayTra);
            if (returnDate <= dueDate) {
              grouped[key].onTime++;
            }
          }
        }

        // Tình trạng sách
        if (item.TinhTrangSach === 'Nguyên vẹn') grouped[key].perfect++;
        if (item.TinhTrangSach === 'Hư sách') grouped[key].damaged++;
        if (item.TinhTrangSach === 'Mất sách') grouped[key].lost++;

        // Phí
        grouped[key].totalFee +=
          (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0);
        if (item.DaThanhToan) {
          grouped[key].paidFee +=
            (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0);
        }
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
      // Lấy dữ liệu đã lọc
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
            approved: 'Đang mượn',
            returned: 'Đã trả',
            overdue: 'Quá hạn',
          };
          subtitle += ` - Trạng thái: ${statusMap[this.selectedStatus]}`;
        }

        if (this.selectedCondition) {
          subtitle += ` - Tình trạng: ${this.selectedCondition}`;
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

      // Tính toán các chỉ số tổng hợp
      const totalBorrows = exportData.length;
      const currentlyBorrowing = exportData.filter(
        (item) => item.TrangThai === 'approved' || item.TrangThai === 'overdue'
      ).length;
      const returned = exportData.filter(
        (item) => item.TrangThai === 'returned'
      ).length;
      const overdue = exportData.filter(
        (item) => item.TrangThai === 'overdue'
      ).length;

      const totalFines = exportData.reduce(
        (sum, item) => sum + (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
        0
      );
      const paidFines = exportData
        .filter((item) => item.DaThanhToan)
        .reduce(
          (sum, item) => sum + (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
          0
        );

      const damagedBooks = exportData.filter(
        (item) =>
          item.TinhTrangSach === 'Hư sách' || item.TinhTrangSach === 'Mất sách'
      ).length;
      const lostBooks = exportData.filter(
        (item) => item.TinhTrangSach === 'Mất sách'
      ).length;
      const brokenBooks = exportData.filter(
        (item) => item.TinhTrangSach === 'Hư sách'
      ).length;

      const content = [
        {
          text: 'BÁO CÁO THỐNG KÊ MƯỢN SÁCH TỔNG HỢP',
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

        // PHẦN 1: TỔNG QUAN
        {
          text: 'I. TỔNG QUAN',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10],
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: `Tổng lượt mượn: ${totalBorrows}`,
                  style: 'summary',
                  margin: [0, 3],
                },
                {
                  text: `Đang mượn: ${currentlyBorrowing}`,
                  style: 'summary',
                  margin: [0, 3],
                },
                {
                  text: `Đã trả: ${returned}`,
                  style: 'summary',
                  margin: [0, 3],
                },
                {
                  text: `Quá hạn: ${overdue}`,
                  style: 'summary',
                  margin: [0, 3],
                },
              ],
            },
            {
              width: '50%',
              stack: [
                {
                  text: `Tổng phí phạt: ${totalFines.toLocaleString('vi-VN')}đ`,
                  style: 'summary',
                  margin: [0, 3],
                },
                {
                  text: `Đã thu: ${paidFines.toLocaleString('vi-VN')}đ`,
                  style: 'summary',
                  margin: [0, 3],
                },
                {
                  text: `Sách bị hỏng: ${damagedBooks} (Mất: ${lostBooks}, Hư: ${brokenBooks})`,
                  style: 'summary',
                  margin: [0, 3],
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // PHẦN 2: THỐNG KÊ THEO THỜI GIAN
        {
          text: 'II. THỐNG KÊ THEO THỜI GIAN',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
        },
      ];

      // Bảng thống kê theo thời gian
      const timeTableBody = [
        [
          { text: 'Thời gian', style: 'tableHeader' },
          { text: 'Tổng\nmượn', style: 'tableHeader' },
          { text: 'Đang\nmượn', style: 'tableHeader' },
          { text: 'Đã trả', style: 'tableHeader' },
          { text: 'Quá hạn', style: 'tableHeader' },
          { text: 'Nguyên\nvẹn', style: 'tableHeader' },
          { text: 'Hư sách', style: 'tableHeader' },
          { text: 'Mất sách', style: 'tableHeader' },
          { text: 'Tỷ lệ trả\nđúng hạn', style: 'tableHeader' },
          { text: 'Phí phạt', style: 'tableHeader' },
          { text: 'Đã thu', style: 'tableHeader' },
        ],
      ];

      this.detailDataFull.forEach((row) => {
        timeTableBody.push([
          { text: row.period, style: 'tableCell' },
          {
            text: row.total.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: row.borrowing.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: row.returned.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: row.overdue.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: row.perfect.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: row.damaged.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: row.lost.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: `${row.onTimeRate}%`,
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: `${row.totalFee.toLocaleString('vi-VN')}đ`,
            style: 'tableCell',
            alignment: 'right',
          },
          {
            text: `${row.paidFee.toLocaleString('vi-VN')}đ`,
            style: 'tableCell',
            alignment: 'right',
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
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
          ],
          body: timeTableBody,
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

      // PHẦN 3: PHÂN TÍCH TÌNH TRẠNG SÁCH
      content.push({
        text: 'III. PHÂN TÍCH TÌNH TRẠNG SÁCH',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10],
        pageBreak: 'before',
      });

      const conditionTableBody = [
        [
          { text: 'Tình trạng', style: 'tableHeader' },
          { text: 'Số lượng', style: 'tableHeader' },
          { text: 'Tỷ lệ %', style: 'tableHeader' },
        ],
      ];

      this.conditionDistribution.forEach((item) => {
        conditionTableBody.push([
          { text: item.label, style: 'tableCell' },
          {
            text: item.value.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          { text: `${item.percent}%`, style: 'tableCell', alignment: 'center' },
        ]);
      });

      content.push({
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: conditionTableBody,
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

      // PHẦN 4: TOP SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT
      if (this.topBorrowedBooks && this.topBorrowedBooks.length > 0) {
        content.push({
          text: 'IV. TOP 10 SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
        });

        const topBooksTableBody = [
          [
            { text: '#', style: 'tableHeader' },
            { text: 'Mã sách', style: 'tableHeader' },
            { text: 'Tên sách', style: 'tableHeader' },
            { text: 'Tác giả', style: 'tableHeader' },
            { text: 'Lượt mượn', style: 'tableHeader' },
          ],
        ];

        this.topBorrowedBooks.forEach((book, index) => {
          topBooksTableBody.push([
            {
              text: (index + 1).toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            { text: book.maSach, style: 'tableCell' },
            { text: book.tenSach, style: 'tableCell' },
            { text: book.tacGia, style: 'tableCell' },
            {
              text: book.borrowCount.toString(),
              style: 'tableCell',
              alignment: 'center',
            },
          ]);
        });

        content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*', 'auto'],
            body: topBooksTableBody,
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

      // PHẦN 5: THỐNG KÊ THEO THỂ LOẠI
      if (this.categoryDemand && this.categoryDemand.length > 0) {
        content.push({
          text: 'V. THỐNG KÊ THEO THỂ LOẠI',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
          pageBreak: 'before',
        });

        const categoryTableBody = [
          [
            { text: 'STT', style: 'tableHeader' },
            { text: 'Thể loại', style: 'tableHeader' },
            { text: 'Số lượt mượn', style: 'tableHeader' },
            { text: 'Tỷ lệ %', style: 'tableHeader' },
          ],
        ];

        this.categoryDemand.forEach((cat, index) => {
          categoryTableBody.push([
            {
              text: (index + 1).toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            { text: cat.name, style: 'tableCell' },
            {
              text: cat.count.toString(),
              style: 'tableCell',
              alignment: 'center',
            },
            {
              text: `${cat.percentage}%`,
              style: 'tableCell',
              alignment: 'center',
            },
          ]);
        });

        content.push({
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: categoryTableBody,
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
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#667eea',
          },
          summary: {
            fontSize: 11,
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
        .download(`bao-cao-thong-ke-tong-hop-${new Date().getTime()}.pdf`);
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
            approved: 'Đang mượn',
            returned: 'Đã trả',
            overdue: 'Quá hạn',
          };
          subtitle += ` - Trạng thái: ${statusMap[this.selectedStatus]}`;
        }

        if (this.selectedCondition) {
          subtitle += ` - Tình trạng: ${this.selectedCondition}`;
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

      // Tính toán các chỉ số
      const totalBorrows = exportData.length;
      const currentlyBorrowing = exportData.filter(
        (item) => item.TrangThai === 'approved' || item.TrangThai === 'overdue'
      ).length;
      const returned = exportData.filter(
        (item) => item.TrangThai === 'returned'
      ).length;
      const overdue = exportData.filter(
        (item) => item.TrangThai === 'overdue'
      ).length;

      const totalFines = exportData.reduce(
        (sum, item) => sum + (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
        0
      );
      const paidFines = exportData
        .filter((item) => item.DaThanhToan)
        .reduce(
          (sum, item) => sum + (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0),
          0
        );

      const damagedBooks = exportData.filter(
        (item) =>
          item.TinhTrangSach === 'Hư sách' || item.TinhTrangSach === 'Mất sách'
      ).length;
      const lostBooks = exportData.filter(
        (item) => item.TinhTrangSach === 'Mất sách'
      ).length;
      const brokenBooks = exportData.filter(
        (item) => item.TinhTrangSach === 'Hư sách'
      ).length;

      // ==================== SHEET 1: TỔNG QUAN ====================
      const overviewData = [
        ['BÁO CÁO THỐNG KÊ MƯỢN SÁCH TỔNG HỢP'],
        [],
        ['Khoảng thời gian:', subtitle],
        ['Xuất ngày:', new Date().toLocaleString('vi-VN')],
        [],
        ['CHỈ SỐ TỔNG HỢP'],
        ['Tổng lượt mượn:', totalBorrows],
        ['Đang mượn:', currentlyBorrowing],
        ['Đã trả:', returned],
        ['Quá hạn:', overdue],
        [],
        ['Tổng phí phạt:', totalFines],
        ['Đã thu:', paidFines],
        ['Chưa thu:', totalFines - paidFines],
        [],
        ['Sách bị hỏng:', damagedBooks],
        ['Sách mất:', lostBooks],
        ['Sách hư:', brokenBooks],
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
      ws1['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

      // ==================== SHEET 2: THỐNG KÊ THEO THỜI GIAN ====================
      const timeData = [
        ['THỐNG KÊ THEO THỜI GIAN'],
        ['Khoảng thời gian:', subtitle],
        [],
        [
          'Thời gian',
          'Tổng mượn',
          'Đang mượn',
          'Đã trả',
          'Quá hạn',
          'Nguyên vẹn',
          'Hư sách',
          'Mất sách',
          'Tỷ lệ trả đúng hạn (%)',
          'Phí phạt',
          'Đã thu',
        ],
      ];

      this.detailDataFull.forEach((row) => {
        timeData.push([
          row.period,
          row.total,
          row.borrowing,
          row.returned,
          row.overdue,
          row.perfect,
          row.damaged,
          row.lost,
          row.onTimeRate,
          row.totalFee,
          row.paidFee,
        ]);
      });

      const ws2 = XLSX.utils.aoa_to_sheet(timeData);
      ws2['!cols'] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'Theo thời gian');

      // ==================== SHEET 3: TÌNH TRẠNG SÁCH ====================
      const conditionData = [
        ['PHÂN TÍCH TÌNH TRẠNG SÁCH'],
        ['Khoảng thời gian:', subtitle],
        [],
        ['Tình trạng', 'Số lượng', 'Tỷ lệ %'],
      ];

      this.conditionDistribution.forEach((item) => {
        conditionData.push([item.label, item.value, item.percent]);
      });

      const ws3 = XLSX.utils.aoa_to_sheet(conditionData);
      ws3['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Tình trạng sách');

      // ==================== SHEET 4: TOP SÁCH ====================
      if (this.topBorrowedBooks && this.topBorrowedBooks.length > 0) {
        const topBooksData = [
          ['TOP 10 SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT'],
          ['Khoảng thời gian:', subtitle],
          [],
          ['#', 'Mã sách', 'Tên sách', 'Tác giả', 'Lượt mượn'],
        ];

        this.topBorrowedBooks.forEach((book, index) => {
          topBooksData.push([
            index + 1,
            book.maSach,
            book.tenSach,
            book.tacGia,
            book.borrowCount,
          ]);
        });

        const ws4 = XLSX.utils.aoa_to_sheet(topBooksData);
        ws4['!cols'] = [
          { wch: 5 },
          { wch: 12 },
          { wch: 40 },
          { wch: 25 },
          { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, ws4, 'Top sách');
      }

      // ==================== SHEET 5: THEO THỂ LOẠI ====================
      if (this.categoryDemand && this.categoryDemand.length > 0) {
        const categoryData = [
          ['THỐNG KÊ THEO THỂ LOẠI'],
          ['Khoảng thời gian:', subtitle],
          [],
          ['STT', 'Thể loại', 'Số lượt mượn', 'Tỷ lệ %'],
        ];

        this.categoryDemand.forEach((cat, index) => {
          categoryData.push([index + 1, cat.name, cat.count, cat.percentage]);
        });

        const ws5 = XLSX.utils.aoa_to_sheet(categoryData);
        ws5['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws5, 'Theo thể loại');
      }

      XLSX.writeFile(
        wb,
        `bao-cao-thong-ke-tong-hop-${new Date().getTime()}.xlsx`
      );
    },

    getColorByIndex(index, isSecondary = false) {
      const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#fa709a', '#fee140'],
        ['#30cfd0', '#330867'],
        ['#6a85b6', '#bac8e0'],
        ['#ff758c', '#ff7eb3'],
        ['#f7971e', '#ffd200'],
      ];
      const colorPair = colors[index % colors.length];
      return isSecondary ? colorPair[1] : colorPair[0];
    },

    handlePeriodChange() {
      if (this.selectedPeriod === 'custom') {
        // Set default dates
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
      // Set default dates for export
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
      // Chỉ export các lần mượn thực sự
      let data = this.statisticData.filter((item) =>
        ['approved', 'overdue', 'returned'].includes(item.TrangThai)
      );

      if (this.exportOption === 'all') {
        return data;
      }

      // THÊM MỚI: Xử lý export dữ liệu đang hiển thị
      if (this.exportOption === 'display') {
        // Áp dụng các bộ lọc hiện tại
        if (this.selectedStatus) {
          data = data.filter((item) => item.TrangThai === this.selectedStatus);
        }
        if (this.selectedCondition) {
          data = data.filter(
            (item) => item.TinhTrangSach === this.selectedCondition
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
            const itemDate = new Date(item.NgayMuon || item.createdAt);
            return itemDate >= fromDate && itemDate <= toDate;
          });
        } else {
          // Lọc theo period mặc định (day/week/month/quarter/year)
          const now = new Date();
          const limits = { day: 7, week: 8, month: 12, quarter: 4, year: 5 };
          const limit = limits[this.selectedPeriod];

          data = data.filter((item) => {
            const itemDate = new Date(item.NgayMuon || item.createdAt);
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
        const itemDate = new Date(item.NgayMuon || item.createdAt);
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

      // Quyết định đơn vị hiển thị giống như biểu đồ
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
        const date = new Date(item.NgayMuon || item.createdAt);

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
            borrowing: 0,
            returned: 0,
            overdue: 0,
            perfect: 0,
            damaged: 0,
            lost: 0,
            totalFee: 0,
            paidFee: 0,
            onTime: 0,
          };
        }

        grouped[key].total++;

        if (item.TrangThai === 'approved') grouped[key].borrowing++;
        if (item.TrangThai === 'overdue') {
          grouped[key].borrowing++;
          grouped[key].overdue++;
        }
        if (item.TrangThai === 'returned') {
          grouped[key].returned++;

          if (item.NgayGhiNhanTra) {
            const returnDate = new Date(item.NgayGhiNhanTra);
            const dueDate = new Date(item.NgayTra);
            if (returnDate <= dueDate) {
              grouped[key].onTime++;
            }
          }
        }

        if (item.TinhTrangSach === 'Nguyên vẹn') grouped[key].perfect++;
        if (item.TinhTrangSach === 'Hư sách') grouped[key].damaged++;
        if (item.TinhTrangSach === 'Mất sách') grouped[key].lost++;

        grouped[key].totalFee +=
          (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0);
        if (item.DaThanhToan) {
          grouped[key].paidFee +=
            (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0);
        }
      });

      // Trả về TẤT CẢ dữ liệu, không sampling
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

      // Quyết định đơn vị hiển thị dựa trên khoảng thời gian
      let groupBy = 'day';
      let maxPoints = 10; // Số điểm tối đa trên biểu đồ

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
        const date = new Date(item.NgayMuon || item.createdAt);

        // Lọc theo khoảng thời gian
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
            borrowing: 0,
            returned: 0,
            overdue: 0,
            perfect: 0,
            damaged: 0,
            lost: 0,
            totalFee: 0,
            paidFee: 0,
            onTime: 0,
          };
        }

        grouped[key].total++;

        if (item.TrangThai === 'approved') grouped[key].borrowing++;
        if (item.TrangThai === 'overdue') {
          grouped[key].borrowing++;
          grouped[key].overdue++;
        }
        if (item.TrangThai === 'returned') {
          grouped[key].returned++;

          if (item.NgayGhiNhanTra) {
            const returnDate = new Date(item.NgayGhiNhanTra);
            const dueDate = new Date(item.NgayTra);
            if (returnDate <= dueDate) {
              grouped[key].onTime++;
            }
          }
        }

        if (item.TinhTrangSach === 'Nguyên vẹn') grouped[key].perfect++;
        if (item.TinhTrangSach === 'Hư sách') grouped[key].damaged++;
        if (item.TinhTrangSach === 'Mất sách') grouped[key].lost++;

        grouped[key].totalFee +=
          (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0);
        if (item.DaThanhToan) {
          grouped[key].paidFee +=
            (item.PhiBoiThuong || 0) + (item.PhiQuaHan || 0);
        }
      });

      let result = Object.values(grouped).sort((a, b) => {
        const dateA = this.parseCustomDate(a.date, groupBy);
        const dateB = this.parseCustomDate(b.date, groupBy);
        return dateA - dateB;
      });

      // Nếu có quá nhiều điểm, lấy mẫu để hiển thị
      if (result.length > maxPoints) {
        const step = Math.floor(result.length / maxPoints);
        const sampled = [];
        for (let i = 0; i < result.length; i += step) {
          sampled.push(result[i]);
        }
        // Đảm bảo luôn có điểm cuối
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

.category-list {
}

.category-item:last-child {
  margin-bottom: 0 !important;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
}

.img-thumbnail {
  border-radius: 8px;
}

/* Thêm vào phần <style scoped> */
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
