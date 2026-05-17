<template>
  <Header />

  <div class="my-shelf container">
    <div class="my-shelf__header">
      <div class="my-shelf__header-title">
        <i class="fa-solid fa-book-bookmark"></i>
        Tủ Sách Của Tôi
      </div>
      <div class="my-shelf__header-subtitle">
        Chọn những cuốn sách bạn muốn mượn và đăng ký cùng lúc
      </div>

      <!-- Hiển thị quy định -->
      <div class="my-shelf__rules" v-if="booksOnShelf.length > 0">
        <div class="my-shelf__rules-item">
          <i class="fa-solid fa-circle-info"></i>
          <span
            >Tối đa <strong>{{ maxBooksAllowed }}</strong> cuốn/lần</span
          >
        </div>
        <div class="my-shelf__rules-item">
          <i class="fa-solid fa-calendar-day"></i>
          <span
            >Tối đa <strong>{{ maxBooksPerDay }}</strong> cuốn/ngày</span
          >
        </div>
        <div class="my-shelf__rules-item">
          <i class="fa-solid fa-book-open"></i>
          <span
            >Đang mượn: <strong>{{ currentBorrowing }}</strong> cuốn</span
          >
        </div>
        <div class="my-shelf__rules-item">
          <i class="fa-solid fa-clock"></i>
          <span
            >Chờ duyệt: <strong>{{ currentPending }}</strong> cuốn</span
          >
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="booksOnShelf.length === 0" class="my-shelf__empty">
      <div class="my-shelf__empty-icon">
        <i class="fa-solid fa-book-open"></i>
      </div>
      <div class="my-shelf__empty-title">Tủ sách của bạn đang trống</div>
      <div class="my-shelf__empty-subtitle">
        Hãy thêm sách vào tủ để đăng ký mượn nhé!
      </div>
      <button class="my-shelf__empty-btn" @click="goToLibrary">
        <i class="fa-solid fa-magnifying-glass"></i>
        Khám phá thư viện
      </button>
    </div>

    <!-- Books List -->
    <div v-else class="my-shelf__content">
      <div class="my-shelf__toolbar">
        <div class="my-shelf__toolbar-left">
          <label class="my-shelf__checkbox-all">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <span class="my-shelf__checkbox-label">
              Chọn tất cả ({{ totalBooks }} cuốn)
            </span>
          </label>
        </div>

        <div class="my-shelf__toolbar-right">
          <button
            class="my-shelf__btn my-shelf__btn--delete"
            :disabled="selectedBooks.length === 0"
            @click="removeSelectedFromShelf"
          >
            <i class="fa-solid fa-trash"></i>
            Xóa đã chọn ({{ selectedBooks.length }})
          </button>
        </div>
      </div>

      <div class="my-shelf__list">
        <div
          v-for="book in paginatedBooks"
          :key="book._id"
          class="my-shelf__item"
          :class="{ 'my-shelf__item--selected': isSelected(book._id) }"
        >
          <div class="my-shelf__item-checkbox">
            <input
              type="checkbox"
              :checked="isSelected(book._id)"
              @change="toggleSelectBook(book._id)"
            />
          </div>

          <div class="my-shelf__item-image" @click="goToBookDetail(book._id)">
            <img :src="book.Image" :alt="book.TenSach" />
          </div>

          <div class="my-shelf__item-info">
            <div class="my-shelf__item-title" @click="goToBookDetail(book._id)">
              {{ book.TenSach }}
            </div>
            <div class="my-shelf__item-author">
              <i class="fa-solid fa-user"></i>
              {{ book.TacGia }}
            </div>
            <div class="my-shelf__item-meta">
              <span class="my-shelf__item-genre">
                <i class="fa-solid fa-tag"></i>
                {{
                  book.LoaiSach === 'GiaoTrinh'
                    ? book.Khoa?.TenKhoa || 'N/A'
                    : book.MaTheLoai?.TenTheLoai || 'N/A'
                }}
              </span>
              <span class="my-shelf__item-year">
                <i class="fa-solid fa-calendar"></i>
                {{ book.NamXuatBan }}
              </span>
            </div>
            <div class="my-shelf__item-stock">
              <i class="fa-solid fa-circle-check" v-if="book.SoQuyen > 0"></i>
              <i class="fa-solid fa-circle-xmark" v-else></i>
              <span :class="{ 'out-of-stock': book.SoQuyen === 0 }">
                {{
                  book.SoQuyen > 0 ? `Còn ${book.SoQuyen} quyển` : 'Hết sách'
                }}
              </span>
            </div>
          </div>

          <div class="my-shelf__item-actions">
            <button
              class="my-shelf__item-btn my-shelf__item-btn--remove"
              @click="removeFromShelf(book._id)"
              title="Xóa khỏi tủ"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="my-shelf__pagination" v-if="totalPages > 1">
        <button
          class="my-shelf__pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          <i class="fa-solid fa-angles-left"></i>
        </button>
        <button
          class="my-shelf__pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <i class="fa-solid fa-angle-left"></i>
        </button>

        <div class="my-shelf__pagination-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </div>

        <button
          class="my-shelf__pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <i class="fa-solid fa-angle-right"></i>
        </button>
        <button
          class="my-shelf__pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </div>

      <!-- Summary Panel -->
      <div class="my-shelf__summary" v-if="selectedBooks.length > 0">
        <div class="my-shelf__summary-content">
          <div class="my-shelf__summary-info">
            <div class="my-shelf__summary-count">
              <i class="fa-solid fa-check-double"></i>
              Đã chọn: <strong>{{ selectedBooks.length }}</strong> cuốn sách
            </div>
            <div class="my-shelf__summary-note">
              <i class="fa-solid fa-circle-info"></i>
              Còn lại: <strong>{{ remainingSlots }}</strong> cuốn có thể mượn
            </div>
          </div>

          <button
            class="my-shelf__summary-btn"
            :disabled="selectedBooks.length === 0 || isProcessing"
            @click="handleBorrowBooks"
          >
            <i class="fa-solid fa-paper-plane"></i>
            {{ isProcessing ? 'Đang xử lý...' : 'Đăng ký mượn' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<script>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { bookService } from '../services/book/book.service';
import { libraryService } from '../services/library/library.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'MyShelf',
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      booksOnShelf: [],
      selectedBooks: [],
      isProcessing: false,
      maxBooksAllowed: 5,
      maxBooksPerDay: 3,
      currentBorrowing: 0,
      currentPending: 0,
      todayBorrowing: 0,
      todayPending: 0,

      // Pagination
      currentPage: 1,
      itemsPerPage: 6,
    };
  },
  async mounted() {
    window.scrollTo(0, 0);
    await this.loadBorrowStatistics();
    await this.loadBooksOnShelf();
    await this.loadBorrowRules();
  },
  computed: {
    isAllSelected() {
      return (
        this.booksOnShelf.length > 0 &&
        this.selectedBooks.length === this.booksOnShelf.length
      );
    },

    totalBooks() {
      return this.booksOnShelf.length;
    },

    totalPages() {
      return Math.ceil(this.totalBooks / this.itemsPerPage);
    },

    paginatedBooks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.booksOnShelf.slice(start, end);
    },

    remainingSlots() {
      const totalAllowed =
        this.maxBooksAllowed - this.currentBorrowing - this.currentPending;
      const dailyAllowed =
        this.maxBooksPerDay - this.todayBorrowing - this.todayPending;
      return Math.max(0, Math.min(totalAllowed, dailyAllowed));
    },
  },
  methods: {
    async loadBorrowStatistics() {
      try {
        const [currentBorrow, todayBorrow, currentPend, todayPend] =
          await Promise.all([
            bookService.countCurrentBorrowing({ MaDocGia: userState._id }),
            bookService.countCurrentBorrowingToday({ MaDocGia: userState._id }),
            bookService.countCurrentPending({ MaDocGia: userState._id }),
            bookService.countCurrentPendingToday({ MaDocGia: userState._id }),
          ]);

        this.currentBorrowing = currentBorrow || 0;
        this.todayBorrowing = todayBorrow || 0;
        this.currentPending = currentPend || 0;
        this.todayPending = todayPend || 0;
      } catch (error) {
        console.error('Lỗi khi tải thống kê mượn sách:', error);
      }
    },

    async loadBooksOnShelf() {
      try {
        const response = await bookService.getAllBooksOnShelf(userState._id);
        this.booksOnShelf = response || [];
      } catch (error) {
        console.error('Lỗi khi tải tủ sách:', error);
        this.booksOnShelf = [];
      }
    },

    async loadBorrowRules() {
      try {
        const quyDinh = await bookService.getBookBorrowRule();
        if (userState.userType === 'Giảng viên') {
          this.maxBooksAllowed = quyDinh?.maxBooksLecturer || 10;
          this.maxBooksPerDay = quyDinh?.maxBooksPerDayLecturer || 5;
        } else {
          this.maxBooksAllowed = quyDinh?.maxBooks || 5;
          this.maxBooksPerDay = quyDinh?.maxBooksPerDay || 3;
        }
      } catch (error) {
        console.error('Lỗi khi tải quy định mượn sách:', error);
      }
    },

    isSelected(bookId) {
      return this.selectedBooks.includes(bookId);
    },

    toggleSelectBook(bookId) {
      const index = this.selectedBooks.indexOf(bookId);
      if (index > -1) {
        this.selectedBooks.splice(index, 1);
      } else {
        this.selectedBooks.push(bookId);
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedBooks = [];
      } else {
        this.selectedBooks = this.booksOnShelf.map((book) => book._id);
      }
    },

    async removeFromShelf(bookId) {
      const confirmDelete = window.confirm(
        'Bạn có chắc muốn xóa sách này khỏi tủ?'
      );
      if (!confirmDelete) return;

      try {
        await bookService.removeBookFromShelf({
          MaSach: bookId,
          MaDocGia: userState._id,
        });

        this.booksOnShelf = this.booksOnShelf.filter(
          (book) => book._id !== bookId
        );
        this.selectedBooks = this.selectedBooks.filter((id) => id !== bookId);

        // Adjust current page if needed
        if (this.paginatedBooks.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }

        alert('Đã xóa sách khỏi tủ!');
      } catch (error) {
        console.error('Lỗi khi xóa sách:', error);
        alert('Không thể xóa sách!');
      }
    },

    async removeSelectedFromShelf() {
      if (this.selectedBooks.length === 0) return;

      const confirmDelete = window.confirm(
        `Bạn có chắc muốn xóa ${this.selectedBooks.length} cuốn sách đã chọn?`
      );
      if (!confirmDelete) return;

      try {
        for (const bookId of this.selectedBooks) {
          await bookService.removeBookFromShelf({
            MaSach: bookId,
            MaDocGia: userState._id,
          });
        }

        this.booksOnShelf = this.booksOnShelf.filter(
          (book) => !this.selectedBooks.includes(book._id)
        );
        this.selectedBooks = [];

        // Adjust current page if needed
        if (this.paginatedBooks.length === 0 && this.currentPage > 1) {
          this.currentPage = 1;
        }

        alert('Đã xóa các sách đã chọn khỏi tủ!');
      } catch (error) {
        console.error('Lỗi khi xóa nhiều sách:', error);
        alert('Không thể xóa sách!');
      }
    },

    async handleBorrowBooks() {
      if (this.selectedBooks.length === 0) {
        alert('Vui lòng chọn ít nhất 1 cuốn sách!');
        return;
      }

      // 1. Kiểm tra sách hết hàng
      const outOfStockBooks = this.booksOnShelf.filter(
        (book) => this.selectedBooks.includes(book._id) && book.SoQuyen === 0
      );

      if (outOfStockBooks.length > 0) {
        alert(
          `Các sách sau đã hết:\n${outOfStockBooks
            .map((b) => `• ${b.TenSach}`)
            .join('\n')}`
        );
        return;
      }

      // 2. Kiểm tra thẻ thư viện
      try {
        const cardRes = await libraryService.getLibraryCard({
          MaDocGia: userState._id,
        });
        const cardInfo = cardRes?.cardInfo;

        if (!cardInfo) {
          alert('Không tìm thấy thẻ thư viện của bạn!');
          return;
        }

        if (cardInfo.TrangThai === 'Hết hạn') {
          alert(
            'Thẻ thư viện của bạn đã hết hạn.\nVui lòng gia hạn trước khi mượn sách!'
          );
          return;
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra thẻ thư viện:', error);
        alert('Không thể kiểm tra thẻ thư viện!');
        return;
      }

      // 3. Load lại thống kê mới nhất
      await this.loadBorrowStatistics();

      const borrowQuantity = this.selectedBooks.length;

      // 4. Kiểm tra giới hạn tổng số sách đang mượn
      if (this.currentBorrowing + borrowQuantity > this.maxBooksAllowed) {
        alert(
          `❌ Vượt quá giới hạn tổng số sách\n\n` +
            `• Đang mượn: ${this.currentBorrowing} cuốn\n` +
            `• Muốn mượn thêm: ${borrowQuantity} cuốn\n` +
            `• Giới hạn tối đa: ${this.maxBooksAllowed} cuốn\n\n` +
            `➡️ Bạn chỉ có thể mượn thêm ${
              this.maxBooksAllowed - this.currentBorrowing
            } cuốn`
        );
        return;
      }

      // 5. Kiểm tra giới hạn số sách mượn trong ngày
      if (this.todayBorrowing + borrowQuantity > this.maxBooksPerDay) {
        alert(
          `❌ Vượt quá giới hạn mượn trong ngày\n\n` +
            `• Hôm nay đã mượn: ${this.todayBorrowing} cuốn\n` +
            `• Muốn mượn thêm: ${borrowQuantity} cuốn\n` +
            `• Giới hạn mỗi ngày: ${this.maxBooksPerDay} cuốn\n\n` +
            `➡️ Hôm nay bạn chỉ có thể mượn thêm ${
              this.maxBooksPerDay - this.todayBorrowing
            } cuốn`
        );
        return;
      }

      // 6. Kiểm tra với cả sách đang chờ duyệt (pending)
      const totalAfterBorrow =
        this.currentBorrowing + this.currentPending + borrowQuantity;
      if (totalAfterBorrow > this.maxBooksAllowed) {
        const remaining =
          this.maxBooksAllowed - this.currentBorrowing - this.currentPending;

        if (remaining > 0) {
          alert(
            `❌ Vượt quá giới hạn với sách chờ duyệt\n\n` +
              `• Đang mượn: ${this.currentBorrowing} cuốn\n` +
              `• Đang chờ duyệt: ${this.currentPending} cuốn\n` +
              `• Muốn đăng ký thêm: ${borrowQuantity} cuốn\n` +
              `• Giới hạn tối đa: ${this.maxBooksAllowed} cuốn\n\n` +
              `➡️ Bạn chỉ có thể đăng ký mượn thêm ${remaining} cuốn`
          );
        } else {
          alert(
            `❌ Không thể đăng ký mượn thêm\n\n` +
              `• Đang mượn: ${this.currentBorrowing} cuốn\n` +
              `• Đang chờ duyệt: ${this.currentPending} cuốn\n` +
              `• Giới hạn tối đa: ${this.maxBooksAllowed} cuốn\n\n` +
              `➡️ Vui lòng trả sách hoặc chờ duyệt xong trước khi đăng ký mượn tiếp`
          );
        }
        return;
      }

      // 7. Kiểm tra giới hạn trong ngày với sách pending
      const totalTodayAfterBorrow =
        this.todayBorrowing + this.todayPending + borrowQuantity;
      if (totalTodayAfterBorrow > this.maxBooksPerDay) {
        const remainingToday =
          this.maxBooksPerDay - this.todayBorrowing - this.todayPending;

        if (remainingToday > 0) {
          alert(
            `❌ Vượt quá giới hạn trong ngày (kể cả chờ duyệt)\n\n` +
              `• Hôm nay đã mượn: ${this.todayBorrowing} cuốn\n` +
              `• Hôm nay đang chờ duyệt: ${this.todayPending} cuốn\n` +
              `• Muốn đăng ký thêm: ${borrowQuantity} cuốn\n` +
              `• Giới hạn mỗi ngày: ${this.maxBooksPerDay} cuốn\n\n` +
              `➡️ Hôm nay bạn chỉ có thể đăng ký mượn thêm ${remainingToday} cuốn`
          );
        } else {
          alert(
            `❌ Hôm nay không thể đăng ký mượn thêm\n\n` +
              `• Hôm nay đã mượn: ${this.todayBorrowing} cuốn\n` +
              `• Hôm nay đang chờ duyệt: ${this.todayPending} cuốn\n` +
              `• Giới hạn mỗi ngày: ${this.maxBooksPerDay} cuốn\n\n` +
              `➡️ Vui lòng quay lại vào ngày mai`
          );
        }
        return;
      }

      // 8. Tất cả kiểm tra đã pass, tiến hành mượn sách
      this.isProcessing = true;

      try {
        const data = {
          MaDocGia: userState._id,
          books: this.selectedBooks.map((bookId) => ({
            MaSach: bookId,
            SoLuong: 1,
          })),
        };

        const response = await bookService.createBorrowingSlip(data);

        if (response.success) {
          alert(
            `✅ Đăng ký mượn ${this.selectedBooks.length} cuốn sách thành công!\n\n` +
              `Vui lòng chờ thư viện duyệt yêu cầu của bạn.`
          );

          // Reload lại tủ sách và thống kê
          await this.loadBooksOnShelf();
          await this.loadBorrowStatistics();
          this.selectedBooks = [];
          this.currentPage = 1;

          window.dispatchEvent(new Event('shelf-updated'));
        } else {
          alert('❌ Đăng ký mượn thất bại!');
        }
      } catch (error) {
        console.error('Lỗi khi đăng ký mượn sách:', error);
        alert('❌ Đã xảy ra lỗi khi đăng ký mượn sách!');
      } finally {
        this.isProcessing = false;
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    goToBookDetail(bookId) {
      this.$router.push({ name: 'DetailBook', params: { id: bookId } });
    },

    goToLibrary() {
      this.$router.push({ name: 'Library' });
    },
  },
};
</script>

<style scoped>
.my-shelf {
  min-height: 80vh;
  padding: 40px 20px 80px;
}

.my-shelf__header {
  text-align: center;
  margin-bottom: 40px;
}

.my-shelf__header-title {
  font-size: 3.6rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.my-shelf__header-title i {
  color: #f55c4e;
}

.my-shelf__header-subtitle {
  font-size: 1.6rem;
  color: #7f8c8d;
  font-weight: 400;
  margin-bottom: 25px;
}

/* Rules Display */
.my-shelf__rules {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-top: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.my-shelf__rules-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  color: #fff;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.my-shelf__rules-item i {
  font-size: 1.8rem;
}

.my-shelf__rules-item strong {
  font-weight: 700;
  color: #ffd700;
}

/* Empty State */
.my-shelf__empty {
  text-align: center;
  padding: 80px 20px;
}

.my-shelf__empty-icon {
  font-size: 8rem;
  color: #ecf0f1;
  margin-bottom: 25px;
}

.my-shelf__empty-title {
  font-size: 2.4rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 12px;
}

.my-shelf__empty-subtitle {
  font-size: 1.6rem;
  color: #95a5a6;
  margin-bottom: 30px;
}

.my-shelf__empty-btn {
  padding: 15px 35px;
  background-color: #f55c4e;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.my-shelf__empty-btn:hover {
  background-color: #e63727;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 92, 78, 0.3);
}

/* Toolbar */
.my-shelf__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 25px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 25px;
  border: 1px solid #e9ecef;
}

.my-shelf__checkbox-all {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 500;
  color: #495057;
}

.my-shelf__checkbox-all input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #f55c4e;
}

.my-shelf__btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.my-shelf__btn--delete {
  background-color: #e74c3c;
  color: #fff;
}

.my-shelf__btn--delete:hover:not(:disabled) {
  background-color: #c0392b;
}

.my-shelf__btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Book List - Compact Design */
.my-shelf__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.my-shelf__item {
  display: grid;
  grid-template-columns: 40px 120px 1fr 40px;
  gap: 15px;
  padding: 15px;
  background-color: #fff;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  align-items: center;
}

.my-shelf__item:hover {
  border-color: #f55c4e;
  box-shadow: 0 4px 15px rgba(245, 92, 78, 0.12);
  transform: translateY(-2px);
}

.my-shelf__item--selected {
  border-color: #f55c4e;
  background-color: #fff5f4;
}

.my-shelf__item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-shelf__item-checkbox input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #f55c4e;
}

