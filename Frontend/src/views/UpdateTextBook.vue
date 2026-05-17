<template>
  <div class="detailbook container">
    <div class="wrapper-search">
      <div class="book__library-list-toolbar-search">
        <span class="search-icon">
          <i class="fas fa-search"></i>
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm giáo trình..."
          ref="searchInput"
        />
      </div>
      <button class="search-button" @click="handleSearch">Tìm kiếm</button>
    </div>

    <div class="row">
      <div class="col-lg-6">
        <div class="detailbook__image-book">
          <div class="detailbook__image-book-input-wrapper">
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              @change="onFileChange"
              style="display: none"
            />
            <label
              for="fileInput"
              class="camera-label"
              :style="{
                pointerEvents: isBookLoaded ? 'auto' : 'none',
                opacity: isBookLoaded ? 1 : 0.5,
              }"
            >
              <div class="camera-icon">
                <i class="fas fa-camera"></i>
              </div>
            </label>
          </div>
          <img v-if="imagePreview" :src="imagePreview" alt="Preview" />
        </div>
      </div>

      <div class="col-lg-6">
        <div class="detailbook__information-book">
          <div class="detailbook__information-book-header">
            <div>
              <span class="title">Mã sách: </span>
              <input
                type="text"
                class="detailbook__information-book-title"
                v-model="bookCode"
                disabled
              />
            </div>

            <span class="title">Tên giáo trình: </span>
            <input
              type="text"
              class="detailbook__information-book-title"
              v-model="bookTitle"
              :disabled="!isBookLoaded"
            />
            <div class="detailbook__information-book-header-wrapper">
              <div class="detailbook__information-book-author">
                <span class="title">Tác giả: </span>
                <input
                  type="text"
                  v-model="bookAuthor"
                  :disabled="!isBookLoaded"
                />
              </div>

              <div class="detailbook__information-book-quantity-wrapper">
                <div class="detailbook__information-book-quantity-title">
                  <span class="title">Số quyển: </span>
                  <input
                    type="text"
                    v-model="bookQuantity"
                    :disabled="!isBookLoaded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="detailbook__information-book-price-and-info">
            <span class="title">Giá giáo trình (VD: 50000 = 50.000đ): </span>
            <input type="text" v-model="bookPrice" :disabled="!isBookLoaded" />

            <span class="title">Mô tả giáo trình: </span>
            <textarea
              class="detailbook__information-book-description"
              rows="4"
              v-model="bookDescription"
              :disabled="!isBookLoaded"
            ></textarea>

            <span class="title">File PDF giáo trình: </span>
            <div class="detailbook__pdf-upload-wrapper">
              <input
                type="file"
                id="pdfInput"
                accept=".pdf"
                @change="onPdfFileChange"
                :disabled="!isBookLoaded"
                style="display: none"
              />
              <label
                for="pdfInput"
                class="pdf-upload-label"
                :style="{
                  pointerEvents: isBookLoaded ? 'auto' : 'none',
                  opacity: isBookLoaded ? 1 : 0.5,
                }"
              >
                <i class="fas fa-file-pdf"></i>
                Chọn file PDF
              </label>
              <span
                v-if="pdfPreview"
                class="pdf-preview"
                @click="openPdfInNewTab"
                >{{ pdfPreview }}</span
              >
            </div>
          </div>

          <div class="detailbook__information-book-publishing">
            <div class="detailbook__information-book-publishing-title">
              Nhà xuất bản:
            </div>
            <input
              type="text"
              class="detailbook__information-book-publishing-content"
              v-model="bookPublisher"
              :disabled="!isBookLoaded"
            />

            <div class="detailbook__information-book-publishing-title">
              Năm xuất bản:
            </div>
            <input
              type="text"
              class="detailbook__information-book-publishing-content"
              v-model="bookPublishYear"
              :disabled="!isBookLoaded"
            />

            <div class="detailbook__information-book-publishing-title">
              Địa chỉ xuất bản:
            </div>
            <input
              type="text"
              class="detailbook__information-book-publishing-content"
              v-model="bookPublisherAddress"
              :disabled="!isBookLoaded"
            />

            <div class="detailbook__information-book-publishing-title">
              Khoa:
            </div>
            <select
              v-model="faculty"
              name="faculty"
              required
              :disabled="!isBookLoaded"
              class="detailbook__information-book-publishing-content"
            >
              <option disabled value="">-- Chọn khoa --</option>
              <option
                v-for="fac in faculties"
                :key="fac._id"
                :value="fac.TenKhoa"
              >
                {{ fac.TenKhoa }}
              </option>
            </select>
          </div>

          <div class="detailbook__information-book-button">
            <button
              type="button"
              class="detailbook__information-textbook-btn"
              @click="updateTextBook"
              :disabled="!isBookLoaded"
            >
              Cập nhật giáo trình
            </button>

            <button
              type="button"
              class="detailbook__information-book-btn delete-btn"
              @click="deleteTextBook"
              :disabled="!isBookLoaded"
            >
              Xóa giáo trình
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

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
import loadingGif from '/image/loading.gif';

