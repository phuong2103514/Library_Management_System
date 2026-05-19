<template>
  <Header />

  <!-- Loading overlay -->
  <div
    v-if="isLoading"
    :style="{
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999,
    }"
  >
    <img :src="loadingGif" alt="loading" style="width: 60px; height: 60px" />
  </div>

  <div class="book__library">
    <!-- Tabs điều hướng -->
    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'sach' }]" @click="changeTab('sach')">
        📚 Sách
      </button>
      <button :class="['tab-btn', { active: activeTab === 'giaotrinh' }]" @click="changeTab('giaotrinh')">
        📕 Giáo trình
      </button>
      <button :class="['tab-btn', { active: activeTab === 'luanvan' }]" @click="changeTab('luanvan')">
        📑 Luận văn
      </button>
      <button :class="['tab-btn', { active: activeTab === 'nienluan' }]" @click="changeTab('nienluan')">
        📝 Niên luận
      </button>
    </div>

    <!-- Tab Sách -->
    <TabSach
      v-if="activeTab === 'sach'"
      :genres="genres"
      :selectedGenres="selectedGenres"
      :selectedRatings="selectedRatings"
      :loading="loading"
      :paginatedBooks="paginatedBooks"
      :sortedBooks="sortedBooks"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :favoriteBookIds="favoriteBookIds"
      :shelfBookIds="shelfBookIds"
      :searchKeyword="searchKeyword"
      :searchAuthor="searchAuthor"
      :publisherSearchKeyword="publisherSearchKeyword"
      :yearSearchKeyword="yearSearchKeyword"
      :showPublisherDropdown="showPublisherDropdown"
      :showYearDropdown="showYearDropdown"
      :filteredPublishers="filteredPublishers"
      :filteredPublishYears="filteredPublishYears"
      :selectedPublishers="selectedPublishers"
      :selectedPublishYears="selectedPublishYears"
      :sortOption="sortOption"
      :hasActiveFilters="hasActiveFilters"
      :getStarStyle="getStarStyle"
      :formatPrice="formatPrice"
      :isFavorite="isFavorite"
      :isInShelf="isInShelf"
      @update:selectedGenres="selectedGenres = $event"
      @update:selectedRatings="selectedRatings = $event"
      @update:searchKeyword="searchKeyword = $event"
      @update:searchAuthor="searchAuthor = $event"
      @update:publisherSearchKeyword="publisherSearchKeyword = $event"
      @update:yearSearchKeyword="yearSearchKeyword = $event"
      @update:showPublisherDropdown="showPublisherDropdown = $event"
      @update:showYearDropdown="showYearDropdown = $event"
      @update:sortOption="sortOption = $event"
      @togglePublisher="togglePublisher"
      @toggleYear="toggleYear"
      @hidePublisherDropdown="hidePublisherDropdown"
      @hideYearDropdown="hideYearDropdown"
      @resetAllFilters="resetAllFilters"
      @goToBookDetail="goToBookDetail"
      @toggleFavorite="toggleFavorite"
      @toggleShelf="toggleShelf"
      @quickBorrow="quickBorrowInLibrary"
      @goToPage="goToPage"
    />

    <!-- Tab Giáo trình -->
    <TabGiaoTrinh
      v-if="activeTab === 'giaotrinh'"
      :khoas="khoas"
      :selectedKhoas="selectedKhoas"
      :selectedRatings="selectedRatings"
      :loading="loading"
      :paginatedBooks="paginatedBooks"
      :sortedBooks="sortedBooks"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :favoriteBookIds="favoriteBookIds"
      :shelfBookIds="shelfBookIds"
      :searchKeyword="searchKeyword"
      :searchAuthor="searchAuthor"
      :publisherSearchKeyword="publisherSearchKeyword"
      :yearSearchKeyword="yearSearchKeyword"
      :showPublisherDropdown="showPublisherDropdown"
      :showYearDropdown="showYearDropdown"
      :filteredPublishers="filteredPublishers"
      :filteredPublishYears="filteredPublishYears"
      :selectedPublishers="selectedPublishers"
      :selectedPublishYears="selectedPublishYears"
      :sortOption="sortOption"
      :hasActiveFilters="hasActiveFilters"
      :getStarStyle="getStarStyle"
      :formatPrice="formatPrice"
      :isFavorite="isFavorite"
      :isInShelf="isInShelf"
      @update:selectedKhoas="selectedKhoas = $event"
      @update:selectedRatings="selectedRatings = $event"
      @update:searchKeyword="searchKeyword = $event"
      @update:searchAuthor="searchAuthor = $event"
      @update:publisherSearchKeyword="publisherSearchKeyword = $event"
      @update:yearSearchKeyword="yearSearchKeyword = $event"
      @update:showPublisherDropdown="showPublisherDropdown = $event"
      @update:showYearDropdown="showYearDropdown = $event"
      @update:sortOption="sortOption = $event"
      @togglePublisher="togglePublisher"
      @toggleYear="toggleYear"
      @hidePublisherDropdown="hidePublisherDropdown"
      @hideYearDropdown="hideYearDropdown"
      @resetAllFilters="resetAllFilters"
      @goToBookDetail="goToBookDetail"
      @toggleFavorite="toggleFavorite"
      @toggleShelf="toggleShelf"
      @quickBorrow="quickBorrowInLibrary"
      @goToPage="goToPage"
    />

    <!-- Tab Luận văn -->
    <TabLuanVan
      v-if="activeTab === 'luanvan'"
      :activeDotNop="activeDotNop"
      :kyHocList="kyHocList"
      :namHocList="namHocList"
      :initialThesisTab="thesisTabFromURL"
      @changeThesisTab="onChangeThesisTab"
      @setLoading="isLoading = $event"
    />

    <!-- Tab Niên luận -->
    <TabNienLuan
      v-if="activeTab === 'nienluan'"
      :kyHocList="kyHocList"
      :namHocList="namHocList"
      :initialNienLuanTab="nienLuanTabFromURL"
      @changeNienLuanTab="onChangeNienLuanTab"
      @setLoading="isLoading = $event"
    />
  </div>

  <Footer />