.my-shelf__item-image {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 180px;
}

.my-shelf__item-image:hover {
  transform: scale(1.05);
}

.my-shelf__item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.my-shelf__item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.my-shelf__item-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2c3e50;
  cursor: pointer;
  transition: color 0.3s ease;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.my-shelf__item-title:hover {
  color: #f55c4e;
}

.my-shelf__item-author {
  font-size: 1.3rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.my-shelf__item-author i {
  color: #95a5a6;
  font-size: 1.2rem;
}

.my-shelf__item-meta {
  display: flex;
  gap: 15px;
  font-size: 1.2rem;
  color: #95a5a6;
  flex-wrap: wrap;
}

.my-shelf__item-genre,
.my-shelf__item-year {
  display: flex;
  align-items: center;
  gap: 5px;
}

.my-shelf__item-stock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #27ae60;
}

.my-shelf__item-stock i {
  font-size: 1.4rem;
}

.my-shelf__item-stock .fa-circle-check {
  color: #27ae60;
}

.my-shelf__item-stock .fa-circle-xmark {
  color: #e74c3c;
}

.my-shelf__item-stock .out-of-stock {
  color: #e74c3c;
}

.my-shelf__item-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.my-shelf__item-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

.my-shelf__item-btn--remove {
  background-color: #fee;
  color: #e74c3c;
}

