<template>
  <div class="book__header-wrapper">
    <div class="containe">
      <div class="book__header">
        <div class="book__header-brand">
          <img
            src="/image/brand.png"
            alt=""
            @click="navigateTo('/home')"
            style="cursor: pointer"
          />
        </div>

        <!-- Hamburger Menu Button -->
        <button
          class="hamburger-menu"
          @click="toggleMenu"
          :class="{ active: isMenuOpen }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="book__header-navigation" :class="{ active: isMenuOpen }">
          <a @click="navigateTo('/home')" class="book__header-link">Trang chủ</a>
          <a @click="navigateTo('/library')" class="book__header-link">Thư viện</a>
          <a @click="navigateTo('/myBook')" class="book__header-link">Sách của tôi</a>
          <a @click="navigateTo('/studyRoom')" class="book__header-link">Phòng học</a>
          <a @click="navigateTo('/myShelf')" class="book__header-link">Tủ sách</a>
        </div>

        <div class="book__header-unity-bar">
          <div class="book__header-my-account">
            <i class="fa-regular fa-circle-user"></i>
            <span class="book__header-name-user">{{
              userState.hoTen || 'User'
            }}</span>

            <div class="book__header-dropdown">
              <a
                @click="navigateTo('/libraryCard')"
                class="book__header-dropdown-element"
              >
                <i class="fa-solid fa-id-card"></i>
                Thẻ thư viện
              </a>

              <div class="book__header-dropdown-element" @click="handleLogout">
                <i class="fa-solid fa-right-from-bracket"></i>
                Đăng xuất
              </div>
            </div>
          </div>

          <!-- Shelf Icon Dropdown -->
          <div class="util-btn util-btn--shelf-wrapper" ref="shelfArea">
            <button
              class="util-btn util-btn--shelf"
              @click="toggleShelfDropdown"
            >
              <i class="fa-solid fa-layer-group"></i>
              <span v-if="shelfBooksCount > 0" class="badge">{{
                shelfBooksCount
              }}</span>
            </button>

            <div v-show="showShelfDropdown" class="shelf-dropdown">
              <div class="shelf-dropdown__header">
                <span>Tủ sách của tôi</span>
                <span class="shelf-dropdown__count"
                  >({{ shelfBooksCount }} cuốn)</span
                >
              </div>

              <div v-if="shelfBooks.length === 0" class="shelf-dropdown__empty">
                <i class="fa-solid fa-inbox"></i>
                <p>Tủ sách trống</p>
              </div>

              <ul v-else class="shelf-list">
                <li
                  v-for="book in shelfBooks"
                  :key="book._id"
                  class="shelf-item"
                  @click="goToBookDetailFromShelf(book._id)"
                >
                  <div class="shelf-item__image">
                    <img :src="book.Image" :alt="book.TenSach" />
                  </div>
                  <div class="shelf-item__info">
                    <div class="shelf-item__title">{{ book.TenSach }}</div>
                    <div class="shelf-item__author">{{ book.TacGia }}</div>
                  </div>
                  <button
                    class="shelf-item__remove"
                    @click="removeBookFromShelf(book._id, $event)"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </li>
              </ul>

              <div class="shelf-dropdown__footer" v-if="shelfBooksCount > 0">
                <button class="shelf-dropdown__view-all" @click="goToMyShelf">
                  Xem tất cả ({{ shelfBooksCount }})
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="util-btn util-btn--notif-wrapper" ref="notifArea">
            <button
              class="util-btn util-btn--notif"
              @click="toggleNotifications"
            >
              <i class="fa-regular fa-bell"></i>
              <span v-if="unreadCount > 0" class="badge">{{
                unreadCount
              }}</span>
            </button>

            <div v-show="showNotifications" class="notif-dropdown">
              <div class="notif-dropdown__header">Thông báo</div>
              <ul class="notif-list">
                <li
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="notif-item"
                  :class="[
                    'notif-item',
                    'notif--' + notif.type,
                    { 'notif--unread': !isReadNotification(notif.id) },
                  ]"
                >
                  <div class="notif-item__icon">
                    <i
                      v-if="notif.type === 'success'"
                      class="fa-solid fa-circle-check"
                    ></i>
                    <i
                      v-else-if="notif.type === 'error'"
                      class="fa-solid fa-circle-exclamation"
                    ></i>
                    <i
                      v-else-if="notif.type === 'warning'"
                      class="fa-solid fa-triangle-exclamation"
                    ></i>
                    <i v-else class="fa-solid fa-info-circle"></i>
                  </div>
                  <div class="notif-item__content">
                    <div class="notif-item__header">
                      <div class="notif-item__title">{{ notif.title }}</div>
                    </div>
                    <div class="notif-item__msg">{{ notif.message }}</div>
                    <div class="notif-item__date">
                      {{ formatDate(notif.createdAt) }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="book__header-search-book">
            <i class="fa-solid fa-magnifying-glass"></i>

            <div class="book__header-search-dropdown">
              <input
                type="text"
                placeholder="Tìm sách..."
                v-model="searchQuery"
                @input="handleSearchInput"
              />

              <div
                class="book__header-search-result"
                v-show="showSearchResults"
              >
                <div class="book__header-search-result-list">
                  <div
                    class="book__header-search-result-element"
                    v-for="book in searchResults.slice(0, 5)"
                    :key="book._id"
                    @click="goToBookDetail(book._id)"
                    style="cursor: pointer"
                  >
                    <div class="book__header-search-result-element-image">
                      <img :src="book.Image" :alt="book.TenSach" />
                    </div>

                    <div class="book__header-search-result-element-information">
                      <div class="book__header-search-result-element-title">
                        {{ book.TenSach }}
                      </div>
                      <div class="book__header-search-result-element-author">
                        {{ book.TacGia }}
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="searchResults.length === 0"
                    style="padding: 15px; text-align: center; color: #666"
                  >
                    Không tìm thấy kết quả nào
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';
import { notificationService } from '../services/notification/notification.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'Header',
  data() {
    return {
      userState,
      genres: [],
      showNotifications: false,
      unreadCount: 0,
      notifications: [],
      readNotificationIds: [],
      books: [],
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      searchTimeout: null,
      isMenuOpen: false,

      showShelfDropdown: false,
      shelfBooks: [],
      shelfBooksCount: 0,
    };
  },
  async mounted() {
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('shelf-updated', this.fetchShelfBooks);
    await this.fetchGenres();
    await this.fetchAllBooks();
    await this.fetchNotifications();
    await this.fetchShelfBooks();
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('shelf-updated', this.fetchShelfBooks);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
  methods: {
    navigateTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
      this.closeMenu();
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    closeMenu() {
      this.isMenuOpen = false;
    },

    async fetchNotifications() {
      try {
        const response = await notificationService.getAllNotificationByUserId({
          DocGia: userState._id,
        });

        this.notifications = response.map((notif) => ({
          id: notif._id,
          title: notif.TieuDe,
          message: notif.NoiDung,
          type: notif.LoaiThongBao,
          isRead: notif.DaDoc,
          createdAt: notif.createdAt,
        }));

        this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
      }
    },

    handleLogout() {
      const role = localStorage.getItem('role');
      localStorage.removeItem('_id');
      localStorage.removeItem('role');
      localStorage.removeItem('hoTen');
      if (role === 'User') {
        localStorage.removeItem('userType');
      }

      this.userState._id = null;
      this.userState.role = null;
      this.userState.hoTen = null;
      if (role === 'User') {
        this.userState.userType = null;
      }

      this.$router.push('/login');
    },

    async handleClickOutside(event) {
      const notifArea = this.$refs.notifArea;
      if (
        notifArea &&
        !notifArea.contains(event.target) &&
        this.showNotifications
      ) {
        const unreadIds = this.notifications
          .filter((n) => !n.isRead)
          .map((n) => n.id);

        if (unreadIds.length > 0) {
          try {
            await notificationService.markMultipleAsRead({
              notificationIds: unreadIds,
            });

            this.notifications.forEach((notif) => {
              if (unreadIds.includes(notif.id)) {
                notif.isRead = true;
              }
            });

            this.unreadCount = 0;
          } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc:', error);
          }
        }

        this.showNotifications = false;
      }

      const bellArea = this.$refs.bellArea;
      if (bellArea && !bellArea.contains(event.target)) {
        this.showNotifications = false;
      }

      const shelfArea = this.$refs.shelfArea;
      if (shelfArea && !shelfArea.contains(event.target)) {
        this.showShelfDropdown = false;
      }
    },

    async fetchGenres() {
      try {
        const response = await bookService.getAllGenre();
        this.genres = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách thể loại:', error);
      }
    },

    goToLibraryWithGenre(genreId) {
      this.$router.push({
        name: 'Library',
        query: { genre: genreId },
      });
    },

    isReadNotification(notifId) {
      const notif = this.notifications.find((n) => n.id === notifId);
      return notif ? notif.isRead : false;
    },

    async toggleNotifications() {
      if (this.showNotifications) {
        const unreadIds = this.notifications
          .filter((n) => !n.isRead)
          .map((n) => n.id);

        if (unreadIds.length > 0) {
          try {
            await notificationService.markMultipleAsRead({
              notificationIds: unreadIds,
            });

            this.notifications.forEach((notif) => {
              if (unreadIds.includes(notif.id)) {
                notif.isRead = true;
              }
            });

            this.unreadCount = 0;
          } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc:', error);
          }
        }
      }

      this.showNotifications = !this.showNotifications;
    },

    async fetchAllBooks() {
      try {
        this.books = await bookService.getAllBook();
      } catch (error) {
        console.error('Lỗi khi tải danh sách sách:', error);
      }
    },

    searchBooks() {
      if (this.searchQuery.trim() === '') {
        this.searchResults = [];
        this.showSearchResults = false;
        return;
      }

      this.searchResults = this.books.filter(
        (book) =>
          book.TenSach.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          book.TacGia.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.showSearchResults = true;
    },

    handleSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchBooks();
      }, 300);
    },

    selectBook(book) {
      this.$router.push({ name: 'BookDetail', params: { id: book._id } });
      this.showSearchResults = false;
      this.searchQuery = '';
    },

    goToBookDetail(bookId) {
      this.$router.push({ name: 'DetailBook', params: { id: bookId } });
      this.showSearchResults = false;
      this.searchQuery = '';
      this.closeMenu();
    },

    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },

    async fetchShelfBooks() {
      try {
        if (!userState._id) {
          this.shelfBooks = [];
          this.shelfBooksCount = 0;
          return;
        }

        const response = await bookService.getAllBooksOnShelf(userState._id);
        this.shelfBooks = (response || []).slice(0, 3);
        this.shelfBooksCount = (response || []).length;
      } catch (error) {
        console.error('Lỗi khi tải tủ sách:', error);
        this.shelfBooks = [];
        this.shelfBooksCount = 0;
      }
    },

    toggleShelfDropdown() {
      this.showShelfDropdown = !this.showShelfDropdown;
    },

    goToMyShelf() {
      this.showShelfDropdown = false;
      this.$router.push('/myShelf');
    },

    goToBookDetailFromShelf(bookId) {
      this.showShelfDropdown = false;
      this.$router.push({ name: 'DetailBook', params: { id: bookId } });
    },

    async removeBookFromShelf(bookId, event) {
      event.stopPropagation();

      const confirmDelete = window.confirm(
        'Bạn có chắc muốn xóa sách này khỏi tủ?'
      );
      if (!confirmDelete) return;

      try {
        await bookService.removeBookFromShelf({
          MaSach: bookId,
          MaDocGia: userState._id,
        });

        await this.fetchShelfBooks();
        alert('Đã xóa sách khỏi tủ!');
      } catch (error) {
        console.error('Lỗi khi xóa sách:', error);
        alert('Không thể xóa sách!');
      }
    },
  },
};
</script>

