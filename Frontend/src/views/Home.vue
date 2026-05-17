<template>
  <Header />

  <div class="home">
    <div class="home__banner">
      <!-- Slide Bootstrap 5 -->
      <div id="myCarousel" class="carousel slide" data-bs-ride="carousel">
        <!-- Nút tròn chuyển slide -->
        <div class="carousel-indicators">
          <button
            type="button"
            data-bs-target="#myCarousel"
            data-bs-slide-to="0"
            class="active"
          ></button>
          <button
            type="button"
            data-bs-target="#myCarousel"
            data-bs-slide-to="1"
          ></button>
        </div>

        <!-- Nội dung từng slide -->
        <div class="carousel-inner">
          <div class="carousel-item active">
            <img src="/image/banner1.jpg" class="d-block w-100" alt="Slide 1" />
            <div class="carousel-caption">
              <div class="title-slide-2">
                Once you learn to read, you will be forever free.
              </div>
            </div>
          </div>
          <div class="carousel-item">
            <img src="/image/banner2.jpg" class="d-block w-100" alt="Slide 2" />
            <div
              class="carousel-caption text-start d-flex align-items-center h-100"
            >
              <div class="title-slide-1">
                A room without books is like a body without a soul.
              </div>
            </div>
          </div>
        </div>

        <!-- Mũi tên trái/phải -->
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#myCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#myCarousel"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    </div>

    <!-- SÁCH PHỔ BIẾN -->
    <div class="home__popular-book">
      <div class="home__book-header">
        <div class="home__book-header-title">Sách Phổ Biến</div>
        <div class="home__book-line">
          <div class="line"></div>
        </div>
        <button type="button" class="view-all-btn" @click="goToPopularBooks">
          Xem tất cả >
        </button>
      </div>

      <div class="home__popular-book-content">
        <!-- Skeleton loading -->
        <div v-if="loadingPopular" class="row g-3 home__feature-book-list">
          <div
            class="col-6 col-sm-4 col-md-3 col-lg-2 home__feature-book-element"
            v-for="n in 6"
            :key="'skel-popular-' + n"
          >
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-info">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-author"></div>
              <div class="skeleton skeleton-stars"></div>
            </div>
          </div>
        </div>

        <!-- Dữ liệu thực -->
        <div v-else class="row g-3 home__feature-book-list">
          <div
            class="col-6 col-sm-4 col-md-3 col-lg-2 home__feature-book-element"
            v-for="book in popularBooks"
            :key="book._id"
          >
            <!-- Badge yêu thích -->
            <div v-if="isFavorite(book._id)" class="badge-favorite">
              <span>❤️</span> Yêu thích
            </div>

            <!-- Hình ảnh + icon -->
            <div
              class="home__feature-book-element-image"
              @click="goToBookDetail(book._id)"
            >
              <img :src="book.Image" :alt="book.TenSach" />

              <div class="home__book-action-icon">
                <!-- Icon yêu thích -->
                <div
                  class="home__book-action-favorite-icon"
                  :class="{ favorite: isFavorite(book._id) }"
                  @click.stop="toggleFavorite(book)"
                >
                  <i
                    :class="
                      isFavorite(book._id)
                        ? 'fa-solid fa-heart'
                        : 'fa-regular fa-heart'
                    "
                  ></i>
                </div>

                <!-- Icon xem trước -->
                <div class="home__book-action-preview-icon">
                  <i class="fa-regular fa-eye"></i>
                </div>

                <!-- Icon mượn sách -->
                <div class="home__book-action-borrow-icon">
                  <i class="fa-solid fa-book-medical"></i>
                </div>
              </div>
            </div>

            <!-- Thông tin -->
            <div class="home__feature-book-element-information">
              <div
                class="home__feature-book-element-title"
                @click="goToBookDetail(book._id)"
              >
                {{ book.TenSach }}
              </div>
              <div class="home__feature-book-element-author">
                {{ book.TacGia }}
              </div>

              <div class="rating">
                <div
                  style="padding: 4px 4px 4px 0"
                  class="non-rating"
                  v-if="!book.SoSaoTB || book.SoSaoTB === 0"
                >
                  <span>Chưa có đánh giá</span>
                </div>
                <div class="rating" v-else>
                  <span
                    v-for="index in 5"
                    :key="index"
                    class="star"
                    :style="getStarStyle(book.SoSaoTB, index)"
                  >
                    ★
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="home__feature-group-book">
      <div class="row align-items-start">
        <div class="col-12 col-lg-9 home__recommend-group-book">

          <!-- SÁCH HÔM NAY -->
          <div class="home__book-of-the-day">
            <div class="home__book-of-the-day-header">
              <div class="home__book-of-the-day-title">Sách Hôm Nay</div>
              <div class="home__book-of-the-day-line">
                <div class="line"></div>
              </div>

              <div class="home__book-of-the-day-three-dot">
                <i
                  class="fa-solid fa-circle"
                  :class="{ 'dot--active': currentDotIndex === 0 }"
                  @click="selectDot(0)"
                ></i>
                <i
                  class="fa-solid fa-circle"
                  :class="{ 'dot--active': currentDotIndex === 1 }"
                  @click="selectDot(1)"
                ></i>
                <i
                  class="fa-solid fa-circle"
                  :class="{ 'dot--active': currentDotIndex === 2 }"
                  @click="selectDot(2)"
                ></i>
              </div>
            </div>

            <!-- Skeleton today books -->
            <div v-if="loadingToday" class="home__book-of-the-day-list-book row">
              <div
                class="col-12 col-md-6 home__book-of-the-day-element"
                v-for="n in 2"
                :key="'skel-today-' + n"
              >
                <div class="skeleton skeleton-today-img"></div>
                <div class="skeleton-info" style="flex:1">
                  <div class="skeleton skeleton-title" style="width:80%"></div>
                  <div class="skeleton skeleton-author" style="width:55%"></div>
                  <div class="skeleton skeleton-stars" style="width:40%"></div>
                </div>
              </div>
            </div>

            <!-- Dữ liệu thực -->
            <div v-else class="home__book-of-the-day-list-book row">
              <div
                class="col-12 col-md-6 home__book-of-the-day-element"
                v-for="book in currentTodayBooks"
                :key="book._id"
              >
                <div
                  class="home__book-of-the-day-element-image"
                  @click="goToBookDetail(book._id)"
                >
                  <img :src="book.Image" :alt="book.TenSach" />
                </div>

                <div class="home__book-of-the-day-element-information">
                  <div
                    class="home__book-of-the-day-element-title"
                    @click="goToBookDetail(book._id)"
                  >
                    {{ book.TenSach }}
                  </div>
                  <div class="home__book-of-the-day-element-author">
                    {{ book.TacGia }}
                  </div>

                  <div class="rating">
                    <div
                      style="padding: 4px 4px 4px 0"
                      class="non-rating"
                      v-if="!book.SoSaoTB || book.SoSaoTB === 0"
                    >
                      <span>Chưa có đánh giá</span>
                    </div>
                    <div class="rating" v-else>
                      <span
                        v-for="index in 5"
                        :key="index"
                        class="star"
                        :style="getStarStyle(book.SoSaoTB, index)"
                      >
                        ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ĐANG XU HƯỚNG -->
          <div class="home__trending-book">
            <div class="home__book-header">
              <div class="home__book-header-title">Đang Xu Hướng</div>
              <div class="home__book-line">
                <div class="line"></div>
              </div>
              <div class="home__book-of-the-day-three-dot">
                <i
                  v-for="index in 3"
                  :key="index"
                  class="fa-solid fa-circle"
                  :class="{ 'dot--active': trendingDotIndex === index - 1 }"
                  @click="selectTrendingDot(index - 1)"
                ></i>
              </div>
            </div>

            <div class="home__trending-book-content">
              <!-- Skeleton trending -->
              <div v-if="loadingTrending" class="row g-5 home__feature-book-list">
                <div
                  class="col-6 col-md-4 home__feature-book-element"
                  v-for="n in 3"
                  :key="'skel-trending-' + n"
                >
                  <div class="skeleton skeleton-trending-img"></div>
                  <div class="skeleton-info">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-author"></div>
                    <div class="skeleton skeleton-stars"></div>
                  </div>
                </div>
              </div>

              <!-- Dữ liệu thực -->
              <div v-else class="row g-5 home__feature-book-list">
                <div
                  class="col-6 col-md-4 home__feature-book-element"
                  v-for="book in currentTrendingBooks"
                  :key="book._id"
                >
                  <!-- Badge yêu thích -->
                  <div v-if="isFavorite(book._id)" class="badge-favorite">
                    <span>❤️</span> Yêu thích
                  </div>

                  <!-- Hình ảnh + icon -->
                  <div
                    class="home__feature-book-element-image home__trending-book-content-image"
                    @click="goToBookDetail(book._id)"
                  >
                    <img :src="book.Image" :alt="book.TenSach" />

                    <div class="home__book-action-icon">
                      <!-- Icon yêu thích -->
                      <div
                        class="home__book-action-favorite-icon"
                        :class="{ favorite: isFavorite(book._id) }"
                        @click.stop="toggleFavorite(book)"
                      >
                        <i
                          :class="
                            isFavorite(book._id)
                              ? 'fa-solid fa-heart'
                              : 'fa-regular fa-heart'
                          "
                        ></i>
                      </div>

                      <!-- Icon xem trước -->
                      <div class="home__book-action-preview-icon">
                        <i class="fa-regular fa-eye"></i>
                      </div>

                      <!-- Icon mượn sách -->
                      <div class="home__book-action-borrow-icon">
                        <i class="fa-solid fa-book-medical"></i>
                      </div>
                    </div>
                  </div>

                  <!-- Thông tin sách -->
                  <div class="home__feature-book-element-information">
                    <div
                      class="home__feature-book-element-title"
                      @click="goToBookDetail(book._id)"
                    >
                      {{ book.TenSach }}
                    </div>
                    <div class="home__feature-book-element-author">
                      {{ book.TacGia }}
                    </div>
                    <div class="rating">
                      <div
                        style="padding: 4px 4px 4px 0"
                        class="non-rating"
                        v-if="!book.SoSaoTB || book.SoSaoTB === 0"
                      >
                        <span>Chưa có đánh giá</span>
                      </div>
                      <div class="rating" v-else>
                        <span
                          v-for="index in 5"
                          :key="index"
                          class="star"
                          :style="getStarStyle(book.SoSaoTB, index)"
                        >
                          ★
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="home__middle-banner">
            <img src="/image/banner-mid.jpg" alt="" />
          </div>

          <!-- MỚI RA MẮT -->
          <div class="home__new-release">
            <div class="home__book-header">
              <div class="home__book-header-title">Mới Ra Mắt</div>
              <div class="home__book-line">
                <div class="line"></div>
              </div>
              <button type="button" class="view-all-btn" @click="goToNewBooks">
                Xem tất cả >
              </button>
            </div>

            <div class="home__new-release-content">
              <!-- Skeleton new release -->
              <div v-if="loadingNewRelease" class="row g-5 home__feature-book-list">
                <div
                  class="col-6 col-md-4 home__feature-book-element"
                  v-for="n in 3"
                  :key="'skel-new-' + n"
                >
                  <div class="skeleton skeleton-trending-img"></div>
                  <div class="skeleton-info">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-author"></div>
                    <div class="skeleton skeleton-stars"></div>
                  </div>
                </div>
              </div>

              <!-- Dữ liệu thực -->
              <div v-else class="row g-5 home__feature-book-list">
                <div
                  class="col-6 col-md-4 home__feature-book-element"
                  v-for="book in newReleaseBooks"
                  :key="book._id"
                >
                  <div v-if="isFavorite(book._id)" class="badge-favorite">
                    <span>❤️</span> Yêu thích
                  </div>

                  <div
                    class="home__feature-book-element-image home__new-release-content-image"
                    @click="goToBookDetail(book._id)"
                  >
                    <img :src="book.Image" :alt="book.TenSach" />

                    <div class="home__book-action-icon">
                      <div
                        class="home__book-action-favorite-icon"
                        :class="{ favorite: isFavorite(book._id) }"
                        @click.stop="toggleFavorite(book)"
                      >
                        <i
                          :class="
                            isFavorite(book._id)
                              ? 'fa-solid fa-heart'
                              : 'fa-regular fa-heart'
                          "
                        ></i>
                      </div>

                      <div class="home__book-action-preview-icon">
                        <i class="fa-regular fa-eye"></i>
                      </div>

                      <div class="home__book-action-borrow-icon">
                        <i class="fa-solid fa-book-medical"></i>
                      </div>
                    </div>
                  </div>

                  <div class="home__feature-book-element-information">
                    <div
                      class="home__feature-book-element-title"
                      @click="goToBookDetail(book._id)"
                    >
                      {{ book.TenSach }}
                    </div>
                    <div class="home__feature-book-element-author">
                      {{ book.TacGia }}
                    </div>
                    <div class="rating">
                      <div
                        style="padding: 4px 4px 4px 0"
                        class="non-rating"
                        v-if="!book.averageRating || book.averageRating === 0"
                      >
                        <span>Chưa có đánh giá</span>
                      </div>
                      <div class="rating" v-else>
                        <span
                          v-for="index in 5"
                          :key="index"
                          class="star"
                          :style="getStarStyle(book.averageRating, index)"
                        >
                          ★
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR: TOP 10 & MOST VIEWED -->
        <div class="col-12 col-lg-3 home__top-book-wrapper">
          <div class="home__top-book">

            <!-- TOP 10 THIS WEEK -->
            <div class="home__top-10-week-book">
              <div class="home__top-book-header">Top 10 This Week</div>
              <div class="home__top-book-content">
                <!-- Skeleton top 10 -->
                <div v-if="loadingTopTen" class="home__top-book-list">
                  <div
                    v-for="n in 5"
                    :key="'skel-top-' + n"
                    class="home__top-book-element"
                  >
                    <div class="skeleton skeleton-top-img"></div>
                    <div class="skeleton-info" style="flex:1">
                      <div class="skeleton skeleton-title" style="width:90%"></div>
                      <div class="skeleton skeleton-author" style="width:60%"></div>
                    </div>
                  </div>
                </div>

                <!-- Dữ liệu thực -->
                <div v-else class="home__top-book-list">
                  <div
                    v-for="(book, index) in topTenWeekBooks"
                    :key="book._id"
                    class="home__top-book-element"
                  >
                    <div class="home__top-book-element-image">
                      <img
                        :src="book.Image"
                        :alt="book.TenSach"
                        @click="goToBookDetail(book._id)"
                      />

                      <div class="home__top-book-element-rank-wrapper">
                        <div
                          class="home__top-book-element-rank"
                          :class="`rank-${index + 1}`"
                        >
                          {{ index + 1 }}
                        </div>
                      </div>
                    </div>

                    <div class="home__top-book-element-information">
                      <div
                        class="home__top-book-element-title"
                        @click="goToBookDetail(book._id)"
                      >
                        {{ book.TenSach }}
                      </div>
                      <div class="home__top-book-element-author">
                        {{ book.TacGia }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- MOST VIEWED -->
            <div class="home__top-most-view-book">
              <div class="home__top-book-header">Most Viewed</div>
              <div class="home__top-book-content">
                <!-- Skeleton most viewed -->
                <div v-if="loadingMostViewed" class="home__top-book-list">
                  <div
                    v-for="n in 5"
                    :key="'skel-mv-' + n"
                    class="home__top-book-element"
                  >
                    <div class="skeleton skeleton-top-img"></div>
                    <div class="skeleton-info" style="flex:1">
                      <div class="skeleton skeleton-title" style="width:90%"></div>
                      <div class="skeleton skeleton-author" style="width:60%"></div>
                    </div>
                  </div>
                </div>

                <!-- Dữ liệu thực -->
                <div v-else class="home__top-book-list">
                  <div
                    class="home__top-book-element"
                    v-for="(book, index) in mostViewedBooks"
                    :key="book._id"
                  >
                    <div
                      class="home__top-book-element-image"
                      @click="goToBookDetail(book._id)"
                    >
                      <img :src="book.Image" :alt="book.TenSach" />

                      <div class="home__top-book-element-rank-wrapper">
                        <div
                          class="home__top-book-element-rank"
                          :class="`rank-${index + 1}`"
                        >
                          {{ index + 1 }}
                        </div>
                      </div>
                    </div>

                    <div class="home__top-book-element-information">
                      <div
                        class="home__top-book-element-title"
                        @click="goToBookDetail(book._id)"
                      >
                        {{ book.TenSach }}
                      </div>
                      <div class="home__top-book-element-author">
                        {{ book.TacGia }}
                      </div>
                    </div>
                  </div>
                </div>
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
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

import { bookService } from "../services/book/book.service";
import { userState } from "../assets/js/userState";

export default {
  name: "Home",
  components: {
    Header,
    Footer,
  },

  data() {
    return {
      books: [],
      newReleaseBooks: [],
      averageRating: 0,
      favoriteBookIds: [],
      mostViewedBooks: [],
      todayBooks: [],
      currentDotIndex: 0,
      trendingDotIndex: 0,
      topTenWeekBooks: [],
      trendingBooks: [],
      popularBooks: [],

      // Skeleton loading states
      loadingPopular: true,
      loadingToday: true,
      loadingTrending: true,
      loadingNewRelease: true,
      loadingTopTen: true,
      loadingMostViewed: true,
    };
  },

  async mounted() {
    try {
      const response = await bookService.getAllBook();
      if (Array.isArray(response)) {
        this.books = response;

        await this.loadNewReleaseBooks();
        await this.updateAverageRatingForBooks();
        await this.loadFavoriteBooks();
      }
      this.loadingNewRelease = false;

      const mostViewed = await bookService.getMostViewBook();
      if (Array.isArray(mostViewed)) {
        this.mostViewedBooks = mostViewed;
      }
      this.loadingMostViewed = false;

      const todayResponse = await bookService.getTodayBook();
      if (Array.isArray(todayResponse)) {
        this.todayBooks = todayResponse;
      }
      this.loadingToday = false;

      const topTenWeekResponse = await bookService.getTopTenWeekBook();
      if (Array.isArray(topTenWeekResponse)) {
        this.topTenWeekBooks = topTenWeekResponse;
      }
      this.loadingTopTen = false;

      const trendingResponse = await bookService.getTrendingBook();
      if (Array.isArray(trendingResponse)) {
        this.trendingBooks = trendingResponse;
      }
      this.loadingTrending = false;

      const popularResponse = await bookService.getPopularBook();
      if (Array.isArray(popularResponse)) {
        this.popularBooks = popularResponse;
      }
      this.loadingPopular = false;

    } catch (error) {
      console.error("Lỗi khi lấy sách:", error);
      // Tắt tất cả skeleton nếu có lỗi
      this.loadingPopular = false;
      this.loadingToday = false;
      this.loadingTrending = false;
      this.loadingNewRelease = false;
      this.loadingTopTen = false;
      this.loadingMostViewed = false;
    }
  },

  methods: {
    async updateAverageRatingForBooks() {
      try {
        this.newReleaseBooks = await this.updateRatingForBookList(
          this.newReleaseBooks
        );
      } catch (err) {
        console.error("Lỗi khi cập nhật averageRating:", err);
      }
    },

    getStarStyle(avg, index) {
      const avgNum = parseFloat(avg) || 0;
      const fullStars = Math.floor(avgNum);
      const decimal = avgNum - fullStars;

      if (index <= fullStars) {
        return { color: "#fa8c16" };
      }

      if (index === fullStars + 1 && decimal > 0) {
        const percent = Math.round(decimal * 100);
        return {
          background: `linear-gradient(90deg, #fa8c16 ${percent}%, #ccc ${percent}%)`,
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        };
      }

      return { color: "#ccc" };
    },

    goToBookDetail(bookId) {
      this.$router.push({ name: "DetailBook", params: { id: bookId } });
    },

    async loadFavoriteBooks() {
      try {
        const favResponse = await bookService.getFavoriteBooks(userState._id);
        this.favoriteBookIds = Array.isArray(favResponse)
          ? favResponse.map((id) => id.toString())
          : [];
      } catch (error) {
        console.error("Lỗi khi load sách yêu thích:", error);
      }
    },

    isFavorite(bookId) {
      if (!bookId || !this.favoriteBookIds) return false;
      const bid = bookId.toString();
      return this.favoriteBookIds.some((id) => id.toString() === bid);
    },

    async toggleFavorite(book) {
      const bookId = book._id;
      const data = { MaSach: bookId, MaDocGia: userState._id };

      try {
        if (this.isFavorite(bookId)) {
          await bookService.deleteFavoriteBook(data);
          this.favoriteBookIds = this.favoriteBookIds.filter(
            (id) => id.toString() !== bookId.toString()
          );
          alert("Đã bỏ yêu thích");
        } else {
          await bookService.addFavoriteBook(data);
          this.favoriteBookIds.push(bookId.toString());
          alert("Đã thêm vào yêu thích");
        }
      } catch (error) {
        console.error("Lỗi khi toggle favorite:", error);
      }
    },

    async loadNewReleaseBooks() {
      this.newReleaseBooks = [...this.books]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    },

    async updateRatingForBookList(bookList) {
      return await Promise.all(
        bookList.map(async (book) => {
          try {
            const ratings = await bookService.getRatingByBook({
              MaSach: book._id,
            });

            if (Array.isArray(ratings) && ratings.length > 0) {
              const sum = ratings.reduce((acc, r) => acc + (r.SoSao || 0), 0);
              book.averageRating = (sum / ratings.length).toFixed(1);
            } else {
              book.averageRating = 0;
            }
          } catch (error) {
            console.error("Lỗi khi tính averageRating:", error);
            book.averageRating = 0;
          }
          return book;
        })
      );
    },

    selectDot(index) {
      this.currentDotIndex = index;
    },

    selectTrendingDot(index) {
      this.trendingDotIndex = index;
    },

    goToPopularBooks() {
      this.$router.push({
        path: "/library",
        query: { sort: "popular" },
      });
    },

    goToNewBooks() {
      this.$router.push({
        path: "/library",
        query: { sort: "new" },
      });
    },
  },

  computed: {
    currentTodayBooks() {
      const startIndex = this.currentDotIndex * 2;
      return this.todayBooks.slice(startIndex, startIndex + 2);
    },

    currentTrendingBooks() {
      const startIndex = this.trendingDotIndex * 3;
      return this.trendingBooks.slice(startIndex, startIndex + 3);
    },
  },
};
</script>

<style scoped>
/* ===================== SKELETON LOADING ===================== */
@keyframes shimmer {
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}

.skeleton {
  background: linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 8px;
}

.skeleton-img {
  width: 100%;
  height: 295px;
  border-radius: 15px;
}

.skeleton-today-img {
  width: 190px;
  min-width: 190px;
  height: 270px;
  border-radius: 15px;
}

.skeleton-trending-img {
  width: 100%;
  height: 415px;
  border-radius: 15px;
}

.skeleton-top-img {
  width: 75px;
  min-width: 75px;
  height: 110px;
  border-radius: 10px;
}

.skeleton-title {
  height: 16px;
  width: 85%;
  margin-bottom: 8px;
}

.skeleton-author {
  height: 13px;
  width: 60%;
  margin-bottom: 8px;
}

.skeleton-stars {
  height: 13px;
  width: 40%;
}

.skeleton-info {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ===================== EXISTING STYLES (unchanged) ===================== */
.home__book-action-favorite-icon.favorite {
  background-color: #f55c4e;
  color: #fff;
}

#myCarousel,
.carousel-inner,
.carousel-item,
.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home__banner {
  height: 540px;
  width: 100%;
}

.home__banner .title-slide-1 {
  font-size: 5rem;
  width: 350px;
  font-family: "Cormorant Garamond", serif;
}

.home__banner .title-slide-2 {
  font-size: 5rem;
  color: #fff;
  font-family: "Cormorant Garamond", serif;
}

.home__popular-book {
  padding: 0 30px;
  margin-top: 80px;
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
  min-width: 130px;
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

.badge-favorite {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ff6b81, #ff4d4d);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(255, 107, 129, 0.4);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-favorite span {
  color: white;
}

.home__feature-book-element {
  position: relative;
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
  object-fit: cover;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  align-items: center;
  gap: 20px;
}

.home__book-of-the-day-element:first-child {
  border-right: 1px solid #e6e6e6;
}

.home__book-of-the-day-element-image img {
  width: 190px;
  height: 270px;
  cursor: pointer;
  border-radius: 15px;
  object-fit: cover;
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
  object-fit: cover;
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
  object-fit: cover;
}

.home__middle-banner:hover img {
  transform: scale(1.05);
}

.home__new-release-content {
  margin-top: 35px;
}

.home__new-release-content-image img {
  height: 415px;
  object-fit: cover;
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
  display: grid;
  grid-template-columns: 75px auto;
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

.home__top-book-element-image img {
  width: 100%;
  height: 110px;
  cursor: pointer;
  border-radius: 10px;
  object-fit: cover;
}

.home__top-book-element-information {
  min-width: 0;
}

.home__top-book-element-title {
  font-size: 1.4rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  background: url("../public/image/backgroundauthor.png") no-repeat center;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.rank-1 { background: linear-gradient(135deg, #ff416c, #ff4b2b); color: #fff; }
.rank-2 { background: linear-gradient(135deg, #f953c6, #b91d73); color: #fff; }
.rank-3 { background: linear-gradient(135deg, #8e2de2, #4a00e0); color: #fff; }
.rank-4 { background: linear-gradient(135deg, #ff6a5b, #ff9472); color: #fff; }
.rank-5 { background: linear-gradient(135deg, #ff9472, #f2709c); color: #fff; }
.rank-6 { background: linear-gradient(135deg, #fbc2eb, #f6c0c0); color: #000; }
.rank-7 { background: linear-gradient(135deg, #fcd3a1, #fda085); color: #000; }
.rank-8 { background: linear-gradient(135deg, #e0c3fc, #8ec5fc); color: #000; }
.rank-9 { background: linear-gradient(135deg, #d4fc79, #96e6a1); color: #000; }
.rank-10 { background: linear-gradient(135deg, #fffbd5, #b7f8db); color: #000; }

.home__section-title {
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 50px;
  letter-spacing: 0.5px;
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

.author-content { text-align: center; }

.author-name {
  font-size: 22px;
  font-weight: 800;
  color: #1e1e1e;
  margin-bottom: 4px;
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

/* ===================== RESPONSIVE ===================== */

/* Tablet (≤ 992px) */
@media (max-width: 992px) {
  .home__banner {
    height: 380px;
  }

  .home__banner .title-slide-1,
  .home__banner .title-slide-2 {
    font-size: 3.2rem;
    width: auto;
  }

  .home__popular-book {
    padding: 0 16px;
    margin-top: 50px;
  }

  .home__feature-group-book {
    padding-left: 16px;
    padding-right: 16px;
  }

  .home__book-header-title,
  .home__book-of-the-day-title {
    font-size: 2.6rem;
  }

  .home__feature-book-element-image img {
    height: 220px;
  }

  .skeleton-img {
    height: 220px;
  }

  /* Today books: stack vertically on tablet */
  .home__book-of-the-day-list-book {
    --bs-gutter-x: 2rem;
  }

  .home__book-of-the-day-element:first-child {
    border-right: none;
    border-bottom: 1px solid #e6e6e6;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  /* Sidebar goes below on tablet */
  .home__top-book-wrapper {
    padding-left: 0;
    margin-top: 30px;
  }

  .home__top-10-week-book,
  .home__top-most-view-book {
    padding: 25px 20px 15px 20px;
  }

  /* Show top books side by side on tablet */
  .home__top-book .home__top-10-week-book,
  .home__top-book .home__top-most-view-book {
    display: inline-block;
    width: 48%;
    vertical-align: top;
    margin-right: 2%;
  }

  .home__top-book .home__top-most-view-book {
    margin-right: 0;
  }
}

/* Mobile (≤ 768px) */
@media (max-width: 768px) {
  .home__banner {
    height: 260px;
  }

  .home__banner .title-slide-1,
  .home__banner .title-slide-2 {
    font-size: 2rem;
    width: auto;
  }

  .home__popular-book {
    padding: 0 12px;
    margin-top: 32px;
  }

  .home__feature-group-book {
    padding-left: 12px;
    padding-right: 12px;
  }

  .home__book-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .home__book-header-title,
  .home__book-of-the-day-title {
    font-size: 2rem;
    white-space: nowrap;
  }

  .home__book-line {
    display: none;
  }

  .view-all-btn {
    height: 38px;
    min-width: 100px;
    padding: 8px 18px;
    font-size: 1.2rem;
  }

  .home__feature-book-element-image img {
    height: 180px;
  }

  .skeleton-img {
    height: 180px;
  }

  /* Today books: stack vertically */
  .home__book-of-the-day-list-book {
    --bs-gutter-x: 1rem;
    flex-direction: column;
  }

  .home__book-of-the-day-element {
    flex-direction: row;
    align-items: flex-start;
    border-right: none !important;
    border-bottom: 1px solid #e6e6e6;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .home__book-of-the-day-element-image img {
    width: 110px;
    min-width: 110px;
    height: 160px;
  }

  .skeleton-today-img {
    width: 110px;
    min-width: 110px;
    height: 160px;
  }

  .home__book-of-the-day-element-title {
    max-width: 100%;
    font-size: 1.4rem;
  }

  .home__trending-book-content-image img,
  .home__new-release-content-image img {
    height: 250px;
  }

  .skeleton-trending-img {
    height: 250px;
  }

  .home__middle-banner img {
    height: 160px;
  }

  /* Sidebar: full width stacked on mobile */
  .home__top-book-wrapper {
    padding-left: 0;
    margin-top: 24px;
  }

  .home__top-book .home__top-10-week-book,
  .home__top-book .home__top-most-view-book {
    display: block;
    width: 100%;
    margin-right: 0;
  }

  .home__top-book-header {
    font-size: 1.8rem;
  }

  .home__top-book-element-image img {
    height: 90px;
  }

  .skeleton-top-img {
    width: 65px;
    min-width: 65px;
    height: 90px;
  }

  .home__top-book-element {
    grid-template-columns: 65px auto;
    gap: 14px;
  }
}

/* Very small screens (≤ 480px) */
@media (max-width: 480px) {
  .home__banner {
    height: 200px;
  }

  .home__banner .title-slide-1,
  .home__banner .title-slide-2 {
    font-size: 1.6rem;
  }

  .home__book-header-title,
  .home__book-of-the-day-title {
    font-size: 1.8rem;
  }

  .home__feature-book-element-image img {
    height: 150px;
  }

  .skeleton-img {
    height: 150px;
  }

  .home__trending-book-content-image img,
  .home__new-release-content-image img {
    height: 200px;
  }

  .skeleton-trending-img {
    height: 200px;
  }

  .home__feature-book-element-title {
    font-size: 1.3rem;
  }

  .home__feature-book-element-author {
    font-size: 1.1rem;
  }
}
</style>