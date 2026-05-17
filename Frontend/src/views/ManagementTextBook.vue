<template>
  <div class="management-textbook">
    <div class="management-textbook__util">
      <div class="management-textbook__util-search">
        <div class="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm giáo trình..."
            class="search-input"
            v-model="searchKeyword"
          />
          <button class="search-button-textbook">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="management-textbook__tabs">
      <div class="management-textbook__tab active">Quản Lý Giáo Trình</div>
    </div>

    <!-- Nút Thêm Giáo Trình -->
    <div class="management-textbook-actions">
      <button class="action-btn action-btn--add" @click="openAddTextBookModal">
        <i class="fas fa-plus"></i> Thêm Giáo Trình Mới
      </button>
    </div>

    <!-- Bảng Danh Sách Giáo Trình -->
    <table class="management-textbook__table mt-4 table w-100">
      <thead>
        <tr>
          <th class="management-textbook__table-header">Mã Giáo Trình</th>
          <th class="management-textbook__table-header">Tên Giáo Trình</th>
          <th class="management-textbook__table-header">Tác Giả</th>
          <th class="management-textbook__table-header">Khoa</th>
          <th class="management-textbook__table-header">Giá</th>
          <th class="management-textbook__table-header">Thao Tác</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="textbook in paginatedTextBookList"
          :key="textbook._id"
          @click="handleTextBookRowClick(textbook)"
        >
          <td class="management-textbook__table-content">{{ textbook.MaSach }}</td>
          <td
            class="management-textbook__table-content management-textbook__table-content-ellipsis"
          >
            {{ textbook.TenSach }}
          </td>
          <td
            class="management-textbook__table-content management-textbook__table-content-ellipsis"
          >
            {{ textbook.TacGia }}
          </td>
          <td class="management-textbook__table-content management-textbook__table-content-ellipsis">
             {{ textbook.Khoa?.TenKhoa }}
          </td>
          <td class="management-textbook__table-content">
            {{ textbook.DonGia?.toLocaleString() }}đ
          </td>
          <td class="management-textbook__table-content d-flex">
            <button
              class="action-btn action-btn--edit"
              @click.stop="openEditTextBookModal(textbook)"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="action-btn action-btn--delete"
              @click.stop="deleteTextBook(textbook._id)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="management-textbook-pagination" v-if="paginatedTextBookList.length > 0">
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

    <!-- Modal Chi Tiết Giáo Trình -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showTextBookDetailModal"
        tabindex="-1"
        @click="showTextBookDetailModal = false"
      >
        <div class="modal-dialog-textbook" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-book"></i> Chi Tiết Giáo Trình
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showTextBookDetailModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body__textbook-detail">
                <div class="modal-body__textbook-image">
                  <img
                    :src="selectedTextBook?.Image"
                    alt="TextBook Cover"
                    v-if="selectedTextBook?.Image"
                  />
                  <div v-else class="no-image">Không có ảnh</div>
                </div>

                <div
                  class="modal-body__textbook-info"
                  style="
                    display: grid;
                    grid-template-columns: 110px auto;
                    row-gap: 6px;
                    column-gap: 12px;
                    align-items: start;
                  "
                >
                  <p><strong>Mã giáo trình:</strong></p>
                  <p>{{ selectedTextBook?.MaSach }}</p>
                  <p><strong>Tên giáo trình:</strong></p>
                  <p>{{ selectedTextBook?.TenSach }}</p>
                  <p><strong>Tác giả:</strong></p>
                  <p>{{ selectedTextBook?.TacGia }}</p>
                  <p><strong>Khoa:</strong></p>
                  <p>{{ selectedTextBook?.Khoa?.TenKhoa }}</p>
                  <p><strong>Số quyển còn:</strong></p>
                  <p>{{ selectedTextBook?.SoQuyen }}</p>
                  <p><strong>Giá:</strong></p>
                  <p>{{ selectedTextBook?.DonGia?.toLocaleString() }}đ</p>
                  <p><strong>Nhà xuất bản:</strong></p>
                  <p>{{ selectedTextBook?.MaNXB?.TenNXB }}</p>
                  <p><strong>Năm xuất bản:</strong></p>
                  <p>{{ selectedTextBook?.NamXuatBan }}</p>
                  <p><strong>Địa chỉ NXB:</strong></p>
                  <p>{{ selectedTextBook?.MaNXB?.DiaChi }}</p>
                  <p><strong>Mô tả:</strong></p>
                  <p>{{ selectedTextBook?.MoTaSach || '--' }}</p>

                  <template v-if="selectedTextBook?.Pdf">
                    <p><strong>File PDF:</strong></p>
                    <p>
                      <span
                        class="pdf-link"
                        @click="openPdfInNewTab(selectedTextBook.Pdf)"
                      >
                        Xem file PDF
                      </span>
                    </p>
                  </template>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="action-btn action-btn--edit"
                @click="editTextBookFromDetail"
              >
                <i class="fas fa-edit"></i> Chỉnh Sửa
              </button>
              <button
                class="action-btn action-btn--close"
                @click="showTextBookDetailModal = false"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Thêm/Sửa Giáo Trình -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showTextBookModal"
        tabindex="-1"
      >
        <div class="modal-dialog-textbook modal-dialog--form" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditMode ? 'Chỉnh Sửa Giáo Trình' : 'Thêm Giáo Trình Mới' }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showTextBookModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <form class="textbook-form">
                <!-- Ảnh Bìa -->
                <div class="form-group">
                  <label>Ảnh Bìa <span class="required">*</span></label>
                  <div class="image-upload-wrapper">
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      @change="onImageChange"
                      style="display: none"
                    />
                    <label for="imageInput" class="image-upload-label">
                      <div v-if="imagePreview" class="image-preview">
                        <img :src="imagePreview" alt="Preview" />
                      </div>
                      <div v-else class="image-placeholder">
                        <i class="fas fa-camera"></i>
                        <span>Chọn ảnh bìa</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label>Tên Giáo Trình <span class="required">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="textbookForm.TenSach"
                    placeholder="VD: Lập trình Web"
                  />
                </div>

                <div class="form-group">
                  <label>Tác Giả <span class="required">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="textbookForm.TacGia"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div class="form-group">
                  <label>Số Quyển <span class="required">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="textbookForm.SoQuyen"
                    placeholder="VD: 10"
                    min="1"
                  />
                </div>

                <div class="form-group">
                  <label>Giá Giáo Trình (VNĐ) <span class="required">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="textbookForm.DonGia"
                    placeholder="VD: 50000"
                    min="0"
                  />
                </div>

                <div class="form-group">
                  <label>Mô Tả</label>
                  <textarea
                    class="form-control"
                    v-model="textbookForm.MoTaSach"
                    placeholder="Nhập mô tả giáo trình..."
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Nhà Xuất Bản <span class="required">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="textbookForm.TenNXB"
                    placeholder="VD: NXB Giáo Dục"
                  />
                </div>

                <div class="form-group">
                  <label>Năm Xuất Bản <span class="required">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="textbookForm.NamXuatBan"
                    placeholder="VD: 2024"
                    min="1900"
                    max="2100"
                  />
                </div>

                <div class="form-group">
                  <label>Địa Chỉ NXB <span class="required">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="textbookForm.DiaChiNXB"
                    placeholder="VD: Hà Nội"
                  />
                </div>

                <div class="form-group">
                  <label>Khoa <span class="required">*</span></label>
                  <div class="faculty-wrapper">
                    <select class="form-control" v-model="textbookForm.TenKhoa">
                      <option value="">-- Chọn khoa --</option>
                      <option
                        v-for="faculty in faculties"
                        :key="faculty._id"
                        :value="faculty.TenKhoa"
                      >
                        {{ faculty.TenKhoa }}
                      </option>
                    </select>
                    <button
                      type="button"
                      class="btn-add-faculty"
                      @click="showAddFacultyModal = true"
                      title="Thêm khoa mới"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>File PDF</label>
                  <div class="pdf-upload-wrapper">
                    <input
                      type="file"
                      id="pdfInput"
                      accept=".pdf"
                      @change="onPdfChange"
                      style="display: none"
                    />
                    <label for="pdfInput" class="pdf-upload-label">
                      <i class="fas fa-file-pdf"></i>
                      Chọn file PDF
                    </label>
                    <span
                      v-if="pdfPreview"
                      class="pdf-preview"
                      @click="openPdfInNewTab(pdfUrl)"
                    >
                      {{ pdfPreview }}
                    </span>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                class="action-btn action-btn--cancel"
                @click="showTextBookModal = false"
              >
                Hủy
              </button>
              <button
                class="action-btn action-btn--save"
                @click="isEditMode ? updateTextBook() : addTextBook()"
              >
                {{ isEditMode ? 'Cập Nhật' : 'Thêm Mới' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Thêm Khoa -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showAddFacultyModal"
        tabindex="-1"
        @click="showAddFacultyModal = false"
      >
        <div class="modal-dialog-faculty" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Thêm Khoa Mới</h5>
              <button
                type="button"
                class="btn-close"
                @click="showAddFacultyModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên Khoa <span class="required">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newFacultyName"
                  placeholder="Nhập tên khoa"
                  @keyup.enter="handleAddFaculty"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="action-btn action-btn--cancel"
                @click="showAddFacultyModal = false"
              >
                Hủy
              </button>
              <button
                class="action-btn action-btn--save"
                @click="handleAddFaculty"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-overlay">
      <img :src="loadingGif" alt="loading" class="loading-spinner" />
    </div>
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';
import loadingGif from '/image/loading.gif';

export default {
  name: 'ManagementTextBook',
  data() {
    return {
      textbookList: [],
      currentPage: 1,
      pageSize: 5,
      searchKeyword: '',
      showTextBookModal: false,
      showTextBookDetailModal: false,
      showAddFacultyModal: false,
      isEditMode: false,
      selectedTextBook: null,
      textbookForm: {
        _id: '',
        TenSach: '',
        TacGia: '',
        SoQuyen: null,
        DonGia: null,
        MoTaSach: '',
        TenNXB: '',
        NamXuatBan: null,
        DiaChiNXB: '',
        TenKhoa: '',
      },
      imageFile: null,
      imagePreview: null,
      pdfFile: null,
      pdfPreview: null,
      pdfUrl: null,
      faculties: [],
      newFacultyName: '',
      isLoading: false,
      loadingGif,
      originalTextBookData: {},
    };
  },

  async mounted() {
    await this.fetchTextBookList();
    await this.fetchFaculties();
  },

  computed: {
    filteredTextBookList() {
      return this.textbookList.filter((textbook) => {
        if (textbook.LoaiSach !== 'GiaoTrinh') {
          return false;
        }

        const keyword = this.searchKeyword.toLowerCase().trim();

        if (keyword) {
          const textbookCode = textbook.MaSach?.toLowerCase() || '';
          const textbookName = textbook.TenSach?.toLowerCase() || '';
          const author = textbook.TacGia?.toLowerCase() || '';
          const faculty = textbook.Khoa?.TenKhoa?.toLowerCase() || '';

          if (
            !textbookCode.includes(keyword) &&
            !textbookName.includes(keyword) &&
            !author.includes(keyword) &&
            !faculty.includes(keyword)
          )
            return false;
        }

        return true;
      });
    },

    paginatedTextBookList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTextBookList.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredTextBookList.length / this.pageSize);
    },
  },

  methods: {
    async fetchTextBookList() {
      try {
        this.isLoading = true;
        const response = await bookService.getAllBook();
        this.textbookList = response || [];
      } catch (error) {
        console.error('Lỗi khi tải danh sách giáo trình:', error);
        alert('Không thể tải danh sách giáo trình!');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchFaculties() {
      try {
        const response = await bookService.getAllFaculty();
        this.faculties = response || [];
      } catch (error) {
        console.error('Lỗi khi tải danh sách khoa:', error);
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    handleTextBookRowClick(textbook) {
      this.selectedTextBook = textbook;
      this.showTextBookDetailModal = true;
    },

    openAddTextBookModal() {
      this.isEditMode = false;
      this.resetTextBookForm();
      this.showTextBookModal = true;
    },

    openEditTextBookModal(textbook) {
      this.isEditMode = true;
      this.textbookForm = {
        _id: textbook._id,
        TenSach: textbook.TenSach,
        TacGia: textbook.TacGia,
        SoQuyen: textbook.SoQuyen,
        DonGia: textbook.DonGia,
        MoTaSach: textbook.MoTaSach || '',
        TenNXB: textbook.MaNXB?.TenNXB || '',
        NamXuatBan: textbook.NamXuatBan,
        DiaChiNXB: textbook.MaNXB?.DiaChi || '',
        TenKhoa: textbook.Khoa?.TenKhoa || '',
      };

      this.imagePreview = textbook.Image || null;
      this.imageFile = null;
      this.pdfUrl = textbook.Pdf || null;
      this.pdfPreview = textbook.Pdf ? textbook.TenSach + '.pdf' : null;
      this.pdfFile = null;

      this.originalTextBookData = {
        TenSach: textbook.TenSach,
        TacGia: textbook.TacGia,
        SoQuyen: textbook.SoQuyen,
        DonGia: textbook.DonGia,
        MoTaSach: textbook.MoTaSach || '',
        TenNXB: textbook.MaNXB?.TenNXB || '',
        NamXuatBan: textbook.NamXuatBan,
        DiaChiNXB: textbook.MaNXB?.DiaChi || '',
        TenKhoa: textbook.Khoa?.TenKhoa || '',
        imagePreview: textbook.Image || null,
        pdfPreview: textbook.Pdf || null,
      };

      this.showTextBookModal = true;
    },

    editTextBookFromDetail() {
      this.showTextBookDetailModal = false;
      this.openEditTextBookModal(this.selectedTextBook);
    },

    resetTextBookForm() {
      this.textbookForm = {
        _id: '',
        TenSach: '',
        TacGia: '',
        SoQuyen: null,
        DonGia: null,
        MoTaSach: '',
        TenNXB: '',
        NamXuatBan: null,
        DiaChiNXB: '',
        TenKhoa: '',
      };
      this.imageFile = null;
      this.imagePreview = null;
      this.pdfFile = null;
      this.pdfPreview = null;
      this.pdfUrl = null;
      this.originalTextBookData = {};

      const imageInput = document.getElementById('imageInput');
      if (imageInput) imageInput.value = null;

      const pdfInput = document.getElementById('pdfInput');
      if (pdfInput) pdfInput.value = null;
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
        if (file.type === 'application/pdf') {
          this.pdfFile = file;
          this.pdfUrl = URL.createObjectURL(file);
          this.pdfPreview = file.name;
        } else {
          alert('Vui lòng chọn file PDF hợp lệ.');
        }
      }
    },

    openPdfInNewTab(url) {
      if (url) {
        window.open(url, '_blank');
      }
    },

    async addTextBook() {
      const {
        TenSach,
        TacGia,
        SoQuyen,
        DonGia,
        TenNXB,
        NamXuatBan,
        DiaChiNXB,
        TenKhoa,
      } = this.textbookForm;

      if (
        !TenSach ||
        !TacGia ||
        !SoQuyen ||
        !DonGia ||
        !TenNXB ||
        !NamXuatBan ||
        !DiaChiNXB ||
        !TenKhoa ||
        !this.imageFile ||
        !this.pdfFile
      ) {
        alert('Vui lòng nhập đầy đủ tất cả các thông tin!');
        return;
      }

      try {
        this.isLoading = true;

        const formData = new FormData();
        formData.append('title', TenSach);
        formData.append('author', TacGia);
        formData.append('quantity', SoQuyen);
        formData.append('price', DonGia);
        formData.append('description', this.textbookForm.MoTaSach || '');
        formData.append('publisher', TenNXB);
        formData.append('publicationYear', NamXuatBan);
        formData.append('publisherAddress', DiaChiNXB);
        formData.append('faculty', TenKhoa);
        formData.append('image', this.imageFile);
        formData.append('pdfFile', this.pdfFile);

        await bookService.addTextBook(formData);
        alert('Thêm giáo trình thành công!');

        this.showTextBookModal = false;
        this.resetTextBookForm();
        await this.fetchTextBookList();
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || 'Không rõ lỗi';
        alert('Lỗi khi thêm giáo trình: ' + message);
      } finally {
        this.isLoading = false;
      }
    },

    async updateTextBook() {
      const changedFields = this.getChangedFields();

      if (Object.keys(changedFields).length === 0) {
        alert('Không có thay đổi nào để cập nhật.');
        return;
      }

      try {
        this.isLoading = true;

        const formData = new FormData();
        for (const key in changedFields) {
          formData.append(key, changedFields[key]);
        }

        await bookService.updateTextBook(this.textbookForm._id, formData);
        alert('Cập nhật giáo trình thành công!');

        this.showTextBookModal = false;
        this.resetTextBookForm();
        await this.fetchTextBookList();
      } catch (error) {
        console.error('Lỗi khi cập nhật giáo trình:', error);
        alert('Đã xảy ra lỗi khi cập nhật giáo trình.');
      } finally {
        this.isLoading = false;
      }
    },

    getChangedFields() {
      const changedFields = {};

      if (this.textbookForm.TenSach !== this.originalTextBookData.TenSach) {
        changedFields.TenSach = this.textbookForm.TenSach;
      }
      if (this.textbookForm.TacGia !== this.originalTextBookData.TacGia) {
        changedFields.TacGia = this.textbookForm.TacGia;
      }
      if (this.textbookForm.SoQuyen !== this.originalTextBookData.SoQuyen) {
        changedFields.SoQuyen = parseInt(this.textbookForm.SoQuyen);
      }
      if (this.textbookForm.DonGia !== this.originalTextBookData.DonGia) {
        changedFields.DonGia = parseFloat(this.textbookForm.DonGia);
      }
      if (this.textbookForm.MoTaSach !== this.originalTextBookData.MoTaSach) {
        changedFields.MoTaSach = this.textbookForm.MoTaSach;
      }

      const publisherChanged =
        this.textbookForm.TenNXB !== this.originalTextBookData.TenNXB;
      const addressChanged =
        this.textbookForm.DiaChiNXB !== this.originalTextBookData.DiaChiNXB;

      if (publisherChanged || addressChanged) {
        changedFields.TenNXB = this.textbookForm.TenNXB;
        changedFields.DiaChiNXB = this.textbookForm.DiaChiNXB;
      }

      if (this.textbookForm.NamXuatBan !== this.originalTextBookData.NamXuatBan) {
        changedFields.NamXuatBan = parseInt(this.textbookForm.NamXuatBan);
      }
      if (this.textbookForm.TenKhoa !== this.originalTextBookData.TenKhoa) {
        changedFields.TenKhoa = this.textbookForm.TenKhoa;
      }

      if (this.imageFile) {
        changedFields.image = this.imageFile;
      }

      if (this.pdfFile) {
        changedFields.pdfFile = this.pdfFile;
      }

      return changedFields;
    },

    async deleteTextBook(id) {
      if (confirm('Bạn có chắc chắn muốn xóa giáo trình này?')) {
        try {
          this.isLoading = true;
          await bookService.deleteBook(id);
          alert('Xóa giáo trình thành công!');
          await this.fetchTextBookList();
        } catch (error) {
          console.error('Lỗi khi xóa giáo trình:', error);
          alert('Có lỗi xảy ra khi xóa giáo trình.');
        } finally {
          this.isLoading = false;
        }
      }
    },

    async handleAddFaculty() {
      if (!this.newFacultyName.trim()) {
        alert('Vui lòng nhập tên khoa!');
        return;
      }

      try {
        this.isLoading = true;

        await bookService.addFaculty({
          Faculty: this.newFacultyName.trim(),
        });

        alert('Thêm khoa thành công!');

        await this.fetchFaculties();
        // Tự động chọn khoa vừa thêm
        this.textbookForm.TenKhoa = this.newFacultyName.trim();

        // Đóng modal và reset
        this.showAddFacultyModal = false;
        this.newFacultyName = '';
      } catch (error) {
        const message =
          error.response?.data?.message || 'Lỗi khi thêm khoa';
        alert(message);
      } finally {
        this.isLoading = false;
      }
    },
  },

  watch: {
    searchKeyword() {
      this.currentPage = 1;
    },
  },
};
</script>

<style scoped>
/* General Management TextBook Styles */
.management-textbook {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Utility Bar */
.management-textbook__util {
  max-width: 250px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.management-textbook__util-search {
  width: 400px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  font-size: 1.4rem;
}

.search-input:focus {
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

.search-button-textbook {
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

.search-button-textbook:hover {
  background: #1d6b5b;
  transform: scale(1.05);
}

/* Tab Navigation */
.management-textbook__tabs {
  display: flex;
  margin: 20px 0;
  border-bottom: 2px solid #e0e0e0;
}

.management-textbook__tab {
  padding: 12px 24px;
  cursor: pointer;
  color: #555;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-size: 1.6rem;
  font-weight: 500;
}

.management-textbook__tab.active {
  color: #16a085;
  border-bottom-color: #16a085;
  background-color: #f0f9f7;
}

/* Action Buttons */
.management-textbook-actions {
  margin: 20px 0;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.action-btn--add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.action-btn--add:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn--edit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  padding: 8px 12px;
}

.action-btn--edit:hover {
  background: linear-gradient(135deg, #3a8cd9 0%, #00d4e0 100%);
}

.action-btn--delete {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
  padding: 8px 12px;
  margin-left: 8px;
}

.action-btn--delete:hover {
  background: linear-gradient(135deg, #e63950 0%, #e8432b 100%);
}

.action-btn--cancel {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  color: #fff;
  padding: 10px 20px;
}

.action-btn--cancel:hover {
  background: linear-gradient(135deg, #a8aeb2 0%, #7f8c8d 100%);
}

.action-btn--save {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: #fff;
  padding: 10px 20px;
  margin-left: 10px;
}

.action-btn--save:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
}

.action-btn--close {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: #fff;
  padding: 10px 20px;
  margin-left: 10px;
}

.action-btn--close:hover {
  background: linear-gradient(135deg, #7f8c8d 0%, #6c7a7b 100%);
}

/* Table Styles */
.management-textbook__table {
  font-size: 1.6rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.management-textbook__table-header {
  padding: 12px;
  border-bottom: 2px solid #dfe2e6;
  background: linear-gradient(1deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  color: #fff;
  text-align: left;
}

.management-textbook__table-content {
  padding: 12px 15px;
  border-bottom: 1px solid #dfe2e6;
  vertical-align: middle;
}

.management-textbook__table tbody tr {
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.management-textbook__table tbody tr:hover {
  background-color: #f2f9f7;
}

.management-textbook__table-content-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

/* Pagination */
.management-textbook-pagination {
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
  font-size: 1.4rem;
}

.page-item:last-child .page-link {
  border-right: none;
}

.page-link:hover {
  background-color: #f2f2f2;
}

.page-item.active .page-link {
  background-color: #16a085;
  color: white;
  cursor: default;
}

.page-item.disabled .page-link {
  color: #aaa;
  background-color: #f9f9f9;
  cursor: not-allowed;
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

.modal-dialog-textbook {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-dialog--form {
  max-width: 600px;
}

.modal-dialog-faculty {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content {
  padding: 0;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
}

.modal-title {
  font-size: 2.2rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title i {
  color: #16a085;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2.8rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 25px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #dee2e6;
  text-align: right;
  background: #f8f9fa;
}

/* Modal Body - TextBook Detail */
.modal-body__textbook-detail {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.modal-body__textbook-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-image {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  color: #999;
  font-size: 1.6rem;
}

.modal-body__textbook-info p {
  margin-bottom: 12px;
  font-size: 1.5rem;
  line-height: 1.6;
}

.modal-body__textbook-info strong {
  color: #16a085;
  min-width: 150px;
  display: inline-block;
}

.pdf-link {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}

.pdf-link:hover {
  color: #0056b3;
}

/* TextBook Form */
.textbook-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.required {
  color: #ff416c;
}

.form-control {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

.form-control::placeholder {
  color: #999;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

/* Image Upload */
.image-upload-wrapper {
  width: 100%;
}

.image-upload-label {
  display: block;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-upload-label:hover {
  border-color: #16a085;
}

.image-preview {
  width: 100%;
  height: 250px;
  display: flex;
  justify-content: center;
}

.image-preview img {
  width: 30%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #999;
  gap: 10px;
}

.image-placeholder i {
  font-size: 4rem;
}

.image-placeholder span {
  font-size: 1.4rem;
}

/* Faculty Wrapper */
.faculty-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.faculty-wrapper .form-control {
  flex: 1;
}

.btn-add-faculty {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-faculty:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
  transform: scale(1.1);
}

/* PDF Upload */
.pdf-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pdf-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.4rem;
  color: #495057;
}

.pdf-upload-label:hover {
  background-color: #e9ecef;
  border-color: #16a085;
  color: #16a085;
}

.pdf-upload-label i {
  font-size: 1.6rem;
  color: #dc3545;
}

.pdf-preview {
  padding: 8px 12px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  font-size: 1.3rem;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pdf-preview:hover {
  background-color: #c3e6cb;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 60px;
  height: 60px;
}

/* Modal Fade Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #16a085 0%, #20c997 100%);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .management-textbook__util {
    flex-direction: column;
    gap: 15px;
  }

  .management-textbook__util-search {
    width: 100%;
  }

  .modal-body__textbook-detail {
    grid-template-columns: 1fr;
  }

  .modal-body__textbook-image img {
    height: 300px;
  }

  .management-textbook__table-content-ellipsis {
    max-width: 150px;
  }
}
</style>