<style scoped>
/* ==================== BASE HEADER ==================== */
.book__header-wrapper {
  width: 100%;
}

.book__header {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
}

/* Brand: dùng max-width + width % để tự co theo viewport */
.book__header-brand {
  flex-shrink: 1;        /* CHO PHÉP co nhỏ khi thiếu chỗ */
  flex: 0 1 auto;
  min-width: 0;
}

.book__header-brand img {
  display: block;
  width: clamp(120px, 18vw, 240px);  /* Co từ 120px → 240px theo viewport */
  height: auto;                        /* Giữ tỉ lệ gốc */
  object-fit: contain;
}

/* Navigation: không bao giờ wrap, co được */
.book__header-navigation {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  min-width: 0;
}

.book__header-link {
  white-space: nowrap;
  cursor: pointer;
}

/* Unity bar không co nhỏ */
.book__header-unity-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* ==================== HAMBURGER MENU STYLES ==================== */
.hamburger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  flex-shrink: 0;
}

.hamburger-menu span {
  width: 30px;
  height: 3px;
  background-color: #fa553c;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-menu.active span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger-menu.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-menu.active span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* ==================== BREAKPOINTS ==================== */

/*
  Desktop lớn (> 1300px)  : navigation đầy đủ, font/padding bình thường
  Desktop vừa (1085–1300px): thu nhỏ font/padding để 5 link vừa 1 dòng
  Desktop nhỏ (900–1084px) : thu nhỏ thêm, logo dùng clamp tự co
  Tablet / Mobile (≤ 899px): hamburger, navigation thành slide-in panel
*/

/* Desktop vừa: thu nhỏ link để 5 link không bị wrap */
@media (max-width: 1300px) and (min-width: 1085px) {
  .book__header-link {
    font-size: 1.25rem !important;
    padding: 0 8px !important;
  }
}

/* Desktop nhỏ: thu nhỏ thêm trước khi chuyển hamburger */
@media (max-width: 1084px) and (min-width: 900px) {
  .book__header-link {
    font-size: 1.15rem !important;
    padding: 0 6px !important;
  }
}

/* Tablet và Mobile: hamburger menu */
@media (max-width: 899px) {
  .hamburger-menu {
    display: flex;
  }

  .book__header {
    height: auto;
    padding: 12px 0;
    position: relative;
  }

  /* Logo responsive — clamp xử lý, không cần override thủ công */
  .book__header-brand img {
    width: clamp(100px, 30vw, 200px);
    height: auto;
  }

  /* Navigation trở thành slide-in panel */
  .book__header-navigation {
    position: fixed;
    top: 0;
    left: -100%;
    width: 270px;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: nowrap;
    padding: 80px 0 20px;
    transition: left 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
    flex: none;
  }

  .book__header-navigation.active {
    left: 0;
  }

  .book__header-navigation .book__header-link {
    width: 100%;
    padding: 15px 30px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    justify-content: flex-start;
    color: #fff !important;
    font-weight: 600;
    font-size: 1.5rem !important;
    transition: all 0.3s ease;
    cursor: pointer;
    white-space: normal;
  }

  .book__header-navigation .book__header-link:hover {
    background-color: rgba(255, 255, 255, 0.15);
    padding-left: 40px !important;
    color: #ffd700 !important;
  }

  .book__header-name-user {
    display: none;
  }

  .book__header-unity-bar {
    gap: 12px;
  }

  /* Overlay mờ sau panel */
  .book__header-navigation.active::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
    backdrop-filter: blur(2px);
  }
}