</template>

<script>
import loadingGif from '/image/loading.gif';
import '../assets/css/library.css';
import { userState } from '../assets/js/userState';
import { removeVietnameseTones } from '../assets/js/fuzzySearch';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import TabSach from './TabSach.vue';
import TabGiaoTrinh from './TabGiaoTrinh.vue';
import TabLuanVan from './TabLuanVan.vue';
import TabNienLuan from './TabNienLuan.vue';

import { bookService } from '../services/book/book.service';
import { libraryService } from '../services/library/library.service';

export default {
  name: 'Library',
  components: { Header, Footer, TabSach, TabGiaoTrinh, TabLuanVan, TabNienLuan },

  data() {
    return {
      userState,
      loadingGif,
      isLoading: false,
      loading: true,

      // Tab điều hướng
      activeTab: 'sach',

      // Dữ liệu sách
      books: [],
      genres: [],
      khoas: [],
      popularBooks: [],
      favoriteBookIds: [],
      shelfBookIds: [],
      publishers: [],
      publishYears: [],

      // Filters chung (Sách + Giáo trình)
      selectedGenres: [],
      selectedKhoas: [],
      selectedRatings: [],
      selectedPublishers: [],
      selectedPublishYears: [],
      searchKeyword: '',
      searchAuthor: '',
      sortOption: 'popular',
      currentPage: 1,
      pageSize: 12,

      // Autocomplete NXB / Năm XB
      publisherSearchKeyword: '',
      showPublisherDropdown: false,
      yearSearchKeyword: '',
      showYearDropdown: false,

      // Shared data cho tab Luận văn & Niên luận
      activeDotNop: null,
      kyHocList: [],
      namHocList: [],

      // Lưu sub-tab từ URL để truyền xuống component con
      thesisTabFromURL: 'nop',
      nienLuanTabFromURL: '',
    };
  },

  async mounted() {
    // --- Đọc query params từ URL ---
    const q = this.$route.query;

    if (q.tab && ['sach', 'giaotrinh', 'luanvan', 'nienluan'].includes(q.tab)) {
      this.activeTab = q.tab;
    }
    if (!isNaN(parseInt(q.page)) && parseInt(q.page) >= 1) {
      this.currentPage = parseInt(q.page);
    }
    if (q.genre) this.selectedGenres = [q.genre];
    if (q.sort && ['popular', 'new', 'title'].includes(q.sort)) this.sortOption = q.sort;
    if (q.thesisTab) this.thesisTabFromURL = q.thesisTab;
    if (q.nienLuanTab) this.nienLuanTabFromURL = q.nienLuanTab;

    // --- Load dữ liệu song song ---
    await Promise.all([
      this.fetchGenres(),
      this.fetchKhoas(),
      this.fetchPublishers(),
      this.fetchBooks(),
      this.fetchActiveDotNop(),
      this.loadKyHocList(),
      this.loadNamHocList(),
    ]);

    // Đọc author từ router state (từ trang khác navigate sang)
    const authorFromState = this.$router.options.history.state?.author;
    if (authorFromState) this.searchAuthor = authorFromState;
    if (q.author) this.searchAuthor = q.author;

    this.loading = false;
  },

  methods: {
    // ===================== TAB =====================
    changeTab(tab) {
      this.activeTab = tab;
      this.$router.push({ query: { ...this.$route.query, tab } });
    },

    onChangeThesisTab(tab) {
      this.thesisTabFromURL = tab;
      this.$router.push({ query: { ...this.$route.query, thesisTab: tab } });
    },

    onChangeNienLuanTab(tab) {
      this.nienLuanTabFromURL = tab;
      this.$router.push({ query: { ...this.$route.query, nienLuanTab: tab } });
    },

    // ===================== FETCH DỮ LIỆU =====================
    async fetchBooks() {
      try {
        const response = await bookService.getAllBook();
        if (Array.isArray(response)) this.books = response;

        await this.updateAverageRatingForBooks();

        if (userState._id) {
          const [favRes, shelfRes, popularRes] = await Promise.all([
            bookService.getFavoriteBooks(userState._id),
            bookService.getAllBooksOnShelf(userState._id),
            bookService.getPopularBookFilter(),
          ]);
          this.favoriteBookIds = Array.isArray(favRes) ? favRes.map((id) => id.toString()) : [];
          this.shelfBookIds = Array.isArray(shelfRes) ? shelfRes.map((b) => b._id.toString()) : [];
          this.popularBooks = Array.isArray(popularRes) ? popularRes : [];
        } else {
          const popularRes = await bookService.getPopularBookFilter();
          this.popularBooks = Array.isArray(popularRes) ? popularRes : [];
        }

        this.populatePublishYears();
      } catch (error) {
        alert('Lỗi khi lấy sách!');
      }
    },

    async fetchGenres() {
      try {
        this.genres = await bookService.getAllGenre();
      } catch (error) {
        console.error('Lỗi khi tải thể loại:', error);
      }
    },

    async fetchKhoas() {
      try {
        this.khoas = await bookService.getAllFaculty();
      } catch (error) {
        console.error('Lỗi khi tải khoa:', error);
      }
    },

    async fetchPublishers() {
      try {
        this.publishers = await bookService.getAllNXB();
      } catch (error) {
        console.error('Lỗi khi tải NXB:', error);
      }
    },

    async fetchActiveDotNop() {
      try {
        this.activeDotNop = await bookService.getActiveDotNop();
      } catch (error) {
        this.activeDotNop = null;
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

    async updateAverageRatingForBooks() {
      this.books = await Promise.all(
        this.books.map(async (book) => {
          try {
            const ratings = await bookService.getRatingByBook({ MaSach: book._id });
            if (Array.isArray(ratings) && ratings.length > 0) {
              const sum = ratings.reduce((acc, r) => acc + (r.SoSao || 0), 0);
              book.averageRating = (sum / ratings.length).toFixed(1);
            } else {
              book.averageRating = 0;
            }
          } catch {
            book.averageRating = 0;
          }
          return book;
        })
      );
    },

    populatePublishYears() {
      this.publishYears = [
        ...new Set(this.books.map((b) => b.NamXuatBan).filter(Boolean)),
      ].sort((a, b) => b - a);
    },

    // ===================== FILTERS =====================
    togglePublisher(pubId) {
      const idx = this.selectedPublishers.indexOf(pubId);
      if (idx > -1) this.selectedPublishers.splice(idx, 1);
      else this.selectedPublishers.push(pubId);
    },

    toggleYear(year) {
      const idx = this.selectedPublishYears.indexOf(year);
      if (idx > -1) this.selectedPublishYears.splice(idx, 1);
      else this.selectedPublishYears.push(year);
    },

    hidePublisherDropdown() {
      setTimeout(() => { this.showPublisherDropdown = false; }, 200);
    },

    hideYearDropdown() {
      setTimeout(() => { this.showYearDropdown = false; }, 200);
    },

    resetAllFilters() {
      this.searchKeyword = '';
      this.searchAuthor = '';
      this.selectedGenres = [];
      this.selectedRatings = [];
      this.selectedPublishers = [];
      this.selectedPublishYears = [];
      this.sortOption = 'popular';
      this.currentPage = 1;
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.$router.push({ query: { ...this.$route.query, page } });
      }
    },

    // ===================== SÁCH: NAVIGATE =====================
    goToBookDetail(bookId) {
      this.$router.push({ name: 'DetailBook', params: { id: bookId } });
    },

    // ===================== SÁCH: FAVORITE =====================
    async toggleFavorite(book) {
      const maDocGia = userState._id;
      if (!maDocGia) { alert('Bạn cần đăng nhập để thêm yêu thích'); return; }
      const bookId = book._id.toString();
      try {
        if (this.isFavorite(bookId)) {
          await bookService.deleteFavoriteBook({ MaSach: bookId, MaDocGia: maDocGia });
          this.favoriteBookIds = this.favoriteBookIds.filter((id) => id.toString() !== bookId);
          alert('Đã bỏ yêu thích!');
        } else {
          await bookService.addFavoriteBook({ MaSach: bookId, MaDocGia: maDocGia });
          this.favoriteBookIds.push(bookId);
          alert('Đã thêm vào danh sách yêu thích!');
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi thay đổi yêu thích!');
      }
    },

    isFavorite(bookId) {
      if (!this.favoriteBookIds || !bookId) return false;
      return this.favoriteBookIds.some((id) => id.toString() === bookId.toString());
    },

    // ===================== SÁCH: TỦ SÁCH =====================
    isInShelf(bookId) {
      if (!this.shelfBookIds || !bookId) return false;
      return this.shelfBookIds.some((id) => id.toString() === bookId.toString());
    },

    async toggleShelf(book) {
      const maDocGia = userState._id;
      if (!maDocGia) { alert('Bạn cần đăng nhập để sử dụng tủ sách'); return; }
      const bookId = book._id.toString();
      try {
        if (this.isInShelf(bookId)) {
          await bookService.removeBookFromShelf({ MaSach: bookId, MaDocGia: maDocGia });
          this.shelfBookIds = this.shelfBookIds.filter((id) => id.toString() !== bookId);
          window.dispatchEvent(new Event('shelf-updated'));
          alert('Đã bỏ sách khỏi tủ!');
        } else {
          try {
            const response = await bookService.addBookIntoShelf({ MaSach: bookId, MaDocGia: maDocGia });
            if (response) {
              this.shelfBookIds.push(bookId);
              window.dispatchEvent(new Event('shelf-updated'));
              alert('Đã thêm vào tủ sách!');
            } else {
              alert('Sách đã có trong tủ rồi!');
            }
          } catch (error) {
            if (error.response?.data?.error === 'BOOK_IN_USE') {
              alert(error.response.data.message);
            } else {
              alert('Có lỗi xảy ra khi thêm vào tủ sách!');
            }
          }
        }
      } catch (error) {
        alert('Có lỗi xảy ra!');
      }
    },

    // ===================== SÁCH: MƯỢN NHANH =====================
    async quickBorrowInLibrary(book) {
      const maDocGia = userState._id;
      if (!maDocGia) { alert('Bạn cần đăng nhập để mượn sách'); return; }
      if (book.SoQuyen === 0) { alert('Sách đã hết!'); return; }

      try {
        const cardRes = await libraryService.getLibraryCard({ MaDocGia: maDocGia });
        const cardInfo = cardRes?.cardInfo;
        if (!cardInfo) { alert('Không tìm thấy thẻ thư viện của bạn!'); return; }
        if (cardInfo.TrangThai === 'Hết hạn') {
          alert('Thẻ thư viện của bạn đã hết hạn. Vui lòng gia hạn trước khi mượn sách!');
          return;
        }

        const [currentBorrow, todayBorrow, currentPending, todayPending, quyDinh] = await Promise.all([
          bookService.countCurrentBorrowing({ MaDocGia: maDocGia }),
          bookService.countCurrentBorrowingToday({ MaDocGia: maDocGia }),
          bookService.countCurrentPending({ MaDocGia: maDocGia }),
          bookService.countCurrentPendingToday({ MaDocGia: maDocGia }),
          bookService.getBookBorrowRule(),
        ]);

        const isLecturer = userState.userType === 'Giảng viên';
        const MAX_TOTAL = isLecturer ? (quyDinh?.maxBooksLecturer || 10) : (quyDinh?.maxBooks || 5);
        const MAX_DAILY = isLecturer ? (quyDinh?.maxBooksPerDayLecturer || 5) : (quyDinh?.maxBooksPerDay || 3);

        if (currentBorrow + 1 > MAX_TOTAL) {
          alert(`❌ Vượt quá giới hạn tổng số sách\n\n• Đang mượn: ${currentBorrow} cuốn\n• Giới hạn tối đa: ${MAX_TOTAL} cuốn\n\n➡️ Bạn chỉ có thể mượn thêm ${MAX_TOTAL - currentBorrow} cuốn`);
          return;
        }
        if (todayBorrow + 1 > MAX_DAILY) {
          alert(`❌ Vượt quá giới hạn mượn trong ngày\n\n• Hôm nay đã mượn: ${todayBorrow} cuốn\n• Giới hạn mỗi ngày: ${MAX_DAILY} cuốn\n\n➡️ Hôm nay bạn chỉ có thể mượn thêm ${MAX_DAILY - todayBorrow} cuốn`);
          return;
        }
        if (currentBorrow + currentPending + 1 > MAX_TOTAL) {
          const remaining = MAX_TOTAL - currentBorrow - currentPending;
          alert(remaining > 0
            ? `❌ Vượt quá giới hạn với sách chờ duyệt\n\n• Đang mượn: ${currentBorrow} cuốn\n• Đang chờ duyệt: ${currentPending} cuốn\n• Giới hạn tối đa: ${MAX_TOTAL} cuốn\n\n➡️ Bạn chỉ có thể đăng ký mượn thêm ${remaining} cuốn`
            : `❌ Không thể đăng ký mượn thêm\n\n• Đang mượn: ${currentBorrow} cuốn\n• Đang chờ duyệt: ${currentPending} cuốn\n• Giới hạn tối đa: ${MAX_TOTAL} cuốn`
          );
          return;
        }
        if (todayBorrow + todayPending + 1 > MAX_DAILY) {
          const remainingToday = MAX_DAILY - todayBorrow - todayPending;
          alert(remainingToday > 0
            ? `❌ Vượt quá giới hạn trong ngày\n\n• Hôm nay đã mượn: ${todayBorrow} cuốn\n• Hôm nay đang chờ duyệt: ${todayPending} cuốn\n• Giới hạn mỗi ngày: ${MAX_DAILY} cuốn\n\n➡️ Hôm nay bạn chỉ có thể đăng ký mượn thêm ${remainingToday} cuốn`
            : `❌ Hôm nay không thể đăng ký mượn thêm\n\n• Hôm nay đã mượn: ${todayBorrow} cuốn\n• Hôm nay đang chờ duyệt: ${todayPending} cuốn\n• Giới hạn mỗi ngày: ${MAX_DAILY} cuốn`
          );
          return;
        }

        try {
          const result = await bookService.lendBook({ MaSach: book._id, MaDocGia: maDocGia, SoLuongMuon: 1 });
          if (!result.success) {
            if (result.error === 'BOOK_ALREADY_BORROWED') {
              const statusText = { pending: 'đang chờ duyệt', processing: 'đang xử lý', approved: 'đang mượn', overdue: 'quá hạn' };
              alert(`❌ Không thể mượn sách này!\n\nBạn ${statusText[result.currentStatus] || 'đang có yêu cầu với'} cuốn sách này.\nVui lòng trả sách hoặc chờ xử lý xong trước khi mượn lại.`);
            } else {
              alert('❌ ' + (result.message || 'Đăng ký mượn thất bại!'));
            }
            return;
          }

          alert('✅ Đăng ký mượn sách thành công!\n\nVui lòng chờ thư viện duyệt yêu cầu.');
          const shelfRes = await bookService.getAllBooksOnShelf(maDocGia);
          this.shelfBookIds = Array.isArray(shelfRes) ? shelfRes.map((b) => b._id.toString()) : [];
          window.dispatchEvent(new Event('shelf-updated'));
        } catch (apiError) {
          if (apiError.response?.data?.error === 'BOOK_ALREADY_BORROWED') {
            const statusText = { pending: 'đang chờ duyệt', processing: 'đang xử lý', approved: 'đang mượn', overdue: 'quá hạn' };
            alert(`❌ Không thể mượn sách này!\n\nBạn ${statusText[apiError.response.data.currentStatus] || 'đang có yêu cầu với'} cuốn sách này.\nVui lòng trả sách hoặc chờ xử lý xong trước khi mượn lại.`);
          } else {
            alert('❌ Đã xảy ra lỗi khi đăng ký mượn sách!');
          }
        }
      } catch (error) {
        alert('❌ Đã xảy ra lỗi khi đăng ký mượn sách!');
      }
    },

    // ===================== HELPERS =====================
    getStarStyle(avg, index) {
      const avgNum = parseFloat(avg) || 0;
      const fullStars = Math.floor(avgNum);
      const decimal = avgNum - fullStars;
      if (index <= fullStars) return { color: '#fa8c16' };
      if (index === fullStars + 1 && decimal > 0) {
        const percent = Math.round(decimal * 100);
        return {
          background: `linear-gradient(90deg, #fa8c16 ${percent}%, #ccc ${percent}%)`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        };
      }
      return { color: '#ccc' };
    },

    formatPrice(value) {
      if (typeof value !== 'number') return value;
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
  },

  computed: {
    // ---- Filter publishers/years cho autocomplete ----
    filteredPublishers() {
      if (!this.publisherSearchKeyword.trim()) return this.publishers;
      const kw = removeVietnameseTones(this.publisherSearchKeyword.toLowerCase());
      return this.publishers.filter((pub) =>
        removeVietnameseTones(pub.TenNXB.toLowerCase()).includes(kw)
      );
    },

    filteredPublishYears() {
      if (!this.yearSearchKeyword.trim()) return this.publishYears;
      return this.publishYears.filter((year) =>
        year.toString().includes(this.yearSearchKeyword.trim())
      );
    },

    hasActiveFilters() {
      return !!(
        this.searchKeyword ||
        this.searchAuthor ||
        this.selectedPublishers.length ||
        this.selectedPublishYears.length ||
        this.selectedGenres.length ||
        this.selectedRatings.length
      );
    },

    // ---- Filter sách theo tab đang active ----
    filteredBooks() {
      let result = this.books;

      if (this.activeTab === 'sach') {
        result = result.filter((b) => b.LoaiSach === 'Sach');
      } else if (this.activeTab === 'giaotrinh') {
        result = result.filter((b) => b.LoaiSach === 'GiaoTrinh');
      }

      if (this.searchKeyword.trim()) {
        const kw = this.searchKeyword.toLowerCase().trim();
        result = result.filter((b) =>
          b.TenSach.toLowerCase().includes(kw) || b.MaSach.toLowerCase().includes(kw)
        );
      }

      if (this.searchAuthor.trim()) {
        const kw = this.searchAuthor.toLowerCase().trim();
        result = result.filter((b) => b.TacGia.toLowerCase().includes(kw));
      }

      if (this.activeTab === 'giaotrinh' && this.selectedKhoas.length > 0) {
        result = result.filter((b) => {
          const id = b.Khoa?._id ? b.Khoa._id.toString() : b.Khoa?.toString();
          return id && this.selectedKhoas.includes(id);
        });
      } else if (this.activeTab === 'sach' && this.selectedGenres.length > 0) {
        result = result.filter((b) => {
          const id = b.MaTheLoai?._id ? b.MaTheLoai._id.toString() : b.MaTheLoai?.toString();
          return id && this.selectedGenres.includes(id);
        });
      }

      if (this.selectedRatings.length > 0) {
        result = result.filter((b) => {
          const rating = parseFloat(b.averageRating) || 0;
          return this.selectedRatings.some((r) => {
            const n = parseInt(r);
            if (n === 5) return rating >= 5.0;
            if (n === 4) return rating >= 4.0 && rating < 5.0;
            if (n === 3) return rating >= 3.0 && rating < 4.0;
            return false;
          });
        });
      }

      if (this.selectedPublishers.length > 0) {
        result = result.filter((b) => {
          const id = b.MaNXB?._id ? b.MaNXB._id.toString() : b.MaNXB?.toString();
          return id && this.selectedPublishers.includes(id);
        });
      }

      if (this.selectedPublishYears.length > 0) {
        result = result.filter((b) => this.selectedPublishYears.includes(b.NamXuatBan));
      }

      return result;
    },

    sortedBooks() {
      if (this.sortOption === 'new') {
        return [...this.filteredBooks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      if (this.sortOption === 'title') {
        return [...this.filteredBooks].sort((a, b) =>
          a.TenSach.localeCompare(b.TenSach, 'vi', { sensitivity: 'base' })
        );
      }
      // popular (default)
      return [...this.filteredBooks].sort((a, b) => {
        const ap = this.popularBooks.find((p) => p._id === a._id);
        const bp = this.popularBooks.find((p) => p._id === b._id);
        if (ap && bp) return bp.score - ap.score;
        if (ap) return -1;
        if (bp) return 1;
        return 0;
      });
    },

    paginatedBooks() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.sortedBooks.slice(start, start + this.pageSize);
    },

    totalPages() {
      return Math.ceil(this.sortedBooks.length / this.pageSize);
    },
  },

  watch: {
    // Reset trang khi thay đổi filter
    sortOption() { this.goToPage(1); },
    searchKeyword() { this.goToPage(1); },
    searchAuthor() { this.goToPage(1); },
    selectedGenres() { this.goToPage(1); },
    selectedKhoas() { this.goToPage(1); },
    selectedRatings() { this.goToPage(1); },
    selectedPublishers() { this.goToPage(1); },
    selectedPublishYears() { this.goToPage(1); },

    // Tự set sub-tab khi đổi tab chính
    activeTab(newTab) {
      if (newTab === 'nienluan') {
        this.nienLuanTabFromURL = userState.userType === 'Sinh viên' ? 'nop' : 'quanlydot';
      } else if (newTab === 'luanvan') {
        this.thesisTabFromURL = 'nop';
      }
    },

    // Sync từ URL query
    '$route.query.page'(newPage) {
      const p = parseInt(newPage);
      if (!isNaN(p) && p >= 1 && p <= this.totalPages) this.currentPage = p;
    },
    '$route.query.genre'(newGenre) {
      this.selectedGenres = newGenre ? [newGenre] : [];
    },
    '$route.query.sort'(newSort) {
      if (['popular', 'new', 'title'].includes(newSort)) this.sortOption = newSort;
    },
    '$route.query.author'(newAuthor) {
      if (newAuthor) this.searchAuthor = newAuthor;
    },
    '$route.query.tab'(newTab) {
      if (['sach', 'giaotrinh', 'luanvan', 'nienluan'].includes(newTab)) this.activeTab = newTab;
    },
  },

  beforeRouteEnter(to, from, next) {
    next(() => { window.scrollTo(0, 0); });
  },
};
</script>