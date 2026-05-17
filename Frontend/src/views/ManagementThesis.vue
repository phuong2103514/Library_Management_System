<template>
  <div class="library-card-management">
    <div class="management-util">
      <div class="management-util__search">
        <div class="wwr">
          <div class="search-box">
            <input
              type="text"
              :placeholder="
                currentTab === 'danhsach' ? 'Tìm kiếm' : 'Tìm theo tên đợt...'
              "
              class="search-input"
              v-model="searchKeyword"
            />
            <button class="search-button-card-library">
              <i class="fas fa-search"></i>
            </button>
          </div>

          <input
            v-if="currentTab === 'danhsach'"
            type="date"
            class="search-date ml-2"
            v-model="selectedDate"
          />
        </div>

        <!-- ✅ Filter dùng chung cho cả 2 tab -->
        <div class="management-util__filters mt-3">
          <!-- Đợt nộp - ẨN khi ở tab quanlydot -->
          <select
            v-if="currentTab === 'danhsach'"
            class="status-select"
            v-model="selectedDotNop"
          >
            <option value="">Tất cả đợt nộp</option>
            <option v-for="dot in dotNopList" :key="dot._id" :value="dot._id">
              {{ dot.TenDot }}
            </option>
          </select>

          <!-- Kỳ học - HIỂN THỊ cho cả 2 tab -->
          <select class="status-select ml-2" v-model="selectedKyHoc">
            <option value="">Tất cả kỳ học</option>
            <option v-for="ky in kyHocList" :key="ky._id" :value="ky._id">
              {{ ky.TenKyHoc }}
            </option>
          </select>

          <!-- Năm học - HIỂN THỊ cho cả 2 tab -->
          <select class="status-select ml-2" v-model="selectedNamHoc">
            <option value="">Tất cả năm học</option>
            <option v-for="nam in namHocList" :key="nam._id" :value="nam._id">
              {{ nam.TenNamHoc }}
            </option>
          </select>

          <!-- Trạng thái - CHỈ HIỂN THỊ ở tab tương ứng -->
          <select class="status-select ml-2" v-model="selectedStatus">
            <option value="all">
              {{
                currentTab === 'danhsach'
                  ? 'Tất cả trạng thái'
                  : 'Tất cả trạng thái'
              }}
            </option>
            <template v-if="currentTab === 'danhsach'">
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Từ chối">Từ chối</option>
            </template>
            <template v-else>
              <option value="Chưa mở">Chưa mở</option>
              <option value="Đang mở">Đang mở</option>
              <option value="Đã đóng">Đã đóng</option>
            </template>
          </select>

          <!-- Nút Reset -->
          <button class="thesis__reset-btn ml-2" @click="resetFilters">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="borrow-book__tabs">
      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'danhsach' }"
        @click="changeTab('danhsach')"
      >
        Danh Sách Luận Văn
      </div>
      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'quanlydot' }"
        @click="changeTab('quanlydot')"
      >
        Quản Lý Đợt Nộp
      </div>
    </div>

    <!-- Bảng Luận Văn -->
    <table
      v-if="currentTab === 'danhsach'"
      class="management-table mt-4 table w-100"
    >
      <thead>
        <tr>
          <th class="management-table__header">Mã Sinh Viên</th>
          <th class="management-table__header">Họ Tên</th>
          <th class="management-table__header">Tên Đề Tài</th>
          <!-- Thêm -->
          <th class="management-table__header">Ngày Yêu Cầu</th>
          <th class="management-table__header">Ngày Duyệt</th>
          <th class="management-table__header">Trạng Thái</th>
          <th class="management-table__header">Thao Tác</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in paginatedThesisList"
          :key="item._id"
          @click="handleRowClick(item)"
        >
          <td class="management-table__content">
            {{ item.MaDocGia.SinhVien.MaSinhVien }}
          </td>
          <td
            class="management-table__content management-table__content-ellipsis"
          >
            {{ item.MaDocGia.HoLot }} {{ item.MaDocGia.Ten }}
          </td>
          <td
            class="management-table__content management-table__content-ellipsis"
          >
            {{ item.TieuDeTai }}
          </td>
          <td class="management-table__content">
            {{ formatDate(item.createdAt) }}
          </td>
          <td class="management-table__content">
            {{ formatDate(item.NgayNop) }}
          </td>
          <td class="management-table__content">
            <div
              class="status-badge"
              :class="{
                'status-badge--pending': item.TrangThai === 'Chờ duyệt',
                'status-badge--approved': item.TrangThai === 'Đã duyệt',
                'status-badge--denied': item.TrangThai === 'Từ chối',
              }"
            >
              {{ item.TrangThai }}
            </div>
          </td>
          <td class="management-table__content">
            <div v-if="item.TrangThai === 'Chờ duyệt'">
              <button
                class="action-btn action-btn--approve"
                @click.stop="approveThesis(item._id)"
              >
                Duyệt
              </button>
              <button
                class="action-btn action-btn--deny"
                @click.stop="denyThesis(item._id)"
              >
                Từ chối
              </button>
            </div>
            <div v-else class="text-muted">Đã xử lý</div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div
      class="management-pagination"
      v-if="currentTab === 'danhsach' && paginatedThesisList.length > 0"
    >
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(1)">«</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage - 1)"
            >‹</a
          >
        </li>
        <li class="page-item active">
          <a class="page-link" href="#" @click.prevent>{{ currentPage }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage + 1)"
            >›</a
          >
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(totalPages)"
            >»</a
          >
        </li>
      </ul>
    </div>

    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showModal"
        tabindex="-1"
        @click="showModal = false"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết luận văn</h5>
              <button
                type="button"
                class="btn-close"
                @click="showModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body__details">
                <div class="modal-body__image">
                  <img
                    :src="selectedItem?.Image || '/image/avatar_comment.png'"
                    alt="Avatar"
                  />
                </div>
                <div class="modal-body__info">
                  <p>
                    <strong>Mã sinh viên:</strong>
                    {{ selectedItem?.MaDocGia?.SinhVien?.MaSinhVien }}
                  </p>
                  <p>
                    <strong>Họ tên:</strong>
                    {{ selectedItem?.MaDocGia?.HoLot }}
                    {{ selectedItem?.MaDocGia?.Ten }}
                  </p>
                  <p>
                    <strong>Ngành học:</strong>
                    {{
                      selectedItem?.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh ||
                      'Chưa cập nhật'
                    }}
                  </p>
                  <p>
                    <strong>Khoa:</strong>
                    {{
                      selectedItem?.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa
                        ?.TenKhoa || 'Chưa cập nhật'
                    }}
                  </p>
                  <p>
                    <strong>Tiêu đề luận văn:</strong>
                    {{ selectedItem?.TieuDeTai }}
                  </p>
                  <p>
                    <strong>Bậc đào tạo:</strong> {{ selectedItem?.BacDaoTao }}
                  </p>
                  <p>
                    <strong>Năm bảo vệ:</strong> {{ selectedItem?.NamBaoVe }}
                  </p>
                  <p>
                    <strong>Giáo viên hướng dẫn:</strong>
                    {{ selectedItem?.GiaoVienHuongDan }}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {{ selectedItem?.TrangThai }}
                  </p>
                  <p>
                    <strong>Ngày yêu cầu:</strong>
                    {{ formatDate(selectedItem?.createdAt) }}
                  </p>
                  <p>
                    <strong>Ngày duyệt:</strong>
                    {{ formatDate(selectedItem?.NgayNop) }}
                  </p>
                  <p>
                    <strong>File Luận Văn:</strong>
                    <button
                      v-if="selectedItem?.Pdf"
                      class="btn btn-link btn-view-pdf"
                      @click="openPdf"
                    >
                      Xem file
                    </button>
                    <span v-else>Chưa có</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Tab Quản lý đợt nộp -->
    <div v-if="currentTab === 'quanlydot'" class="dot-nop-management">
      <div class="dot-nop-header">
        <button class="btn-create-dot" @click="openCreateDotModal">
          <i class="fas fa-plus"></i> Tạo đợt nộp mới
        </button>
      </div>

      <table class="management-table mt-4 table w-100">
        <thead>
          <tr>
            <th class="management-table__header">Tên đợt</th>
            <th class="management-table__header">Kỳ học</th>
            <th class="management-table__header">Năm học</th>
            <th class="management-table__header">Chỉ tiêu</th>
            <th class="management-table__header">Thời gian mở</th>
            <th class="management-table__header">Thời gian đóng</th>
            <th class="management-table__header">Trạng thái</th>
            <th class="management-table__header">Đã nộp</th>
            <th class="management-table__header">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dot in filteredDotNopListWithCount" :key="dot._id">
            <td class="management-table__content">{{ dot.TenDot }}</td>
            <td class="management-table__content">{{ dot.KyHoc?.TenKyHoc }}</td>
            <td class="management-table__content">
              {{ dot.NamHoc?.TenNamHoc }}
            </td>
            <td class="management-table__content" style="text-align: center">
              {{ dot.SoLuongPhaiNop }}
            </td>
            <td class="management-table__content">
              {{ formatDate(dot.ThoiGianMoNop) }}
            </td>
            <td class="management-table__content">
              {{ formatDate(dot.ThoiGianDongNop) }}
            </td>
            <td class="management-table__content">
              <div
                class="status-badge"
                :class="{
                  'status-badge--approved': dot.TrangThai === 'Đang mở',
                  'status-badge--pending': dot.TrangThai === 'Chưa mở',
                  'status-badge--denied': dot.TrangThai === 'Đã đóng',
                }"
              >
                {{ dot.TrangThai }}
              </div>
            </td>
            <td class="management-table__content" style="text-align: center">
              <div class="submission-count">
                <i class="fas fa-file-alt"></i>
                {{ dot.soLuongDaNop || 0 }}
              </div>
            </td>
            <td class="management-table__content">
              <button
                class="action-btn action-btn--approve"
                @click="openEditDotModal(dot)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="action-btn action-btn--deny"
                @click="deleteDot(dot._id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Tạo/Sửa đợt nộp -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showDotModal"
        tabindex="-1"
        @click="showDotModal = false"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editingDot ? 'Chỉnh sửa đợt nộp' : 'Tạo đợt nộp mới' }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showDotModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên đợt:</label>
                <input
                  type="text"
                  v-model="dotForm.TenDot"
                  class="form-control"
                  placeholder="Ví dụ: Đợt nộp luận văn K20"
                />
              </div>

              <div class="form-group">
                <label>Kỳ học:</label>
                <div class="input-with-button">
                  <select v-model="dotForm.KyHoc" class="form-control">
                    <option value="">-- Chọn kỳ học --</option>
                    <option
                      v-for="ky in kyHocList"
                      :key="ky._id"
                      :value="ky._id"
                    >
                      {{ ky.TenKyHoc }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn-add-inline"
                    @click="showAddKyHocModal = true"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Năm học:</label>
                <div class="input-with-button">
                  <select v-model="dotForm.NamHoc" class="form-control">
                    <option value="">-- Chọn năm học --</option>
                    <option
                      v-for="nam in namHocList"
                      :key="nam._id"
                      :value="nam._id"
                    >
                      {{ nam.TenNamHoc }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn-add-inline"
                    @click="showAddNamHocModal = true"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Thời gian mở nộp:</label>
                <input
                  type="datetime-local"
                  v-model="dotForm.ThoiGianMoNop"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Thời gian đóng nộp:</label>
                <input
                  type="datetime-local"
                  v-model="dotForm.ThoiGianDongNop"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Số lượng phải nộp:</label>
                <input
                  type="number"
                  v-model.number="dotForm.SoLuongPhaiNop"
                  class="form-control"
                  min="1"
                  placeholder="Nhập số lượng luận văn phải nộp"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showDotModal = false">
                Hủy
              </button>
              <button class="btn btn-primary" @click="saveDot">
                {{ editingDot ? 'Cập nhật' : 'Tạo mới' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Thêm Kỳ Học -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showAddKyHocModal"
        @click="showAddKyHocModal = false"
      >
        <div class="modal-dialog modal-sm" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Thêm Kỳ Học Mới</h5>
              <button
                type="button"
                class="btn-close"
                @click="showAddKyHocModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên kỳ học:</label>
                <input
                  type="text"
                  v-model="newKyHoc"
                  class="form-control"
                  placeholder="Nhập tên kỳ học (VD: Kỳ 1, Kỳ 2, Hè)"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="btn btn-secondary"
                @click="showAddKyHocModal = false"
              >
                Hủy
              </button>
              <button class="btn btn-primary" @click="addKyHoc">Thêm</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Thêm Năm Học -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showAddNamHocModal"
        @click="showAddNamHocModal = false"
      >
        <div class="modal-dialog modal-sm" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Thêm Năm Học Mới</h5>
              <button
                type="button"
                class="btn-close"
                @click="showAddNamHocModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Năm học (VD: 2023-2024):</label>
                <input
                  type="text"
                  v-model="newNamHoc"
                  class="form-control"
                  placeholder="2023-2024"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="btn btn-secondary"
                @click="showAddNamHocModal = false"
              >
                Hủy
              </button>
              <button class="btn btn-primary" @click="addNamHoc">Thêm</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';

export default {
  name: 'ManagementThesis',
  data() {
    return {
      thesisList: [],
      currentPage: 1,
      pageSize: 6,
      searchKeyword: '',
      selectedDate: '',
      selectedStatus: 'all',
      showModal: false,
      selectedItem: null,

      // ✅ THÊM các biến mới cho tab quản lý đợt
      currentTab: this.$route.query.tab || 'danhsach',
      dotNopList: [],
      kyHocList: [],
      namHocList: [],
      showDotModal: false,
      editingDot: null,
      dotForm: {
        TenDot: '',
        KyHoc: '',
        NamHoc: '',
        ThoiGianMoNop: '',
        ThoiGianDongNop: '',
        SoLuongPhaiNop: 1,
      },

      // ✅ THÊM các filter mới cho danh sách luận văn
      selectedDotNop: '',
      selectedKyHoc: '',
      selectedNamHoc: '',

      showAddKyHocModal: false,
      showAddNamHocModal: false,
      newKyHoc: '',
      newNamHoc: '',
    };
  },

  async mounted() {
    const response = await bookService.getAllThesis();
    this.thesisList = response;

    await this.loadDotNopData();
    await this.loadKyHocList();
    await this.loadNamHocList();
  },

  methods: {
    handleRowClick(item) {
      this.selectedItem = item;
      this.showModal = true;
    },

    formatDate(dateStr) {
      if (!dateStr) return '--';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    formatDateToYMD(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    async approveThesis(id) {
      try {
        const response = await bookService.approveThesis({ thesisId: id }); // gửi id lên backend
        if (response) {
          // Cập nhật trạng thái trên giao diện
          const index = this.thesisList.findIndex((item) => item._id === id);
          if (index !== -1) {
            this.thesisList[index].TrangThai = 'Đã duyệt';
            this.thesisList[index].NgayNop = new Date(); // nếu backend có trả NgayNop thì dùng response.NgayNop
          }
          alert('Duyệt thành công');
        }
      } catch (error) {
        console.error('Lỗi khi duyệt:', error);
        alert('Duyệt thất bại');
      }
    },

    async denyThesis(id) {
      try {
        const response = await bookService.rejectThesis({ thesisId: id });
        if (response) {
          // cập nhật lại trạng thái trong danh sách
          const index = this.thesisList.findIndex((item) => item._id === id);
          if (index !== -1) {
            this.thesisList[index].TrangThai = 'Từ chối';
          }
          alert('Từ chối thành công');
        }
      } catch (error) {
        console.error('Lỗi khi từ chối:', error);
        alert('Từ chối thất bại');
      }
    },

    openPdf() {
      if (this.selectedItem?.Pdf) {
        window.open(this.selectedItem.Pdf, '_blank');
      } else {
        alert('Chưa có file luận văn');
      }
    },

    async loadDotNopData() {
      try {
        this.dotNopList = await bookService.getAllDotNop();
      } catch (error) {
        console.error('Lỗi khi tải đợt nộp:', error);
      }
    },

    async loadKyHocList() {
      try {
        this.kyHocList = await bookService.getAllKyHoc();
      } catch (error) {
        console.error('Lỗi khi tải kỳ học:', error);
      }
    },

    async loadNamHocList() {
      try {
        this.namHocList = await bookService.getAllNamHoc();
      } catch (error) {
        console.error('Lỗi khi tải năm học:', error);
      }
    },

    // ✅ THÊM: Mở modal tạo đợt mới
    openCreateDotModal() {
      this.editingDot = null;
      this.dotForm = {
        TenDot: '',
        KyHoc: '',
        NamHoc: '',
        ThoiGianMoNop: '',
        ThoiGianDongNop: '',
        SoLuongPhaiNop: 1,
      };
      this.showDotModal = true;
    },

    // ✅ THÊM: Mở modal chỉnh sửa
    openEditDotModal(dot) {
      this.editingDot = dot;
      this.dotForm = {
        TenDot: dot.TenDot,
        KyHoc: dot.KyHoc?._id || '',
        NamHoc: dot.NamHoc?._id || '',
        ThoiGianMoNop: this.formatDateTimeLocal(dot.ThoiGianMoNop),
        ThoiGianDongNop: this.formatDateTimeLocal(dot.ThoiGianDongNop),
        SoLuongPhaiNop: dot.SoLuongPhaiNop || 1,
      };
      this.showDotModal = true;
    },

    // ✅ THÊM: Lưu đợt nộp
    async saveDot() {
      try {
        if (
          !this.dotForm.TenDot ||
          !this.dotForm.KyHoc ||
          !this.dotForm.NamHoc ||
          !this.dotForm.ThoiGianMoNop ||
          !this.dotForm.ThoiGianDongNop ||
          !this.dotForm.SoLuongPhaiNop ||
          this.dotForm.SoLuongPhaiNop < 1
        ) {
          alert('Vui lòng điền đầy đủ thông tin');
          return;
        }

        if (this.editingDot) {
          // Cập nhật
          await bookService.updateDotNop({
            dotNopId: this.editingDot._id,
            ...this.dotForm,
          });
          alert('Cập nhật đợt nộp thành công');
        } else {
          // Tạo mới
          await bookService.createDotNop(this.dotForm);
          alert('Tạo đợt nộp thành công');
        }

        this.showDotModal = false;
        await this.loadDotNopData();
      } catch (error) {
        console.error('Lỗi khi lưu đợt nộp:', error);
        alert('Có lỗi xảy ra');
      }
    },

    // ✅ THÊM: Xóa đợt nộp
    async deleteDot(dotNopId) {
      if (!confirm('Bạn có chắc muốn xóa đợt nộp này?')) return;

      try {
        await bookService.deleteDotNop({ dotNopId });
        alert('Xóa thành công');
        await this.loadDotNopData();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert(error.response?.data?.error || 'Có lỗi xảy ra');
      }
    },

    // ✅ THÊM: Format datetime cho input datetime-local
    formatDateTimeLocal(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    // ✅ THÊM: Reset filter đợt nộp
    resetFilters() {
      this.searchKeyword = '';
      this.selectedStatus = 'all';
      this.selectedDate = '';
      this.selectedDotNop = '';
      this.selectedKyHoc = '';
      this.selectedNamHoc = '';
      this.currentPage = 1;
    },

    async addKyHoc() {
      if (!this.newKyHoc || !this.newKyHoc.trim()) {
        alert('Vui lòng nhập tên kỳ học');
        return;
      }

      try {
        await bookService.addKyHoc({ TenKyHoc: this.newKyHoc.trim() });
        alert('Thêm kỳ học thành công');
        this.showAddKyHocModal = false;
        this.newKyHoc = '';
        await this.loadKyHocList();
      } catch (error) {
        console.error('Lỗi khi thêm kỳ học:', error);
        alert(error.response?.data?.error || 'Thêm kỳ học thất bại');
      }
    },

    async addNamHoc() {
      if (!this.newNamHoc) {
        alert('Vui lòng nhập năm học');
        return;
      }

      const pattern = /^\d{4}-\d{4}$/;
      if (!pattern.test(this.newNamHoc)) {
        alert('Định dạng năm học không hợp lệ. VD: 2023-2024');
        return;
      }

      try {
        await bookService.addNamHoc({ TenNamHoc: this.newNamHoc });
        alert('Thêm năm học thành công');
        this.showAddNamHocModal = false;
        this.newNamHoc = '';
        await this.loadNamHocList();
      } catch (error) {
        console.error('Lỗi khi thêm năm học:', error);
        alert(error.response?.data?.error || 'Thêm năm học thất bại');
      }
    },

    changeTab(tabName) {
      this.currentTab = tabName;
      // Cập nhật URL mà không reload trang
      this.$router.push({
        query: { ...this.$route.query, tab: tabName },
      });
    },
  },

  computed: {
    filteredThesisList() {
      const list = this.thesisList.filter((item) => {
        const keyword = this.searchKeyword.toLowerCase().trim();
        const status = this.selectedStatus;
        const selectedDate = this.selectedDate;

        // Lọc theo trạng thái
        if (status !== 'all' && item.TrangThai !== status) return false;

        // Lọc theo từ khóa
        if (keyword) {
          const fullName =
            `${item.MaDocGia.HoLot} ${item.MaDocGia.Ten}`.toLowerCase();
          const studentCode = item.MaDocGia.SinhVien.MaSinhVien.toLowerCase();
          const thesisTitle = item.TieuDeTai.toLowerCase();

          if (
            !fullName.includes(keyword) &&
            !studentCode.includes(keyword) &&
            !thesisTitle.includes(keyword)
          )
            return false;
        }

        // Lọc theo ngày
        if (selectedDate) {
          const thesisDate = new Date(item.createdAt);
          const formattedDate = this.formatDateToYMD(thesisDate);
          if (formattedDate !== selectedDate) return false;
        }

        // ✅ SỬA LẠI: Lọc theo đợt nộp
        if (this.selectedDotNop) {
          // Lấy ID từ object đã populate hoặc từ string ID
          const dotNopId =
            typeof item.MaDotNop === 'object'
              ? item.MaDotNop?._id
              : item.MaDotNop;
          if (String(dotNopId) !== String(this.selectedDotNop)) return false;
        }

        // ✅ SỬA LẠI: Lọc theo kỳ học
        if (this.selectedKyHoc) {
          const kyHocId =
            typeof item.MaDotNop?.KyHoc === 'object'
              ? item.MaDotNop?.KyHoc?._id
              : item.MaDotNop?.KyHoc;
          if (String(kyHocId) !== String(this.selectedKyHoc)) return false;
        }

        // ✅ SỬA LẠI: Lọc theo năm học
        if (this.selectedNamHoc) {
          const namHocId =
            typeof item.MaDotNop?.NamHoc === 'object'
              ? item.MaDotNop?.NamHoc?._id
              : item.MaDotNop?.NamHoc;
          if (String(namHocId) !== String(this.selectedNamHoc)) return false;
        }

        return true;
      });

      // Sắp xếp theo độ ưu tiên
      const priority = { 'Chờ duyệt': 1, 'Đã duyệt': 2, 'Từ chối': 3 };
      return list.sort((a, b) => {
        const priDiff =
          (priority[a.TrangThai] || 99) - (priority[b.TrangThai] || 99);
        if (priDiff !== 0) return priDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },

    paginatedThesisList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredThesisList.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredThesisList.length / this.pageSize);
    },

    filteredDotNopList() {
      let result = [...this.dotNopList];

      // Lọc theo từ khóa tìm kiếm (tên đợt)
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase().trim();
        result = result.filter((dot) =>
          dot.TenDot.toLowerCase().includes(keyword)
        );
      }

      // Lọc theo kỳ học
      if (this.selectedKyHoc) {
        result = result.filter((dot) => {
          const kyHocId =
            typeof dot.KyHoc === 'object' ? dot.KyHoc?._id : dot.KyHoc;
          return String(kyHocId) === String(this.selectedKyHoc);
        });
      }

      // Lọc theo năm học
      if (this.selectedNamHoc) {
        result = result.filter((dot) => {
          const namHocId =
            typeof dot.NamHoc === 'object' ? dot.NamHoc?._id : dot.NamHoc;
          return String(namHocId) === String(this.selectedNamHoc);
        });
      }

      // Lọc theo trạng thái
      if (this.selectedStatus !== 'all') {
        result = result.filter((dot) => dot.TrangThai === this.selectedStatus);
      }

      return result;
    },

    filteredDotNopListWithCount() {
      return this.filteredDotNopList.map((dot) => {
        // Đếm số luận văn có trạng thái "Đã duyệt" của đợt này
        const approvedCount = this.thesisList.filter((thesis) => {
          const dotNopId =
            typeof thesis.MaDotNop === 'object'
              ? thesis.MaDotNop?._id
              : thesis.MaDotNop;
          return (
            String(dotNopId) === String(dot._id) &&
            thesis.TrangThai === 'Đã duyệt'
          );
        }).length;

        return {
          ...dot,
          soLuongDaNop: approvedCount,
        };
      });
    },
  },

  watch: {
    searchKeyword() {
      this.currentPage = 1;
    },
    selectedStatus() {
      this.currentPage = 1;
    },
    selectedDate() {
      this.currentPage = 1;
    },

    selectedDotNop() {
      this.currentPage = 1;
    },
    selectedKyHoc() {
      this.currentPage = 1;
    },
    selectedNamHoc() {
      this.currentPage = 1;
    },
    currentTab(newTab) {
      this.resetFilters();
      // Cập nhật URL nếu khác với query hiện tại
      if (this.$route.query.tab !== newTab) {
        this.$router.push({
          query: { ...this.$route.query, tab: newTab },
        });
      }
    },

    // Thêm watcher để đồng bộ khi URL thay đổi (back/forward browser)
    '$route.query.tab'(newTab) {
      if (newTab && newTab !== this.currentTab) {
        this.currentTab = newTab;
      }
    },
  },
};
</script>

<style scoped>
.borrow-book__tabs {
  display: flex;
  margin: 20px 0;
  border-bottom: 2px solid #e0e0e0;
}

.borrow-book__tab {
  padding: 12px 24px;
  cursor: pointer;
  color: #555;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.borrow-book__tab:hover {
  color: #16a085;
}

.borrow-book__tab.active {
  color: #16a085;
  border-bottom-color: #16a085;
  background-color: #f0f9f7;
}

.management-util {
  display: flex;
  justify-content: space-between;
}

.management-util__search {
  width: 100%;
}

.library-card-management .search-date {
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #dedede;
}

.library-card-management .search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.library-card-management .search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.library-card-management .search-input:focus {
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

.library-card-management .search-button-card-library {
  position: absolute;
  right: 5px;
  background: #16a085;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.library-card-management .search-button-card-library:hover {
  background: #1d6b5b;
  transform: scale(1.05);
}

.library-card-management .status-select {
  padding: 10px 15px;
  padding-right: 35px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23555'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 15px;
  min-width: 200px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.status-select:hover {
  border-color: #a1c4d0;
}

.status-select:focus {
  outline: none;
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

/* Table Styles */
.management-table {
  font-size: 1.6rem;
}

.management-table__header {
  padding: 5px;
  border-bottom: 1px solid #dfe2e6;
}

.management-table__content {
  padding: 5px;
  border-bottom: 1px solid #dfe2e6;
  display: table-cell;
  vertical-align: middle;
}

.management-table tbody tr:hover > td {
  background-color: #f2f2f2;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

/* Text Overflow Handling */
.text-ellipsis--md {
  max-width: 230px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Status Badges */
.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
  min-width: 100px;
  text-align: center;
  font-size: 1.3rem;
}

.status-badge--pending {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe066 100%);
  color: #856404;
}

.status-badge--approved {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: #fff;
}

.status-badge--denied {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
}

.text-muted {
  padding: 5px 10px;
  width: 96px;
  background-color: #fff;
  color: #a1a6ab;
  border: 1px solid #a1a6ab;
  border-radius: 7px;
  text-align: center;
  font-size: 1.3rem;
}

/* Action Buttons */
.action-btn {
  padding: 5px 10px;
  min-width: 80px;
  min-height: 30px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.3rem;
}

.action-btn--approve {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: #fff;
}

.action-btn--approve:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
}

.action-btn--deny {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
  margin-left: 8px;
}

.action-btn--deny:hover {
  background: linear-gradient(135deg, #e63950 0%, #e8432b 100%);
}

/* Pagination */
.management-pagination {
  text-align: center;
  margin: 25px 0;
}

.pagination {
  display: inline-flex;
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #ddd;
  font-family: Arial, sans-serif;
}

.page-item {
  margin: 0;
}

.page-link {
  display: block;
  padding: 8px 14px;
  text-decoration: none;
  color: #333;
  background-color: #fff;
  border-right: 1px solid #ddd;
  transition: background-color 0.2s ease;
  font-size: 1.2rem;
}

.page-item:last-child .page-link {
  border-right: none;
}

.page-link:hover {
  background-color: #f2f2f2;
}

.page-item.active .page-link {
  background-color: #007bff;
  color: white;
  cursor: default;
}

.page-item.disabled .page-link {
  color: #aaa;
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.management-table__content-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 15px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid #dee2e6;
  text-align: right;
}

.modal-title {
  font-size: 2.5rem;
  font-weight: bold;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-body__details {
  display: flex;
}

.modal-body__image {
  width: 50%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 16px;
}

.modal-body__info {
  width: 50%;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-body__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
}

.btn-view-pdf {
  font-size: 1.6rem;
  position: relative;
  top: -2px;
}

.management-util__filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ml-2 {
  margin-left: 0 !important;
}

/* Tab Quản lý đợt nộp */
.dot-nop-management {
  margin-top: 20px;
}

.dot-nop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dot-nop-header h3 {
  font-size: 2rem;
  color: #333;
}

.btn-create-dot {
  padding: 10px 20px;
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.btn-create-dot:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
  transform: translateY(-2px);
}

.btn-create-dot i {
  margin-right: 8px;
}

/* Form trong modal */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 1.4rem;
  margin-bottom: 5px;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 1.4rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.form-control:focus {
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid #dee2e6;
  text-align: right;
}

.btn {
  padding: 8px 16px;
  font-size: 1.4rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  margin-right: 10px;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-primary {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
}

.action-btn i {
  font-size: 1.2rem;
}

.wwr {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-with-button .form-control {
  flex: 1;
}

.btn-add-inline {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-add-inline:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
  transform: scale(1.05);
}

.modal-sm .modal-dialog {
  max-width: 400px;
}

.thesis__reset-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.4rem;
  transition: all 0.3s ease;
  min-width: 100px;
}

.thesis__reset-btn:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
}

.submission-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 12px;
  color: #2e7d32;
  font-weight: 600;
}

.submission-count i {
  font-size: 1.2rem;
}
</style>
