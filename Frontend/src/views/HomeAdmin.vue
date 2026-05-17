<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-lg-2 wrapper-column-1">
        <div class="book__admin-navigation">
          <div class="book__admin-information">
            <div class="admin-info">
              <i class="fa-solid fa-circle-user"></i>
              <span class="admin-name">{{ userState.hoTen || 'Admin' }}</span>

              <div class="admin-dropdown">
                <div class="logout-button" @click="handleLogout">Đăng xuất</div>
              </div>
            </div>
          </div>

          <!-- Các mục menu -->
          <router-link
            to="/homeAdmin/managementLibraryCard"
            class="book__admin-navigation-option"
            :class="{
              'book__admin-navigation-option--choosing': $route.path.includes(
                'managementLibraryCard'
              ),
            }"
          >
            <div class="book__admin-navigation-icon">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div class="book__admin-navigation-title">Thẻ Thư Viện</div>
          </router-link>

          <router-link
            to="/homeAdmin/managementStudyRoom"
            class="book__admin-navigation-option"
            :class="{
              'book__admin-navigation-option--choosing': $route.path.includes(
                'managementStudyRoom'
              ),
            }"
          >
            <div class="book__admin-navigation-icon">
              <i class="fa-solid fa-door-open"></i>
            </div>
            <div class="book__admin-navigation-title">Phòng Học</div>
          </router-link>

          <!-- Management Borrow Book-->
          <router-link
            to="/homeAdmin/managementBorrowBook"
            class="book__admin-navigation-option"
            :class="{
              'book__admin-navigation-option--choosing': $route.path.includes(
                'managementBorrowBook'
              ),
            }"
          >
            <div class="book__admin-navigation-icon">
              <i class="fa-solid fa-book-open-reader"></i>
            </div>
            <div class="book__admin-navigation-title">Mượn Sách</div>
          </router-link>

          <!-- Management Book -->
          <router-link
            to="/homeAdmin/managementBook"
            class="book__admin-navigation-option"
            :class="{
              'book__admin-navigation-option--choosing':
                $route.path.includes('managementBook'),
            }"
          >
            <div class="book__admin-navigation-icon">
              <i class="fa-solid fa-book-medical"></i>
            </div>
            <div class="book__admin-navigation-title">Sách</div>
          </router-link>

          <!-- Management TextBook -->
          <router-link
            to="/homeAdmin/managementTextBook"
            class="book__admin-navigation-option"
            :class="{
              'book__admin-navigation-option--choosing':
                $route.path.includes('managementTextBook'),
            }"
          >
            <div class="book__admin-navigation-icon">
              <i class="fa-solid fa-book"></i>
            </div>
            <div class="book__admin-navigation-title">Giáo Trình</div>
          </router-link>

          <!-- Management Thesis -->
          <router-link
            to="/homeAdmin/thesis"
            class="book__admin-navigation-option"
            :class="{
              'book__admin-navigation-option--choosing':
                $route.path.includes('thesis'),
            }"
          >
            <div class="book__admin-navigation-icon">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div class="book__admin-navigation-title">Luận Văn</div>
          </router-link>

          <!-- Management Statistics Dropdown -->
          <div
            class="book__admin-navigation-option book__admin-navigation-option--parent"
            @click="toggleStatisticsMenu"
          >
            <div class="book__admin-navigation-icon">
              <i class="fa-solid fa-chart-column"></i>
            </div>
            <div class="book__admin-navigation-title">Thống kê</div>
            <i
              class="fa-solid fa-chevron-down dropdown-arrow"
              :class="{ rotate: isStatisticsMenuOpen }"
            ></i>
          </div>
          <div
            class="submenu"
            :class="{ 'submenu--open': isStatisticsMenuOpen }"
          >
            <router-link
              to="/homeAdmin/statisticsBook"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing':
                  $route.path === '/homeAdmin/statisticsBook',
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-book"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê tổng hợp mượn sách 
              </div>
            </router-link>

            <router-link
              to="/homeAdmin/statisticsBorrowBook"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing':
                  $route.path === '/homeAdmin/statisticsBorrowBook',
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-file-invoice"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê tình trạng mượn sách
              </div>
            </router-link>

            <router-link
              to="/homeAdmin/statisticsBorrowBookWithReader"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing': $route.path.includes(
                  'statisticsBorrowBookWithReader'
                ),
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-user"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê mượn sách theo độc giả
              </div>
            </router-link>

            <router-link
              to="/homeAdmin/statisticsBookDocument"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing': $route.path.includes(
                  'statisticsBookDocument'
                ),
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-folder-open"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê tài liệu sách
              </div>
            </router-link>

            <router-link
              to="/homeAdmin/statisticsRoom"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing':
                  $route.path === '/homeAdmin/statisticsRoom',
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-door-open"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê tổng hợp đặt phòng 
              </div>
            </router-link>

            <router-link
              to="/homeAdmin/statisticsBookingRoom"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing': $route.path.includes(
                  'statisticsBookingRoom'
                ),
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-calendar-check"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê tình trạng đặt phòng
              </div>
            </router-link>

            <router-link
              to="/homeAdmin/statisticsRoomWithReader"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing': $route.path.includes(
                  'statisticsRoomWithReader'
                ),
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-users"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê đặt phòng theo độc giả
              </div>
            </router-link>

            <router-link
              v-if="userState.role === 'Manager'"
              to="/homeAdmin/reportStatistics"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing':
                  $route.path.includes('reportStatistics'),
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-file-lines"></i>
              </div>
              <div class="book__admin-navigation-title">Xem báo cáo</div>
            </router-link>

            <router-link
              to="/homeAdmin/statisticsThesis"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing':
                  $route.path === '/homeAdmin/statisticsThesis',
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-scroll"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê luận văn
              </div>
            </router-link>
            
            <router-link
              to="/homeAdmin/statisticsEssay"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing':
                  $route.path === '/homeAdmin/statisticsEssay',
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-file-lines"></i>
              </div>
              <div class="book__admin-navigation-title">
                Thống kê niên luận
              </div>
            </router-link>

            <router-link
              v-if="userState.role === 'Admin'"
              to="/homeAdmin/submitStatistics"
              class="book__admin-navigation-option book__admin-navigation-option--sub"
              :class="{
                'book__admin-navigation-option--choosing':
                  $route.path.includes('submitStatistics'),
              }"
            >
              <div class="book__admin-navigation-icon">
                <i class="fa-solid fa-file-upload"></i>
              </div>
              <div class="book__admin-navigation-title">Nộp báo cáo</div>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-lg-10 wrapper-column-2 mt-5">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { userState } from '../assets/js/userState';

