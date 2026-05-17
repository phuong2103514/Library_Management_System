<template>
  <Header />

  <div class="book__library">
    <div class="container">
      <div class="book__library-list-wrapper">
        <div class="book__library-list">
          <div class="my-book__library-list-toolbar">
            <div class="my-book__library-list-toolbar-search">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm theo mã hoặc tên sách..."
                v-model="searchKeyword"
              />
            </div>

            <div class="my-book__library-list-toolbar-sort">
              <label for="sort">Lọc theo trạng thái:</label>
              <select id="sort" v-model="sortOption">
                <option value="all">Tất cả</option>
                <option value="favorite">Yêu thích</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đang mượn</option>
                <option value="returned">Đã trả</option>
                <option value="lost">Mất sách</option>
                <option value="denied">Bị từ chối</option>
              </select>
            </div>
          </div>

          <div class="book__library-list-book">
            <div class="row book__library-list-book-row">
              <div v-if="paginatedBooks.length === 0" class="no-books-message">
                {{ getNoDataMessage() }}
              </div>

              <div
                class="col-lg-3 col-md-4 col-sm-6 col-12 book__library-list-book-element-wrapper"
                v-for="book in paginatedBooks"
                :key="book._id"
              >
                <div class="book__library-list-book-element">
                  <div
                    v-if="isFavorite(book.MaSach._id)"
                    class="badge-favorite"
                  >
                    <span>❤️</span> Yêu thích
                  </div>

                  <div
                    class="book__library-list-book-element-image"
                    @click="goToBookDetail(book.MaSach._id)"
                  >
                    <img :src="book.MaSach.Image" alt="" />

                    <div class="home__book-action-icon">
                      <div
                        class="home__book-action-favorite-icon"
                        :class="{ favorite: isFavorite(book.MaSach._id) }"
                        @click.stop="toggleFavorite(book)"
                      >
                        <i class="fa-solid fa-heart"></i>
                      </div>

                      <div
                        class="home__book-action-shelf-icon"
                        :class="{ 'in-shelf': isInShelf(book.MaSach._id) }"
                        @click.stop="toggleShelf(book)"
                        title="Thêm vào tủ sách"
                      >
                        <i class="fa-solid fa-bookmark"></i>
                      </div>

                      <div
                        class="home__book-action-borrow-icon"
                        @click.stop="quickBorrow(book)"
                        title="Mượn nhanh"
                      >
                        <i class="fa-solid fa-book-medical"></i>
                      </div>
                    </div>
                  </div>

                  <div class="book__library-list-book-element-information">
                    <div
                      class="book__library-list-book-element-title"
                      @click="goToBookDetail(book.MaSach._id)"
                    >
                      {{ book.MaSach.TenSach }}
                    </div>

                    <div class="book__library-list-book-element-author">
                      {{ book.MaSach.TacGia }}
                    </div>

                    <div
                      class="book__library-list-book-element-quantity"
                      v-if="book.TrangThai !== 'not_borrowed'"
                    >
                      Số lượng: {{ book.SoLuong }}
                    </div>

                    <div
                      class="book__library-list-book-element-status"
                      :class="getStatusClass(book)"
                    >
                      {{ getStatusLabel(book) }}
                    </div>

                    <div
                      class="book__library-list-book-element-date"
                      v-if="book.NgayMuon && book.TrangThai !== 'not_borrowed'"
                    >
                      Ngày mượn: {{ formatDate(book.NgayMuon) }}
                    </div>

                    <div
                      class="book__library-list-book-element-return-date"
                      v-if="book.NgayTra && book.TrangThai !== 'not_borrowed'"
                    >
                      Hạn trả: {{ formatDate(book.NgayTra) }}
                    </div>

                    <div
                      class="book__library-list-book-element-actual-return-date"
                      v-if="
                        book.TrangThai === 'returned' && book.NgayGhiNhanTra
                      "
                    >
                      Ngày trả: {{ formatDate(book.NgayGhiNhanTra) }}
                    </div>

                    <div
                      class="book__library-list-book-element-condition"
                      v-if="
                        book.TrangThai === 'returned' &&
                        book.TinhTrangSach &&
                        book.TinhTrangSach !== 'Mất sách'
                      "
                    >
                      Tình trạng sách: {{ book.TinhTrangSach }}
                    </div>

                    <div
                      class="book__library-list-book-element-fine"
                      v-if="
                        book.TrangThai === 'returned' &&
                        (book.PhiBoiThuong > 0 || book.PhiQuaHan > 0)
                      "
                    >
                      Tiền phạt:
                      <span>{{
                        formatPrice(book.PhiBoiThuong + book.PhiQuaHan)
                      }}</span>
                    </div>

                    <div
                      class="book__library-list-book-element-extended"
                      v-if="book.DaGiaHan && book.TrangThai !== 'not_borrowed'"
                    >
                      <span class="extended-badge">Đã gia hạn</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="book__library-list-book-navigation-page"
              v-if="sortedBooks.length > 0"
            >
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="goToPage(1)"
                    >«</a
                  >
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
                  <a class="page-link" href="#" @click.prevent>{{
                    currentPage
                  }}</a>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages }"
                >
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="goToPage(currentPage + 1)"
                    >›</a
                  >
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages }"
                >
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="goToPage(totalPages)"
                    >»</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<script>