export default {
  name: 'UpdateTextBook',
  data() {
    return {
      imageFile: null,
      imagePreview: null,
      pdfFile: null,
      pdfPreview: null,
      pdfUrl: null,
      faculty: '',
      bookId: '',
      bookCode: '',
      bookTitle: '',
      bookAuthor: '',
      bookQuantity: '',
      bookPrice: '',
      bookDescription: '',
      bookPublisher: '',
      bookPublishYear: '',
      bookPublisherAddress: '',
      originalBookData: {
        pdfPreview: '',
      },
      isBookLoaded: false,
      isLoading: false,
      loadingGif,
      faculties: [],
    };
  },
  mounted() {
    this.fetchFaculties();
  },
  methods: {
    async fetchFaculties() {
      try {
        const response = await bookService.getAllFaculty();
        this.faculties = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách khoa:', error);
      }
    },

    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },

    onPdfFileChange(event) {
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

    async handleSearch() {
      const keyword = this.$refs.searchInput.value.trim();
      if (!keyword) {
        alert('Vui lòng nhập từ khóa tìm kiếm.');
        return;
      }

      try {
        const book = await bookService.getOneTextBook(keyword);
        if (book) {
          this.bookId = book._id;
          this.bookCode = book.MaSach;
          this.bookTitle = book.TenSach;
          this.bookAuthor = book.TacGia;
          this.bookQuantity = book.SoQuyen.toString();
          this.bookPrice = book.DonGia.toString();
          this.bookDescription = book.MoTaSach;
          this.bookPublisher = book.MaNXB?.TenNXB || '';
          this.bookPublisherAddress = book.MaNXB?.DiaChi || '';
          this.bookPublishYear = book.NamXuatBan?.toString() || '';
          this.faculty = book.Khoa?.TenKhoa || '';
          this.imagePreview = book.Image || '';
          this.imageFile = null;
          this.pdfUrl = book.Pdf || '';
          this.pdfPreview = book.Pdf ? this.bookTitle + '.pdf' : '';
          this.pdfFile = null;

          this.originalBookData = {
            bookCode: book.MaSach,
            bookTitle: book.TenSach,
            bookAuthor: book.TacGia,
            bookQuantity: book.SoQuyen.toString(),
            bookPrice: book.DonGia.toString(),
            bookDescription: book.MoTaSach,
            bookPublisher: book.MaNXB?.TenNXB || '',
            bookPublisherAddress: book.MaNXB?.DiaChi || '',
            bookPublishYear: book.NamXuatBan?.toString() || '',
            faculty: book.Khoa?.TenKhoa || '',
            imagePreview: book.Image || '',
            pdfPreview: book.Pdf || '',
          };

          this.isBookLoaded = true;
        } else {
          alert('Không tìm thấy giáo trình nào.');
        }
      } catch (error) {
        console.error('Lỗi khi tìm giáo trình:', error);
        alert('Đã xảy ra lỗi khi tìm giáo trình.');
      }
    },

    getChangedFields() {
      const changedFields = {};

      if (this.bookTitle !== this.originalBookData.bookTitle) {
        changedFields.TenSach = this.bookTitle;
      }
      if (this.bookAuthor !== this.originalBookData.bookAuthor) {
        changedFields.TacGia = this.bookAuthor;
      }
      if (this.bookQuantity !== this.originalBookData.bookQuantity) {
        changedFields.SoQuyen = parseInt(this.bookQuantity);
      }
      if (this.bookPrice !== this.originalBookData.bookPrice) {
        changedFields.DonGia = parseFloat(this.bookPrice);
      }
      if (this.bookDescription !== this.originalBookData.bookDescription) {
        changedFields.MoTaSach = this.bookDescription;
      }

      const publisherChanged =
        this.bookPublisher !== this.originalBookData.bookPublisher;
      const addressChanged =
        this.bookPublisherAddress !==
        this.originalBookData.bookPublisherAddress;

      if (publisherChanged || addressChanged) {
        changedFields.TenNXB = this.bookPublisher;
        changedFields.DiaChiNXB = this.bookPublisherAddress;
      }

      if (this.bookPublishYear !== this.originalBookData.bookPublishYear) {
        changedFields.NamXuatBan = parseInt(this.bookPublishYear);
      }
      if (this.faculty !== this.originalBookData.faculty) {
        changedFields.TenKhoa = this.faculty;
      }

      if (this.imageFile) {
        changedFields.image = this.imageFile;
      }

      if (this.pdfFile) {
        changedFields.pdfFile = this.pdfFile;
      }

      return changedFields;
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

        await bookService.updateTextBook(this.bookId, formData);
        alert('Cập nhật giáo trình thành công.');

        this.originalBookData = {
          bookCode: this.bookCode,
          bookTitle: this.bookTitle,
          bookAuthor: this.bookAuthor,
          bookQuantity: this.bookQuantity,
          bookPrice: this.bookPrice,
          bookDescription: this.bookDescription,
          bookPublisher: this.bookPublisher,
          bookPublisherAddress: this.bookPublisherAddress,
          bookPublishYear: this.bookPublishYear,
          faculty: this.faculty,
          imagePreview: this.imagePreview,
          pdfPreview: this.pdfPreview,
        };

        this.imageFile = null;
        this.pdfFile = null;
      } catch (error) {
        console.error('Lỗi khi cập nhật giáo trình:', error);
        alert('Đã xảy ra lỗi khi cập nhật giáo trình.');
      } finally {
        this.isLoading = false;
      }
    },

    openPdfInNewTab() {
      if (this.pdfFile) {
        const fileUrl = URL.createObjectURL(this.pdfFile);
        window.open(fileUrl, '_blank');
        setTimeout(() => {
          URL.revokeObjectURL(fileUrl);
        }, 1000);
      } else if (this.pdfUrl) {
        window.open(this.pdfUrl, '_blank');
      }
    },

    resetForm() {
      this.bookId = '';
      this.bookCode = '';
      this.bookTitle = '';
      this.bookAuthor = '';
      this.bookQuantity = '';
      this.bookPrice = '';
      this.bookDescription = '';
      this.bookPublisher = '';
      this.bookPublisherAddress = '';
      this.bookPublishYear = '';
      this.faculty = '';
      this.imagePreview = null;
      this.pdfPreview = null;
      this.imageFile = null;
      this.pdfFile = null;
      this.pdfUrl = null;
      this.isBookLoaded = false;
    },

    async deleteTextBook() {
      if (
        !confirm(`Bạn có chắc chắn muốn xóa giáo trình "${this.bookTitle}"?`)
      ) {
        return;
      }

      try {
        this.isLoading = true;

        await bookService.deleteBook(this.bookId);
        alert('Xóa giáo trình thành công.');

        this.resetForm();
      } catch (error) {
        console.error('Lỗi khi xóa giáo trình:', error);
        alert('Đã xảy ra lỗi khi xóa giáo trình.');
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.detailbook {
  margin-bottom: 40px;
}

.detailbook__image-book {
  position: relative;
  width: 100%;
  height: 140vh;
  border-radius: 15px;
  padding: 30px;
  border: 1px solid #e6e6e6;
}

.detailbook__image-book img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detailbook__information-book {
  width: 100%;
  height: 140vh;
  border-radius: 15px;
  padding: 30px;
  border: 1px solid #e6e6e6;
  font-weight: 400;
  font-size: 1.3rem;
}

.detailbook__information-book-title {
  font-size: 3.6rem;
  font-weight: 600;
}

.detailbook__information-book-header {
  padding-bottom: 15px;
  margin-bottom: 23px;
  border-bottom: 1px solid #e6e6e6;
}

.detailbook__information-book-header-wrapper {
  display: flex;
  align-items: center;
  gap: 25px;
}

.detailbook__information-book-author {
  border-right: 1px solid #e6e6e6;
  padding-right: 25px;
}

.detailbook__information-book-star-wrapper {
  display: flex;
  gap: 5px;
  align-items: center;
  border-right: 1px solid #e6e6e6;
  padding-right: 25px;
}

.detailbook__information-book-star-wrapper .rating {
  position: relative;
  top: -1px;
}

.detailbook__information-book-header-wrapper .title {
  color: rgba(0, 0, 0, 0.8);
}

.detailbook__information-book-header-wrapper .content:hover {
  cursor: pointer;
  color: #f55c4e;
}

.detailbook__information-book-star-wrapper .number-start {
  font-weight: bold;
}

.detailbook__information-book-price {
  font-size: 2rem;
  color: #f55c4e;
  font-weight: bold;
  margin-bottom: 15px;
}

.detailbook__information-book-description {
  font-size: 1.4rem;
  padding-bottom: 25px;
  border-bottom: 1px solid #e6e6e6;
}

.detailbook__information-book-publishing {
  margin-top: 25px;
  margin-bottom: 38px;
  display: grid;
  grid-template-columns: 130px 1fr;
  row-gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.detailbook__information-book-publishing-title {
  color: rgba(0, 0, 0, 0.8);
}

.detailbook__information-textbook-btn {
  height: 52px;
  width: 190px;
  padding: 17px 32px;
  background-color: #f65d4e;
  color: #fff;
  border-radius: 50px;
  font-size: 1.4rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detailbook__information-textbook-btn:hover {
  background-color: #e63727;
}

.detailbook__information-book-btn {
  height: 52px;
  width: 176px;
  padding: 17px 32px;
  background-color: #f65d4e;
  color: #fff;
  border-radius: 50px;
  font-size: 1.4rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detailbook__information-book-btn:hover {
  background-color: #e63727;
}

.detailbook__information-book-button {
  display: flex;
  align-items: center;
  gap: 35px;
}

.detailbook__information-book-btn-favorite-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detailbook__information-book-btn-favorite-wrapper i {
  font-size: 1.9rem;
  color: #ccc;
}

.detailbook__information-book-btn-favorite-wrapper:hover i {
  color: red;
}

.detailbook__information-book-btn-favorite-wrapper:hover {
  cursor: pointer;
}

.detailbook__relate-book {
  margin-top: 32px;
}

.detailbook__relate-book-header {
  font-size: 3.6rem;
  font-weight: bold;
  margin-bottom: 35px;
}

.detailbook__relate-book-image img {
  height: 500px;
  object-fit: cover;
}

.detailbook input,
.detailbook textarea,
.detailbook select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1.3rem;
  margin-bottom: 10px;
  font-family: inherit;
}

.detailbook textarea {
  resize: none;
  max-height: 80px;
}

.detailbook__information-book-publishing-title {
  display: flex;
  align-items: center;
}

.detailbook__information-book-publishing-content {
  margin-bottom: 0;
}

.detailbook__information-book-publishing input,
.detailbook__information-book-publishing select {
  margin-bottom: 0;
}

.detailbook__image-book-input-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.camera-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-icon {
  background-color: #000;
  color: white;
  border-radius: 50%;
  padding: 10px;
  font-size: 18px;
  transition: background-color 0.3s ease, transform 0.3s ease;
  height: 38px;
  width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-icon:hover {
  background-color: #111;
  transform: scale(1.1);
}

.wrapper-search {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.book__library-list-toolbar-search {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.book__library-list-toolbar-search input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ccc;
  border-radius: 36px;
  font-size: 15px;
  line-height: 1.5;
  box-sizing: border-box;
}

.book__library-list-toolbar-search .search-icon {
  position: absolute;
  left: 14px;
  top: 42%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #888;
  pointer-events: none;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button {
  padding: 10px 20px;
  background-color: #f55c4e;
  color: white;
  border: none;
  border-radius: 36px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: 10px;
  height: 42px;
  position: relative;
  top: -5px;
}

.search-button:hover {
  background-color: #d74a3f;
}

.detailbook__information-book-btn[disabled] {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  border: 1px solid #aaa;
  opacity: 0.8;
}

.detailbook__pdf-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.pdf-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #495057;
}

.pdf-upload-label:hover {
  background-color: #e9ecef;
  border-color: #007bff;
  color: #007bff;
}

.pdf-upload-label i {
  font-size: 16px;
  color: #dc3545;
}

.pdf-preview {
  padding: 8px 12px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  font-size: 13px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pdf-preview:hover {
  background-color: #c3e6cb;
}
</style>