export default {
  name: 'HomeAdmin',
  components: {},
  data() {
    return {
      userState,
      isBookMenuOpen: false,
      isTextBookMenuOpen: false,
      isStatisticsMenuOpen: false,
    };
  },
  watch: {
    // Theo dõi route để tự động mở dropdown khi vào trang con
    '$route.path': {
      immediate: true,
      handler(newPath) {
        if (newPath.includes('addBook') || newPath.includes('updateBook')) {
          this.isBookMenuOpen = true;
        }
        if (
          newPath.includes('addTextBook') ||
          newPath.includes('updateTextBook')
        ) {
          this.isTextBookMenuOpen = true;
        }
        if (
          newPath.includes('statisticsBook') ||
          newPath.includes('statisticsRoom')
        ) {
          this.isStatisticsMenuOpen = true;
        }
      },
    },
  },
  methods: {
    handleLogout() {
      // Xóa localStorage
      localStorage.removeItem('_id');
      localStorage.removeItem('role');
      localStorage.removeItem('hoTen');

      this.userState._id = null;
      this.userState.role = null;
      this.userState.hoTen = null;

      // Chuyển hướng về trang login
      this.$router.push('/login');
    },

    toggleBookMenu() {
      this.isBookMenuOpen = !this.isBookMenuOpen;
    },

    toggleTextBookMenu() {
      this.isTextBookMenuOpen = !this.isTextBookMenuOpen;
    },

    toggleStatisticsMenu() {
      this.isStatisticsMenuOpen = !this.isStatisticsMenuOpen;
    },
  },
};
</script>

<style scoped>
.book-admin-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 0 auto 40px auto;
  flex-wrap: wrap;
}

.nav-button {
  padding: 8px 22px;
  font-size: 16px;
  font-weight: 500;
  border: 2px solid transparent;
  border-radius: 30px;
  background-color: #f7f7f7;
  color: #333;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.nav-button:hover {
  background-color: #3f51b5;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(63, 81, 181, 0.4);
}

.nav-button.active {
  background-color: #3f51b5;
  color: white;
  border-color: #3f51b5;
  font-weight: 600;
  box-shadow: 0 6px 12px rgba(63, 81, 181, 0.4);
  transform: translateY(-2px);
}

.book__admin-navigation {
  padding-left: 5px;
  padding-top: 3px;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px 5px;
  height: 100%;
  min-height: 100vh;
}

.book__admin-navigation-option {
  padding: 11px 20px;
  display: grid;
  grid-template-columns: 20px auto;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: #fff;
  align-items: center;
}

.book__admin-navigation-option:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
}

.book__admin-navigation-option--choosing {
  background-color: rgba(255, 255, 255, 0.25);
  color: #fff;
  border-radius: 8px;
}

/* Parent menu item with dropdown */
.book__admin-navigation-option--parent {
  grid-template-columns: 20px auto 20px;
  position: relative;
}

/* Dropdown arrow animation */
.dropdown-arrow {
  transition: transform 0.3s ease;
  font-size: 1.2rem;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

/* Submenu styles */
.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  background-color: rgba(0, 0, 0, 0.15);
}

.submenu--open {
  max-height: 130vh;
}

/* Submenu items */
.book__admin-navigation-option--sub {
  padding-left: 40px;
  font-size: 1.4rem;
  background-color: transparent;
}

.book__admin-navigation-option--sub:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Submenu active state - higher specificity */
.book__admin-navigation-option--sub.book__admin-navigation-option--choosing {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
}

.book__admin-navigation {
  padding-left: 5px;
  padding-top: 3px;
}

.book__admin-information {
  position: relative;
  padding: 15px 20px;
  font-size: 1.4rem;
  cursor: pointer;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 500;
  position: relative;
  left: -4px;
}

.admin-info i {
  font-size: 2rem;
}

.admin-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: none;
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
  transition: opacity 0.2s ease;
}

.book__admin-information:hover .admin-dropdown,
.admin-dropdown:hover {
  display: block;
}

.logout-button {
  padding: 8px 12px;
  font-size: 1.3rem;
  color: #333;
  background-color: white;
  transition: background 0.25s ease;
  width: 100%;
  box-sizing: border-box;
}

.logout-button:hover {
  background-color: #1e3a8a;
  color: white;
}

.container-fluid {
  overflow: hidden;
}
</style>
