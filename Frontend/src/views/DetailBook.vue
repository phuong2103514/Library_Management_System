<template>
  <Header />

  <div class="detailbook container">
    <div class="row">
      <div class="col-lg-6">
        <div class="detailbook__image-book">
          <img :src="book.Image" alt="" />
        </div>
      </div>

      <div class="col-lg-6">
        <div class="detailbook__information-book">
          <div class="detailbook__information-book-header">
            <div class="detailbook__information-book-title">
              {{ book.TenSach }} ({{ book.MaSach }})
            </div>
            <div class="detailbook__information-book-header-wrapper">
              <div class="detailbook__information-book-author">
                <span class="title">Tác giả: </span>
                <span
                  class="content"
                  @click="goToLibraryWithAuthor(book.TacGia)"
                  >{{ book.TacGia }}</span
                >
              </div>

              <div class="detailbook__information-book-star-wrapper">
                <div class="rating">
                  <span
                    v-for="index in 5"
                    :key="index"
                    class="star"
                    :style="getStarStyle(index)"
                    >★</span
                  >
                </div>

                <div class="number-start">
                  {{ averageRating > 0 ? averageRating : 'Chưa có' }}
                </div>
              </div>

              <div class="detailbook__information-book-quantity-wrapper">
                <div class="detailbook__information-book-quantity-title">
                  <span class="title">Số quyển: </span>{{ book.SoQuyen }}
                </div>
              </div>
            </div>
          </div>

          <div class="detailbook__information-book-price-and-info">
            <div class="detailbook__information-book-price">
              {{ formatPrice(book.DonGia) }}
            </div>
            <div class="detailbook__information-book-description">
              {{ book.MoTaSach }}
            </div>
          </div>

          <div class="detailbook__information-book-publishing">
            <div class="detailbook__information-book-publishing-title">
              Nhà Xuất Bản:
            </div>
            <div class="detailbook__information-book-publishing-content">
              {{ book.MaNXB?.TenNXB }}
            </div>
            <div class="detailbook__information-book-publishing-title">
              Năm xuất bản:
            </div>
            <div class="detailbook__information-book-publishing-content">
              {{ book.NamXuatBan }}
            </div>
            <div class="detailbook__information-book-publishing-title">
              {{ book.LoaiSach === 'GiaoTrinh' ? 'Khoa:' : 'Thể loại:' }}
            </div>
            <div class="detailbook__information-book-publishing-content">
              {{
                book.LoaiSach === 'GiaoTrinh'
                  ? book.Khoa?.TenKhoa || 'N/A'
                  : book.MaTheLoai?.TenTheLoai || 'N/A'
              }}
            </div>
          </div>

          <div style="display: flex; gap: 25px">
            <div
              class="detailbook__information-book-btn-favorite-wrapper"
              :class="{ 'is-favorite': isFavorite(book._id) }"
              @click="toggleFavorite"
            >
              <i class="fa-solid fa-heart"></i>
              <span
                class="detailbook__information-book-btn-favorite-content"
                style="font-size: 1.5rem"
              >
                {{
                  isFavorite(book._id)
                    ? 'Đã thêm vào yêu thích'
                    : 'Thêm vào yêu thích'
                }}
              </span>
            </div>

            <div
              class="detailbook__information-book-btn-shelf-wrapper"
              :class="{ 'is-in-shelf': isInShelf }"
              @click="toggleShelf"
            >
              <i class="fa-solid fa-bookmark"></i>
              <span class="detailbook__information-book-btn-shelf-content">
                {{ isInShelf ? 'Đã có trong tủ sách' : 'Thêm vào tủ sách' }}
              </span>
            </div>
          </div>

          <div class="detailbook__information-book-button-wrapper">
            <button
              type="button"
              class="detailbook__information-book-btn-borrow"
              :class="{
                'btn-overdue': lendInfo?.TrangThai === 'overdue',
                'borrowed-success':
                  hasBorrowed && lendInfo?.TrangThai === 'approved',
                'out-of-stock': book.SoQuyen === 0,
                'btn-pending': lendInfo?.TrangThai === 'pending',
              }"
              @click="
                lendInfo?.TrangThai === 'pending' ? cancelLend() : lendBook()
              "
              :disabled="
                (lendInfo?.TrangThai === 'approved' && hasBorrowed) ||
                book.SoQuyen === 0
              "
            >
              {{ getButtonText() }}
            </button>

            <button
              v-if="book.Pdf"
              type="button"
              class="detailbook__information-book-btn-borrow detailbook__information-book-btn-preview"
              @click="openPdfInNewTab"
            >
              Đọc trước
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="detailbook__relate-book-review">
      <div class="detailbook__relate-book-header">Review Books</div>

      <div class="detailbook__relate-book-list-option">
        <div
          class="detailbook__relate-book-option"
          :class="{
            'detailbook__relate-book-option--choosing':
              activeReviewTab === 'my',
          }"
          @click="setActiveTab('my')"
        >
          My Rating
        </div>

        <div
          class="detailbook__relate-book-option"
          :class="{
            'detailbook__relate-book-option--choosing':
              activeReviewTab === 'all',
          }"
          @click="setActiveTab('all')"
        >
          All Review
        </div>
      </div>

      <div
        class="detailbook__relate-book-my-rating"
        v-if="activeReviewTab === 'my'"
      >
        <div class="detailbook__relate-book-my-rating-wrapper">
          <div class="detailbook__relate-book-my-rating-text">Your Rating</div>
          <div class="detailbook__relate-book-my-rating-star">
            <div
              class="rating"
              :class="{ disabled: isSubmitDisabled || isStarDisabled }"
            >
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{
                  filled: star <= (hoverRating || currentRating),
                }"
                @mouseover="!isStarDisabled && (hoverRating = star)"
                @mouseleave="!isStarDisabled && (hoverRating = 0)"
                @click="!isStarDisabled && (currentRating = star)"
              >
                ★
              </span>
            </div>
          </div>
        </div>

        <div class="detailbook__relate-book-my-rating-comment mt-4">
          <div class="detailbook__relate-book-my-rating-text">Your Comment</div>

          <textarea
            v-model="comment"
            class="detailbook__relate-book-my-rating-input mt-2"
            placeholder="Your comment..."
            rows="4"
            :disabled="isSubmitDisabled"
          ></textarea>
        </div>

        <div class="detailbook__rating-book-button-group mt-4">
          <button
            type="button"
            class="detailbook__information-book-btn-submit"
            :disabled="isSubmitDisabled"
            @click="submitRating"
          >
            Submit
          </button>

          <button
            type="button"
            class="detailbook__information-book-btn-submit detailbook__information-book-btn-delete"
            @click="handleDeleteRating"
            :disabled="!alreadyRated"
          >
            Delete
          </button>
        </div>
      </div>

      <div
        class="detailbook__relate-book-all-review"
        v-if="activeReviewTab === 'all'"
      >
        <div v-if="allReviews.length === 0" class="no-review">
          Chưa có đánh giá
        </div>

        <div v-else class="detailbook__relate-book-all-review-list">
          <div
            class="detailbook__relate-book-all-review-element"
            v-for="(review, index) in paginatedReviews"
            :key="index"
          >
            <div class="detailbook__relate-book-all-review-image">
              <img src="/public/image/avatar_comment.png" alt="" />
            </div>

            <div class="detailbook__relate-book-all-review-information">
              <div class="detailbook__relate-book-all-review-rating">
                <div class="rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ filled: star <= review.SoSao }"
                  >
                    ★
                  </span>
                </div>
              </div>

              <div class="detailbook__relate-book-all-review-name-and-date">
                <div class="detailbook__relate-book-all-review-name">
                  {{ review.MaDocGia?.HoLot }} {{ review.MaDocGia?.Ten }}
                </div>
                <div class="detailbook__relate-book-all-review-date">
                  {{ formatReviewDate(review.NgayDanhGia) }}
                </div>
              </div>
            </div>

            <div></div>

            <div class="detailbook__relate-book-all-review-content">
              {{ review.BinhLuan }}
            </div>
          </div>

          <div
            class="book__library-list-book-navigation-page"
            v-if="allReviews.length > reviewPageSize"
          >
            <ul class="pagination">
              <li
                class="page-item"
                :class="{ disabled: reviewCurrentPage === 1 }"
              >
                <a class="page-link" href="#" @click.prevent="goToReviewPage(1)"
                  >«</a
                >
              </li>

              <li
                class="page-item"
                :class="{ disabled: reviewCurrentPage === 1 }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="goToReviewPage(reviewCurrentPage - 1)"
                  >‹</a
                >
              </li>

              <li class="page-item active">
                <a class="page-link" href="#" @click.prevent>{{
                  reviewCurrentPage
                }}</a>
              </li>

              <li
                class="page-item"
                :class="{ disabled: reviewCurrentPage === reviewTotalPages }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="goToReviewPage(reviewCurrentPage + 1)"
                  >›</a
                >
              </li>

              <li
                class="page-item"
                :class="{ disabled: reviewCurrentPage === reviewTotalPages }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="goToReviewPage(reviewTotalPages)"
                  >»</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="detailbook__relate-book">
      <div class="detailbook__relate-book-header">Sách Liên Quan</div>

      <div class="detailbook__relate-book-content">
        <div class="row g-5 home__feature-book-list">
          <div
            class="col-lg-4 home__feature-book-element"
            v-for="relatedBook in relatedBooks"
            :key="relatedBook._id"
          >
            <div
              class="home__feature-book-element-image detailbook__relate-book-image"
              @click="goToBookDetail(relatedBook._id)"
            >
              <img :src="relatedBook.Image" alt="" />
            </div>

            <div class="home__feature-book-element-information">
              <div
                class="home__feature-book-element-title"
                @click="goToBookDetail(relatedBook._id)"
              >
                {{ relatedBook.TenSach }}
              </div>
              <div class="home__feature-book-element-author">
                {{ relatedBook.TacGia }}
              </div>
              <div class="rating">
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star">☆</span>
                <span class="star">☆</span>
                <span class="star">☆</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<script>