.my-shelf__item-btn--remove:hover {
  background-color: #e74c3c;
  color: #fff;
  transform: rotate(90deg);
}

/* Pagination */
.my-shelf__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 30px 0;
  padding: 20px;
}

.my-shelf__pagination-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e9ecef;
  background-color: #fff;
  color: #495057;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.my-shelf__pagination-btn:hover:not(:disabled) {
  border-color: #f55c4e;
  background-color: #f55c4e;
  color: #fff;
  transform: scale(1.1);
}

.my-shelf__pagination-btn:disabled {
  background-color: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.5;
}

.my-shelf__pagination-info {
  padding: 8px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #495057;
  min-width: 140px;
  text-align: center;
}

/* Summary Panel */
.my-shelf__summary {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 3px solid #f55c4e;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 999;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.my-shelf__summary-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.my-shelf__summary-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.my-shelf__summary-count {
  font-size: 1.7rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.my-shelf__summary-count i {
  color: #27ae60;
  font-size: 1.8rem;
}

.my-shelf__summary-count strong {
  color: #f55c4e;
}

.my-shelf__summary-note {
  font-size: 1.4rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 8px;
}

.my-shelf__summary-note i {
  color: #3498db;
}

.my-shelf__summary-note strong {
  color: #27ae60;
  font-weight: 700;
}

.my-shelf__summary-btn {
  padding: 16px 40px;
  background: linear-gradient(135deg, #f55c4e, #ff8a75);
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 1.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(245, 92, 78, 0.3);
}

.my-shelf__summary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #e63727, #f55c4e);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 92, 78, 0.4);
}

.my-shelf__summary-btn:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  cursor: not-allowed;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 1200px) {
  .my-shelf__list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .my-shelf__rules {
    gap: 15px;
  }

  .my-shelf__rules-item {
    font-size: 1.3rem;
    padding: 6px 12px;
  }
}

