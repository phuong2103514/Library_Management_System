<template>
  <div class="detailbook container">
    <div class="wrapper-search">
      <div class="book__library-list-toolbar-search">
        <span class="search-icon">
          <i class="fas fa-search"></i>
        </span>
        <input type="text" placeholder="Tìm kiếm sách..." ref="searchInput" />
      </div>
      <button class="search-button" @click="handleSearch">Tìm kiếm</button>
    </div>

    <div class="row">
      <div class="col-lg-6">
        <div class="detailbook__image-book">
          <img v-if="imagePreview" :src="imagePreview" alt="Book Image" />
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

            <span class="title">Tên sách: </span>
            <input
              type="text"
              class="detailbook__information-book-title"
              v-model="bookTitle"
              disabled
            />
            <div class="detailbook__information-book-header-wrapper">
              <div class="detailbook__information-book-author">
                <span class="title">Tác giả: </span>
                <input type="text" v-model="bookAuthor" disabled />
              </div>

              <div class="detailbook__information-book-quantity-wrapper">
                <div class="detailbook__information-book-quantity-title">
                  <span class="title">Số quyển: </span>
                  <input type="text" v-model="bookQuantity" disabled />
                </div>
              </div>
            </div>
          </div>

          <div class="detailbook__information-book-price-and-info">
            <span class="title">Giá sách (VD: 50000 = 50.000đ): </span>
            <input type="text" v-model="bookPrice" disabled />

            <span class="title">Mô tả sách: </span>
            <textarea
              class="detailbook__information-book-description"
              rows="4"
              v-model="bookDescription"
              disabled
            ></textarea>
          </div>

          <div class="detailbook__information-book-publishing">
            <div class="detailbook__information-book-publishing-title">
              Nhà xuất bản:
            </div>
            <input
              type="text"
              class="detailbook__information-book-publishing-content"
              v-model="bookPublisher"
              disabled
            />

            <div class="detailbook__information-book-publishing-title">
              Năm xuất bản:
            </div>
            <input
              type="text"
              class="detailbook__information-book-publishing-content"
              v-model="bookPublishYear"
              disabled
            />

            <div class="detailbook__information-book-publishing-title">
              Địa chỉ xuất bản:
            </div>
            <input
              type="text"
              class="detailbook__information-book-publishing-content"
              v-model="bookPublisherAddress"
              disabled
            />

            <div class="detailbook__information-book-publishing-title">
              Thể loại:
            </div>
            <select v-model="selectedGenre" name="genre" required disabled>
              <option disabled value="">-- Chọn thể loại --</option>
              <option
                v-for="genre in genres"
                :key="genre._id"
                :value="genre.TenTheLoai"
              >
                {{ genre.TenTheLoai }}
              </option>
            </select>
          </div>

          <div class="detailbook__information-book-button">
            <button
              type="button"
              class="detailbook__information-book-btn btn-danger"
              @click="deleteBook"
              :disabled="!isBookLoaded"
            >
              Xóa Sách
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading overlay -->
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
import '../assets/css/deleteBook.css';

import { bookService } from '../services/book/book.service';
import loadingGif from '/image/loading.gif';

export default {
  name: 'DeleteBook',
  data() {
    return {
      imagePreview: null,
      genres: [],
      selectedGenre: '',
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
      isBookLoaded: false,
      isLoading: false,
      loadingGif,
    };
  },
  mounted() {
    this.fetchGenres();
  },
  methods: {
    async fetchGenres() {
      try {
        const response = await bookService.getAllGenre();
        this.genres = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách thể loại:', error);
      }
    },

    async handleSearch() {
      const keyword = this.$refs.searchInput.value.trim();
      if (!keyword) {
        alert('Vui lòng nhập từ khóa tìm kiếm.');
        return;
      }

      try {
        this.isLoading = true;

        const book = await bookService.getOneBook(keyword);
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
          this.selectedGenre = book.MaTheLoai?.TenTheLoai || '';
          this.imagePreview = book.Image || '';

          this.isBookLoaded = true;
        } else {
          alert('Không tìm thấy sách nào.');
        }
      } catch (error) {
        console.error('Lỗi khi tìm sách:', error);
        alert('Đã xảy ra lỗi khi tìm sách.');
      } finally {
        this.isLoading = false;
      }
    },

    async deleteBook() {
      if (!confirm(`Bạn có chắc chắn muốn xóa sách "${this.bookTitle}"?`)) {
        return;
      }

      try {
        this.isLoading = true;

        await bookService.deleteBook(this.bookId);
        alert('Xóa sách thành công.');

        // Reset form sau khi xóa thành công
        this.resetForm();
      } catch (error) {
        console.error('Lỗi khi xóa sách:', error);
        alert('Đã xảy ra lỗi khi xóa sách.');
      } finally {
        this.isLoading = false;
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
      this.bookPublishYear = '';
      this.bookPublisherAddress = '';
      this.selectedGenre = '';
      this.imagePreview = null;
      this.isBookLoaded = false;
      this.$refs.searchInput.value = '';
    },
  },
};
</script>