import '../assets/css/deleteBook.css';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

import { bookService } from '../services/book/book.service';
import { libraryService } from '../services/library/library.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'DetailBook',
  components: {
    Header,
    Footer,
  },
  props: ['id'],
  data() {
    return {
      book: {},
      relatedBooks: [],
      hasBorrowed: false,
      borrowQuantity: 1,
      lendInfo: null,
      favoriteBookIds: [],
      activeReviewTab: 'my',
      currentRating: 0,
      hoverRating: 0,
      comment: '',
      alreadyRated: false,
      alreadyRatedWithComment: false,
      allReviews: [],
      reviewCurrentPage: 1,
      reviewPageSize: 5,
      averageRating: 0,
      totalViews: 0,

      isInShelf: false,
    };
  },

  async mounted() {
    window.scrollTo(0, 0);
    await this.fetchBookDetail();

    if (userState._id) {
      try {
        const favResponse = await bookService.getFavoriteBooks(userState._id);
        this.favoriteBookIds = Array.isArray(favResponse)
          ? favResponse.map((id) => id.toString())
          : [];
      } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
      }
    }

    // Kiểm tra sách có trong tủ chưa
    if (userState._id && this.book._id) {
      try {
        const shelfResponse = await bookService.checkBookInShelf({
          MaSach: this.book._id,
          MaDocGia: userState._id,
        });
        this.isInShelf = shelfResponse?.exists || false;
      } catch (error) {
        console.error('Lỗi khi kiểm tra tủ sách:', error);
        this.isInShelf = false;
      }
    }

    if (this.activeReviewTab === 'all') {
      await this.fetchAllCommentRating();
    }

    if (userState._id && this.book._id) {
      try {
        await bookService.addBookView({
          MaSach: this.book._id,
          MaDocGia: userState._id,
        });
      } catch (err) {
        console.error('Lỗi khi ghi nhận lượt xem:', err);
      }
    }
  },

  methods: {
    async fetchBookDetail() {
      try {
        const response = await bookService.getBookById(this.id);
        this.book = response;

        this.borrowQuantity = 1;

        await this.checkLendStatus();
        await this.getRelatedBooks();

        if (this.activeReviewTab === 'my' && userState._id) {
          await this.fetchMyRating();
        }

        await this.updateAverageRating();
      } catch (error) {
        console.error('Lỗi khi tải thông tin sách:', error);
        alert('Không thể tải thông tin sách!');
      }
    },

    async getRelatedBooks() {
      try {
        if (this.book.MaTheLoai?._id) {
          // Lấy tất cả sách cùng thể loại
          const allBooks = await bookService.getAllBook();

          // Lọc sách cùng thể loại nhưng khác sách hiện tại
          const sameGenreBooks = allBooks.filter(
            (book) =>
              book.MaTheLoai?._id === this.book.MaTheLoai._id &&
              book._id !== this.book._id
          );

          // Random và lấy 3 sách
          const shuffled = sameGenreBooks.sort(() => 0.5 - Math.random());
          this.relatedBooks = shuffled.slice(0, 3);
        }
      } catch (error) {
        console.error('Lỗi khi tải sách liên quan:', error);
      }
    },

    goToBookDetail(bookId) {
      this.$router.push({ name: 'DetailBook', params: { id: bookId } });
      window.scrollTo(0, 0);
    },

    formatPrice(value) {
      if (typeof value !== 'number') return value;
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    async lendBook() {
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
          'Thẻ thư viện của bạn đã hết hạn. Vui lòng gia hạn trước khi mượn sách!'
        );
        return;
      }

      if (this.book.SoQuyen === 0) {
        alert('Sách đã hết!');
        return;
      }

      if (this.hasBorrowed) {
        alert('Bạn đã đăng ký mượn sách này rồi!');
        return;
      }

      const currentBorrow = await bookService.countCurrentBorrowing({
        MaDocGia: userState._id,
      });

      const todayBorrow = await bookService.countCurrentBorrowingToday({
        MaDocGia: userState._id,
      });

      const currentPending = await bookService.countCurrentPending({
        MaDocGia: userState._id,
      });

      const todayPending = await bookService.countCurrentPendingToday({
        MaDocGia: userState._id,
      });

      const quyDinh = await bookService.getBookBorrowRule();

      let MAX_TOTAL, MAX_DAILY;

      if (userState.userType === 'Giảng viên') {
        MAX_TOTAL = quyDinh?.maxBooksLecturer;
        MAX_DAILY = quyDinh?.maxBooksPerDayLecturer;
      } else {
        MAX_TOTAL = quyDinh?.maxBooks;
        MAX_DAILY = quyDinh?.maxBooksPerDay;
      }

      // --- Check Borrow ---
      if (currentBorrow + this.borrowQuantity > MAX_TOTAL) {
        alert(
          `Bạn đang mượn ${currentBorrow} cuốn.\nKhông thể mượn quá ${MAX_TOTAL} cuốn cùng lúc!`
        );
        return;
      }

      if (todayBorrow + this.borrowQuantity > MAX_DAILY) {
        alert(
          `Hôm nay bạn đã mượn ${todayBorrow} cuốn.\nChỉ được mượn tối đa ${MAX_DAILY} cuốn/ngày!`
        );
        return;
      }

      // --- Check Pending ---
      if (currentBorrow + currentPending + this.borrowQuantity > MAX_TOTAL) {
        const remaining = MAX_TOTAL - currentBorrow - currentPending;

        if (remaining > 0) {
          alert(
            `Bạn đang mượn ${currentBorrow} cuốn\n` +
              `Bạn đã đăng ký muợn ${currentPending} cuốn\n` +
              `Bạn chỉ có thể đăng ký mượn thêm ${remaining} cuốn`
          );
        } else {
          alert(
            `Bạn đang mượn ${currentBorrow} cuốn\n` +
              `Bạn đã đăng ký mượn ${currentPending} cuốn\n` +
              `Bạn không thể đăng ký mượn thêm nữa`
          );
        }
        return;
      }

      if (todayBorrow + todayPending + this.borrowQuantity > MAX_DAILY) {
        const remainingToday = MAX_DAILY - todayBorrow - todayPending;

        if (remainingToday > 0) {
          alert(
            `Hôm nay bạn đã đăng ký mượn ${todayPending} cuốn\n` +
              `Bạn chỉ có thể đăng ký mượn thêm ${remainingToday} cuốn trong ngày`
          );
        } else {
          alert(
            `Hôm nay bạn đã đăng ký mượn ${todayPending} cuốn\n` +
              `Bạn không thể đăng ký mượn thêm trong ngày`
          );
        }
        return;
      }

      try {
        const data = {
          MaSach: this.book._id,
          MaDocGia: userState._id,
          SoLuongMuon: 1,
        };
        await bookService.lendBook(data);

        // Reload trạng thái sau khi mượn thành công
        await this.checkLendStatus();

        this.isInShelf = false;
        window.dispatchEvent(new Event('shelf-updated'));

        alert(`Đăng ký mượn ${this.borrowQuantity} cuốn sách thành công`);
      } catch (error) {
        alert('Đã xảy ra lỗi!');
      }
    },

    async cancelLend() {
      try {
        const data = {
          MaSach: this.book._id,
          MaDocGia: userState._id,
        };

        await bookService.deletePending(data);

        // Reload lại trạng thái mượn để cập nhật nút
        await this.checkLendStatus();

        alert('Đã hủy đăng ký mượn sách thành công');
      } catch (error) {
        alert('Đã xảy ra lỗi khi hủy đăng ký!');
      }
    },

    increaseQuantity() {
      if (this.borrowQuantity < this.maxBorrowQuantity) {
        this.borrowQuantity++;
      }
    },

    decreaseQuantity() {
      if (this.borrowQuantity > 1) {
        this.borrowQuantity--;
      }
    },

    getButtonText() {
      if (this.book.SoQuyen === 0) {
        return 'Hết Sách';
      }

      if (this.hasBorrowed && this.lendInfo) {
        switch (this.lendInfo.TrangThai) {
          case 'pending':
            return 'Hủy đăng ký';
          case 'approved':
            return 'Đang mượn';
          case 'returned':
            return 'Đã trả';
          case 'overdue':
            return 'Quá hạn';
          case 'denied':
            return 'Bị từ chối';
          default:
            return 'Đã gửi yêu cầu';
        }
      }

      return 'Đăng ký mượn';
    },

    async checkLendStatus() {
      try {
        const response = await bookService.getInfoLendBook({
          MaSach: this.book._id,
          MaDocGia: userState._id,
        });

        if (
          response &&
          ['pending', 'approved', 'borrowing', 'overdue'].includes(
            response.TrangThai?.toLowerCase()
          )
        ) {
          this.hasBorrowed = true;
          this.lendInfo = response;
        } else {
          this.hasBorrowed = false;
          this.lendInfo = null;
        }
      } catch (error) {
        // Nếu không tìm thấy hoặc lỗi thì chưa mượn
        this.hasBorrowed = false;
        this.lendInfo = null;
      }
    },

    async toggleFavorite() {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để thêm yêu thích');
          return;
        }

        const bookId = this.book._id.toString();

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

    async toggleShelf() {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để sử dụng tủ sách');
          return;
        }

        const bookId = this.book._id.toString();

        if (this.isInShelf) {
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          await bookService.removeBookFromShelf(data);
          this.isInShelf = false;
          window.dispatchEvent(new Event('shelf-updated'));
          alert('Đã bỏ sách khỏi tủ!');
        } else {
          const data = { MaSach: bookId, MaDocGia: maDocGia };

          // SỬA: Xử lý response từ API
          try {
            const response = await bookService.addBookIntoShelf(data);

            if (response) {
              this.isInShelf = true;
              window.dispatchEvent(new Event('shelf-updated'));
              alert('Đã thêm vào tủ sách!');
            } else {
              alert('Sách đã có trong tủ rồi!');
            }
          } catch (error) {
            // THÊM: Xử lý lỗi khi sách đang được mượn
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

    isFavorite(bookId) {
      if (!this.favoriteBookIds || !bookId) return false;
      const bid = bookId.toString();
      return this.favoriteBookIds.some((id) => id.toString() === bid);
    },

    setActiveTab(tab) {
      this.activeReviewTab = tab;
      this.reviewCurrentPage = 1;

      if (tab === 'my') {
        this.fetchMyRating();
      } else if (tab === 'all') {
        this.fetchAllCommentRating();
      }
    },

    async submitRating() {
      if (!userState._id) {
        alert('Bạn cần đăng nhập để đánh giá!');
        return;
      }

      if (this.currentRating <= 0) {
        alert('Vui lòng chọn số sao trước khi gửi!');
        return;
      }

      if (this.alreadyRated && !this.comment.trim()) {
        alert('Vui lòng nhập bình luận trước khi gửi!');
        return;
      }

      try {
        const data = {
          MaSach: this.book._id,
          MaDocGia: userState._id,
          SoSao: this.currentRating,
          BinhLuan: this.comment || '',
        };

        if (this.alreadyRated && this.comment.trim() != '') {
          const response = await bookService.updateRatingComment({
            MaSach: data.MaSach,
            MaDocGia: data.MaDocGia,
            BinhLuan: data.BinhLuan,
          });
          this.isSubmitDisabled = true;
          alert('Đánh giá thành công!');
          this.setActiveTab('all');
          await this.updateAverageRating();
          return;
        }

        await bookService.addRatingBook(data);

        alert('Đánh giá thành công!');
        const hasComment = !!(this.comment && this.comment.trim().length > 0);
        this.alreadyRated = true;
        this.alreadyRatedWithComment = hasComment;

        // Nếu có comment thì mới chuyển tab
        if (hasComment) {
          this.setActiveTab('all');
        }

        await this.updateAverageRating();
      } catch (error) {
        console.error('Lỗi khi gửi đánh giá:', error);
        alert('Không thể gửi đánh giá!');
      }
    },

    async fetchMyRating() {
      try {
        if (!userState._id) return;

        const data = {
          MaSach: this.book._id,
          MaDocGia: userState._id,
        };
        const response = await bookService.getRatingByBookAndReader(data);
        // Reset mặc định
        this.currentRating = 0;
        this.comment = '';
        this.alreadyRated = false;
        this.alreadyRatedWithComment = false;

        const stars = Number(response?.SoSao) || 0;
        const hasComment = !!(
          response?.BinhLuan && response.BinhLuan.trim().length > 0
        );

        if (stars > 0) {
          this.currentRating = stars;
          this.comment = response?.BinhLuan || '';
          this.alreadyRated = true;
          this.alreadyRatedWithComment = hasComment;
        }
      } catch (err) {
        // Reset khi lỗi
        this.currentRating = 0;
        this.comment = '';
        this.alreadyRated = false;
      }
    },

    async handleDeleteRating() {
      if (!userState._id) {
        alert('Bạn cần đăng nhập để xóa đánh giá!');
        return;
      }

      const confirmDelete = confirm('Bạn có chắc muốn xóa đánh giá này?');
      if (!confirmDelete) {
        return; // Người dùng bấm Cancel
      }

      try {
        const data = {
          MaSach: this.book._id,
          MaDocGia: userState._id,
        };
        const response = await bookService.deleteRatingBook(data);

        if (response?.success) {
          this.currentRating = 0;
          this.comment = '';
          this.alreadyRated = false;
          this.alreadyRatedWithComment = false;

          await this.updateAverageRating();
        } else {
          alert('Không tìm thấy đánh giá để xóa!');
        }
      } catch (error) {
        console.error('Lỗi khi xóa đánh giá:', error);
        alert('Xóa đánh giá thất bại!');
      }
    },

    async fetchAllCommentRating() {
      try {
        const response = await bookService.getAllCommentRating({
          MaSach: this.book._id,
        });
        this.allReviews = Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Lỗi khi lấy tất cả bình luận và đánh giá:', error);
      }
    },

    formatReviewDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) {
        return `${diffSec} giây trước`;
      } else if (diffMin < 60) {
        return `${diffMin} phút trước`;
      } else if (diffHour < 24) {
        return `${diffHour} giờ trước`;
      } else if (diffDay < 7) {
        return `${diffDay} ngày trước`;
      } else {
        // Hơn 1 tuần => in ngày tháng
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    },

    goToReviewPage(page) {
      if (page >= 1 && page <= this.reviewTotalPages) {
        this.reviewCurrentPage = page;
      }
    },

    getStarStyle(index) {
      const fullStars = Math.floor(this.averageRating);
      const decimal = this.averageRating - fullStars;

      if (index <= fullStars) {
        return { color: 'gold' }; // sao đầy
      }

      if (index === fullStars + 1 && decimal > 0) {
        // Tính % vàng theo phần thập phân (vd: 0.3 => 30%)
        const percent = Math.round(decimal * 100);
        return {
          background: `linear-gradient(90deg, gold ${percent}%, #ccc ${percent}%)`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        };
      }

      return { color: '#ccc' }; // sao rỗng
    },

    async updateAverageRating() {
      try {
        const ratings = await bookService.getRatingByBook({
          MaSach: this.book._id,
        });

        if (Array.isArray(ratings) && ratings.length > 0) {
          const sum = ratings.reduce((acc, r) => acc + (r.SoSao || 0), 0);
          this.averageRating = (sum / ratings.length).toFixed(1);
        } else {
          this.averageRating = 0;
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật averageRating:', err);
        this.averageRating = 0;
      }
    },

    goToLibraryWithAuthor(authorName) {
      this.$router.push({
        name: 'Library',
        state: { author: authorName },
      });
    },

    openPdfInNewTab() {
      if (this.book.Pdf) {
        window.open(this.book.Pdf, '_blank');
      } else {
        alert('Không có file PDF cho sách này.');
      }
    },
  },

  watch: {
    id(newId) {
      if (newId) {
        this.hasBorrowed = false; // Reset trạng thái
        this.lendInfo = null; // Reset thông tin mượn
        this.fetchBookDetail();

        this.$nextTick(() => {
          window.scrollTo(0, 0);
        });
      }
    },
  },

  computed: {
    // Tính toán số lượng tối đa có thể mượn (tối đa 3 hoặc bằng SoQuyen nếu ít hơn 3)
    maxBorrowQuantity() {
      if (!this.book.SoQuyen) return 0;
      return Math.min(3, this.book.SoQuyen);
    },

    isSubmitDisabled() {
      return this.alreadyRatedWithComment === true;
    },

    isStarDisabled() {
      return this.alreadyRated === true;
    },

    paginatedReviews() {
      const start = (this.reviewCurrentPage - 1) * this.reviewPageSize;
      const end = start + this.reviewPageSize;
      return this.allReviews.slice(start, end);
    },

    reviewTotalPages() {
      return Math.ceil(this.allReviews.length / this.reviewPageSize);
    },
  },
};
</script>