import '../assets/css/mybook.css';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

import { bookService } from '../services/book/book.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'MyBook',
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      books: [],
      currentPage: 1,
      pageSize: 12,
      sortOption: 'all',
      searchKeyword: '',
      favoriteBookIds: [],
      allFavoriteBooks: [],

      shelfBookIds: [],
    };
  },
  async mounted() {
    const pageFromURL = parseInt(this.$route.query.page);
    if (!isNaN(pageFromURL) && pageFromURL >= 1) {
      this.currentPage = pageFromURL;
    }

    try {
      const response = await bookService.getBorrowBookOfUser(userState._id);
      if (Array.isArray(response)) {
        this.books = response;
      }

      if (userState._id) {
        const favResponse = await bookService.getFavoriteBooks(userState._id);
        this.favoriteBookIds = Array.isArray(favResponse)
          ? favResponse.map((id) => id.toString())
          : [];

        if (this.favoriteBookIds.length > 0) {
          const favoriteDetailsPromises = this.favoriteBookIds.map((bookId) =>
            bookService.getBookById(bookId)
          );
          const favoriteDetails = await Promise.all(favoriteDetailsPromises);
          this.allFavoriteBooks = favoriteDetails.filter((book) => book);
        }

        const shelfResponse = await bookService.getAllBooksOnShelf(
          userState._id
        );
        this.shelfBookIds = Array.isArray(shelfResponse)
          ? shelfResponse.map((book) => book._id.toString())
          : [];
      }
    } catch (error) {
      alert('Lỗi khi lấy sách!');
    }
  },
  methods: {
    formatPrice(value) {
      if (typeof value !== 'number') return value;
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.$router.push({ query: { ...this.$route.query, page: page } });
      }
    },

    goToBookDetail(bookId) {
      this.$router.push({ name: 'DetailBook', params: { id: bookId } });
    },

    getStatusText(status) {
      const statusMap = {
        pending: 'Chờ duyệt',
        approved: 'Đang mượn',
        denied: 'Bị từ chối',
        returned: 'ĐẢ TRẢ',
        overdue: 'Quá hạn',
        not_borrowed: 'Chưa mượn',
      };
      return statusMap[status] || status;
    },

    getStatusLabel(book) {
      if (book.TrangThai === 'returned' && book.TinhTrangSach === 'Mất sách') {
        return 'Mất Sách';
      }
      return this.getStatusText(book.TrangThai);
    },

    getStatusClass(book) {
      if (book.TrangThai === 'returned' && book.TinhTrangSach === 'Mất sách') {
        return 'status-lost';
      }
      return 'status-' + book.TrangThai;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },

    async toggleFavorite(book) {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để thêm yêu thích');
          return;
        }

        const bookId = book.MaSach._id.toString();

        if (this.isFavorite(bookId)) {
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          await bookService.deleteFavoriteBook(data);
          this.favoriteBookIds = this.favoriteBookIds.filter(
            (id) => id.toString() !== bookId
          );
          alert('Đã bỏ yêu thích!');
        } else {
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          await bookService.addFavoriteBook(data);
          this.favoriteBookIds.push(bookId);
          alert('Đã thêm vào danh sách yêu thích!');
        }
      } catch (error) {
        console.error('Lỗi khi toggle yêu thích:', error);
        alert('Có lỗi xảy ra khi thay đổi yêu thích!');
      }
    },

    isFavorite(bookId) {
      if (!this.favoriteBookIds || !bookId) return false;
      const bid = bookId.toString();
      return this.favoriteBookIds.some((id) => id.toString() === bid);
    },

    getNoDataMessage() {
      if (this.searchKeyword.trim()) {
        return '📚 Tìm không thấy sách';
      }
      return '📚 Hiện tại không có dữ liệu';
    },

    isInShelf(bookId) {
      if (!this.shelfBookIds || !bookId) return false;
      const bid = bookId.toString();
      return this.shelfBookIds.some((id) => id.toString() === bid);
    },

    async toggleShelf(book) {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để sử dụng tủ sách');
          return;
        }

        const bookId = book.MaSach._id.toString();

        if (this.isInShelf(bookId)) {
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          await bookService.removeBookFromShelf(data);
          this.shelfBookIds = this.shelfBookIds.filter(
            (id) => id.toString() !== bookId
          );
          window.dispatchEvent(new Event('shelf-updated'));
          alert('Đã bỏ sách khỏi tủ!');
        } else {
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          try {
            const response = await bookService.addBookIntoShelf(data);

            if (response) {
              this.shelfBookIds.push(bookId);
              window.dispatchEvent(new Event('shelf-updated'));
              alert('Đã thêm vào tủ sách!');
            } else {
              alert('Sách đã có trong tủ rồi!');
            }
          } catch (error) {
            if (error.response && error.response.data.error === 'BOOK_IN_USE') {
              alert(error.response.data.message);
            } else {
              alert('Có lỗi xảy ra khi thêm vào tủ sách!');
            }
          }
        }
      } catch (error) {
        console.error('Lỗi khi thao tác với tủ sách:', error);
        alert('Có lỗi xảy ra!');
      }
    },

    async quickBorrow(book) {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để mượn sách');
          return;
        }

        const bookId = book.MaSach._id;

        if (book.MaSach.SoQuyen === 0) {
          alert('Sách đã hết!');
          return;
        }

        const currentStatus = book.TrangThai;
        if (currentStatus === 'pending') {
          alert('Bạn đã đăng ký mượn sách này rồi! Đang chờ duyệt.');
          return;
        }
        if (currentStatus === 'approved') {
          alert('Bạn đang mượn sách này rồi!');
          return;
        }
        if (currentStatus === 'overdue') {
          alert('Bạn có sách quá hạn! Vui lòng trả sách trước.');
          return;
        }

        const { libraryService } = await import(
          '../services/library/library.service'
        );
        const cardRes = await libraryService.getLibraryCard({
          MaDocGia: maDocGia,
        });
        const cardInfo = cardRes?.cardInfo;

        if (!cardInfo) {
          alert('Không tìm thấy thẻ thư viện của bạn!');
          return;
        }

        if (cardInfo.TrangThai === 'Hết hạn') {
          alert(
            'Thẻ thư viện của bạn đã hết hạn. Vui lòng gia hạn trước khi mượn sách!'
          );
          return;
        }

        const currentBorrow = await bookService.countCurrentBorrowing({
          MaDocGia: maDocGia,
        });

        const todayBorrow = await bookService.countCurrentBorrowingToday({
          MaDocGia: maDocGia,
        });

        const currentPending = await bookService.countCurrentPending({
          MaDocGia: maDocGia,
        });

        const todayPending = await bookService.countCurrentPendingToday({
          MaDocGia: maDocGia,
        });

        const quyDinh = await bookService.getBookBorrowRule();

        let MAX_TOTAL, MAX_DAILY;
        if (userState.userType === 'Giảng viên') {
          MAX_TOTAL = quyDinh?.maxBooksLecturer || 10;
          MAX_DAILY = quyDinh?.maxBooksPerDayLecturer || 5;
        } else {
          MAX_TOTAL = quyDinh?.maxBooks || 5;
          MAX_DAILY = quyDinh?.maxBooksPerDay || 3;
        }

        if (currentBorrow + 1 > MAX_TOTAL) {
          alert(
            `❌ Vượt quá giới hạn tổng số sách\n\n` +
              `• Đang mượn: ${currentBorrow} cuốn\n` +
              `• Giới hạn tối đa: ${MAX_TOTAL} cuốn\n\n` +
              `➡️ Bạn chỉ có thể mượn thêm ${MAX_TOTAL - currentBorrow} cuốn`
          );
          return;
        }

        if (todayBorrow + 1 > MAX_DAILY) {
          alert(
            `❌ Vượt quá giới hạn mượn trong ngày\n\n` +
              `• Hôm nay đã mượn: ${todayBorrow} cuốn\n` +
              `• Giới hạn mỗi ngày: ${MAX_DAILY} cuốn\n\n` +
              `➡️ Hôm nay bạn chỉ có thể mượn thêm ${
                MAX_DAILY - todayBorrow
              } cuốn`
          );
          return;
        }

        if (currentBorrow + currentPending + 1 > MAX_TOTAL) {
          const remaining = MAX_TOTAL - currentBorrow - currentPending;
          if (remaining > 0) {
            alert(
              `❌ Vượt quá giới hạn với sách chờ duyệt\n\n` +
                `• Đang mượn: ${currentBorrow} cuốn\n` +
                `• Đang chờ duyệt: ${currentPending} cuốn\n` +
                `• Giới hạn tối đa: ${MAX_TOTAL} cuốn\n\n` +
                `➡️ Bạn chỉ có thể đăng ký mượn thêm ${remaining} cuốn`
            );
          } else {
            alert(
              `❌ Không thể đăng ký mượn thêm\n\n` +
                `• Đang mượn: ${currentBorrow} cuốn\n` +
                `• Đang chờ duyệt: ${currentPending} cuốn\n` +
                `• Giới hạn tối đa: ${MAX_TOTAL} cuốn`
            );
          }
          return;
        }

        if (todayBorrow + todayPending + 1 > MAX_DAILY) {
          const remainingToday = MAX_DAILY - todayBorrow - todayPending;
          if (remainingToday > 0) {
            alert(
              `❌ Vượt quá giới hạn trong ngày\n\n` +
                `• Hôm nay đã mượn: ${todayBorrow} cuốn\n` +
                `• Hôm nay đang chờ duyệt: ${todayPending} cuốn\n` +
                `• Giới hạn mỗi ngày: ${MAX_DAILY} cuốn\n\n` +
                `➡️ Hôm nay bạn chỉ có thể đăng ký mượn thêm ${remainingToday} cuốn`
            );
          } else {
            alert(
              `❌ Hôm nay không thể đăng ký mượn thêm\n\n` +
                `• Hôm nay đã mượn: ${todayBorrow} cuốn\n` +
                `• Hôm nay đang chờ duyệt: ${todayPending} cuốn\n` +
                `• Giới hạn mỗi ngày: ${MAX_DAILY} cuốn`
            );
          }
          return;
        }

        const data = {
          MaSach: bookId,
          MaDocGia: maDocGia,
          SoLuongMuon: 1,
        };

        try {
          const result = await bookService.lendBook(data);

          if (!result.success) {
            if (result.error === 'BOOK_ALREADY_BORROWED') {
              const statusText = {
                pending: 'đang chờ duyệt',
                processing: 'đang xử lý',
                approved: 'đang mượn',
                overdue: 'quá hạn',
              };

              alert(
                `❌ Không thể mượn sách này!\n\n` +
                  `Bạn ${
                    statusText[result.currentStatus] || 'đang có yêu cầu với'
                  } cuốn sách này.\n` +
                  `Vui lòng trả sách hoặc chờ xử lý xong trước khi mượn lại.`
              );
            } else {
              alert('❌ ' + (result.message || 'Đăng ký mượn thất bại!'));
            }
            return;
          }

          alert(
            '✅ Đăng ký mượn sách thành công!\n\nVui lòng chờ thư viện duyệt yêu cầu.'
          );

          const response = await bookService.getBorrowBookOfUser(userState._id);
          if (Array.isArray(response)) {
            this.books = response;
          }

          const shelfResponse = await bookService.getAllBooksOnShelf(
            userState._id
          );
          this.shelfBookIds = Array.isArray(shelfResponse)
            ? shelfResponse.map((book) => book._id.toString())
            : [];

          window.dispatchEvent(new Event('shelf-updated'));
        } catch (apiError) {
          if (
            apiError.response &&
            apiError.response.data.error === 'BOOK_ALREADY_BORROWED'
          ) {
            const statusText = {
              pending: 'đang chờ duyệt',
              processing: 'đang xử lý',
              approved: 'đang mượn',
              overdue: 'quá hạn',
            };

            alert(
              `❌ Không thể mượn sách này!\n\n` +
                `Bạn ${
                  statusText[apiError.response.data.currentStatus] ||
                  'đang có yêu cầu với'
                } cuốn sách này.\n` +
                `Vui lòng trả sách hoặc chờ xử lý xong trước khi mượn lại.`
            );
          } else {
            alert('❌ Đã xảy ra lỗi khi đăng ký mượn sách!');
          }
        }
      } catch (error) {
        console.error('Lỗi khi mượn nhanh:', error);
        alert('❌ Đã xảy ra lỗi khi đăng ký mượn sách!');
      }
    },
  },
  computed: {
    filteredBooks() {
      let result = this.books;

      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase().trim();
        result = result.filter((book) => {
          const tenSach = book.MaSach.TenSach.toLowerCase();
          const maSach = book.MaSach.MaSach.toLowerCase();
          return tenSach.includes(keyword) || maSach.includes(keyword);
        });
      }

      return result;
    },

    sortedBooks() {
      let filtered = this.filteredBooks;

      if (this.sortOption === 'all' || this.sortOption === 'favorite') {
        const unborrowedFavorites = this.allFavoriteBooks
          .filter(
            (favBook) =>
              !this.books.some(
                (borrowedBook) =>
                  borrowedBook.MaSach._id.toString() === favBook._id.toString()
              )
          )
          .map((favBook) => ({
            _id: `fav_${favBook._id}`,
            MaSach: favBook,
            TrangThai: 'not_borrowed',
            SoLuong: 0,
            NgayMuon: null,
            NgayTra: null,
            DaGiaHan: false,
          }));

        if (this.sortOption === 'favorite') {
          const borrowedFavorites = filtered.filter((book) =>
            this.isFavorite(book.MaSach._id)
          );
          filtered = [...borrowedFavorites, ...unborrowedFavorites];
        } else {
          filtered = [...filtered, ...unborrowedFavorites];
        }
      } else if (
        this.sortOption !== 'all' &&
        !['new', 'title'].includes(this.sortOption)
      ) {
        if (this.sortOption === 'lost') {
          filtered = filtered.filter(
            (book) => book.TinhTrangSach === 'Mất sách'
          );
        } else {
          if (this.sortOption === 'returned') {
            filtered = filtered.filter(
              (book) =>
                book.TrangThai === 'returned' &&
                book.TinhTrangSach !== 'Mất sách'
            );
          } else {
            filtered = filtered.filter(
              (book) => book.TrangThai === this.sortOption
            );
          }
        }
      }

      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase().trim();
        filtered = filtered.filter((book) => {
          const tenSach = book.MaSach.TenSach.toLowerCase();
          const maSach = book.MaSach.MaSach.toLowerCase();
          return tenSach.includes(keyword) || maSach.includes(keyword);
        });
      }

      if (this.sortOption === 'new') {
        return [...filtered].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      } else if (this.sortOption === 'title') {
        return [...filtered].sort((a, b) =>
          a.MaSach.TenSach.localeCompare(b.MaSach.TenSach, 'vi', {
            sensitivity: 'base',
          })
        );
      }

      return filtered;
    },

    paginatedBooks() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedBooks.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.sortedBooks.length / this.pageSize);
    },
  },
  watch: {
    '$route.query.page'(newPage) {
      const page = parseInt(newPage);
      if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    sortOption() {
      this.goToPage(1);
    },

    searchKeyword() {
      this.goToPage(1);
    },
  },

  beforeRouteEnter(to, from, next) {
    next(() => {
      window.scrollTo(0, 0);
    });
  },
};
</script>