/* Mobile vừa */
@media (max-width: 600px) {
  .book__header-wrapper {
    padding: 0 8px;
  }

  .book__header-brand img {
    width: clamp(90px, 28vw, 160px);
  }

  .book__header-navigation {
    width: 260px;
  }

  .book__header-unity-bar {
    gap: 10px;
  }

  .notif-dropdown {
    width: calc(100vw - 32px);
    right: -8px;
    max-width: 340px;
  }

  .shelf-dropdown {
    width: calc(100vw - 32px);
    right: -8px;
    max-width: 340px;
  }

  .book__header-search-dropdown input {
    width: 180px;
  }

  .book__header-search-result {
    width: 180px;
  }
}

/* Mobile nhỏ */
@media (max-width: 420px) {
  .book__header-brand img {
    width: clamp(80px, 26vw, 130px);
  }

  .book__header-navigation {
    width: 240px;
  }

  .book__header-navigation .book__header-link {
    padding: 12px 24px !important;
    font-size: 1.4rem !important;
  }

  .book__header-unity-bar {
    gap: 8px;
  }

  .book__header-dropdown {
    right: -16px;
  }

  .notif-dropdown {
    width: calc(100vw - 16px);
    right: -40px;
    max-width: none;
  }

  .shelf-dropdown {
    width: calc(100vw - 16px);
    right: -40px;
    max-width: none;
  }

  .shelf-item {
    grid-template-columns: 50px 1fr 28px;
    padding: 10px 14px;
  }

  .shelf-item__image {
    width: 50px;
    height: 68px;
  }

  .book__header-search-dropdown {
    right: -40px;
  }

  .book__header-search-dropdown input {
    width: 160px;
  }

  .book__header-search-result {
    width: 160px;
  }

  .book__header-search-result-element {
    padding: 10px;
    gap: 8px;
  }

  .book__header-search-result-element-image img {
    width: 38px;
    height: 38px;
  }
}