<style scoped>
.detailbook__information-book-btn-borrow.btn-pending {
  background-color: #6f42c1;
  color: #fff;
  cursor: pointer;
}

.detailbook__information-book-btn-borrow.btn-pending:hover {
  background-color: #59359c;
}

.book__library-list-book-navigation-page {
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

.no-review {
  text-align: center;
  color: #ff9800; /* Màu cam nổi bật */
  font-size: 2.4rem;
  padding: 20px 0;
  font-weight: bold;
}

.detailbook__rating-book-button-group {
  display: flex;
  gap: 12px;
}

.detailbook__relate-book-my-rating-star .rating.disabled {
  pointer-events: none;
  cursor: not-allowed;
}

.detailbook__information-book-btn-submit:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.detailbook__information-book-btn-submit:disabled:hover {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.detailbook__relate-book-my-rating-text {
  font-weight: 600;
}

.detailbook__information-book-btn-favorite-wrapper {
  margin-bottom: 20px;
}

.detailbook__information-book-btn-favorite-wrapper.is-favorite i {
  color: red;
}

.detailbook__information-book-btn-shelf-wrapper {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detailbook__information-book-btn-shelf-wrapper i {
  font-size: 1.9rem;
  color: #ccc;
  transition: color 0.3s ease;
}

.detailbook__information-book-btn-shelf-wrapper:hover i {
  color: #667eea;
}

.detailbook__information-book-btn-shelf-wrapper.is-in-shelf i {
  color: #667eea;
}

.detailbook__information-book-btn-shelf-content {
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
}

.btn-overdue {
  background-color: #e74c3c !important;
  color: white !important;
  border: none !important;
}

.out-of-stock {
  background-color: #95a5a6 !important;
  color: white !important;
  border: none;
  cursor: not-allowed;
}

/* Style cho phần chọn số lượng */
.detailbook__information-book-quantity-selector {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.quantity-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quantity-label {
  font-size: 1.4rem;
  color: rgba(0, 0, 0, 0.8);
  font-weight: 500;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  width: 35px;
  height: 35px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  color: #333;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #f55c4e;
  color: white;
  border-color: #f55c4e;
}

.quantity-btn:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.quantity-display {
  font-size: 1.6rem;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
  color: #333;
}

.borrowed-success {
  background-color: #2ecc71 !important;
  /* Xanh lá thành công */
  color: white !important;
  border: none;
  cursor: auto;
}

.home__book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home__book-header-title {
  font-size: 3.6rem;
  font-weight: bold;
}

.view-all-btn {
  height: 45px;
  width: 130px;
  padding: 12px 31px;
  background-color: #f55c4e;
  color: #fff;
  font-size: 1.4rem;
  border-radius: 30px;
}

.home__book-line {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.line {
  width: 80%;
  height: 1px;
  background-color: #e6e6e6;
}

.view-all-btn:hover {
  background-color: #eb4738;
}

.home__popular-book-content {
  margin-top: 35px;
}

.home__feature-book-element-image {
  position: relative;
}

.home__book-action-icon {
  position: absolute;
  right: 10px;
  bottom: 10px;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  display: flex;
  opacity: 0;
  transform: translateX(20px);
  pointer-events: none;
  transition: all 0.3s ease;
}

.home__book-action-favorite-icon,
.home__book-action-preview-icon,
.home__book-action-borrow-icon {
  background-color: #fff;
  border-radius: 50%;
  width: 37px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

.home__book-action-favorite-icon:hover,
.home__book-action-preview-icon:hover,
.home__book-action-borrow-icon:hover {
  background-color: #f55c4e;
  color: #fff;
  cursor: pointer;
}

.home__feature-book-element-image img {
  width: 100%;
  height: 295px;
  border-radius: 15px;
  cursor: pointer;
}

.home__feature-book-element-image:hover .home__book-action-icon {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.home__feature-book-element-information {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3px;
}

.home__feature-book-element-title {
  font-size: 1.6rem;
  font-weight: bold;
}

.home__feature-book-element-title:hover {
  color: #f65d4e;
  cursor: pointer;
}

.home__feature-book-element-author {
  font-size: 1.2rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
}

.home__feature-book-element-author:hover {
  color: #f65d4e;
  cursor: pointer;
}

.home__feature-group-book {
  padding-left: 30px;
  padding-right: 30px;
  margin-top: 30px;
}

.home__book-of-the-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home__book-of-the-day-title {
  font-size: 3.6rem;
  font-weight: bold;
}

.home__book-of-the-day-line {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home__book-of-the-day-three-dot {
  font-size: 0.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.home__book-of-the-day-three-dot i {
  cursor: pointer;
  color: #e6e6e6;
}

.home__book-of-the-day-three-dot i:hover {
  color: #f55c4e;
}

.home__book-of-the-day-three-dot .dot--active {
  color: #f55c4e;
}

.home__book-of-the-day-list-book {
  --bs-gutter-x: 8rem;
  margin-top: 35px;
}

.home__book-of-the-day-element {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home__book-of-the-day-element:first-child {
  border-right: 1px solid #e6e6e6;
}

.home__book-of-the-day-element-image img {
  width: 190px;
  height: 270px;
  cursor: pointer;
  border-radius: 15px;
}

.home__book-of-the-day-element-title {
  max-width: 200px;
  font-size: 1.6rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home__book-of-the-day-element-title:hover {
  color: #f65d4e;
  cursor: pointer;
}

.home__book-of-the-day-element-author {
  font-size: 1.2rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
}

.home__book-of-the-day-element-author:hover {
  color: #f65d4e;
  cursor: pointer;
}

.home__book-of-the-day-element-information {
  padding: 0 20px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3px;
}

.home__trending-book {
  margin-top: 35px;
}

.home__trending-book-content {
  margin-top: 35px;
}

.home__trending-book-content-image img {
  height: 415px;
}

.home__new-release {
  margin-top: 35px;
}

.home__middle-banner {
  overflow: hidden;
}

.home__middle-banner img {
  margin-top: 35px;
  width: 100%;
  height: 242px;
  border-radius: 15px;
  transition: transform 0.4s ease;
}

.home__middle-banner:hover img {
  transform: scale(1.05);
}

.home__new-release-content {
  margin-top: 35px;
}

.home__new-release-content-image img {
  height: 415px;
}

.home__top-book-wrapper {
  padding-left: 30px;
}

.home__top-10-week-book,
.home__top-most-view-book {
  padding: 35px 30px 15px 30px;
  background-color: #f0f1f5;
  border-radius: 15px;
  margin-bottom: 30px;
}

.home__top-book-header {
  font-size: 2rem;
  font-weight: bold;
  padding-bottom: 30px;
  border-bottom: 1px solid #ed4321;
}

.home__top-book-content {
  margin-top: 40px;
}

.home__top-book-element {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.home__top-book-element-image {
  position: relative;
}

.home__top-book-element-rank-wrapper {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  top: -4px;
  left: -9px;
}

.home__top-book-element-rank {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
}

.rank-1 {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
  /* Hồng cam rực rỡ */
  color: #fff;
}

.rank-2 {
  background: linear-gradient(135deg, #f953c6, #b91d73);
  /* Hồng tím đậm */
  color: #fff;
}

.rank-3 {
  background: linear-gradient(135deg, #8e2de2, #4a00e0);
  /* Tím mộng mơ đậm chất premium */
  color: #fff;
}

.rank-4 {
  background: linear-gradient(135deg, #ff6a5b, #ff9472);
  /* Đỏ cam – đậm vừa */
  color: #fff;
}

.rank-5 {
  background: linear-gradient(135deg, #ff9472, #f2709c);
  /* Cam hồng – rực nhẹ */
  color: #fff;
}

.rank-6 {
  background: linear-gradient(135deg, #fbc2eb, #f6c0c0);
  /* Hồng pastel vừa phải */
  color: #000;
}

.rank-7 {
  background: linear-gradient(135deg, #fcd3a1, #fda085);
  /* Cam đào nhạt – ấm áp */
  color: #000;
}

.rank-8 {
  background: linear-gradient(135deg, #e0c3fc, #8ec5fc);
  /* Tím nhạt – xanh sương nhẹ */
  color: #000;
}

.rank-9 {
  background: linear-gradient(135deg, #d4fc79, #96e6a1);
  /* Xanh lá mát – dịu sáng */
  color: #000;
}

.rank-10 {
  background: linear-gradient(135deg, #fffbd5, #b7f8db);
  /* Vàng kem – xanh nhạt hài hòa */
  color: #000;
}

.home__top-book-element-image img {
  width: 100%;
  height: 110px;
  cursor: pointer;
  border-radius: 10px;
}

.home__top-book-element-title {
  font-size: 1.4rem;
  font-weight: bold;
}

.home__top-book-element-title:hover {
  color: #f55c4e;
  cursor: pointer;
}

.home__top-book-element-author {
  font-size: 1.2rem;
  color: rgba(0, 0, 0, 0.5);
}

.home__top-book-element-author:hover {
  color: #f55c4e;
  cursor: pointer;
}

.home__featured-authors {
  padding: 80px 20px;
  text-align: center;
  background: url('../public/image/backgroundauthor.png') no-repeat center;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.home__section-title {
  font-size: 36px;
  font-weight: 800;
  color: #2c2c2c;
  margin-bottom: 50px;
  letter-spacing: 0.5px;
  color: #fff;
}

.author-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.author-card {
  border-radius: 20px;
  padding: 30px 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid transparent;
  background: #fff;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.author-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e3e3e3;
  cursor: pointer;
}

.author-avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  margin-bottom: 20px;
}

.author-content {
  text-align: center;
}

.author-name {
  font-size: 22px;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 4px;
  font-weight: 800;
}

.author-role {
  font-size: 14px;
  font-style: italic;
  color: #888;
  margin-bottom: 10px;
}

.author-sub {
  font-size: 14px;
  color: #555;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.detailbook {
  margin-bottom: 40px;
}

.detailbook__image-book {
  width: 100%;
  height: 100vh;
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
  height: 100vh;
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
  display: flex;
  gap: 3px;
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

.detailbook__information-book-btn-borrow {
  height: 52px;
  width: 170px;
  padding: 17px 32px;
  background-color: #f65d4e;
  color: #fff;
  border-radius: 50px;
  font-size: 1.4rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.detailbook__information-book-btn-borrow:hover {
  background-color: #e63727;
}

.detailbook__information-book-btn-preview {
  background-color: #17a2b8;
}

.detailbook__information-book-btn-preview:hover {
  background-color: #138496;
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

.detailbook__relate-book .rating {
  display: flex;
  gap: 3px;
}

.detailbook__relate-book-header {
  font-size: 3.6rem;
  font-weight: bold;
  margin-bottom: 35px;
  margin-top: 12px;
}

.detailbook__relate-book-image img {
  height: 500px;
  object-fit: cover;
}

.home__feature-book-element-information {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3px;
}

.home__feature-book-element-title {
  font-size: 1.6rem;
  font-weight: bold;
}

.home__feature-book-element-title:hover {
  color: #f65d4e;
  cursor: pointer;
}

.home__feature-book-element-author {
  font-size: 1.2rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
}

.home__feature-book-element-author:hover {
  color: #f65d4e;
  cursor: pointer;
}

.detailbook__relate-book-image img {
  height: 500px;
  object-fit: cover;
}

.detailbook__relate-book-list-option {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.detailbook__relate-book-option {
  padding: 15px 30px;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
}

.detailbook__relate-book-option:hover {
  border-bottom: 3px solid #f55c4e;
  color: #000;
}

.detailbook__relate-book-option--choosing {
  border-bottom: 3px solid #f55c4e;
  color: #000;
  font-weight: 600;
}

.detailbook__relate-book-my-rating,
.detailbook__relate-book-all-review {
  font-size: 1.6rem;
  font-weight: 300;
}

.detailbook__relate-book-my-rating-wrapper {
  display: flex;
  gap: 20px;
  align-items: center;
}

.detailbook__relate-book-my-rating-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical; /* cho phép thay đổi chiều cao */
  box-sizing: border-box;
  resize: none;
  font-size: 1.6rem;
}

.detailbook__relate-book-my-rating-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.4);
}

.detailbook__information-book-btn-submit {
  height: 47px;
  width: 140px;
  padding: 22px 32px;
  background-color: #3498db;
  color: #fff;
  border-radius: 50px;
  font-size: 1.4rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detailbook__information-book-btn-submit:hover {
  background-color: #2980b9;
}

.detailbook__information-book-btn-delete {
  background-color: #f65d4e;
}

.detailbook__information-book-btn-delete:hover {
  background-color: #e63727;
}

.detailbook__relate-book-my-rating-star .rating {
  display: flex;
  gap: 3px;
  align-items: center;
  position: relative;
  top: -2px;
}

.detailbook__relate-book-my-rating-star .rating span:hover {
  cursor: pointer;
}

.detailbook__relate-book-all-review-image img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
}

.detailbook__relate-book-all-review-element {
  display: grid;
  grid-template-columns: 50px auto;
  column-gap: 15px;
  row-gap: 3px;
  margin-bottom: 20px;
}

.detailbook__relate-book-all-review-name-and-date {
  display: flex;
  gap: 15px;
}

.detailbook__relate-book-all-review-name {
  font-weight: bold;
}

.detailbook__relate-book-all-review-date {
  color: #000;
  font-weight: 400;
}

.detailbook__relate-book-all-review-content {
  color: #000;
  font-weight: 400;
}

.detailbook__information-book-button-wrapper {
  display: flex;
  align-items: center;
  gap: 26px;
}
</style>
