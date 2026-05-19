<template>
  <div class="thesis_library">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar tabs dọc -->
        <div class="col-12 col-lg-2 thesis_sidebar">
          <ul class="nav flex-column flex-lg-column flex-row">
            <li>
              <a
                href="#"
                :class="{ active: thesisTab === 'nop' }"
                @click.prevent="changeThesisTab('nop')"
              >
                📂 Nộp luận văn
              </a>
            </li>
            <li>
              <a
                href="#"
                :class="{ active: thesisTab === 'danhsach' }"
                @click.prevent="changeThesisTab('danhsach')"
              >
                📑 Danh sách luận văn
              </a>
            </li>
          </ul>
        </div>

        <!-- Nội dung -->
        <div class="col-12 col-lg-10 thesis_content">
          <!-- TAB NỘP LUẬN VĂN -->
          <div v-if="thesisTab === 'nop'">
            <div class="thesis_content_upload">
              <!-- Banner đợt nộp đang mở -->
              <div class="thesis__dot-nop-info" v-if="activeDotNop">
                <div class="thesis__dot-nop-banner">
                  <i class="fas fa-calendar-check"></i>
                  <div class="thesis__dot-nop-details">
                    <strong>{{ activeDotNop.TenDot }}</strong>
                    <p>
                      Thời gian:
                      <span class="highlight">{{ formatDateTime(activeDotNop.ThoiGianMoNop) }}</span>
                      đến
                      <span class="highlight">{{ formatDateTime(activeDotNop.ThoiGianDongNop) }}</span>
                    </p>
                    <p>Kỳ học: <span class="highlight">{{ activeDotNop.KyHoc?.TenKyHoc }}</span></p>
                    <p>Năm học: <span class="highlight">{{ activeDotNop.NamHoc?.TenNamHoc }}</span></p>
                  </div>
                </div>
              </div>

              <!-- Không có đợt nộp -->
              <div class="thesis__no-dot-nop" v-else-if="!activeDotNop && !thesisStatus">
                <div class="thesis__no-dot-banner">
                  <i class="fas fa-exclamation-circle"></i>
                  <div>
                    <strong>Hiện tại không có đợt nộp luận văn nào đang mở</strong>
                    <p>Vui lòng chờ thông báo về đợt nộp tiếp theo từ nhà trường.</p>
                  </div>
                </div>
              </div>

              <div class="row">
                <!-- Ảnh upload -->
                <div class="col-12 col-lg-6">
                  <div class="thesis__image-wrapper">
                    <div class="thesis__image-input">
                      <input
                        type="file"
                        id="thesisImageInput"
                        accept="image/*"
                        style="display: none"
                        @change="onImageChange"
                        :disabled="!canSubmitThesis"
                      />
                      <label for="thesisImageInput" class="thesis__camera-label">
                        <div
                          class="thesis__camera-icon"
                          v-if="!(thesisStatus === 'Chờ duyệt' || thesisStatus === 'Đã duyệt')"
                        >
                          <i class="fas fa-camera"></i>
                        </div>
                      </label>
                    </div>
                    <img v-if="imagePreview" :src="imagePreview" alt="Preview" />
                  </div>
                </div>

                <!-- Thông tin luận văn -->
                <div class="col-12 col-lg-6">
                  <div class="thesis__info">
                    <div class="thesis__info-header">
                      <span class="title">Tên đề tài: </span>
                      <input
                        type="text"
                        placeholder="Nhập tên đề tài"
                        v-model="topicName"
                        class="thesis__info-title"
                        :disabled="!canSubmitThesis"
                      />

                      <div class="thesis__info-item">
                        <span class="title">Bậc đào tạo: </span>
                        <div>
                          <select v-model="educationLevel" :disabled="!canSubmitThesis">
                            <option disabled value="">-- Chọn bậc đào tạo --</option>
                            <option value="Đại học">Đại học</option>
                            <option value="Thạc sĩ">Thạc sĩ</option>
                            <option value="Tiến sĩ">Tiến sĩ</option>
                          </select>
                        </div>
                      </div>

                      <div class="thesis__info-item">
                        <span class="title">Năm bảo vệ: </span>
                        <input
                          type="text"
                          placeholder="Nhập năm bảo vệ"
                          v-model="defenseYear"
                          :disabled="!canSubmitThesis"
                        />
                      </div>
                    </div>

                    <div class="thesis__info-section">
                      <span class="title">Giáo viên hướng dẫn: </span>
                      <input
                        type="text"
                        placeholder="Nhập tên GVHD"
                        v-model="supervisor"
                        :disabled="!canSubmitThesis"
                      />

                      <span class="title">File PDF Luận văn: </span>
                      <div class="thesis__pdf-upload">
                        <input
                          type="file"
                          id="thesisPdfInput"
                          accept=".pdf"
                          style="display: none"
                          @change="onPdfChange"
                          :disabled="!canSubmitThesis"
                        />
                        <label for="thesisPdfInput" class="thesis__pdf-label">
                          <i class="fas fa-file-pdf"></i> Chọn file PDF
                        </label>
                        <span
                          v-if="pdfPreview"
                          class="thesis__pdf-preview"
                          @click="openPdf"
                          style="cursor: pointer"
                        >
                          {{ pdfPreview }}
                        </span>
                      </div>
                    </div>

                    <div class="thesis__info-button">
                      <button
                        type="button"
                        class="thesis__btn-submit"
                        :class="{
                          'thesis__btn-waiting': thesisStatus === 'Chờ duyệt',
                          'thesis__btn-approved': thesisStatus === 'Đã duyệt',
                        }"
                        :disabled="!canSubmitThesis"
                        @click="submitThesis"
                      >
                        {{
                          thesisStatus === 'Chờ duyệt'
                            ? 'Đang chờ duyệt'
                            : thesisStatus === 'Đã duyệt'
                            ? 'Đã duyệt'
                            : 'Nộp Luận văn'
                        }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB DANH SÁCH LUẬN VĂN -->
          <div v-else-if="thesisTab === 'danhsach'">

            <!-- Nút toggle filter (chỉ hiện trên mobile/tablet) -->
            <button class="thesis__filter-toggle-btn" @click="showFilterDrawer = true">
              <i class="fas fa-sliders-h"></i>
              Bộ lọc
              <span class="thesis__filter-badge" v-if="activeFilterCount > 0">{{ activeFilterCount }}</span>
            </button>

            <!-- Overlay backdrop -->
            <div
              class="thesis__filter-overlay"
              :class="{ open: showFilterDrawer }"
              @click="showFilterDrawer = false"
            ></div>

            <!-- Drawer / Filter panel -->
            <div class="thesis__filters" :class="{ 'thesis__filters--drawer-open': showFilterDrawer }">
              <!-- Nút đóng drawer (chỉ hiện trên mobile) -->
              <div class="thesis__filter-drawer-header">
                <span><i class="fas fa-sliders-h"></i> Bộ lọc tìm kiếm</span>
                <button class="thesis__filter-drawer-close" @click="showFilterDrawer = false">
                  &times;
                </button>
              </div>

              <!-- Hàng 1: Tìm kiếm -->
              <div class="thesis__filters-row">
                <div class="thesis__filter-search">
                  <span class="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Tìm theo tên luận văn..."
                    v-model="thesisSearchKeyword"
                  />
                </div>
                <div class="thesis__filter-search">
                  <span class="search-icon">👨</span>
                  <input
                    type="text"
                    placeholder="Tìm theo GVHD..."
                    v-model="thesisSearchSupervisor"
                  />
                </div>
                <button class="thesis__reset-btn" @click="resetThesisFilters">
                  <i class="fas fa-undo"></i> Reset
                </button>
              </div>

              <!-- Hàng 2: Dropdown filters -->
              <div class="thesis__filters-row thesis__filters-row--dropdowns">
                <select class="thesis__filter-select" v-model="thesisFilterKyHoc">
                  <option value="">Tất cả kỳ học</option>
                  <option v-for="ky in kyHocList" :key="ky._id" :value="ky._id">
                    {{ ky.TenKyHoc }}
                  </option>
                </select>

                <select class="thesis__filter-select" v-model="thesisFilterNamHoc">
                  <option value="">Tất cả năm học</option>
                  <option v-for="nam in namHocList" :key="nam._id" :value="nam._id">
                    {{ nam.TenNamHoc }}
                  </option>
                </select>

                <select class="thesis__filter-select" v-model="selectedDefenseYear">
                  <option value="">Tất cả năm bảo vệ</option>
                  <option v-for="year in defenseYears" :key="year" :value="year">{{ year }}</option>
                </select>

                <select class="thesis__filter-select" v-model="selectedEducationLevel">
                  <option value="">Tất cả bậc đào tạo</option>
                  <option v-for="level in educationLevels" :key="level" :value="level">{{ level }}</option>
                </select>

                <select class="thesis__filter-select" v-model="selectedMajor">
                  <option value="">Tất cả ngành học</option>
                  <option v-for="major in majors" :key="major" :value="major">{{ major }}</option>
                </select>

                <select class="thesis__filter-select" v-model="selectedFaculty">
                  <option value="">Tất cả khoa</option>
                  <option v-for="faculty in faculties" :key="faculty" :value="faculty">{{ faculty }}</option>
                </select>
              </div>

              <!-- Nút áp dụng (chỉ hiện trong drawer mobile) -->
              <div class="thesis__filter-drawer-footer">
                <button class="thesis__filter-apply-btn" @click="showFilterDrawer = false">
                  <i class="fas fa-check"></i> Áp dụng
                  <span v-if="activeFilterCount > 0">({{ activeFilterCount }} bộ lọc)</span>
                </button>
              </div>
            </div>

            <div class="thesis__list-container">
              <div v-if="filteredThesisList.length === 0" class="text-center py-5">
                <p style="color: #666; font-size: 2.8rem">📑 Chưa có luận văn nào được duyệt</p>
              </div>

              <div class="row thesis__list-row" v-else>
                <div
                  class="col-6 col-md-4 col-lg-3 thesis__list-element-wrapper"
                  v-for="thesis in paginatedThesis"
                  :key="thesis._id"
                >
                  <div class="thesis__list-element" @click="handleThesisClick(thesis)">
                    <div class="thesis__list-element-image">
                      <img :src="thesis.Image" :alt="thesis.TieuDeTai" />
                    </div>
                    <div class="thesis__list-element-info">
                      <div class="thesis__list-element-title">
                        <span v-html="highlightText(thesis.TieuDeTai, thesisSearchKeyword)"></span>
                      </div>
                      <div class="thesis__list-element-author">
                        {{ thesis.MaDocGia.HoLot }} {{ thesis.MaDocGia.Ten }}
                      </div>
                      <div class="thesis__list-element-level">
                        GVHD:
                        <span v-html="highlightText(thesis.GiaoVienHuongDan, thesisSearchSupervisor)"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Phân trang luận văn -->
              <div
                class="thesis__list-navigation-page"
                v-if="filteredThesisList.length > 0 && thesisTotalPages > 1"
              >
                <ul class="pagination">
                  <li class="page-item" :class="{ disabled: thesisCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="goToThesisPage(1)">«</a>
                  </li>
                  <li class="page-item" :class="{ disabled: thesisCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="goToThesisPage(thesisCurrentPage - 1)">‹</a>
                  </li>
                  <li class="page-item active">
                    <a class="page-link" href="#" @click.prevent>{{ thesisCurrentPage }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: thesisCurrentPage === thesisTotalPages }">
                    <a class="page-link" href="#" @click.prevent="goToThesisPage(thesisCurrentPage + 1)">›</a>
                  </li>
                  <li class="page-item" :class="{ disabled: thesisCurrentPage === thesisTotalPages }">
                    <a class="page-link" href="#" @click.prevent="goToThesisPage(thesisTotalPages)">»</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết luận văn -->
    <transition name="modal-fade">
      <div
        class="thesis-modal"
        v-if="showThesisModal"
        tabindex="-1"
        @click="showThesisModal = false"
      >
        <div class="thesis-modal-dialog" @click.stop>
          <div class="thesis-modal-content">
            <div class="thesis-modal-header">
              <h5 class="thesis-modal-title">Chi tiết luận văn</h5>
              <button type="button" class="thesis-btn-close" @click="showThesisModal = false">
                &times;
              </button>
            </div>
            <div class="thesis-modal-body">
              <div class="thesis-modal-body__details">
                <div class="thesis-modal-body__image">
                  <img
                    :src="selectedThesis?.Image || '/image/avatar_comment.png'"
                    :alt="selectedThesis?.TieuDeTai"
                  />
                </div>
                <div class="thesis-modal-body__info">
                  <p><strong>Mã sinh viên:</strong> {{ selectedThesis?.MaDocGia?.SinhVien?.MaSinhVien }}</p>
                  <p><strong>Họ tên:</strong> {{ selectedThesis?.MaDocGia?.HoLot }} {{ selectedThesis?.MaDocGia?.Ten }}</p>
                  <p><strong>Ngành học:</strong> {{ selectedThesis?.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh || 'Chưa cập nhật' }}</p>
                  <p><strong>Khoa:</strong> {{ selectedThesis?.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa || 'Chưa cập nhật' }}</p>
                  <p><strong>Tiêu đề luận văn:</strong> {{ selectedThesis?.TieuDeTai }}</p>
                  <p><strong>Bậc đào tạo:</strong> {{ selectedThesis?.BacDaoTao }}</p>
                  <p><strong>Năm bảo vệ:</strong> {{ selectedThesis?.NamBaoVe }}</p>
                  <p><strong>Giáo viên hướng dẫn:</strong> {{ selectedThesis?.GiaoVienHuongDan }}</p>
                  <p>
                    <strong>File Luận Văn:</strong>
                    <button
                      v-if="selectedThesis?.Pdf"
                      class="thesis-btn thesis-btn-link thesis-btn-view-pdf"
                      @click="openThesisPdf"
                    >Xem file</button>
                    <span v-else>Chưa có</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';
import { smartSearch, removeVietnameseTones } from '../assets/js/fuzzySearch';
import { userState } from '../assets/js/userState';

export default {
  name: 'TabLuanVan',
  props: {
    activeDotNop: Object,
    kyHocList: Array,
    namHocList: Array,
    initialThesisTab: { type: String, default: 'nop' },
  },
  emits: ['changeThesisTab'],
  data() {
    return {
      thesisTab: this.initialThesisTab,

      // Form nộp luận văn
      imageFile: null,
      imagePreview: null,
      pdfFile: null,
      pdfPreview: null,
      pdfPath: null,
      topicName: '',
      educationLevel: '',
      defenseYear: '',
      supervisor: '',
      thesisStatus: null,

      // Danh sách luận văn
      thesisList: [],
      thesisCurrentPage: 1,
      thesisPageSize: 8,
      showThesisModal: false,
      selectedThesis: null,

      // Filters danh sách
      thesisSearchKeyword: '',
      thesisSearchSupervisor: '',
      selectedDefenseYear: '',
      selectedEducationLevel: '',
      selectedMajor: '',
      selectedFaculty: '',
      thesisFilterKyHoc: '',
      thesisFilterNamHoc: '',

      // Dropdown options
      defenseYears: [],
      educationLevels: [],
      majors: [],
      faculties: [],

      // Filter drawer (mobile/tablet)
      showFilterDrawer: false,
    };
  },
  async mounted() {
    await this.fetchThesis();
    await this.fetchAllThesis();
  },
  methods: {
    changeThesisTab(tab) {
      this.thesisTab = tab;
      this.$emit('changeThesisTab', tab);
    },

    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },

    onPdfChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.pdfFile = file;
        this.pdfPreview = file.name;
      }
    },

    openPdf() {
      if (this.pdfFile) {
        window.open(URL.createObjectURL(this.pdfFile), '_blank');
      } else if (this.pdfPath) {
        window.open(this.pdfPath, '_blank');
      } else {
        alert('Chưa có file PDF để mở.');
      }
    },

    async fetchThesis() {
      try {
        const thesis = await bookService.getOneThesis({ userId: userState._id });
        if (!thesis || thesis.TrangThai === 'Từ chối') return;
        if (thesis && thesis._id) {
          this.topicName = thesis.TieuDeTai || '';
          this.educationLevel = thesis.BacDaoTao || '';
          this.defenseYear = thesis.NamBaoVe || '';
          this.supervisor = thesis.GiaoVienHuongDan || '';
          this.pdfPreview = thesis.Pdf ? this.topicName + '.pdf' : null;
          this.pdfPath = thesis.Pdf || null;
          this.imagePreview = thesis.Image || null;
          this.thesisStatus = thesis.TrangThai;
        }
      } catch (err) {
        console.error('Lỗi khi tải luận văn:', err);
      }
    },

    async submitThesis() {
      if (!this.activeDotNop) {
        alert('Hiện tại không có đợt nộp luận văn nào đang mở!');
        return;
      }
      if (!this.topicName || !this.educationLevel || !this.defenseYear || !this.supervisor || !this.imageFile || !this.pdfFile) {
        alert('Vui lòng nhập đầy đủ thông tin và chọn file!');
        return;
      }
      this.$emit('setLoading', true);
      try {
        const formData = new FormData();
        formData.append('userId', userState._id);
        formData.append('image', this.imageFile);
        formData.append('pdfFile', this.pdfFile);
        formData.append('topicName', this.topicName);
        formData.append('educationLevel', this.educationLevel);
        formData.append('defenseYear', this.defenseYear);
        formData.append('supervisor', this.supervisor);
        await bookService.addThesis(formData);
        alert('Nộp luận văn thành công!');
        await this.fetchThesis();
      } catch (err) {
        alert('Có lỗi xảy ra khi nộp luận văn!');
      } finally {
        this.$emit('setLoading', false);
      }
    },

    async fetchAllThesis() {
      try {
        const response = await bookService.getAllThesis();
        if (Array.isArray(response)) {
          this.thesisList = response.filter((t) => t.TrangThai === 'Đã duyệt');
          this.populateFilterOptions();
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách luận văn:', error);
      }
    },

    populateFilterOptions() {
      if (!this.thesisList.length) return;
      this.defenseYears = [
        ...new Set(this.thesisList.map((t) => parseInt(t.NamBaoVe)).filter((y) => !isNaN(y))),
      ].sort((a, b) => b - a);
      this.educationLevels = [...new Set(this.thesisList.map((t) => t.BacDaoTao).filter(Boolean))];
      this.majors = [
        ...new Set(
          this.thesisList
            .filter((t) => t.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh)
            .map((t) => t.MaDocGia.SinhVien.MaNganhHoc.TenNganh)
        ),
      ].sort();
      this.faculties = [
        ...new Set(
          this.thesisList
            .filter((t) => t.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa)
            .map((t) => t.MaDocGia.SinhVien.MaNganhHoc.Khoa.TenKhoa)
        ),
      ].sort();
    },

    goToThesisPage(page) {
      if (page >= 1 && page <= this.thesisTotalPages) {
        this.thesisCurrentPage = page;
      }
    },

    handleThesisClick(thesis) {
      this.selectedThesis = thesis;
      this.showThesisModal = true;
    },

    openThesisPdf() {
      if (this.selectedThesis?.Pdf) {
        window.open(this.selectedThesis.Pdf, '_blank');
      } else {
        alert('Chưa có file luận văn');
      }
    },

    resetThesisFilters() {
      this.thesisSearchKeyword = '';
      this.thesisSearchSupervisor = '';
      this.selectedDefenseYear = '';
      this.selectedEducationLevel = '';
      this.selectedMajor = '';
      this.selectedFaculty = '';
      this.thesisCurrentPage = 1;
      this.thesisFilterKyHoc = '';
      this.thesisFilterNamHoc = '';
    },

    highlightText(text, keyword) {
      if (!keyword || !keyword.trim()) return text;
      const normalizedText = removeVietnameseTones(text);
      const normalizedKeyword = removeVietnameseTones(keyword);
      const index = normalizedText.indexOf(normalizedKeyword);
      if (index === -1) return text;
      const before = text.substring(0, index);
      const match = text.substring(index, index + keyword.length);
      const after = text.substring(index + keyword.length);
      return `${before}<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 2px;">${match}</mark>${after}`;
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? 'chiều' : 'sáng';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${day}/${month}/${year} ${displayHours}:${minutes} ${period}`;
    },
  },
  computed: {
    canSubmitThesis() {
      if (this.thesisStatus === 'Chờ duyệt' || this.thesisStatus === 'Đã duyệt') return false;
      if (!this.activeDotNop) return false;
      return true;
    },

    filteredThesisList() {
      let result = [...this.thesisList];
      if (this.thesisSearchKeyword.trim()) {
        result = smartSearch(result, this.thesisSearchKeyword, (t) => t.TieuDeTai);
      }
      if (this.thesisSearchSupervisor.trim()) {
        const kw = removeVietnameseTones(this.thesisSearchSupervisor);
        result = result.filter((t) => removeVietnameseTones(t.GiaoVienHuongDan).includes(kw));
      }
      if (this.thesisFilterKyHoc) {
        result = result.filter((t) => {
          const id = typeof t.MaDotNop?.KyHoc === 'object' ? t.MaDotNop?.KyHoc?._id : t.MaDotNop?.KyHoc;
          return String(id) === String(this.thesisFilterKyHoc);
        });
      }
      if (this.thesisFilterNamHoc) {
        result = result.filter((t) => {
          const id = typeof t.MaDotNop?.NamHoc === 'object' ? t.MaDotNop?.NamHoc?._id : t.MaDotNop?.NamHoc;
          return String(id) === String(this.thesisFilterNamHoc);
        });
      }
      if (this.selectedDefenseYear) {
        const y = parseInt(this.selectedDefenseYear);
        result = result.filter((t) => parseInt(t.NamBaoVe) === y);
      }
      if (this.selectedEducationLevel) {
        result = result.filter((t) => t.BacDaoTao === this.selectedEducationLevel);
      }
      if (this.selectedMajor) {
        result = result.filter((t) => t.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh === this.selectedMajor);
      }
      if (this.selectedFaculty) {
        result = result.filter((t) => t.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa === this.selectedFaculty);
      }
      return result;
    },

    paginatedThesis() {
      const start = (this.thesisCurrentPage - 1) * this.thesisPageSize;
      return this.filteredThesisList.slice(start, start + this.thesisPageSize);
    },

    thesisTotalPages() {
      return Math.ceil(this.filteredThesisList.length / this.thesisPageSize);
    },

    activeFilterCount() {
      let count = 0;
      if (this.thesisSearchKeyword.trim()) count++;
      if (this.thesisSearchSupervisor.trim()) count++;
      if (this.thesisFilterKyHoc) count++;
      if (this.thesisFilterNamHoc) count++;
      if (this.selectedDefenseYear) count++;
      if (this.selectedEducationLevel) count++;
      if (this.selectedMajor) count++;
      if (this.selectedFaculty) count++;
      return count;
    },
  },
  watch: {
    thesisSearchKeyword() { this.thesisCurrentPage = 1; },
    thesisSearchSupervisor() { this.thesisCurrentPage = 1; },
    selectedDefenseYear() { this.thesisCurrentPage = 1; },
    selectedEducationLevel() { this.thesisCurrentPage = 1; },
    selectedMajor() { this.thesisCurrentPage = 1; },
    selectedFaculty() { this.thesisCurrentPage = 1; },
    thesisFilterKyHoc() { this.thesisCurrentPage = 1; },
    thesisFilterNamHoc() { this.thesisCurrentPage = 1; },
    initialThesisTab(val) { this.thesisTab = val; },
  },
};
</script>