@media (max-width: 1024px) {
  .my-shelf__item {
    grid-template-columns: 35px 100px 1fr 35px;
    gap: 12px;
    padding: 12px;
  }

  .my-shelf__item-image {
    height: 150px;
  }

  .my-shelf__item-title {
    font-size: 1.5rem;
  }

  .my-shelf__summary-content {
    padding: 18px 30px;
  }
}

@media (max-width: 768px) {
  .my-shelf__header-title {
    font-size: 3rem;
    flex-direction: column;
    gap: 10px;
  }

  .my-shelf__rules {
    flex-direction: column;
    gap: 10px;
  }

  .my-shelf__rules-item {
    justify-content: center;
  }

  .my-shelf__toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .my-shelf__toolbar-right {
    width: 100%;
  }

  .my-shelf__btn--delete {
    width: 100%;
    justify-content: center;
  }

  .my-shelf__list {
    grid-template-columns: 1fr;
  }

  .my-shelf__item {
    grid-template-columns: 30px 90px 1fr 30px;
    gap: 10px;
  }

  .my-shelf__item-image {
    height: 140px;
  }

  .my-shelf__item-title {
    font-size: 1.4rem;
  }

  .my-shelf__item-author,
  .my-shelf__item-stock {
    font-size: 1.2rem;
  }

  .my-shelf__item-meta {
    font-size: 1.1rem;
    gap: 10px;
  }

  .my-shelf__pagination {
    gap: 8px;
    padding: 15px;
  }

  .my-shelf__pagination-btn {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
  }

  .my-shelf__pagination-info {
    font-size: 1.3rem;
    padding: 6px 15px;
    min-width: 120px;
  }

  .my-shelf__summary-content {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }

  .my-shelf__summary-info {
    width: 100%;
    text-align: center;
  }

  .my-shelf__summary-btn {
    width: 100%;
    justify-content: center;
    padding: 14px 30px;
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .my-shelf__header-title {
    font-size: 2.4rem;
  }

  .my-shelf__header-subtitle {
    font-size: 1.4rem;
  }

  .my-shelf__rules-item {
    font-size: 1.2rem;
    padding: 5px 10px;
  }

  .my-shelf__item {
    grid-template-columns: 1fr;
    position: relative;
    padding: 50px 15px 15px;
  }

  .my-shelf__item-checkbox {
    position: absolute;
    top: 15px;
    left: 15px;
  }

  .my-shelf__item-actions {
    position: absolute;
    top: 15px;
    right: 15px;
  }

  .my-shelf__item-image {
    width: 100%;
    max-width: 200px;
    margin: 0 auto 10px;
    height: 280px;
  }

  .my-shelf__item-title {
    text-align: center;
  }

  .my-shelf__item-author,
  .my-shelf__item-meta,
  .my-shelf__item-stock {
    justify-content: center;
  }

  .my-shelf__pagination-btn {
    width: 32px;
    height: 32px;
  }

  .my-shelf__summary-count {
    font-size: 1.5rem;
  }

  .my-shelf__summary-note {
    font-size: 1.3rem;
  }
}
</style>
