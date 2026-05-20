<template>
  <div class="admin-dashboard d-flex">
    <div class="main d-flex flex-column flex-grow-1 min-vh-100">
      <div class="content-wrapper flex-grow-1 p-4" style="background: #f5f7fa">
        <div class="container-fluid">
          <!-- Header Section -->
          <div class="page-header mb-4">
            <h2 class="fw-bold text-dark mb-2" style="font-size: 2.5rem">
              <i class="bi bi-graph-up-arrow me-2"></i>Thống kê nhu cầu tài liệu
              sách
            </h2>
            <p>
              Phân tích xu hướng và nhu cầu mượn sách theo thể loại và từng đầu
              sách
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
                  <label class="form-label fw-semibold">Loại sách</label>
                  <select
                    v-model="selectedBookType"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">Tất cả</option>
                    <option value="GiaoTrinh">Giáo trình</option>
                    <option value="Sach">Sách</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Tìm kiếm</label>
                  <input
                    type="text"
                    v-model="searchKeyword"
                    class="form-control"
                    placeholder="Tên sách, mã sách, tác giả..."
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
                      <p class="mb-1 text-white-50">Tổng đầu sách</p>
                      <h3 class="fw-bold mb-0">
                        {{ topBorrowedBooks.length }}
                      </h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-book-half"></i>
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
                      <p class="mb-1 text-white-50">Tổng lượt mượn</p>
                      <h3 class="fw-bold mb-0">{{ totalBorrows }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-journals"></i>
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
                      <p class="mb-1 text-white-50">Số thể loại</p>
                      <h3 class="fw-bold mb-0">{{ categoryDemand.length }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-collection"></i>
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
                      <p class="mb-1 text-white-50">Trung bình/đầu sách</p>
                      <h3 class="fw-bold mb-0">{{ averageBorrowsPerBook }}</h3>
                    </div>
                    <div class="stat-icon">
                      <i class="bi bi-bar-chart"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Books & Category Demand -->
          <div class="row g-3 mb-4">
            <!-- Top Borrowed Books Table -->
            <div class="col-xl-8">
              <div class="card shadow-sm border-0">
                <div class="card-header bg-white border-bottom py-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <h5 class="mb-0 fw-semibold" style="font-size: 1.8rem">
                      <i class="bi bi-trophy text-warning me-2"></i>
                      Top sách được mượn nhiều nhất
                    </h5>
                    <span style="font-size: 1.3rem">
                      Hiển thị {{ startIndexBooks + 1 }}-{{ endIndexBooks }} /
                      {{ topBorrowedBooks.length }}
                    </span>
                  </div>
                </div>
                <div class="card-body p-0">
                  <div class="table-wrapper">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th style="width: 60px">Hạng</th>
                          <th style="width: 80px">Ảnh</th>
                          <th>Tên sách</th>
                          <th>Mã sách</th>
                          <th>Tác giả</th>
                          <th>Thể loại</th>
                          <th class="text-center">Lượt mượn</th>
                          <th class="text-center">Đang mượn</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(book, index) in paginatedBooks"
                          :key="book.id"
                        >
                          <td>
                            <span
                              class="rank-badge"
                              :class="getRankClass(startIndexBooks + index)"
                            >
                              {{ startIndexBooks + index + 1 }}
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
                          <td>{{ book.tacGia }}</td>
                          <td>{{ book.theLoai }}</td>
                          <td class="text-center fw-semibold">
                            {{ book.borrowCount }}
                          </td>
                          <td class="text-center">
                            {{ book.currentlyBorrowed }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Pagination for Books -->
                  <div class="pagination-wrapper">
                    <div class="pagination-info">
                      <label>Hiển thị:</label>
                      <select
                        v-model="itemsPerPageBooks"
                        @change="changePageBooks(1)"
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
                        :disabled="currentPageBooks === 1"
                        @click="changePageBooks(currentPageBooks - 1)"
                      >
                        <i class="fa-solid fa-arrow-left"></i>
                      </button>
                      <button
                        v-for="page in visiblePagesBooks"
                        :key="page"
                        class="pagination-btn"
                        :class="{ active: currentPageBooks === page }"
                        @click="changePageBooks(page)"
                      >
                        {{ page }}
                      </button>
                      <button
                        class="pagination-btn"
                        :disabled="currentPageBooks === totalPagesBooks"
                        @click="changePageBooks(currentPageBooks + 1)"
                      >
                        <i class="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category Demand -->
            <div class="col-xl-4">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white border-bottom py-3">
                  <h5 class="mb-0 fw-semibold" style="font-size: 1.8rem">
                    <i class="bi bi-bar-chart-line text-info me-2"></i>
                    Nhu cầu theo thể loại
                  </h5>
                </div>
                <div class="card-body">
                  <div
                    class="category-list"
                    style="max-height: 200vh; overflow-y: auto"
                  >
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
                            background: `linear-gradient(135deg, ${getColorByIndex(
                              index
                            )}, ${getColorByIndex(index, true)})`,
                          }"
                          role="progressbar"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Detail Table -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-semibold" style="font-size: 1.7rem">
                  <i class="bi bi-table text-info me-2"></i>
                  Chi tiết nhu cầu theo thể loại
                </h5>
                <span style="font-size: 1.3rem">
                  Hiển thị {{ startIndexCategories + 1 }}-{{
                    endIndexCategories
                  }}
                  / {{ categoryDemand.length }}
                </span>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Thể loại</th>
                      <th class="text-center">Số đầu sách</th>
                      <th class="text-center">Tổng lượt mượn</th>
                      <th class="text-center">Tỷ lệ (%)</th>
                      <th class="text-center">TB mượn/sách</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(cat, index) in paginatedCategories"
                      :key="index"
                    >
                      <td>{{ startIndexCategories + index + 1 }}</td>
                      <td class="fw-semibold">{{ cat.name }}</td>
                      <td class="text-center">{{ cat.bookCount }}</td>
                      <td class="text-center fw-semibold">{{ cat.count }}</td>
                      <td class="text-center">{{ cat.percentage }}%</td>
                      <td class="text-center">{{ cat.avgBorrowsPerBook }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination for Categories -->
              <div class="pagination-wrapper">
                <div class="pagination-info">
                  <label>Hiển thị:</label>
                  <select
                    v-model="itemsPerPageCategories"
                    @change="changePageCategories(1)"
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
                    :disabled="currentPageCategories === 1"
                    @click="changePageCategories(currentPageCategories - 1)"
                  >
                    <i class="fa-solid fa-arrow-left"></i>
                  </button>
                  <button
                    v-for="page in visiblePagesCategories"
                    :key="page"
                    class="pagination-btn"
                    :class="{ active: currentPageCategories === page }"
                    @click="changePageCategories(page)"
                  >
                    {{ page }}
                  </button>
                  <button
                    class="pagination-btn"
                    :disabled="currentPageCategories === totalPagesCategories"
                    @click="changePageCategories(currentPageCategories + 1)"
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
            <i class="bi bi-download me-2"></i>Xuất báo cáo nhu cầu tài liệu
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
  name: 'StatisticsBookDocument',

  data() {
    return {
      statisticData: [],
      filteredData: [],
      selectedPeriod: 'all',
      selectedBookType: '',
      searchKeyword: '',
      customDateRange: {
        from: '',
        to: '',
      },

      // Pagination for Books
      currentPageBooks: 1,
      itemsPerPageBooks: 10,

      // Pagination for Categories
      currentPageCategories: 1,
      itemsPerPageCategories: 10,

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
    topBorrowedBooks() {
      const bookStats = {};

      this.filteredData
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
                theLoai: this.getBookCategory(item.MaSach),
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

      return Object.values(bookStats).sort(
        (a, b) => b.borrowCount - a.borrowCount
      );
    },

    categoryDemand() {
      const categoryStats = {};
      const bookCountByCategory = {};

      let filtered = this.filteredData.filter((item) =>
        ['approved', 'overdue', 'returned'].includes(item.TrangThai)
      );

      // Đếm số lượt mượn và số đầu sách theo thể loại
      filtered.forEach((item) => {
        let category;

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
            bookCount: 0,
            avgBorrowsPerBook: 0,
            bookIds: new Set(),
          };
        }
        categoryStats[category].count++;

        // Đếm số đầu sách khác nhau
        if (item.MaSach?._id) {
          categoryStats[category].bookIds.add(item.MaSach._id);
        }
      });

      const total = filtered.length;

      // Tính toán các chỉ số
      Object.values(categoryStats).forEach((cat) => {
        cat.percentage =
          total > 0 ? ((cat.count / total) * 100).toFixed(2) : '0.00';
        cat.bookCount = cat.bookIds.size;
        cat.avgBorrowsPerBook =
          cat.bookCount > 0 ? (cat.count / cat.bookCount).toFixed(1) : '0.0';
        delete cat.bookIds; // Xóa Set để không xuất hiện trong export
      });

      return Object.values(categoryStats).sort((a, b) => b.count - a.count);
    },

    totalBorrows() {
      return this.filteredData.filter((item) =>
        ['approved', 'overdue', 'returned'].includes(item.TrangThai)
      ).length;
    },

    averageBorrowsPerBook() {
      if (this.topBorrowedBooks.length === 0) return 0;
      const total = this.topBorrowedBooks.reduce(
        (sum, book) => sum + book.borrowCount,
        0
      );
      return (total / this.topBorrowedBooks.length).toFixed(1);
    },

    // Pagination for Books
    totalPagesBooks() {
      return Math.ceil(this.topBorrowedBooks.length / this.itemsPerPageBooks);
    },
    startIndexBooks() {
      return (this.currentPageBooks - 1) * this.itemsPerPageBooks;
    },
    endIndexBooks() {
      return Math.min(
        this.startIndexBooks + this.itemsPerPageBooks,
        this.topBorrowedBooks.length
      );
    },
    paginatedBooks() {
      return this.topBorrowedBooks.slice(
        this.startIndexBooks,
        this.endIndexBooks
      );
    },
    visiblePagesBooks() {
      return this.getVisiblePages(this.currentPageBooks, this.totalPagesBooks);
    },

    // Pagination for Categories
    totalPagesCategories() {
      return Math.ceil(
        this.categoryDemand.length / this.itemsPerPageCategories
      );
    },
    startIndexCategories() {
      return (this.currentPageCategories - 1) * this.itemsPerPageCategories;
    },
    endIndexCategories() {
      return Math.min(
        this.startIndexCategories + this.itemsPerPageCategories,
        this.categoryDemand.length
      );
    },
    paginatedCategories() {
      return this.categoryDemand.slice(
        this.startIndexCategories,
        this.endIndexCategories
      );
    },
    visiblePagesCategories() {
      return this.getVisiblePages(
        this.currentPageCategories,
        this.totalPagesCategories
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

    getBookCategory(book) {
      if (!book) return 'N/A';
      if (book.LoaiSach === 'GiaoTrinh') return 'Giáo trình';
      return book.MaTheLoai?.TenTheLoai || 'Chưa phân loại';
    },

    applyFilters() {
      let data = [...this.statisticData];

      // Filter by period
      if (this.selectedPeriod !== 'all') {
        data = this.filterByPeriod(data);
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
          const author = (item.MaSach?.TacGia || '').toLowerCase();

          return (
            bookName.includes(keyword) ||
            bookCode.includes(keyword) ||
            author.includes(keyword)
          );
        });
      }

      this.filteredData = data;
      this.currentPageBooks = 1;
      this.currentPageCategories = 1;
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

    getVisiblePages(currentPage, totalPages) {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },

    changePageBooks(page) {
      if (page < 1 || page > this.totalPagesBooks) return;
      this.currentPageBooks = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    changePageCategories(page) {
      if (page < 1 || page > this.totalPagesCategories) return;
      this.currentPageCategories = page;
    },

    getRankClass(index) {
      if (index === 0) return 'rank-gold';
      if (index === 1) return 'rank-silver';
      if (index === 2) return 'rank-bronze';
      return '';
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
        return {
          books: this.topBorrowedBooks,
          categories: this.categoryDemand,
          title: 'Dữ liệu đang hiển thị',
        };
      } else if (this.exportOption === 'all') {
        // Tính toán lại với tất cả dữ liệu
        const allBooks = this.calculateBooksStats(this.statisticData);
        const allCategories = this.calculateCategoryStats(this.statisticData);
        return {
          books: allBooks,
          categories: allCategories,
          title: 'Tất cả dữ liệu',
        };
      } else {
        // custom
        const fromDate = new Date(this.exportDateRange.from);
        const toDate = new Date(this.exportDateRange.to);
        toDate.setHours(23, 59, 59, 999);

        const customData = this.statisticData.filter((item) => {
          const itemDate = new Date(item.NgayMuon || item.createdAt);
          return itemDate >= fromDate && itemDate <= toDate;
        });

        const customBooks = this.calculateBooksStats(customData);
        const customCategories = this.calculateCategoryStats(customData);

        return {
          books: customBooks,
          categories: customCategories,
          title: `Từ ${fromDate.toLocaleDateString(
            'vi-VN'
          )} đến ${toDate.toLocaleDateString('vi-VN')}`,
        };
      }
    },

    calculateBooksStats(data) {
      const bookStats = {};

      data
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
                theLoai: this.getBookCategory(item.MaSach),
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

      return Object.values(bookStats).sort(
        (a, b) => b.borrowCount - a.borrowCount
      );
    },

    calculateCategoryStats(data) {
      const categoryStats = {};

      const filtered = data.filter((item) =>
        ['approved', 'overdue', 'returned'].includes(item.TrangThai)
      );

      filtered.forEach((item) => {
        let category;

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
            bookCount: 0,
            avgBorrowsPerBook: 0,
            bookIds: new Set(),
          };
        }
        categoryStats[category].count++;

        if (item.MaSach?._id) {
          categoryStats[category].bookIds.add(item.MaSach._id);
        }
      });

      const total = filtered.length;

      Object.values(categoryStats).forEach((cat) => {
        cat.percentage =
          total > 0 ? ((cat.count / total) * 100).toFixed(2) : '0.00';
        cat.bookCount = cat.bookIds.size;
        cat.avgBorrowsPerBook =
          cat.bookCount > 0 ? (cat.count / cat.bookCount).toFixed(1) : '0.0';
        delete cat.bookIds;
      });

      return Object.values(categoryStats).sort((a, b) => b.count - a.count);
    },

    exportPDF() {
      const exportData = this.getExportData();

      const content = [
        {
          text: 'BÁO CÁO THỐNG KÊ NHU CẦU TÀI LIỆU SÁCH',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: exportData.title,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
      ];

      // Phần 1: Top sách được mượn nhiều nhất
      content.push({
        text: 'TOP SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
      });

      const bookTableBody = [
        [
          { text: 'Hạng', style: 'tableHeader' },
          { text: 'Mã sách', style: 'tableHeader' },
          { text: 'Tên sách', style: 'tableHeader' },
          { text: 'Tác giả', style: 'tableHeader' },
          { text: 'Thể loại', style: 'tableHeader' },
          { text: 'Lượt mượn', style: 'tableHeader' },
          { text: 'Đang mượn', style: 'tableHeader' },
        ],
      ];

      exportData.books.slice(0, 20).forEach((book, index) => {
        bookTableBody.push([
          {
            text: (index + 1).toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          { text: book.maSach, style: 'tableCell' },
          { text: book.tenSach, style: 'tableCell' },
          { text: book.tacGia, style: 'tableCell' },
          { text: book.theLoai, style: 'tableCell' },
          {
            text: book.borrowCount.toString(),
            style: 'tableCellBold',
            alignment: 'center',
          },
          {
            text: book.currentlyBorrowed.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
        ]);
      });

      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: bookTableBody,
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

      // Phần 2: Nhu cầu theo thể loại
      content.push({
        text: 'NHU CẦU TÀI LIỆU THEO THỂ LOẠI',
        style: 'sectionHeader',
        pageBreak: 'before',
        margin: [0, 0, 0, 10],
      });

      const categoryTableBody = [
        [
          { text: 'STT', style: 'tableHeader' },
          { text: 'Thể loại', style: 'tableHeader' },
          { text: 'Số đầu sách', style: 'tableHeader' },
          { text: 'Tổng lượt mượn', style: 'tableHeader' },
          { text: 'Tỷ lệ (%)', style: 'tableHeader' },
          { text: 'TB mượn/sách', style: 'tableHeader' },
        ],
      ];

      exportData.categories.forEach((cat, index) => {
        categoryTableBody.push([
          {
            text: (index + 1).toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          { text: cat.name, style: 'tableCellBold' },
          {
            text: cat.bookCount.toString(),
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: cat.count.toString(),
            style: 'tableCellBold',
            alignment: 'center',
          },
          {
            text: cat.percentage + '%',
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: cat.avgBorrowsPerBook,
            style: 'tableCell',
            alignment: 'center',
          },
        ]);
      });

      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
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
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#667eea',
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
        .download(`bao-cao-nhu-cau-tai-lieu-${new Date().getTime()}.pdf`);
    },

    exportExcel() {
      const wb = XLSX.utils.book_new();
      const exportData = this.getExportData();

      // Sheet 1: Top sách
      const booksData = [
        ['BÁO CÁO THỐNG KÊ NHU CẦU TÀI LIỆU SÁCH'],
        [],
        ['Khoảng dữ liệu:', exportData.title],
        ['Xuất ngày:', new Date().toLocaleString('vi-VN')],
        [],
        ['TOP SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT'],
        [],
        [
          'Hạng',
          'Mã sách',
          'Tên sách',
          'Tác giả',
          'Thể loại',
          'Lượt mượn',
          'Đang mượn',
        ],
      ];

      exportData.books.forEach((book, index) => {
        booksData.push([
          index + 1,
          book.maSach,
          book.tenSach,
          book.tacGia,
          book.theLoai,
          book.borrowCount,
          book.currentlyBorrowed,
        ]);
      });

      const ws1 = XLSX.utils.aoa_to_sheet(booksData);
      ws1['!cols'] = [
        { wch: 8 },
        { wch: 12 },
        { wch: 40 },
        { wch: 25 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, ws1, 'Top sách');

      // Sheet 2: Thể loại
      const categoriesData = [
        ['NHU CẦU TÀI LIỆU THEO THỂ LOẠI'],
        [],
        [
          'STT',
          'Thể loại',
          'Số đầu sách',
          'Tổng lượt mượn',
          'Tỷ lệ (%)',
          'TB mượn/sách',
        ],
      ];

      exportData.categories.forEach((cat, index) => {
        categoriesData.push([
          index + 1,
          cat.name,
          cat.bookCount,
          cat.count,
          cat.percentage,
          cat.avgBorrowsPerBook,
        ]);
      });

      const ws2 = XLSX.utils.aoa_to_sheet(categoriesData);
      ws2['!cols'] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 12 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'Theo thể loại');

      XLSX.writeFile(
        wb,
        `bao-cao-nhu-cau-tai-lieu-${new Date().getTime()}.xlsx`
      );
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

.img-thumbnail {
  border-radius: 8px;
}

.rank-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.4rem;
  background-color: #e9ecef;
  color: #495057;
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #d4a574 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

/* Category Styles */
.category-list {
  padding: 10px 0;
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