/* ==================== SHELF DROPDOWN STYLES ==================== */
.util-btn--shelf-wrapper {
  position: relative;
  margin-right: 8px;
}

.util-btn--shelf {
  background: none;
  border: none;
  font-size: 2.2rem;
  color: #333;
  cursor: pointer;
  position: relative;
  padding: 8px;
  transition: color 0.3s ease;
}

.util-btn--shelf:hover {
  color: #f55c4e;
}

.util-btn--shelf .badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #f55c4e;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.shelf-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: fadeInDown 0.3s ease;
}

.shelf-dropdown__header {
  padding: 18px 20px;
  border-bottom: 2px solid #f55c4e;
  background: linear-gradient(135deg, #f55c4e 0%, #ff8a75 100%);
  color: white;
  font-size: 1.6rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shelf-dropdown__count {
  font-size: 1.4rem;
  font-weight: 500;
  opacity: 0.9;
}

.shelf-dropdown__empty {
  padding: 40px 20px;
  text-align: center;
  color: #95a5a6;
}

.shelf-dropdown__empty i {
  font-size: 4rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.shelf-dropdown__empty p {
  font-size: 1.5rem;
  margin: 0;
}

.shelf-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 340px;
  overflow-y: auto;
}

.shelf-item {
  display: grid;
  grid-template-columns: 60px 1fr 35px;
  gap: 12px;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-items: center;
}

.shelf-item:hover {
  background-color: #f8f9fa;
}

.shelf-item__image {
  width: 60px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shelf-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shelf-item__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.shelf-item__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.shelf-item__author {
  font-size: 1.3rem;
  color: #7f8c8d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shelf-item__remove {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: #fee;
  color: #e74c3c;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.shelf-item:hover .shelf-item__remove {
  opacity: 1;
}

.shelf-item__remove:hover {
  background-color: #e74c3c;
  color: white;
  transform: scale(1.1);
}

.shelf-dropdown__footer {
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.shelf-dropdown__view-all {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.shelf-dropdown__view-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.shelf-dropdown__view-all i {
  font-size: 1.4rem;
}

/* Scrollbar cho shelf list */
.shelf-list::-webkit-scrollbar {
  width: 6px;
}

.shelf-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.shelf-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.shelf-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>