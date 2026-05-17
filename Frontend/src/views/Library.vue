<template>
  <Header />
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

  <div class="book__library">
    <div class="tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'sach' }]"
        @click="changeTab('sach')"
      >
        📚 Sách
      </button>

      <button
        :class="['tab-btn', { active: activeTab === 'giaotrinh' }]"
        @click="changeTab('giaotrinh')"
      >
        📕 Giáo trình
      </button>

      <button
        :class="['tab-btn', { active: activeTab === 'luanvan' }]"
        @click="changeTab('luanvan')"
      >
        📑 Luận văn
      </button>

      <button
        :class="['tab-btn', { active: activeTab === 'nienluan' }]"
        @click="changeTab('nienluan')"
      >
        📝 Niên luận
      </button>
    </div>

    <!-- Tab Sách -->
    <div v-if="activeTab === 'sach'" class="container-fluid">
      <div class="row d-flex align-items-start">
        <div class="col-lg-3 book__library-filter-wrapper">
          <div class="book__library-filter">
            <div class="book__library-filter-title">Thể loại</div>
            <div class="book__library-filter-content">
              <div class="form-check" v-for="genre in genres" :key="genre._id">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="genre._id"
                  :id="'genre' + genre._id"
                  v-model="selectedGenres"
                />
                <label class="form-check-label" :for="'genre' + genre._id">
                  {{ genre.TenTheLoai }}
                </label>
              </div>
            </div>
          </div>

          <div class="book__library-filter">
            <div class="book__library-filter-title">Đánh giá</div>
            <div class="book__library-filter-content">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value="5"
                  id="rating5"
                  v-model="selectedRatings"
                />
                <label class="form-check-label" for="rating5">
                  <div class="rating">
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                  </div>
                </label>
              </div>

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value="4"
                  id="rating4"
                  v-model="selectedRatings"
                />
                <label class="form-check-label" for="rating4">
                  <div class="rating">
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star">☆</span>
                  </div>
                </label>
              </div>

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value="3"
                  id="rating3"
                  v-model="selectedRatings"
                />
                <label class="form-check-label" for="rating3">
                  <div class="rating">
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star">☆</span>
                    <span class="star">☆</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-9 book__library-list-wrapper">
          <div class="book__library-list">
            <!-- HTML -->
            <div class="book__library-list-toolbar">
              <div class="book__library-toolbar-row">
                <!-- Tìm theo mã/tên sách -->
                <div class="book__library-search-input">
                  <span class="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Tìm theo mã hoặc tên sách..."
                    v-model="searchKeyword"
                  />
                </div>

                <!-- Tìm theo tác giả -->
                <div class="book__library-search-input">
                  <span class="search-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Tìm theo tác giả..."
                    v-model="searchAuthor"
                  />
                </div>

                <!-- Nhà xuất bản autocomplete -->
                <div class="book__library-filter-autocomplete">
                  <span class="filter-icon">🏢</span>
                  <input
                    type="text"
                    placeholder="Nhà xuất bản..."
                    v-model="publisherSearchKeyword"
                    @focus="showPublisherDropdown = true"
                    @blur="hidePublisherDropdown"
                  />
                  <div
                    v-if="
                      showPublisherDropdown && filteredPublishers.length > 0
                    "
                    class="autocomplete-dropdown"
                  >
                    <div
                      v-for="pub in filteredPublishers"
                      :key="pub._id"
                      class="autocomplete-item"
                      :class="{
                        selected: selectedPublishers.includes(pub._id),
                      }"
                      @mousedown.prevent="togglePublisher(pub._id)"
                    >
                      <i
                        v-if="selectedPublishers.includes(pub._id)"
                        class="fas fa-check-circle"
                      ></i>
                      {{ pub.TenNXB }}
                    </div>
                  </div>
                  <span
                    v-if="selectedPublishers.length > 0"
                    class="selected-count"
                  >
                    {{ selectedPublishers.length }}
                  </span>
                </div>

                <!-- Năm xuất bản autocomplete -->
                <div class="book__library-filter-autocomplete">
                  <span class="filter-icon">📅</span>
                  <input
                    type="text"
                    placeholder="Năm xuất bản..."
                    v-model="yearSearchKeyword"
                    @focus="showYearDropdown = true"
                    @blur="hideYearDropdown"
                  />
                  <div
                    v-if="showYearDropdown && filteredPublishYears.length > 0"
                    class="autocomplete-dropdown"
                  >
                    <div
                      v-for="year in filteredPublishYears"
                      :key="year"
                      class="autocomplete-item"
                      :class="{ selected: selectedPublishYears.includes(year) }"
                      @mousedown.prevent="toggleYear(year)"
                    >
                      <i
                        v-if="selectedPublishYears.includes(year)"
                        class="fas fa-check-circle"
                      ></i>
                      {{ year }}
                    </div>
                  </div>
                  <span
                    v-if="selectedPublishYears.length > 0"
                    class="selected-count"
                  >
                    {{ selectedPublishYears.length }}
                  </span>
                </div>

                <!-- Sort -->
                <div class="book__library-sort-select">
                  <select v-model="sortOption">
                    <option value="popular">📊 Phổ biến nhất</option>
                    <option value="new">🆕 Mới nhất</option>
                    <option value="title">🔤 Tên sách (A-Z)</option>
                  </select>
                </div>

                <!-- Reset -->
                <button
                  class="book__library-reset-btn"
                  @click="resetAllFilters"
                  v-if="hasActiveFilters"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="book__library-list-book">
              <div
                v-if="!loading && sortedBooks.length === 0"
                class="text-center py-5"
              >
                <p style="color: #666; font-size: 2.8rem">
                  📚 Không tìm thấy sách phù hợp
                </p>
              </div>

              <div class="row book__library-list-book-row" v-else-if="!loading">
                <div
                  class="col-lg-3 book__library-list-book-element-wrapper"
                  v-for="book in paginatedBooks"
                  :key="book._id"
                >
                  <div class="book__library-list-book-element">
                    <div v-if="isFavorite(book._id)" class="badge-favorite">
                      <span>❤️</span> Yêu thích
                    </div>

                    <div
                      class="book__library-list-book-element-image"
                      @click="goToBookDetail(book._id)"
                    >
                      <img :src="book.Image" alt="" />

                      <div class="home__book-action-icon">
                        <div
                          class="home__book-action-favorite-icon"
                          :class="{ favorite: isFavorite(book._id) }"
                          @click.stop="toggleFavorite(book)"
                        >
                          <i class="fa-solid fa-heart"></i>
                        </div>

                        <!-- SỬA: Đổi icon eye thành bookmark (tủ sách) -->
                        <div
                          class="home__book-action-shelf-icon"
                          :class="{ 'in-shelf': isInShelf(book._id) }"
                          @click.stop="toggleShelf(book)"
                          title="Thêm vào tủ sách"
                        >
                          <i class="fa-solid fa-bookmark"></i>
                        </div>

                        <!-- SỬA: Thêm chức năng mượn nhanh -->
                        <div
                          class="home__book-action-borrow-icon"
                          @click.stop="quickBorrowInLibrary(book)"
                          title="Mượn nhanh"
                        >
                          <i class="fa-solid fa-book-medical"></i>
                        </div>
                      </div>
                    </div>

                    <div class="book__library-list-book-element-information">
                      <div
                        class="book__library-list-book-element-title"
                        @click="goToBookDetail(book._id)"
                      >
                        {{ book.TenSach }}
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

                      <div class="book__library-list-book-element-author">
                        {{ book.TacGia }}
                      </div>

                      <div class="book__library-list-book-element-price">
                        {{ formatPrice(book.DonGia) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="loading" class="text-center py-5">
                <p style="color: #999; font-size: 2.8rem">Đang tải sách...</p>
              </div>

              <div
                class="book__library-list-book-navigation-page"
                v-if="sortedBooks.length > 0"
              >
                <ul class="pagination">
                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === 1 }"
                  >
                    <a class="page-link" href="#" @click.prevent="goToPage(1)"
                      >«</a
                    >
                  </li>

                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === 1 }"
                  >
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

    <!-- Tab Giáo Trình -->
    <div v-if="activeTab === 'giaotrinh'" class="container-fluid">
      <div class="row d-flex align-items-start">
        <div class="col-lg-3 book__library-filter-wrapper">
          <div class="book__library-filter">
            <div class="book__library-filter-title">Khoa</div>
            <div class="book__library-filter-content">
              <div class="form-check" v-for="khoa in khoas" :key="khoa._id">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="khoa._id"
                  :id="'khoa' + khoa._id"
                  v-model="selectedKhoas"
                />
                <label class="form-check-label" :for="'khoa' + khoa._id">
                  {{ khoa.TenKhoa }}
                </label>
              </div>
            </div>
          </div>

          <div class="book__library-filter">
            <div class="book__library-filter-title">Đánh giá</div>
            <div class="book__library-filter-content">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value="5"
                  id="rating5"
                  v-model="selectedRatings"
                />
                <label class="form-check-label" for="rating5">
                  <div class="rating">
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                  </div>
                </label>
              </div>

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value="4"
                  id="rating4"
                  v-model="selectedRatings"
                />
                <label class="form-check-label" for="rating4">
                  <div class="rating">
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star">☆</span>
                  </div>
                </label>
              </div>

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value="3"
                  id="rating3"
                  v-model="selectedRatings"
                />
                <label class="form-check-label" for="rating3">
                  <div class="rating">
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star">☆</span>
                    <span class="star">☆</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-9 book__library-list-wrapper">
          <div class="book__library-list">
            <div class="book__library-list-toolbar">
              <div class="book__library-toolbar-row">
                <!-- Tìm theo mã/tên sách -->
                <div class="book__library-search-input">
                  <span class="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Tìm theo mã hoặc tên sách..."
                    v-model="searchKeyword"
                  />
                </div>

                <!-- Tìm theo tác giả -->
                <div class="book__library-search-input">
                  <span class="search-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Tìm theo tác giả..."
                    v-model="searchAuthor"
                  />
                </div>

                <!-- Nhà xuất bản autocomplete -->
                <div class="book__library-filter-autocomplete">
                  <span class="filter-icon">🏢</span>
                  <input
                    type="text"
                    placeholder="Nhà xuất bản..."
                    v-model="publisherSearchKeyword"
                    @focus="showPublisherDropdown = true"
                    @blur="hidePublisherDropdown"
                  />
                  <div
                    v-if="
                      showPublisherDropdown && filteredPublishers.length > 0
                    "
                    class="autocomplete-dropdown"
                  >
                    <div
                      v-for="pub in filteredPublishers"
                      :key="pub._id"
                      class="autocomplete-item"
                      :class="{
                        selected: selectedPublishers.includes(pub._id),
                      }"
                      @mousedown.prevent="togglePublisher(pub._id)"
                    >
                      <i
                        v-if="selectedPublishers.includes(pub._id)"
                        class="fas fa-check-circle"
                      ></i>
                      {{ pub.TenNXB }}
                    </div>
                  </div>
                  <span
                    v-if="selectedPublishers.length > 0"
                    class="selected-count"
                  >
                    {{ selectedPublishers.length }}
                  </span>
                </div>

                <!-- Năm xuất bản autocomplete -->
                <div class="book__library-filter-autocomplete">
                  <span class="filter-icon">📅</span>
                  <input
                    type="text"
                    placeholder="Năm xuất bản..."
                    v-model="yearSearchKeyword"
                    @focus="showYearDropdown = true"
                    @blur="hideYearDropdown"
                  />
                  <div
                    v-if="showYearDropdown && filteredPublishYears.length > 0"
                    class="autocomplete-dropdown"
                  >
                    <div
                      v-for="year in filteredPublishYears"
                      :key="year"
                      class="autocomplete-item"
                      :class="{ selected: selectedPublishYears.includes(year) }"
                      @mousedown.prevent="toggleYear(year)"
                    >
                      <i
                        v-if="selectedPublishYears.includes(year)"
                        class="fas fa-check-circle"
                      ></i>
                      {{ year }}
                    </div>
                  </div>
                  <span
                    v-if="selectedPublishYears.length > 0"
                    class="selected-count"
                  >
                    {{ selectedPublishYears.length }}
                  </span>
                </div>

                <!-- Sort -->
                <div class="book__library-sort-select">
                  <select v-model="sortOption">
                    <option value="popular">📊 Phổ biến nhất</option>
                    <option value="new">🆕 Mới nhất</option>
                    <option value="title">🔤 Tên sách (A-Z)</option>
                  </select>
                </div>

                <!-- Reset -->
                <button
                  class="book__library-reset-btn"
                  @click="resetAllFilters"
                  v-if="hasActiveFilters"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="book__library-list-book">
              <div
                v-if="!loading && sortedBooks.length === 0"
                class="text-center py-5"
              >
                <p style="color: #666; font-size: 2.8rem">
                  📚 Không tìm thấy sách phù hợp
                </p>
              </div>

              <div class="row book__library-list-book-row" v-else-if="!loading">
                <div
                  class="col-lg-3 book__library-list-book-element-wrapper"
                  v-for="book in paginatedBooks"
                  :key="book._id"
                >
                  <div class="book__library-list-book-element">
                    <div v-if="isFavorite(book._id)" class="badge-favorite">
                      <span>❤️</span> Yêu thích
                    </div>

                    <div
                      class="book__library-list-book-element-image"
                      @click="goToBookDetail(book._id)"
                    >
                      <img :src="book.Image" alt="" />

                      <div class="home__book-action-icon">
                        <div
                          class="home__book-action-favorite-icon"
                          :class="{ favorite: isFavorite(book._id) }"
                          @click.stop="toggleFavorite(book)"
                        >
                          <i class="fa-solid fa-heart"></i>
                        </div>

                        <!-- SỬA: Đổi icon eye thành bookmark (tủ sách) -->
                        <div
                          class="home__book-action-shelf-icon"
                          :class="{ 'in-shelf': isInShelf(book._id) }"
                          @click.stop="toggleShelf(book)"
                          title="Thêm vào tủ sách"
                        >
                          <i class="fa-solid fa-bookmark"></i>
                        </div>

                        <!-- SỬA: Thêm chức năng mượn nhanh -->
                        <div
                          class="home__book-action-borrow-icon"
                          @click.stop="quickBorrowInLibrary(book)"
                          title="Mượn nhanh"
                        >
                          <i class="fa-solid fa-book-medical"></i>
                        </div>
                      </div>
                    </div>

                    <div class="book__library-list-book-element-information">
                      <div
                        class="book__library-list-book-element-title"
                        @click="goToBookDetail(book._id)"
                      >
                        {{ book.TenSach }}
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

                      <div class="book__library-list-book-element-author">
                        {{ book.TacGia }}
                      </div>

                      <div class="book__library-list-book-element-price">
                        {{ formatPrice(book.DonGia) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="loading" class="text-center py-5">
                <p style="color: #999; font-size: 2.8rem">Đang tải sách...</p>
              </div>

              <div
                class="book__library-list-book-navigation-page"
                v-if="sortedBooks.length > 0"
              >
                <ul class="pagination">
                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === 1 }"
                  >
                    <a class="page-link" href="#" @click.prevent="goToPage(1)"
                      >«</a
                    >
                  </li>

                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === 1 }"
                  >
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

    <!-- Tab Luận văn -->
    <div v-if="activeTab === 'luanvan'" class="thesis_library">
      <div class="container-fluid">
        <div class="row">
          <!-- Cột bên trái: Tab -->
          <div class="col-lg-2 thesis_sidebar">
            <ul class="nav flex-column">
              <li>
                <a
                  href="#"
                  :class="{ active: thesisTab === 'nop' }"
                  @click.prevent="changeThesisTab('nop')"
                >
                  📂 Nộp luận văn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  :class="{ active: thesisTab === 'danhsach' }"
                  @click.prevent="changeThesisTab('danhsach')"
                >
                  📑 Danh sách luận văn
                </a>
              </li>
            </ul>
          </div>

          <!-- Cột bên phải: Nội dung -->
          <div class="col-lg-10 thesis_content">
            <div v-if="thesisTab === 'nop'">
              <div class="thesis_content_upload">
                <!-- Thêm thông báo đợt nộp ở đầu -->
                <div class="thesis__dot-nop-info" v-if="activeDotNop">
                  <div class="thesis__dot-nop-banner">
                    <i class="fas fa-calendar-check"></i>
                    <div class="thesis__dot-nop-details">
                      <strong>{{ activeDotNop.TenDot }}</strong>
                      <p>
                        Thời gian:
                        <span class="highlight">{{
                          formatDateTime(activeDotNop.ThoiGianMoNop)
                        }}</span>
                        đến
                        <span class="highlight">{{
                          formatDateTime(activeDotNop.ThoiGianDongNop)
                        }}</span>
                      </p>
                      <p>
                        Kỳ học:
                        <span class="highlight">{{
                          activeDotNop.KyHoc?.TenKyHoc
                        }}</span>
                      </p>
                      <p>
                        Năm học:
                        <span class="highlight">{{
                          activeDotNop.NamHoc?.TenNamHoc
                        }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Thông báo không có đợt nộp -->
                <div
                  class="thesis__no-dot-nop"
                  v-else-if="!activeDotNop && !thesisStatus"
                >
                  <div class="thesis__no-dot-banner">
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                      <strong
                        >Hiện tại không có đợt nộp luận văn nào đang mở</strong
                      >
                      <p>
                        Vui lòng chờ thông báo về đợt nộp tiếp theo từ nhà
                        trường.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <!-- Ảnh upload -->
                  <div class="col-lg-6">
                    <div class="thesis__image-wrapper">
                      <div class="thesis__image-input">
                        <input
                          type="file"
                          id="thesisImageInput"
                          accept="image/*"
                          style="display: none"
                          @change="onImageChange"
                          :disabled="!canSubmitThesis"
                        />

                        <label
                          for="thesisImageInput"
                          class="thesis__camera-label"
                        >
                          <div
                            class="thesis__camera-icon"
                            v-if="
                              !(
                                thesisStatus === 'Chờ duyệt' ||
                                thesisStatus === 'Đã duyệt'
                              )
                            "
                          >
                            <i class="fas fa-camera"></i>
                          </div>
                        </label>
                      </div>
                      <img
                        v-if="imagePreview"
                        :src="imagePreview"
                        alt="Preview"
                      />
                    </div>
                  </div>

                  <!-- Nội dung thông tin luận văn -->
                  <div class="col-lg-6">
                    <div class="thesis__info">
                      <div class="thesis__info-header">
                        <span class="title">Tên đề tài: </span>
                        <input
                          type="text"
                          placeholder="Nhập tên đề tài"
                          v-model="topicName"
                          class="thesis__info-title"
                          :disabled="!canSubmitThesis"
                        />

                        <div class="thesis__info-item">
                          <span class="title">Bậc đào tạo: </span>
                          <div>
                            <select
                              v-model="educationLevel"
                              :disabled="!canSubmitThesis"
                            >
                              <option disabled value="">
                                -- Chọn bậc đào tạo --
                              </option>
                              <option value="Đại học">Đại học</option>
                              <option value="Thạc sĩ">Thạc sĩ</option>
                              <option value="Tiến sĩ">Tiến sĩ</option>
                            </select>
                          </div>
                        </div>

                        <div class="thesis__info-item">
                          <span class="title">Năm bảo vệ: </span>
                          <input
                            type="text"
                            placeholder="Nhập năm bảo vệ"
                            v-model="defenseYear"
                            :disabled="!canSubmitThesis"
                          />
                        </div>
                      </div>

                      <div class="thesis__info-section">
                        <span class="title">Giáo viên hướng dẫn: </span>
                        <input
                          type="text"
                          placeholder="Nhập tên GVHD"
                          v-model="supervisor"
                          :disabled="!canSubmitThesis"
                        />

                        <span class="title">File PDF Luận văn: </span>
                        <div class="thesis__pdf-upload">
                          <input
                            type="file"
                            id="thesisPdfInput"
                            accept=".pdf"
                            style="display: none"
                            @change="onPdfChange"
                            :disabled="!canSubmitThesis"
                          />

                          <label for="thesisPdfInput" class="thesis__pdf-label">
                            <i class="fas fa-file-pdf"></i>
                            Chọn file PDF
                          </label>

                          <span
                            v-if="pdfPreview"
                            class="thesis__pdf-preview"
                            @click="openPdf"
                            style="cursor: pointer"
                          >
                            {{ pdfPreview }}
                          </span>
                        </div>
                      </div>

                      <div class="thesis__info-button">
                        <button
                          type="button"
                          class="thesis__btn-submit"
                          :class="{
                            'thesis__btn-waiting': thesisStatus === 'Chờ duyệt',
                            'thesis__btn-approved': thesisStatus === 'Đã duyệt',
                          }"
                          :disabled="!canSubmitThesis"
                          @click="submitThesis"
                        >
                          {{
                            thesisStatus === 'Chờ duyệt'
                              ? 'Đang chờ duyệt'
                              : thesisStatus === 'Đã duyệt'
                              ? 'Đã duyệt'
                              : 'Nộp Luận văn'
                          }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="thesisTab === 'danhsach'">
              <div class="thesis__filters">
                <!-- Hàng 1: Tìm kiếm -->
                <div class="thesis__filters-row">
                  <div class="thesis__filter-search">
                    <span class="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Tìm theo tên luận văn..."
                      v-model="thesisSearchKeyword"
                    />
                  </div>

                  <div class="thesis__filter-search">
                    <span class="search-icon">👨</span>
                    <input
                      type="text"
                      placeholder="Tìm theo GVHD..."
                      v-model="thesisSearchSupervisor"
                    />
                  </div>

                  <button class="thesis__reset-btn" @click="resetThesisFilters">
                    Reset
                  </button>
                </div>

                <!-- Hàng 2: Dropdown filters -->
                <div class="thesis__filters-row">
                  <select
                    class="thesis__filter-select"
                    v-model="thesisFilterKyHoc"
                  >
                    <option value="">Tất cả kỳ học</option>
                    <option
                      v-for="ky in kyHocList"
                      :key="ky._id"
                      :value="ky._id"
                    >
                      {{ ky.TenKyHoc }}
                    </option>
                  </select>

                  <select
                    class="thesis__filter-select"
                    v-model="thesisFilterNamHoc"
                  >
                    <option value="">Tất cả năm học</option>
                    <option
                      v-for="nam in namHocList"
                      :key="nam._id"
                      :value="nam._id"
                    >
                      {{ nam.TenNamHoc }}
                    </option>
                  </select>

                  <select
                    class="thesis__filter-select"
                    v-model="selectedDefenseYear"
                  >
                    <option value="">Tất cả năm bảo vệ</option>
                    <option
                      v-for="year in defenseYears"
                      :key="year"
                      :value="year"
                    >
                      {{ year }}
                    </option>
                  </select>

                  <select
                    class="thesis__filter-select"
                    v-model="selectedEducationLevel"
                  >
                    <option value="">Tất cả bậc đào tạo</option>
                    <option
                      v-for="level in educationLevels"
                      :key="level"
                      :value="level"
                    >
                      {{ level }}
                    </option>
                  </select>

                  <select class="thesis__filter-select" v-model="selectedMajor">
                    <option value="">Tất cả ngành học</option>
                    <option v-for="major in majors" :key="major" :value="major">
                      {{ major }}
                    </option>
                  </select>

                  <select
                    class="thesis__filter-select"
                    v-model="selectedFaculty"
                  >
                    <option value="">Tất cả khoa</option>
                    <option
                      v-for="faculty in faculties"
                      :key="faculty"
                      :value="faculty"
                    >
                      {{ faculty }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="thesis__list-container">
                <div
                  v-if="filteredThesisList.length === 0"
                  class="text-center py-5"
                >
                  <p style="color: #666; font-size: 2.8rem">
                    📑 Chưa có luận văn nào được duyệt
                  </p>
                </div>

                <div class="row thesis__list-row" v-else>
                  <div
                    class="col-lg-3 thesis__list-element-wrapper"
                    v-for="thesis in paginatedThesis"
                    :key="thesis._id"
                  >
                    <div
                      class="thesis__list-element"
                      @click="handleThesisClick(thesis)"
                    >
                      <div class="thesis__list-element-image">
                        <img :src="thesis.Image" :alt="thesis.TieuDeTai" />
                      </div>

                      <div class="thesis__list-element-info">
                        <div class="thesis__list-element-title">
                          <span
                            v-html="
                              highlightText(
                                thesis.TieuDeTai,
                                thesisSearchKeyword
                              )
                            "
                          ></span>
                        </div>

                        <div class="thesis__list-element-author">
                          {{ thesis.MaDocGia.HoLot }} {{ thesis.MaDocGia.Ten }}
                        </div>

                        <div class="thesis__list-element-level">
                          GVHD:
                          <span
                            v-html="
                              highlightText(
                                thesis.GiaoVienHuongDan,
                                thesisSearchSupervisor
                              )
                            "
                          ></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Phân trang cho luận văn -->
                <div
                  class="thesis__list-navigation-page"
                  v-if="filteredThesisList.length > 0 && thesisTotalPages > 1"
                >
                  <ul class="pagination">
                    <li
                      class="page-item"
                      :class="{ disabled: thesisCurrentPage === 1 }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="goToThesisPage(1)"
                        >«</a
                      >
                    </li>

                    <li
                      class="page-item"
                      :class="{ disabled: thesisCurrentPage === 1 }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="goToThesisPage(thesisCurrentPage - 1)"
                        >‹</a
                      >
                    </li>

                    <li class="page-item active">
                      <a class="page-link" href="#" @click.prevent>{{
                        thesisCurrentPage
                      }}</a>
                    </li>

                    <li
                      class="page-item"
                      :class="{
                        disabled: thesisCurrentPage === thesisTotalPages,
                      }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="goToThesisPage(thesisCurrentPage + 1)"
                        >›</a
                      >
                    </li>

                    <li
                      class="page-item"
                      :class="{
                        disabled: thesisCurrentPage === thesisTotalPages,
                      }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="goToThesisPage(thesisTotalPages)"
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
    </div>

    <!-- Tab Niên luận -->
    <div v-if="activeTab === 'nienluan'" class="nienluan_library">
      <div class="container-fluid">
        <div class="row">
          <!-- Sidebar tabs dọc -->
          <div class="col-lg-2 nienluan_sidebar">
            <ul class="nav flex-column">
              <!-- Tab Nộp niên luận - Hiển thị cho SINH VIÊN -->
              <li v-if="userState && userState.userType === 'Sinh viên'">
                <a
                  href="#"
                  :class="{ active: nienLuanTab === 'nop' }"
                  @click.prevent="changeNienLuanTab('nop')"
                >
                  📂 Nộp niên luận
                </a>
              </li>

              <!-- Tab Quản lý đợt nộp - Hiển thị cho GIẢNG VIÊN -->
              <li v-if="userState && userState.userType === 'Giảng viên'">
                <a
                  href="#"
                  :class="{ active: nienLuanTab === 'quanlydot' }"
                  @click.prevent="changeNienLuanTab('quanlydot')"
                >
                  📅 Quản lý đợt nộp
                </a>
              </li>

              <!-- Tab Danh sách niên luận - Hiển thị cho GIẢNG VIÊN -->
              <li v-if="userState && userState.userType === 'Giảng viên'">
                <a
                  href="#"
                  :class="{ active: nienLuanTab === 'danhsach' }"
                  @click.prevent="changeNienLuanTab('danhsach')"
                >
                  📑 Danh sách niên luận
                </a>
              </li>
            </ul>
          </div>

          <!-- Nội dung chính -->
          <div class="col-lg-10 nienluan_content">
            <!-- NỘI DUNG TAB NỘP NIÊN LUẬN (SINH VIÊN) -->
            <div
              v-if="
                nienLuanTab === 'nop' &&
                userState &&
                userState.userType === 'Sinh viên'
              "
            >
              <div class="nienluan_content_upload">
                <div class="nienluan__select-dot">
                  <!-- Thông báo đợt nộp -->
                  <div
                    v-if="
                      !hasSubmittedForSelectedDot &&
                      availableDotNopList.length > 0
                    "
                    class="nienluan__dot-notification"
                  >
                    <div class="nienluan__dot-notification-icon">
                      <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="nienluan__dot-notification-content">
                      <strong
                        >Đang có {{ availableDotNopList.length }} đợt nộp niên
                        luận đang mở</strong
                      >
                      <p>Vui lòng chọn đợt nộp phù hợp để tiếp tục</p>
                    </div>
                  </div>

                  <div
                    v-else-if="
                      !hasSubmittedForSelectedDot &&
                      availableDotNopList.length === 0
                    "
                    class="nienluan__dot-notification nienluan__dot-notification--warning"
                  >
                    <div class="nienluan__dot-notification-icon">
                      <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="nienluan__dot-notification-content">
                      <strong>Hiện tại không có đợt nộp nào đang mở</strong>
                      <p>
                        Vui lòng chờ thông báo từ giảng viên hoặc nhà trường
                      </p>
                    </div>
                  </div>

                  <!-- Hiển thị trạng thái đã nộp - THAY ĐỔI NỘI DUNG -->
                  <div
                    v-if="hasSubmittedForSelectedDot && submittedDotInfo"
                    class="nienluan__submitted-status"
                  >
                    <div class="nienluan__submitted-info">
                      <i class="fas fa-check-circle"></i>
                      <div class="nienluan__submitted-text">
                        <strong>Đã nộp niên luận</strong>
                        <span
                          ><strong>Đợt nộp:</strong>
                          {{ submittedDotInfo.TenDot }}</span
                        >
                        <span
                          ><strong>Giảng viên:</strong>
                          {{ submittedDotInfo.MaGiangVien.HoLot }}
                          {{ submittedDotInfo.MaGiangVien.Ten }}</span
                        >
                        <span
                          ><strong>Tên đề tài:</strong>
                          {{ submittedDotDetails?.tenDeTai }}</span
                        >
                        <span
                          ><strong>Ngày nộp:</strong>
                          {{ formatDate(submittedDotDetails?.ngayNop) }}</span
                        >
                        <span
                          class="status-badge"
                          :class="{
                            'status-badge--pending':
                              submittedDotDetails?.trangThai === 'Chờ duyệt',
                            'status-badge--approved':
                              submittedDotDetails?.trangThai === 'Đã duyệt',
                          }"
                        >
                          {{ submittedDotDetails?.trangThai }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Hiển thị đợt đã chọn hoặc nút chọn - CHỈ HIỆN KHI CHƯA NỘP -->
                  <div
                    v-else-if="
                      !hasSubmittedForSelectedDot && selectedDotNopInfo
                    "
                    class="nienluan__selected-dot-compact"
                  >
                    <div class="nienluan__selected-info">
                      <i class="fas fa-calendar-check"></i>
                      <div class="nienluan__selected-text">
                        <strong>{{ selectedDotNopInfo.TenDot }}</strong>
                        <span
                          >GV: {{ selectedDotNopInfo.MaGiangVien.HoLot }}
                          {{ selectedDotNopInfo.MaGiangVien.Ten }}</span
                        >
                      </div>
                    </div>
                    <button
                      type="button"
                      class="nienluan__btn-change"
                      @click="showSelectDotModal = true"
                    >
                      <i class="fas fa-exchange-alt"></i> Đổi đợt nộp
                    </button>
                  </div>

                  <!-- Nút chọn đợt - CHỈ HIỆN KHI CHƯA NỘP VÀ CHƯA CHỌN -->
                  <button
                    v-else-if="!hasSubmittedForSelectedDot"
                    type="button"
                    class="nienluan__btn-select-dot"
                    :class="{ disabled: availableDotNopList.length === 0 }"
                    :disabled="availableDotNopList.length === 0"
                    @click="showSelectDotModal = true"
                  >
                    <i class="fas fa-plus-circle"></i> Chọn đợt nộp
                  </button>
                </div>

                <!-- Thông báo đợt nộp -->
                <div class="nienluan__dot-nop-info" v-if="activeDotNopNienLuan">
                  <div class="nienluan__dot-nop-banner">
                    <i class="fas fa-calendar-check"></i>
                    <div class="nienluan__dot-nop-details">
                      <strong>{{ activeDotNopNienLuan.TenDot }}</strong>
                      <p>
                        Thời gian:
                        <span class="highlight">{{
                          formatDateTime(activeDotNopNienLuan.ThoiGianMoNop)
                        }}</span>
                        đến
                        <span class="highlight">{{
                          formatDateTime(activeDotNopNienLuan.ThoiGianDongNop)
                        }}</span>
                      </p>
                      <p>
                        Kỳ học:
                        <span class="highlight">{{
                          activeDotNopNienLuan.KyHoc?.TenKyHoc
                        }}</span>
                      </p>
                      <p>
                        Năm học:
                        <span class="highlight">{{
                          activeDotNopNienLuan.NamHoc?.TenNamHoc
                        }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Thông báo không có đợt nộp -->
                <div
                  class="nienluan__no-dot-nop"
                  v-else-if="
                    selectedGiangVien &&
                    !activeDotNopNienLuan &&
                    !nienLuanStatus
                  "
                >
                  <div class="nienluan__no-dot-banner">
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                      <strong>Giảng viên chưa mở đợt nộp niên luận</strong>
                      <p>Vui lòng chọn giảng viên khác hoặc chờ thông báo.</p>
                    </div>
                  </div>
                </div>

                <!-- Form upload (tương tự luận văn, bỏ các trường: Bậc đào tạo, Năm bảo vệ, GVHD) -->
                <div class="row">
                  <div class="col-lg-6">
                    <!-- Upload ảnh -->
                    <div class="nienluan__image-wrapper">
                      <div class="nienluan__image-input">
                        <input
                          type="file"
                          id="nienLuanImageInput"
                          accept="image/*"
                          style="display: none"
                          @change="onNienLuanImageChange"
                          :disabled="!canSubmitNienLuan"
                        />
                        <label
                          for="nienLuanImageInput"
                          class="nienluan__camera-label"
                        >
                          <div
                            class="nienluan__camera-icon"
                            v-if="
                              !(
                                nienLuanStatus === 'Chờ duyệt' ||
                                nienLuanStatus === 'Đã duyệt'
                              )
                            "
                          >
                            <i class="fas fa-camera"></i>
                          </div>
                        </label>
                      </div>
                      <img
                        v-if="nienLuanImagePreview"
                        :src="nienLuanImagePreview"
                        alt="Preview"
                      />
                    </div>
                  </div>

                  <div class="col-lg-6">
                    <div class="nienluan__info">
                      <!-- Tên đề tài -->
                      <div class="nienluan__info-header">
                        <span class="title">Tên đề tài: </span>
                        <input
                          type="text"
                          placeholder="Nhập tên đề tài"
                          v-model="nienLuanTopicName"
                          class="nienluan__info-title"
                          :disabled="!canSubmitNienLuan"
                        />
                      </div>

                      <!-- Upload PDF -->
                      <div class="nienluan__info-section">
                        <span class="title">File PDF Niên luận: </span>
                        <div class="nienluan__pdf-upload">
                          <input
                            type="file"
                            id="nienLuanPdfInput"
                            accept=".pdf"
                            style="display: none"
                            @change="onNienLuanPdfChange"
                            :disabled="!canSubmitNienLuan"
                          />
                          <label
                            for="nienLuanPdfInput"
                            class="nienluan__pdf-label"
                          >
                            <i class="fas fa-file-pdf"></i> Chọn file PDF
                          </label>
                          <span
                            v-if="nienLuanPdfPreview"
                            class="nienluan__pdf-preview"
                            @click="openNienLuanPdf"
                            style="cursor: pointer"
                          >
                            {{ nienLuanPdfPreview }}
                          </span>
                        </div>
                      </div>

                      <!-- Nút nộp -->
                      <div class="nienluan__info-button">
                        <button
                          type="button"
                          class="nienluan__btn-submit"
                          :class="{
                            'nienluan__btn-waiting':
                              nienLuanStatus === 'Chờ duyệt',
                            'nienluan__btn-approved':
                              nienLuanStatus === 'Đã duyệt',
                          }"
                          :disabled="!canSubmitNienLuan"
                          @click="submitNienLuan"
                        >
                          {{
                            nienLuanStatus === 'Chờ duyệt'
                              ? 'Đang chờ duyệt'
                              : nienLuanStatus === 'Đã duyệt'
                              ? 'Đã duyệt'
                              : 'Nộp Niên luận'
                          }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- NỘI DUNG TAB QUẢN LÝ ĐỢT NỘP (GIẢNG VIÊN) -->
            <div
              v-if="
                nienLuanTab === 'quanlydot' &&
                userState &&
                userState.userType === 'Giảng viên'
              "
            >
              <div class="dot-nop-management">
                <div class="dot-nop-header">
                  <button
                    class="btn-create-dot"
                    @click="openCreateDotNienLuanModal"
                  >
                    <i class="fas fa-plus"></i> Tạo đợt nộp mới
                  </button>
                </div>

                <!-- Filters -->
                <div class="management-util__filters mt-3">
                  <select class="status-select" v-model="nienLuanFilterKyHoc">
                    <option value="">Tất cả kỳ học</option>
                    <option
                      v-for="ky in kyHocList"
                      :key="ky._id"
                      :value="ky._id"
                    >
                      {{ ky.TenKyHoc }}
                    </option>
                  </select>

                  <select
                    class="status-select ml-2"
                    v-model="nienLuanFilterNamHoc"
                  >
                    <option value="">Tất cả năm học</option>
                    <option
                      v-for="nam in namHocList"
                      :key="nam._id"
                      :value="nam._id"
                    >
                      {{ nam.TenNamHoc }}
                    </option>
                  </select>

                  <select
                    class="status-select ml-2"
                    v-model="selectedNienLuanStatus"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Chưa mở">Chưa mở</option>
                    <option value="Đang mở">Đang mở</option>
                    <option value="Đã đóng">Đã đóng</option>
                  </select>

                  <button
                    class="thesis__reset-btn ml-2"
                    @click="resetNienLuanFilters"
                  >
                    Reset
                  </button>
                </div>

                <!-- Table -->
                <table class="management-table mt-4 table w-100">
                  <thead>
                    <tr>
                      <th class="management-table__header">Tên đợt</th>
                      <th class="management-table__header">Kỳ học</th>
                      <th class="management-table__header">Năm học</th>
                      <th class="management-table__header">
                        Số lượng phải nộp
                      </th>
                      <th class="management-table__header">Thời gian mở</th>
                      <th class="management-table__header">Thời gian đóng</th>
                      <th class="management-table__header">Trạng thái</th>
                      <th class="management-table__header">Đã nộp</th>
                      <th class="management-table__header">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="dot in filteredDotNopNienLuanListWithCount"
                      :key="dot._id"
                    >
                      <td class="management-table__content">
                        {{ dot.TenDot }}
                      </td>
                      <td class="management-table__content">
                        {{ dot.KyHoc?.TenKyHoc }}
                      </td>
                      <td class="management-table__content">
                        {{ dot.NamHoc?.TenNamHoc }}
                      </td>
                      <td
                        class="management-table__content"
                        style="text-align: center"
                      >
                        {{ dot.SoLuongPhaiNop }}
                      </td>
                      <td class="management-table__content">
                        {{ formatDate(dot.ThoiGianMoNop) }}
                      </td>
                      <td class="management-table__content">
                        {{ formatDate(dot.ThoiGianDongNop) }}
                      </td>
                      <td class="management-table__content">
                        <div
                          class="status-badge"
                          :class="{
                            'status-badge--approved':
                              dot.TrangThai === 'Đang mở',
                            'status-badge--pending':
                              dot.TrangThai === 'Chưa mở',
                            'status-badge--denied': dot.TrangThai === 'Đã đóng',
                          }"
                        >
                          {{ dot.TrangThai }}
                        </div>
                      </td>
                      <td class="management-table__content">
                        <div class="submission-count">
                          <i class="fas fa-file-alt"></i>
                          {{ dot.soLuongDaNop || 0 }}
                        </div>
                      </td>
                      <td class="management-table__content">
                        <button
                          class="action-btn action-btn--approve"
                          @click="openEditDotNienLuanModal(dot)"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          class="action-btn action-btn--deny"
                          @click="deleteDotNienLuan(dot._id)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- NỘI DUNG TAB DANH SÁCH NIÊN LUẬN (GIẢNG VIÊN) -->
            <div
              v-if="
                nienLuanTab === 'danhsach' &&
                userState &&
                userState.userType === 'Giảng viên'
              "
            >
              <div class="nienluan-sub-tabs">
                <button
                  class="nienluan-sub-tab-btn"
                  :class="{ active: nienLuanTabSub === 'cuatoi' }"
                  @click="nienLuanTabSub = 'cuatoi'"
                >
                  <i class="fas fa-user-check"></i> Niên luận của tôi
                </button>
                <button
                  class="nienluan-sub-tab-btn"
                  :class="{ active: nienLuanTabSub === 'trongkhoa' }"
                  @click="nienLuanTabSub = 'trongkhoa'"
                >
                  <i class="fas fa-building"></i> Niên luận trong khoa
                </button>
              </div>

              <div
                v-if="
                  nienLuanTab === 'danhsach' &&
                  userState &&
                  userState.userType === 'Giảng viên'
                "
              >
                <div class="thesis__filters" v-if="nienLuanTabSub === 'cuatoi'">
                  <div class="thesis__filters">
                    <div class="thesis__filters-row">
                      <div class="thesis__filter-search">
                        <span class="search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="Tìm theo tên niên luận..."
                          v-model="nienLuanSearchKeyword"
                        />
                      </div>

                      <button
                        class="thesis__reset-btn"
                        @click="resetNienLuanFilters"
                      >
                        Reset
                      </button>
                    </div>

                    <div class="thesis__filters-row">
                      <!-- THÊM SELECT ĐỢT NỘP Ở ĐÂY -->
                      <select
                        class="thesis__filter-select"
                        v-model="nienLuanFilterDotNop"
                      >
                        <option value="">Tất cả các đợt</option>
                        <option
                          v-for="dot in dotNopNienLuanList"
                          :key="dot._id"
                          :value="dot._id"
                        >
                          {{ dot.TenDot }}
                        </option>
                      </select>

                      <select
                        class="thesis__filter-select"
                        v-model="nienLuanFilterKyHoc"
                      >
                        <option value="">Tất cả kỳ học</option>
                        <option
                          v-for="ky in kyHocList"
                          :key="ky._id"
                          :value="ky._id"
                        >
                          {{ ky.TenKyHoc }}
                        </option>
                      </select>

                      <select
                        class="thesis__filter-select"
                        v-model="nienLuanFilterNamHoc"
                      >
                        <option value="">Tất cả năm học</option>
                        <option
                          v-for="nam in namHocList"
                          :key="nam._id"
                          :value="nam._id"
                        >
                          {{ nam.TenNamHoc }}
                        </option>
                      </select>

                      <select
                        class="thesis__filter-select"
                        v-model="selectedNienLuanStatus"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Chờ duyệt">Chờ duyệt</option>
                        <option value="Đã duyệt">Đã duyệt</option>
                        <option value="Từ chối">Từ chối</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- List - TAB CỦA TÔI -->
                <div
                  class="thesis__list-container"
                  v-if="nienLuanTabSub === 'cuatoi'"
                >
                  <div class="thesis__list-container">
                    <div
                      v-if="filteredNienLuanList.length === 0"
                      class="text-center py-5"
                    >
                      <p style="color: #666; font-size: 2.8rem">
                        📑 Chưa có niên luận nào
                      </p>
                    </div>

                    <!-- TABLE THAY CHO CARD -->
                    <table v-else class="nienluan-table">
                      <thead>
                        <tr>
                          <th class="nienluan-table__header">STT</th>
                          <th class="nienluan-table__header">Tên đề tài</th>
                          <th class="nienluan-table__header">Sinh viên</th>
                          <th class="nienluan-table__header">Kỳ học</th>
                          <th class="nienluan-table__header">Năm học</th>
                          <th class="nienluan-table__header">Ngày nộp</th>
                          <th class="nienluan-table__header">Trạng thái</th>
                          <th class="nienluan-table__header">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(nienLuan, index) in paginatedNienLuanList"
                          :key="nienLuan._id"
                          class="nienluan-table__row"
                          @click="handleNienLuanClick(nienLuan)"
                        >
                          <td class="nienluan-table__content">
                            {{
                              (nienLuanCurrentPage - 1) * nienLuanPageSize +
                              index +
                              1
                            }}
                          </td>
                          <td
                            class="nienluan-table__content nienluan-table__title"
                          >
                            <span
                              v-html="
                                highlightText(
                                  nienLuan.TenDeTai,
                                  nienLuanSearchKeyword
                                )
                              "
                            ></span>
                          </td>
                          <td
                            class="nienluan-table__content nienluan-table__title"
                          >
                            {{ nienLuan.MaDocGia.HoLot }}
                            {{ nienLuan.MaDocGia.Ten }}
                          </td>
                          <td class="nienluan-table__content">
                            {{ nienLuan.MaDotNop?.KyHoc?.TenKyHoc || 'N/A' }}
                          </td>
                          <td class="nienluan-table__content">
                            {{ nienLuan.MaDotNop?.NamHoc?.TenNamHoc || 'N/A' }}
                          </td>
                          <td class="nienluan-table__content">
                            {{ formatDate(nienLuan.NgayNop) }}
                          </td>
                          <td class="nienluan-table__content">
                            <div
                              class="status-badge"
                              :class="{
                                'status-badge--pending':
                                  nienLuan.TrangThai === 'Chờ duyệt',
                                'status-badge--approved':
                                  nienLuan.TrangThai === 'Đã duyệt',
                                'status-badge--denied':
                                  nienLuan.TrangThai === 'Từ chối',
                              }"
                            >
                              {{ nienLuan.TrangThai }}
                            </div>
                          </td>
                          <td
                            class="nienluan-table__content nienluan-table__actions"
                          >
                            <template v-if="nienLuan.TrangThai === 'Chờ duyệt'">
                              <button
                                class="action-btn action-btn--approve"
                                @click.stop="
                                  approveNienLuanInTable(nienLuan._id)
                                "
                                title="Duyệt"
                              >
                                <i class="fas fa-check"></i>
                              </button>

                              <button
                                class="action-btn action-btn--deny"
                                @click.stop="
                                  rejectNienLuanInTable(nienLuan._id)
                                "
                                title="Từ chối"
                              >
                                <i class="fas fa-times"></i>
                              </button>
                            </template>

                            <span v-else class="processed-label">
                              <i class="fas fa-check-circle"></i> Đã xử lý
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Pagination -->
                    <div
                      class="thesis__list-navigation-page"
                      v-if="
                        filteredNienLuanList.length > 0 &&
                        nienLuanTotalPages > 1
                      "
                    >
                      <ul class="pagination">
                        <li
                          class="page-item"
                          :class="{ disabled: nienLuanCurrentPage === 1 }"
                        >
                          <a
                            class="page-link"
                            href="#"
                            @click.prevent="goToNienLuanPage(1)"
                            >«</a
                          >
                        </li>
                        <li
                          class="page-item"
                          :class="{ disabled: nienLuanCurrentPage === 1 }"
                        >
                          <a
                            class="page-link"
                            href="#"
                            @click.prevent="
                              goToNienLuanPage(nienLuanCurrentPage - 1)
                            "
                            >‹</a
                          >
                        </li>
                        <li class="page-item active">
                          <a class="page-link" href="#" @click.prevent>{{
                            nienLuanCurrentPage
                          }}</a>
                        </li>
                        <li
                          class="page-item"
                          :class="{
                            disabled:
                              nienLuanCurrentPage === nienLuanTotalPages,
                          }"
                        >
                          <a
                            class="page-link"
                            href="#"
                            @click.prevent="
                              goToNienLuanPage(nienLuanCurrentPage + 1)
                            "
                            >›</a
                          >
                        </li>
                        <li
                          class="page-item"
                          :class="{
                            disabled:
                              nienLuanCurrentPage === nienLuanTotalPages,
                          }"
                        >
                          <a
                            class="page-link"
                            href="#"
                            @click.prevent="
                              goToNienLuanPage(nienLuanTotalPages)
                            "
                            >»</a
                          >
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- List - TAB TRONG KHOA -->
                <div
                  class="thesis__list-container"
                  v-if="nienLuanTabSub === 'trongkhoa'"
                >
                  <!-- Filters cho tab Trong khoa -->
                  <div class="thesis__filters">
                    <div class="thesis__filters-row">
                      <div class="thesis__filter-search">
                        <span class="search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="Tìm theo tên niên luận..."
                          v-model="nienLuanKhoaSearchKeyword"
                        />
                      </div>

                      <button
                        class="thesis__reset-btn"
                        @click="resetNienLuanKhoaFilters"
                      >
                        Reset
                      </button>
                    </div>

                    <div class="thesis__filters-row">
                      <select
                        class="thesis__filter-select"
                        v-model="nienLuanKhoaFilterKyHoc"
                      >
                        <option value="">Tất cả kỳ học</option>
                        <option
                          v-for="ky in kyHocList"
                          :key="ky._id"
                          :value="ky._id"
                        >
                          {{ ky.TenKyHoc }}
                        </option>
                      </select>

                      <select
                        class="thesis__filter-select"
                        v-model="nienLuanKhoaFilterNamHoc"
                      >
                        <option value="">Tất cả năm học</option>
                        <option
                          v-for="nam in namHocList"
                          :key="nam._id"
                          :value="nam._id"
                        >
                          {{ nam.TenNamHoc }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Danh sách niên luận -->
                  <div
                    v-if="filteredNienLuanKhoaList.length === 0"
                    class="text-center py-5"
                  >
                    <p style="color: #666; font-size: 2.8rem">
                      📑 Chưa có niên luận nào trong khoa
                    </p>
                  </div>

                  <!-- TABLE KHÔNG CÓ CỘT THAO TÁC -->
                  <table v-else class="nienluan-table">
                    <thead>
                      <tr>
                        <th class="nienluan-table__header">STT</th>
                        <th class="nienluan-table__header">Tên đề tài</th>
                        <th class="nienluan-table__header">Sinh viên</th>
                        <th class="nienluan-table__header">Giảng viên HD</th>
                        <th class="nienluan-table__header">Kỳ học</th>
                        <th class="nienluan-table__header">Năm học</th>
                        <th class="nienluan-table__header">Ngày nộp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(nienLuan, index) in paginatedNienLuanKhoaList"
                        :key="nienLuan._id"
                        class="nienluan-table__row"
                        @click="handleNienLuanClick(nienLuan)"
                      >
                        <td class="nienluan-table__content">
                          {{
                            (nienLuanKhoaCurrentPage - 1) *
                              nienLuanKhoaPageSize +
                            index +
                            1
                          }}
                        </td>
                        <td
                          class="nienluan-table__content nienluan-table__title"
                        >
                          <span
                            v-html="
                              highlightText(
                                nienLuan.TenDeTai,
                                nienLuanKhoaSearchKeyword
                              )
                            "
                          ></span>
                        </td>
                        <td class="nienluan-table__content">
                          {{ nienLuan.MaDocGia.HoLot }}
                          {{ nienLuan.MaDocGia.Ten }}
                        </td>
                        <td class="nienluan-table__content">
                          {{ nienLuan.MaDotNop?.MaGiangVien?.HoLot }}
                          {{ nienLuan.MaDotNop?.MaGiangVien?.Ten }}
                        </td>
                        <td class="nienluan-table__content">
                          {{ nienLuan.MaDotNop?.KyHoc?.TenKyHoc || 'N/A' }}
                        </td>
                        <td class="nienluan-table__content">
                          {{ nienLuan.MaDotNop?.NamHoc?.TenNamHoc || 'N/A' }}
                        </td>
                        <td class="nienluan-table__content">
                          {{ formatDate(nienLuan.NgayNop) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Pagination cho tab Trong khoa -->
                  <div
                    class="thesis__list-navigation-page"
                    v-if="
                      filteredNienLuanKhoaList.length > 0 &&
                      nienLuanKhoaTotalPages > 1
                    "
                  >
                    <ul class="pagination">
                      <li
                        class="page-item"
                        :class="{ disabled: nienLuanKhoaCurrentPage === 1 }"
                      >
                        <a
                          class="page-link"
                          href="#"
                          @click.prevent="goToNienLuanKhoaPage(1)"
                          >«</a
                        >
                      </li>
                      <li
                        class="page-item"
                        :class="{ disabled: nienLuanKhoaCurrentPage === 1 }"
                      >
                        <a
                          class="page-link"
                          href="#"
                          @click.prevent="
                            goToNienLuanKhoaPage(nienLuanKhoaCurrentPage - 1)
                          "
                          >‹</a
                        >
                      </li>
                      <li class="page-item active">
                        <a class="page-link" href="#" @click.prevent>{{
                          nienLuanKhoaCurrentPage
                        }}</a>
                      </li>
                      <li
                        class="page-item"
                        :class="{
                          disabled:
                            nienLuanKhoaCurrentPage === nienLuanKhoaTotalPages,
                        }"
                      >
                        <a
                          class="page-link"
                          href="#"
                          @click.prevent="
                            goToNienLuanKhoaPage(nienLuanKhoaCurrentPage + 1)
                          "
                          >›</a
                        >
                      </li>
                      <li
                        class="page-item"
                        :class="{
                          disabled:
                            nienLuanKhoaCurrentPage === nienLuanKhoaTotalPages,
                        }"
                      >
                        <a
                          class="page-link"
                          href="#"
                          @click.prevent="
                            goToNienLuanKhoaPage(nienLuanKhoaTotalPages)
                          "
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
      </div>
    </div>

    <!-- Modal Tạo/Sửa đợt nộp niên luận -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showDotNienLuanModal"
        tabindex="-1"
        @click="showDotNienLuanModal = false"
      >
        <div class="modal-dialog" style="max-width: 600px" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{
                  editingDotNienLuan ? 'Chỉnh sửa đợt nộp' : 'Tạo đợt nộp mới'
                }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showDotNienLuanModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên đợt:</label>
                <input
                  type="text"
                  v-model="dotNienLuanForm.TenDot"
                  class="form-control"
                  placeholder="Ví dụ: Đợt nộp niên luận K20"
                />
              </div>

              <div class="form-group">
                <label>Kỳ học:</label>
                <div class="input-with-button">
                  <select v-model="dotNienLuanForm.KyHoc" class="form-control">
                    <option value="">-- Chọn kỳ học --</option>
                    <option
                      v-for="ky in kyHocList"
                      :key="ky._id"
                      :value="ky._id"
                    >
                      {{ ky.TenKyHoc }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn-add-inline"
                    @click="showAddKyHocModal = true"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Năm học:</label>
                <div class="input-with-button">
                  <select v-model="dotNienLuanForm.NamHoc" class="form-control">
                    <option value="">-- Chọn năm học --</option>
                    <option
                      v-for="nam in namHocList"
                      :key="nam._id"
                      :value="nam._id"
                    >
                      {{ nam.TenNamHoc }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn-add-inline"
                    @click="showAddNamHocModal = true"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Thời gian mở nộp:</label>
                <input
                  type="datetime-local"
                  v-model="dotNienLuanForm.ThoiGianMoNop"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Thời gian đóng nộp:</label>
                <input
                  type="datetime-local"
                  v-model="dotNienLuanForm.ThoiGianDongNop"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Số lượng phải nộp:</label>
                <input
                  type="number"
                  v-model.number="dotNienLuanForm.SoLuongPhaiNop"
                  class="form-control"
                  min="1"
                  placeholder="Nhập số lượng niên luận phải nộp"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="btn btn-secondary"
                @click="showDotNienLuanModal = false"
              >
                Hủy
              </button>
              <button class="btn btn-primary" @click="saveDotNienLuan">
                {{ editingDotNienLuan ? 'Cập nhật' : 'Tạo mới' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chi tiết niên luận -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showNienLuanModal"
        tabindex="-1"
        @click="showNienLuanModal = false"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết niên luận</h5>
              <button
                type="button"
                class="btn-close"
                @click="showNienLuanModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body__details">
                <div class="modal-body__image">
                  <img
                    :src="
                      selectedNienLuan?.Image || '/image/avatar_comment.png'
                    "
                    alt="Avatar"
                  />
                </div>
                <div class="modal-body__info">
                  <p>
                    <strong>Mã sinh viên:</strong>
                    {{ selectedNienLuan?.MaDocGia?.SinhVien?.MaSinhVien }}
                  </p>
                  <p>
                    <strong>Họ tên:</strong>
                    {{ selectedNienLuan?.MaDocGia?.HoLot }}
                    {{ selectedNienLuan?.MaDocGia?.Ten }}
                  </p>
                  <p>
                    <strong>Ngành học:</strong>
                    {{
                      selectedNienLuan?.MaDocGia?.SinhVien?.MaNganhHoc
                        ?.TenNganh || 'Chưa cập nhật'
                    }}
                  </p>
                  <p>
                    <strong>Khoa:</strong>
                    {{
                      selectedNienLuan?.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa
                        ?.TenKhoa || 'Chưa cập nhật'
                    }}
                  </p>
                  <p>
                    <strong>Tên đề tài:</strong>
                    {{ selectedNienLuan?.TenDeTai }}
                  </p>
                  <p v-if="selectedNienLuan?.MaDotNop?.MaGiangVien">
                    <strong>Giảng viên HD:</strong>
                    {{ selectedNienLuan?.MaDotNop?.MaGiangVien?.HoLot }}
                    {{ selectedNienLuan?.MaDotNop?.MaGiangVien?.Ten }}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>
                    {{ selectedNienLuan?.TrangThai }}
                  </p>
                  <p>
                    <strong>Ngày nộp:</strong>
                    {{ formatDate(selectedNienLuan?.NgayNop) }}
                  </p>
                  <p>
                    <strong>File Niên luận:</strong>
                    <button
                      v-if="selectedNienLuan?.Pdf"
                      class="btn btn-link btn-view-pdf"
                      @click="openNienLuanPdfInModal"
                    >
                      Xem file
                    </button>
                    <span v-else>Chưa có</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- Thesis Detail Modal -->
  <transition name="modal-fade">
    <div
      class="thesis-modal"
      v-if="showThesisModal"
      tabindex="-1"
      @click="showThesisModal = false"
    >
      <div class="thesis-modal-dialog" @click.stop>
        <div class="thesis-modal-content">
          <div class="thesis-modal-header">
            <h5 class="thesis-modal-title">Chi tiết luận văn</h5>
            <button
              type="button"
              class="thesis-btn-close"
              @click="showThesisModal = false"
            >
              &times;
            </button>
          </div>
          <div class="thesis-modal-body">
            <div class="thesis-modal-body__details">
              <div class="thesis-modal-body__image">
                <img
                  :src="selectedThesis?.Image || '/image/avatar_comment.png'"
                  :alt="selectedThesis?.TieuDeTai"
                />
              </div>
              <div class="thesis-modal-body__info">
                <p>
                  <strong>Mã sinh viên:</strong>
                  {{ selectedThesis?.MaDocGia?.SinhVien?.MaSinhVien }}
                </p>
                <p>
                  <strong>Họ tên:</strong>
                  {{ selectedThesis?.MaDocGia?.HoLot }}
                  {{ selectedThesis?.MaDocGia?.Ten }}
                </p>

                <p>
                  <strong>Ngành học:</strong>
                  {{
                    selectedThesis?.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh ||
                    'Chưa cập nhật'
                  }}
                </p>
                <p>
                  <strong>Khoa:</strong>
                  {{
                    selectedThesis?.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa
                      ?.TenKhoa || 'Chưa cập nhật'
                  }}
                </p>

                <p>
                  <strong>Tiêu đề luận văn:</strong>
                  {{ selectedThesis?.TieuDeTai }}
                </p>
                <p>
                  <strong>Bậc đào tạo:</strong>
                  {{ selectedThesis?.BacDaoTao }}
                </p>
                <p>
                  <strong>Năm bảo vệ:</strong>
                  {{ selectedThesis?.NamBaoVe }}
                </p>
                <p>
                  <strong>Giáo viên hướng dẫn:</strong>
                  {{ selectedThesis?.GiaoVienHuongDan }}
                </p>
                <p>
                  <strong>File Luận Văn:</strong>
                  <button
                    v-if="selectedThesis?.Pdf"
                    class="thesis-btn thesis-btn-link thesis-btn-view-pdf"
                    @click="openThesisPdf"
                  >
                    Xem file
                  </button>
                  <span v-else>Chưa có</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Modal Thêm Kỳ Học -->
  <transition name="modal-fade">
    <div
      class="modal"
      v-if="showAddKyHocModal"
      @click="showAddKyHocModal = false"
    >
      <div class="modal-dialog" @click.stop style="max-width: 400px">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm Kỳ Học</h5>
            <button
              type="button"
              class="btn-close"
              @click="showAddKyHocModal = false"
            >
              &times;
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên kỳ học:</label>
              <input
                type="text"
                v-model="newKyHoc"
                class="form-control"
                placeholder="VD: Kỳ 1, Kỳ 2"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              @click="showAddKyHocModal = false"
            >
              Hủy
            </button>
            <button class="btn btn-primary" @click="saveKyHoc">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Modal Thêm Năm Học -->
  <transition name="modal-fade">
    <div
      class="modal"
      v-if="showAddNamHocModal"
      @click="showAddNamHocModal = false"
    >
      <div class="modal-dialog" @click.stop style="max-width: 400px">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm Năm Học</h5>
            <button
              type="button"
              class="btn-close"
              @click="showAddNamHocModal = false"
            >
              &times;
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên năm học:</label>
              <input
                type="text"
                v-model="newNamHoc"
                class="form-control"
                placeholder="VD: 2024-2025"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              @click="showAddNamHocModal = false"
            >
              Hủy
            </button>
            <button class="btn btn-primary" @click="saveNamHoc">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Modal Chọn đợt nộp niên luận -->
  <transition name="modal-fade">
    <div
      class="modal-select-dot"
      v-if="showSelectDotModal"
      @click="showSelectDotModal = false"
    >
      <div class="modal-select-dot-dialog" @click.stop>
        <div class="modal-select-dot-header">
          <h3 class="modal-select-dot-title">
            <i class="fas fa-list-ul"></i> Chọn đợt nộp niên luận
          </h3>
          <button
            type="button"
            class="modal-select-dot-close"
            @click="showSelectDotModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-select-dot-body">
          <!-- Search box -->
          <div class="modal-select-dot-search">
            <i class="fas fa-search"></i>
            <input
              type="text"
              v-model="dotNopSearchKeyword"
              placeholder="Tìm theo tên đợt hoặc giảng viên..."
              class="modal-select-dot-search-input"
            />
            <button
              v-if="dotNopSearchKeyword"
              class="modal-select-dot-search-clear"
              @click="dotNopSearchKeyword = ''"
            >
              <i class="fas fa-times-circle"></i>
            </button>
          </div>

          <!-- Danh sách đợt nộp -->
          <div class="modal-select-dot-list">
            <div
              v-if="filteredDotNopList.length === 0"
              class="modal-select-dot-empty"
            >
              <i class="fas fa-inbox"></i>
              <p>
                {{
                  dotNopSearchKeyword
                    ? 'Không tìm thấy đợt nộp phù hợp'
                    : 'Chưa có đợt nộp nào'
                }}
              </p>
            </div>

            <div
              v-for="dot in filteredDotNopList"
              :key="dot._id"
              class="modal-select-dot-item"
              :class="{ selected: selectedDotNop === dot._id }"
              @click="selectDotNopAndClose(dot)"
            >
              <div class="modal-select-dot-item-icon">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="modal-select-dot-item-content">
                <div class="modal-select-dot-item-title">
                  {{ dot.TenDot }}
                </div>
                <div class="modal-select-dot-item-info">
                  <span class="info-item">
                    <i class="fas fa-user-tie"></i>
                    {{ dot.MaGiangVien.HoLot }} {{ dot.MaGiangVien.Ten }}
                  </span>
                  <span class="info-item">
                    <i class="fas fa-book-open"></i>
                    {{ dot.KyHoc?.TenKyHoc }}
                  </span>
                  <span class="info-item">
                    <i class="fas fa-calendar"></i>
                    {{ dot.NamHoc?.TenNamHoc }}
                  </span>
                </div>
                <div class="modal-select-dot-item-dates">
                  <span class="date-item date-item--open">
                    Mở: {{ formatDateTime(dot.ThoiGianMoNop) }}
                  </span>
                  <span class="date-item date-item--close">
                    Đóng: {{ formatDateTime(dot.ThoiGianDongNop) }}
                  </span>
                </div>
                <div class="modal-select-dot-item-deadline">
                  <i class="fas fa-clock"></i>
                  Ngày mở: {{ formatDateTime(dot.ThoiGianMoNop) }}
                </div>
                <div class="modal-select-dot-item-deadline">
                  <i class="fas fa-clock"></i>
                  Hạn nộp: {{ formatDateTime(dot.ThoiGianDongNop) }}
                </div>
              </div>
              <div
                v-if="selectedDotNop === dot._id"
                class="modal-select-dot-item-check"
              >
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-select-dot-footer">
          <button
            type="button"
            class="btn-modal-cancel"
            @click="showSelectDotModal = false"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </transition>

  <Footer />
</template>

<script>
import loadingGif from '/image/loading.gif';

import '../assets/css/library.css';
import { userState } from '../assets/js/userState';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

import { bookService } from '../services/book/book.service';
import { smartSearch, removeVietnameseTones } from '../assets/js/fuzzySearch';

export default {
  name: 'Library',
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      userState: userState,
      genres: [],
      books: [],
      currentPage: 1,
      pageSize: 12,
      sortOption: 'popular',
      selectedGenres: [],
      searchKeyword: '',
      searchAuthor: '',
      favoriteBookIds: [],
      averageRating: 0,
      popularBooks: [],
      selectedRatings: [],
      loading: true,
      activeTab: 'sach',
      thesisTab: 'nop',
      imageFile: null,
      imagePreview: null,
      pdfFile: null,
      pdfPreview: null,
      topicName: '',
      educationLevel: '',
      defenseYear: '',
      supervisor: '',
      thesisStatus: null,
      isLoading: false,
      loadingGif,
      thesisList: [],
      thesisCurrentPage: 1,
      thesisPageSize: 8,
      showThesisModal: false,
      selectedThesis: null,
      thesisSearchKeyword: '', // Tìm theo tên luận văn
      thesisSearchSupervisor: '', // Tìm theo GVHD
      selectedDefenseYear: '', // Lọc năm bảo vệ
      selectedEducationLevel: '', // Lọc bậc đào tạo
      selectedMajor: '', // Lọc ngành học
      selectedFaculty: '', // Lọc khoa
      // Danh sách để populate dropdown
      defenseYears: [],
      educationLevels: [],
      majors: [],
      faculties: [],

      khoas: [],
      selectedKhoas: [],

      activeDotNop: null,
      thesisFilterKyHoc: '',
      thesisFilterNamHoc: '',

      nienLuanTab: '',
      nienLuanImageFile: null,
      nienLuanImagePreview: null,
      nienLuanPdfFile: null,
      nienLuanPdfPreview: null,
      nienLuanTopicName: '',
      nienLuanStatus: null,
      nienLuanPdfPath: null,

      // THAY BẰNG
      selectedDotNop: '', // ID của đợt nộp được chọn
      availableDotNopList: [], // Danh sách các đợt đang mở

      // Biến cho quản lý đợt nộp niên luận (Giảng viên)
      dotNopNienLuanList: [],
      showDotNienLuanModal: false,
      editingDotNienLuan: null,
      dotNienLuanForm: {
        TenDot: '',
        KyHoc: '',
        NamHoc: '',
        ThoiGianMoNop: '',
        ThoiGianDongNop: '',
        SoLuongPhaiNop: 1,
      },

      // Biến cho danh sách niên luận (Giảng viên)
      nienLuanList: [],
      nienLuanCurrentPage: 1,
      nienLuanPageSize: 8,
      showNienLuanModal: false,
      selectedNienLuan: null,

      // Filter cho danh sách niên luận
      nienLuanSearchKeyword: '',
      nienLuanFilterKyHoc: '',
      nienLuanFilterNamHoc: '',
      selectedNienLuanStatus: 'all',

      showAddKyHocModal: false,
      showAddNamHocModal: false,
      newKyHoc: '',
      newNamHoc: '',

      dotNopSearchKeyword: '',
      showSelectDotModal: false,

      submittedForCurrentDot: false, // THÊM DÒNG NÀY
      submittedDotDetails: null,

      nienLuanTabSub: 'cuatoi',
      nienLuanKhoaList: [],

      nienLuanKhoaSearchKeyword: '',
      nienLuanKhoaFilterKyHoc: '',
      nienLuanKhoaFilterNamHoc: '',
      nienLuanKhoaCurrentPage: 1,
      nienLuanKhoaPageSize: 8,

      nienLuanFilterDotNop: '',

      publishers: [], // Danh sách nhà xuất bản
      selectedPublishers: [], // NXB được chọn
      publishYears: [], // Danh sách năm xuất bản
      selectedPublishYears: [], // Năm XB được chọn

      publisherSearchKeyword: '',
      showPublisherDropdown: false,
      yearSearchKeyword: '',
      showYearDropdown: false,

      shelfBookIds: [],
    };
  },
  async mounted() {
    const tabFromURL = this.$route.query.tab;
    if (
      tabFromURL &&
      ['sach', 'giaotrinh', 'luanvan', 'nienluan'].includes(tabFromURL)
    ) {
      this.activeTab = tabFromURL;
    }

    const pageFromURL = parseInt(this.$route.query.page);
    if (!isNaN(pageFromURL) && pageFromURL >= 1) {
      this.currentPage = pageFromURL;
    }

    const genreFromURL = this.$route.query.genre;
    if (genreFromURL) {
      this.selectedGenres = [genreFromURL];
    }

    const sortFromURL = this.$route.query.sort;
    if (sortFromURL && ['popular', 'new', 'title'].includes(sortFromURL)) {
      this.sortOption = sortFromURL;
    }

    this.fetchGenres();
    this.fetchKhoas();

    try {
      const response = await bookService.getAllBook();
      if (Array.isArray(response)) {
        this.books = response;
      }

      await this.updateAverageRatingForBooks();

      if (userState._id) {
        const favResponse = await bookService.getFavoriteBooks(userState._id);
        this.favoriteBookIds = Array.isArray(favResponse)
          ? favResponse.map((id) => id.toString())
          : [];

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

    const popularResponse = await bookService.getPopularBookFilter();
    if (Array.isArray(popularResponse)) {
      this.popularBooks = popularResponse;
    }

    const authorFromState = this.$router.options.history.state?.author;
    if (authorFromState) {
      this.searchAuthor = authorFromState;
    }

    this.fetchThesis();
    this.fetchAllThesis();
    this.fetchActiveDotNop();

    await this.loadKyHocForThesis();
    await this.loadNamHocForThesis();

    if (userState && userState.userType === 'Sinh viên') {
      await this.loadAvailableDotNopList();
      await this.fetchNienLuan();
    } else if (userState && userState.userType === 'Giảng viên') {
      this.loadDotNopNienLuanData();
      this.loadAllNienLuanByGiangVien();
      this.loadNienLuanKhoa();
    }

    const thesisTabFromURL = this.$route.query.thesisTab;
    if (this.activeTab === 'luanvan' && thesisTabFromURL) {
      this.thesisTab = thesisTabFromURL;
    }

    const nienLuanTabFromURL = this.$route.query.nienLuanTab;
    if (this.activeTab === 'nienluan') {
      if (nienLuanTabFromURL) {
        this.nienLuanTab = nienLuanTabFromURL;
      } else if (userState && userState.userType === 'Sinh viên') {
        this.nienLuanTab = 'nop';
      } else if (userState && userState.userType === 'Giảng viên') {
        this.nienLuanTab = 'quanlydot';
      }
    }

    await this.fetchPublishers();
    this.populatePublishYears();

    this.loading = false;
  },
  methods: {
    togglePublisher(pubId) {
      const index = this.selectedPublishers.indexOf(pubId);
      if (index > -1) {
        this.selectedPublishers.splice(index, 1);
      } else {
        this.selectedPublishers.push(pubId);
      }
    },

    toggleYear(year) {
      const index = this.selectedPublishYears.indexOf(year);
      if (index > -1) {
        this.selectedPublishYears.splice(index, 1);
      } else {
        this.selectedPublishYears.push(year);
      }
    },

    hidePublisherDropdown() {
      setTimeout(() => {
        this.showPublisherDropdown = false;
      }, 200);
    },

    hideYearDropdown() {
      setTimeout(() => {
        this.showYearDropdown = false;
      }, 200);
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

    changeTab(tab) {
      this.activeTab = tab;
      this.$router.push({
        query: { ...this.$route.query, tab: tab },
      });
    },

    changeThesisTab(tab) {
      this.thesisTab = tab;
      this.$router.push({
        query: {
          ...this.$route.query,
          thesisTab: tab,
        },
      });
    },

    changeNienLuanTab(tab) {
      this.nienLuanTab = tab;
      this.$router.push({
        query: {
          ...this.$route.query,
          nienLuanTab: tab,
        },
      });
    },

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

    async fetchGenres() {
      try {
        const response = await bookService.getAllGenre();
        this.genres = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách thể loại:', error);
      }
    },

    async fetchKhoas() {
      try {
        const response = await bookService.getAllFaculty(); // Bạn cần tạo API này
        this.khoas = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách khoa:', error);
      }
    },

    async fetchPublishers() {
      try {
        const response = await bookService.getAllNXB(); // API lấy tất cả NXB
        this.publishers = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhà xuất bản:', error);
      }
    },

    populatePublishYears() {
      if (!this.books.length) return;

      // Lấy danh sách năm xuất bản unique
      this.publishYears = [
        ...new Set(
          this.books.map((book) => book.NamXuatBan).filter((year) => year)
        ),
      ].sort((a, b) => b - a); // Sắp xếp giảm dần
    },

    goToBookDetail(bookId) {
      this.$router.push({ name: 'DetailBook', params: { id: bookId } });
    },

    async toggleFavorite(book) {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để thêm yêu thích');
          return;
        }

        const bookId = book._id.toString();

        if (this.isFavorite(bookId)) {
          // Nếu đang là favorite -> gọi API xóa
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          await bookService.deleteFavoriteBook(data);
          // cập nhật local
          this.favoriteBookIds = this.favoriteBookIds.filter(
            (id) => id.toString() !== bookId
          );
          // bạn có thể thay alert bằng toast nếu muốn
          alert('Đã bỏ yêu thích!');
        } else {
          // Nếu chưa favorite -> gọi API thêm
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          await bookService.addFavoriteBook(data);
          // cập nhật local ngay
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

    getStarStyle(avg, index) {
      const avgNum = parseFloat(avg) || 0;
      const fullStars = Math.floor(avgNum);
      const decimal = avgNum - fullStars;

      if (index <= fullStars) {
        return { color: '#fa8c16' }; // sao đầy
      }

      if (index === fullStars + 1 && decimal > 0) {
        const percent = Math.round(decimal * 100);
        return {
          background: `linear-gradient(90deg, #fa8c16 ${percent}%, #ccc ${percent}%)`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        };
      }

      return { color: '#ccc' }; // sao rỗng
    },

    async updateAverageRatingForBooks() {
      try {
        // duyệt qua tất cả sách trong this.books
        this.books = await Promise.all(
          this.books.map(async (book) => {
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
              console.error('Lỗi khi tính averageRating:', error);
              book.averageRating = 0;
            }
            return book;
          })
        );
      } catch (err) {
        console.error('Lỗi khi cập nhật averageRating cho list:', err);
      }
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
        this.pdfFile = file;
        this.pdfPreview = file.name;
      }
    },

    openPdf() {
      if (this.pdfFile) {
        // file local vừa upload
        const fileURL = URL.createObjectURL(this.pdfFile);
        window.open(fileURL, '_blank');
      } else if (this.pdfPath) {
        // file từ backend
        window.open(this.pdfPath, '_blank');
      } else {
        alert('Chưa có file PDF để mở.');
      }
    },

    async fetchThesis() {
      try {
        const thesis = await bookService.getOneThesis({
          userId: userState._id,
        });

        if (!thesis || thesis.TrangThai === 'Từ chối') {
          return;
        }

        if (thesis && thesis._id) {
          this.topicName = thesis.TieuDeTai || '';
          this.educationLevel = thesis.BacDaoTao || '';
          this.defenseYear = thesis.NamBaoVe || '';
          this.supervisor = thesis.GiaoVienHuongDan || '';
          this.pdfPreview = thesis.Pdf ? this.topicName + '.pdf' : null;
          this.pdfPath = thesis.Pdf || null;
          this.imagePreview = thesis.Image || null;
          this.thesisStatus = thesis.TrangThai;
        }
      } catch (err) {
        console.error('Lỗi khi tải luận văn:', err);
      }
    },

    async submitThesis() {
      try {
        if (!this.activeDotNop) {
          alert('Hiện tại không có đợt nộp luận văn nào đang mở!');
          return;
        }

        if (
          !this.topicName ||
          !this.educationLevel ||
          !this.defenseYear ||
          !this.supervisor ||
          !this.imageFile ||
          !this.pdfFile
        ) {
          alert('Vui lòng nhập đầy đủ thông tin và chọn file!');
          return;
        }
        this.isLoading = true;

        const formData = new FormData();
        formData.append('userId', userState._id);
        formData.append('image', this.imageFile);
        formData.append('pdfFile', this.pdfFile);
        formData.append('topicName', this.topicName);
        formData.append('educationLevel', this.educationLevel);
        formData.append('defenseYear', this.defenseYear);
        formData.append('supervisor', this.supervisor);

        const res = await bookService.addThesis(formData);

        alert('Nộp luận văn thành công!');
        this.fetchThesis();
      } catch (err) {
        alert('Có lỗi xảy ra khi nộp luận văn!');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAllThesis() {
      try {
        const response = await bookService.getAllThesis();
        if (Array.isArray(response)) {
          this.thesisList = response.filter(
            (thesis) => thesis.TrangThai === 'Đã duyệt'
          );

          this.populateFilterOptions();
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách luận văn:', error);
      }
    },

    goToThesisPage(page) {
      if (page >= 1 && page <= this.thesisTotalPages) {
        this.thesisCurrentPage = page;
      }
    },

    handleThesisClick(thesis) {
      this.selectedThesis = thesis;
      this.showThesisModal = true;
    },

    openThesisPdf() {
      if (this.selectedThesis?.Pdf) {
        window.open(this.selectedThesis.Pdf, '_blank');
      } else {
        alert('Chưa có file luận văn');
      }
    },

    populateFilterOptions() {
      if (!this.thesisList.length) return;

      // Lấy danh sách năm bảo vệ unique - ĐẢM BẢO KIỂU DỮ LIỆU
      this.defenseYears = [
        ...new Set(
          this.thesisList
            .map((t) => parseInt(t.NamBaoVe))
            .filter((year) => !isNaN(year))
        ),
      ].sort((a, b) => b - a);

      // Lấy danh sách bậc đào tạo unique
      this.educationLevels = [
        ...new Set(
          this.thesisList
            .map((t) => t.BacDaoTao)
            .filter((level) => level && level.trim())
        ),
      ];

      // Lấy danh sách ngành học unique
      this.majors = [
        ...new Set(
          this.thesisList
            .filter((t) => t.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh)
            .map((t) => t.MaDocGia.SinhVien.MaNganhHoc.TenNganh)
            .filter((major) => major && major.trim())
        ),
      ].sort();

      // Lấy danh sách khoa unique
      this.faculties = [
        ...new Set(
          this.thesisList
            .filter((t) => t.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa)
            .map((t) => t.MaDocGia.SinhVien.MaNganhHoc.Khoa.TenKhoa)
            .filter((faculty) => faculty && faculty.trim())
        ),
      ].sort();
    },

    resetThesisFilters() {
      this.thesisSearchKeyword = '';
      this.thesisSearchSupervisor = '';
      this.selectedDefenseYear = '';
      this.selectedEducationLevel = '';
      this.selectedMajor = '';
      this.selectedFaculty = '';
      this.thesisCurrentPage = 1;
      this.thesisFilterKyHoc = '';
      this.thesisFilterNamHoc = '';
    },

    async fetchActiveDotNop() {
      try {
        const response = await bookService.getActiveDotNop();
        this.activeDotNop = response;
      } catch (error) {
        console.error('Lỗi khi lấy đợt nộp đang mở:', error);
        this.activeDotNop = null;
      }
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      const period = hours >= 12 ? 'chiều' : 'sáng';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

      return `${day}/${month}/${year} ${displayHours}:${minutes} ${period}`;
    },

    // THÊM METHOD NÀY
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    // THÊM METHOD NÀY CHO DATETIME-LOCAL INPUT
    formatDateTimeLocal(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    async loadKyHocForThesis() {
      try {
        this.kyHocList = await bookService.getAllKyHoc();
      } catch (error) {
        console.error('Lỗi khi tải kỳ học:', error);
      }
    },

    async loadNamHocForThesis() {
      try {
        this.namHocList = await bookService.getAllNamHoc();
      } catch (error) {
        console.error('Lỗi khi tải năm học:', error);
      }
    },

    highlightText(text, keyword) {
      if (!keyword || !keyword.trim()) return text;

      const normalizedText = removeVietnameseTones(text);
      const normalizedKeyword = removeVietnameseTones(keyword);

      const index = normalizedText.indexOf(normalizedKeyword);

      if (index === -1) return text;

      const before = text.substring(0, index);
      const match = text.substring(index, index + keyword.length);
      const after = text.substring(index + keyword.length);

      return `${before}<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 2px;">${match}</mark>${after}`;
    },

    // ===== METHODS CHO NIÊN LUẬN =====
    // Load danh sách giảng viên
    async loadAvailableDotNopList() {
      try {
        // Gọi API lấy tất cả đợt nộp đang mở
        const response = await bookService.getAllActiveDotNopNienLuan(
          userState._id
        );
        this.availableDotNopList = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách đợt nộp:', error);
      }
    },

    selectDotNop(dot) {
      this.selectedDotNop = dot._id;
    },

    // Xử lý chọn ảnh niên luận
    onNienLuanImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.nienLuanImageFile = file;
        this.nienLuanImagePreview = URL.createObjectURL(file);
      }
    },

    // Xử lý chọn PDF niên luận
    onNienLuanPdfChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.nienLuanPdfFile = file;
        this.nienLuanPdfPreview = file.name;
      }
    },

    // Mở PDF niên luận
    openNienLuanPdf() {
      if (this.nienLuanPdfFile) {
        const fileURL = URL.createObjectURL(this.nienLuanPdfFile);
        window.open(fileURL, '_blank');
      } else if (this.nienLuanPdfPath) {
        window.open(this.nienLuanPdfPath, '_blank');
      } else {
        alert('Chưa có file PDF để mở.');
      }
    },

    // Load niên luận của sinh viên
    async fetchNienLuan() {
      try {
        const nienLuan = await bookService.getOneNienLuan({
          userId: userState._id,
        });

        if (!nienLuan || nienLuan.TrangThai === 'Từ chối') {
          this.submittedForCurrentDot = false;
          this.submittedDotDetails = null;
          return;
        }

        if (nienLuan && nienLuan._id) {
          this.nienLuanTopicName = nienLuan.TenDeTai || '';
          this.nienLuanPdfPreview = nienLuan.Pdf
            ? this.nienLuanTopicName + '.pdf'
            : null;
          this.nienLuanPdfPath = nienLuan.Pdf || null;
          this.nienLuanImagePreview = nienLuan.Image || null;
          this.nienLuanStatus = nienLuan.TrangThai;

          // Set đợt nộp đã chọn và thông tin đã nộp
          if (nienLuan.MaDotNop) {
            const dotNopId =
              typeof nienLuan.MaDotNop === 'object'
                ? nienLuan.MaDotNop._id
                : nienLuan.MaDotNop;

            this.selectedDotNop = dotNopId;

            // Set thông tin đã nộp
            this.submittedForCurrentDot = true;
            this.submittedDotDetails = {
              trangThai: nienLuan.TrangThai,
              ngayNop: nienLuan.NgayNop,
              tenDeTai: nienLuan.TenDeTai,
            };
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải niên luận:', err);
      }
    },

    // Nộp niên luận
    async submitNienLuan() {
      try {
        if (!this.selectedDotNop) {
          alert('Vui lòng chọn đợt nộp!');
          return;
        }

        if (
          !this.nienLuanTopicName ||
          !this.nienLuanImageFile ||
          !this.nienLuanPdfFile
        ) {
          alert('Vui lòng nhập đầy đủ thông tin và chọn file!');
          return;
        }

        this.isLoading = true;

        const formData = new FormData();
        formData.append('userId', userState._id);
        formData.append('image', this.nienLuanImageFile);
        formData.append('pdfFile', this.nienLuanPdfFile);
        formData.append('topicName', this.nienLuanTopicName);
        formData.append('maDotNop', this.selectedDotNop);

        await bookService.addNienLuan(formData);
        alert('Nộp niên luận thành công!');
        this.fetchNienLuan();
      } catch (err) {
        alert('Có lỗi xảy ra khi nộp niên luận!');
      } finally {
        this.isLoading = false;
      }
    },

    // ===== METHODS CHO GIẢNG VIÊN =====

    // Load danh sách đợt nộp niên luận (Giảng viên)
    async loadDotNopNienLuanData() {
      try {
        const response = await bookService.getAllDotNopNienLuan({
          maGiangVien: userState._id,
        });
        this.dotNopNienLuanList = response;
      } catch (error) {
        console.error('Lỗi khi tải đợt nộp niên luận:', error);
      }
    },

    // Mở modal tạo đợt nộp niên luận
    openCreateDotNienLuanModal() {
      this.editingDotNienLuan = null;
      this.dotNienLuanForm = {
        TenDot: '',
        KyHoc: '',
        NamHoc: '',
        ThoiGianMoNop: '',
        ThoiGianDongNop: '',
        SoLuongPhaiNop: 1,
      };
      this.showDotNienLuanModal = true;
    },

    // Mở modal chỉnh sửa đợt nộp niên luận
    openEditDotNienLuanModal(dot) {
      this.editingDotNienLuan = dot;
      this.dotNienLuanForm = {
        TenDot: dot.TenDot,
        KyHoc: dot.KyHoc?._id || '',
        NamHoc: dot.NamHoc?._id || '',
        ThoiGianMoNop: this.formatDateTimeLocal(dot.ThoiGianMoNop),
        ThoiGianDongNop: this.formatDateTimeLocal(dot.ThoiGianDongNop),
        SoLuongPhaiNop: dot.SoLuongPhaiNop || 1,
      };
      this.showDotNienLuanModal = true;
    },

    // Lưu đợt nộp niên luận
    async saveDotNienLuan() {
      try {
        if (
          !this.dotNienLuanForm.TenDot ||
          !this.dotNienLuanForm.KyHoc ||
          !this.dotNienLuanForm.NamHoc ||
          !this.dotNienLuanForm.ThoiGianMoNop ||
          !this.dotNienLuanForm.ThoiGianDongNop ||
          !this.dotNienLuanForm.SoLuongPhaiNop ||
          this.dotNienLuanForm.SoLuongPhaiNop < 1
        ) {
          alert('Vui lòng điền đầy đủ thông tin');
          return;
        }

        if (this.editingDotNienLuan) {
          await bookService.updateDotNopNienLuan({
            dotNopId: this.editingDotNienLuan._id,
            ...this.dotNienLuanForm,
          });
          alert('Cập nhật đợt nộp niên luận thành công');
        } else {
          await bookService.createDotNopNienLuan({
            ...this.dotNienLuanForm,
            MaGiangVien: userState._id,
          });
          alert('Tạo đợt nộp niên luận thành công');
        }

        this.showDotNienLuanModal = false;
        await this.loadDotNopNienLuanData();
      } catch (error) {
        console.error('Lỗi khi lưu đợt nộp niên luận:', error);
        alert('Có lỗi xảy ra');
      }
    },

    // Xóa đợt nộp niên luận
    async deleteDotNienLuan(dotNopId) {
      if (!confirm('Bạn có chắc muốn xóa đợt nộp này?')) return;

      try {
        await bookService.deleteDotNopNienLuan({ dotNopId });
        alert('Xóa thành công');
        await this.loadDotNopNienLuanData();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert(error.response?.data?.error || 'Có lỗi xảy ra');
      }
    },

    // Load danh sách niên luận (Giảng viên)
    async loadAllNienLuanByGiangVien() {
      try {
        const response = await bookService.getAllNienLuanByGiangVien({
          maGiangVien: userState._id,
        });
        this.nienLuanList = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách niên luận:', error);
      }
    },

    // Duyệt niên luận
    async approveNienLuanInTable(nienLuanId) {
      try {
        const confirmApprove = confirm(
          'Bạn có chắc chắn muốn duyệt niên luận này không?'
        );
        if (!confirmApprove) return;

        await bookService.approveNienLuan({ nienLuanId });
        const index = this.nienLuanList.findIndex(
          (item) => item._id === nienLuanId
        );
        if (index !== -1) {
          this.nienLuanList[index].TrangThai = 'Đã duyệt';
          this.nienLuanList[index].NgayNop = new Date();
        }
        alert('Duyệt thành công');
      } catch (error) {
        console.error('Lỗi khi duyệt:', error);
        alert('Duyệt thất bại');
      }
    },

    // Từ chối niên luận
    async rejectNienLuanInTable(nienLuanId) {
      try {
        const confirmApprove = confirm(
          'Bạn có chắc chắn muốn từ chối niên luận này không?'
        );
        if (!confirmApprove) return;

        await bookService.rejectNienLuan({ nienLuanId });
        const index = this.nienLuanList.findIndex(
          (item) => item._id === nienLuanId
        );
        if (index !== -1) {
          this.nienLuanList[index].TrangThai = 'Từ chối';
        }
        alert('Từ chối thành công');
      } catch (error) {
        console.error('Lỗi khi từ chối:', error);
        alert('Từ chối thất bại');
      }
    },

    // Xem chi tiết niên luận
    handleNienLuanClick(nienLuan) {
      this.selectedNienLuan = nienLuan;
      this.showNienLuanModal = true;
    },

    // Mở PDF niên luận trong modal
    openNienLuanPdfInModal() {
      if (this.selectedNienLuan?.Pdf) {
        window.open(this.selectedNienLuan.Pdf, '_blank');
      } else {
        alert('Chưa có file niên luận');
      }
    },

    // Reset filter niên luận
    resetNienLuanFilters() {
      this.nienLuanSearchKeyword = '';
      this.nienLuanFilterDotNop = '';
      this.nienLuanFilterKyHoc = '';
      this.nienLuanFilterNamHoc = '';
      this.selectedNienLuanStatus = 'all';
      this.nienLuanCurrentPage = 1;
    },

    // Phân trang niên luận
    goToNienLuanPage(page) {
      if (page >= 1 && page <= this.nienLuanTotalPages) {
        this.nienLuanCurrentPage = page;
      }
    },

    async saveKyHoc() {
      if (!this.newKyHoc.trim()) {
        alert('Vui lòng nhập tên kỳ học');
        return;
      }
      try {
        const result = await bookService.addKyHoc({ TenKyHoc: this.newKyHoc });
        this.kyHocList.push(result);
        this.dotNienLuanForm.KyHoc = result._id;
        this.showAddKyHocModal = false;
        this.newKyHoc = '';
        alert('Thêm kỳ học thành công');
      } catch (error) {
        alert('Lỗi khi thêm kỳ học');
      }
    },

    async saveNamHoc() {
      if (!this.newNamHoc.trim()) {
        alert('Vui lòng nhập tên năm học');
        return;
      }
      try {
        const result = await bookService.addNamHoc({
          TenNamHoc: this.newNamHoc,
        });
        this.namHocList.push(result);
        this.dotNienLuanForm.NamHoc = result._id;
        this.showAddNamHocModal = false;
        this.newNamHoc = '';
        alert('Thêm năm học thành công');
      } catch (error) {
        alert('Lỗi khi thêm năm học');
      }
    },

    selectDotNopAndClose(dot) {
      this.selectedDotNop = dot._id;
      this.showSelectDotModal = false;
      this.dotNopSearchKeyword = ''; // Clear search
    },

    // Thêm vào phần methods
    async checkSubmissionForDot(dotNopId) {
      if (!dotNopId || !userState._id) {
        this.submittedForCurrentDot = false;
        this.submittedDotDetails = null;
        return;
      }

      try {
        const result = await bookService.checkNienLuanSubmission(
          userState._id,
          dotNopId
        );
        this.submittedForCurrentDot = result.hasSubmitted;
        this.submittedDotDetails = result.data;

        if (result.hasSubmitted) {
          this.nienLuanStatus = result.data.trangThai;
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra niên luận:', error);
        this.submittedForCurrentDot = false;
        this.submittedDotDetails = null;
      }
    },

    async loadNienLuanKhoa() {
      try {
        const response = await bookService.getAllNienLuanCuaKhoa({
          maGiangVien: userState._id,
        });
        this.nienLuanKhoaList = response;
      } catch (error) {
        console.error('Lỗi khi tải niên luận khoa:', error);
      }
    },

    resetNienLuanKhoaFilters() {
      this.nienLuanKhoaSearchKeyword = '';
      this.nienLuanKhoaFilterKyHoc = '';
      this.nienLuanKhoaFilterNamHoc = '';
      this.nienLuanKhoaCurrentPage = 1;
    },

    goToNienLuanKhoaPage(page) {
      if (page >= 1 && page <= this.nienLuanKhoaTotalPages) {
        this.nienLuanKhoaCurrentPage = page;
      }
    },

    // THÊM: Kiểm tra sách có trong tủ không
    isInShelf(bookId) {
      if (!this.shelfBookIds || !bookId) return false;
      const bid = bookId.toString();
      return this.shelfBookIds.some((id) => id.toString() === bid);
    },

    // THÊM: Toggle tủ sách
    async toggleShelf(book) {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để sử dụng tủ sách');
          return;
        }

        const bookId = book._id.toString();

        if (this.isInShelf(bookId)) {
          // Xóa khỏi tủ
          const data = { MaSach: bookId, MaDocGia: maDocGia };
          await bookService.removeBookFromShelf(data);
          this.shelfBookIds = this.shelfBookIds.filter(
            (id) => id.toString() !== bookId
          );
          window.dispatchEvent(new Event('shelf-updated'));
          alert('Đã bỏ sách khỏi tủ!');
        } else {
          // Thêm vào tủ
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

    // THÊM: Mượn nhanh 1 cuốn
    async quickBorrowInLibrary(book) {
      try {
        const maDocGia = userState._id;
        if (!maDocGia) {
          alert('Bạn cần đăng nhập để mượn sách');
          return;
        }

        // Kiểm tra số lượng sách
        if (book.SoQuyen === 0) {
          alert('Sách đã hết!');
          return;
        }

        // Kiểm tra thẻ thư viện
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

        // Kiểm tra giới hạn mượn
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

        // Kiểm tra giới hạn tổng
        if (currentBorrow + 1 > MAX_TOTAL) {
          alert(
            `❌ Vượt quá giới hạn tổng số sách\n\n` +
              `• Đang mượn: ${currentBorrow} cuốn\n` +
              `• Giới hạn tối đa: ${MAX_TOTAL} cuốn\n\n` +
              `➡️ Bạn chỉ có thể mượn thêm ${MAX_TOTAL - currentBorrow} cuốn`
          );
          return;
        }

        // Kiểm tra giới hạn trong ngày
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

        // Kiểm tra với pending
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

        // Thực hiện mượn sách
        const data = {
          MaSach: book._id,
          MaDocGia: maDocGia,
          SoLuongMuon: 1,
        };

        try {
          const result = await bookService.lendBook(data);

          // THÊM: Kiểm tra kết quả trả về
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

          // Cập nhật tủ sách
          const shelfResponse = await bookService.getAllBooksOnShelf(
            userState._id
          );
          this.shelfBookIds = Array.isArray(shelfResponse)
            ? shelfResponse.map((book) => book._id.toString())
            : [];

          window.dispatchEvent(new Event('shelf-updated'));
        } catch (apiError) {
          // Xử lý lỗi từ API
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
    filteredDotNopNienLuanListWithCount() {
      return this.filteredDotNopNienLuanList.map((dot) => {
        // Đếm số niên luận có trạng thái "Đã duyệt" của đợt này
        const approvedCount = this.nienLuanList.filter((nl) => {
          const dotNopId =
            typeof nl.MaDotNop === 'object' ? nl.MaDotNop?._id : nl.MaDotNop;
          return (
            String(dotNopId) === String(dot._id) && nl.TrangThai === 'Đã duyệt'
          );
        }).length;

        return {
          ...dot,
          soLuongDaNop: approvedCount,
        };
      });
    },

    filteredPublishers() {
      if (!this.publisherSearchKeyword.trim()) {
        return this.publishers;
      }
      const keyword = removeVietnameseTones(
        this.publisherSearchKeyword.toLowerCase()
      );
      return this.publishers.filter((pub) => {
        const name = removeVietnameseTones(pub.TenNXB.toLowerCase());
        return name.includes(keyword);
      });
    },

    filteredPublishYears() {
      if (!this.yearSearchKeyword.trim()) {
        return this.publishYears;
      }
      const keyword = this.yearSearchKeyword.trim();
      return this.publishYears.filter((year) =>
        year.toString().includes(keyword)
      );
    },

    hasActiveFilters() {
      return (
        this.searchKeyword ||
        this.searchAuthor ||
        this.selectedPublishers.length > 0 ||
        this.selectedPublishYears.length > 0 ||
        this.selectedGenres.length > 0 ||
        this.selectedRatings.length > 0
      );
    },

    filteredBooks() {
      let result = this.books;

      if (this.activeTab === 'sach') {
        result = result.filter((book) => book.LoaiSach === 'Sach');
      } else if (this.activeTab === 'giaotrinh') {
        result = result.filter((book) => book.LoaiSach === 'GiaoTrinh');
      }

      // Filter theo search keyword
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase().trim();
        result = result.filter((book) => {
          const tenSach = book.TenSach.toLowerCase();
          const maSach = book.MaSach.toLowerCase();
          return tenSach.includes(keyword) || maSach.includes(keyword);
        });
      }

      //Filter theo tác giả
      if (this.searchAuthor.trim()) {
        const authorKeyword = this.searchAuthor.toLowerCase().trim();
        result = result.filter((book) => {
          const tacGia = book.TacGia.toLowerCase();
          return tacGia.includes(authorKeyword);
        });
      }

      // Filter theo thể loại đã chọn
      if (this.activeTab === 'giaotrinh' && this.selectedKhoas.length > 0) {
        result = result.filter((book) => {
          const khoaId = book.Khoa?._id
            ? book.Khoa._id.toString()
            : book.Khoa?.toString();
          return khoaId && this.selectedKhoas.includes(khoaId);
        });
      } else if (this.activeTab === 'sach' && this.selectedGenres.length > 0) {
        result = result.filter((book) => {
          const genreId = book.MaTheLoai?._id
            ? book.MaTheLoai._id.toString()
            : book.MaTheLoai?.toString();
          return genreId && this.selectedGenres.includes(genreId);
        });
      }

      // THÊM FILTER THEO RATING
      if (this.selectedRatings.length > 0) {
        result = result.filter((book) => {
          const rating = parseFloat(book.averageRating) || 0;
          return this.selectedRatings.some((selectedRating) => {
            const ratingNum = parseInt(selectedRating);
            if (ratingNum === 5) {
              return rating >= 5.0;
            } else if (ratingNum === 4) {
              return rating >= 4.0 && rating < 5.0;
            } else if (ratingNum === 3) {
              return rating >= 3.0 && rating < 4.0;
            }
            return false;
          });
        });
      }

      // THÊM FILTER THEO NHÀ XUẤT BẢN
      if (this.selectedPublishers.length > 0) {
        result = result.filter((book) => {
          const nxbId = book.MaNXB?._id
            ? book.MaNXB._id.toString()
            : book.MaNXB?.toString();
          return nxbId && this.selectedPublishers.includes(nxbId);
        });
      }

      // THÊM FILTER THEO NĂM XUẤT BẢN
      if (this.selectedPublishYears.length > 0) {
        result = result.filter((book) => {
          return this.selectedPublishYears.includes(book.NamXuatBan);
        });
      }

      return result;
    },

    sortedBooks() {
      if (this.sortOption === 'new') {
        return [...this.filteredBooks].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (this.sortOption === 'title') {
        return [...this.filteredBooks].sort((a, b) =>
          a.TenSach.localeCompare(b.TenSach, 'vi', { sensitivity: 'base' })
        );
      } else if (this.sortOption === 'popular') {
        // Thêm case này
        // Sắp xếp theo thứ tự trong popularBooks, sau đó theo score giảm dần
        return [...this.filteredBooks].sort((a, b) => {
          const aPopular = this.popularBooks.find((p) => p._id === a._id);
          const bPopular = this.popularBooks.find((p) => p._id === b._id);

          if (aPopular && bPopular) {
            return bPopular.score - aPopular.score;
          }
          if (aPopular) return -1;
          if (bPopular) return 1;
          return 0;
        });
      } else {
        return this.filteredBooks;
      }
    },

    paginatedBooks() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedBooks.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.sortedBooks.length / this.pageSize);
    },

    filteredThesisList() {
      let result = [...this.thesisList]; // Tạo bản sao để tránh mutate

      // ✅ SỬA LẠI: Lọc theo tên luận văn - TÌM KIẾM THÔNG MINH
      if (this.thesisSearchKeyword.trim()) {
        result = smartSearch(
          result,
          this.thesisSearchKeyword,
          (thesis) => thesis.TieuDeTai
        );
      }

      // ✅ SỬA LẠI: Lọc theo GVHD - TÌM KHÔNG DẤU
      if (this.thesisSearchSupervisor.trim()) {
        const normalizedKeyword = removeVietnameseTones(
          this.thesisSearchSupervisor
        );

        result = result.filter((thesis) => {
          const normalizedSupervisor = removeVietnameseTones(
            thesis.GiaoVienHuongDan
          );
          return normalizedSupervisor.includes(normalizedKeyword);
        });
      }

      // ✅ THÊM: Lọc theo kỳ học
      if (this.thesisFilterKyHoc) {
        result = result.filter((thesis) => {
          const kyHocId =
            typeof thesis.MaDotNop?.KyHoc === 'object'
              ? thesis.MaDotNop?.KyHoc?._id
              : thesis.MaDotNop?.KyHoc;
          return String(kyHocId) === String(this.thesisFilterKyHoc);
        });
      }

      // ✅ THÊM: Lọc theo năm học
      if (this.thesisFilterNamHoc) {
        result = result.filter((thesis) => {
          const namHocId =
            typeof thesis.MaDotNop?.NamHoc === 'object'
              ? thesis.MaDotNop?.NamHoc?._id
              : thesis.MaDotNop?.NamHoc;
          return String(namHocId) === String(this.thesisFilterNamHoc);
        });
      }

      // Lọc theo năm bảo vệ - SỬA LẠI PHẦN NÀY
      if (this.selectedDefenseYear) {
        const selectedYear = parseInt(this.selectedDefenseYear);
        result = result.filter((thesis) => {
          const thesisYear = parseInt(thesis.NamBaoVe);
          return thesisYear === selectedYear;
        });
      }

      // Lọc theo bậc đào tạo
      if (this.selectedEducationLevel) {
        result = result.filter(
          (thesis) => thesis.BacDaoTao === this.selectedEducationLevel
        );
      }

      // Lọc theo ngành học
      if (this.selectedMajor) {
        result = result.filter((thesis) => {
          const majorName = thesis.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh;
          return majorName === this.selectedMajor;
        });
      }

      // Lọc theo khoa
      if (this.selectedFaculty) {
        result = result.filter((thesis) => {
          const facultyName =
            thesis.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa;
          return facultyName === this.selectedFaculty;
        });
      }

      return result;
    },

    paginatedThesis() {
      const start = (this.thesisCurrentPage - 1) * this.thesisPageSize;
      const end = start + this.thesisPageSize;
      return this.filteredThesisList.slice(start, end); // Sử dụng filteredThesisList thay vì thesisList
    },

    thesisTotalPages() {
      return Math.ceil(this.filteredThesisList.length / this.thesisPageSize); // Sử dụng filteredThesisList
    },

    canSubmitThesis() {
      // Nếu đã có luận văn (chờ duyệt hoặc đã duyệt) thì không cho nộp
      if (
        this.thesisStatus === 'Chờ duyệt' ||
        this.thesisStatus === 'Đã duyệt'
      ) {
        return false;
      }
      // Nếu không có đợt nộp đang mở thì không cho nộp
      if (!this.activeDotNop) {
        return false;
      }
      return true;
    },

    canSubmitNienLuan() {
      if (
        this.nienLuanStatus === 'Chờ duyệt' ||
        this.nienLuanStatus === 'Đã duyệt'
      ) {
        return false;
      }
      // Kiểm tra đã chọn đợt nộp chưa
      if (!this.selectedDotNop) {
        return false;
      }
      return true;
    },

    // Filter danh sách niên luận (Giảng viên)
    filteredNienLuanList() {
      let result = [...this.nienLuanList];

      // Lọc theo từ khóa tên đề tài
      if (this.nienLuanSearchKeyword.trim()) {
        result = smartSearch(
          result,
          this.nienLuanSearchKeyword,
          (nl) => nl.TenDeTai
        );
      }

      // THÊM: Lọc theo đợt nộp
      if (this.nienLuanFilterDotNop) {
        result = result.filter((nl) => {
          const dotNopId =
            typeof nl.MaDotNop === 'object' ? nl.MaDotNop?._id : nl.MaDotNop;
          return String(dotNopId) === String(this.nienLuanFilterDotNop);
        });
      }

      // Lọc theo kỳ học
      if (this.nienLuanFilterKyHoc) {
        result = result.filter((nl) => {
          const kyHocId =
            typeof nl.MaDotNop?.KyHoc === 'object'
              ? nl.MaDotNop?.KyHoc?._id
              : nl.MaDotNop?.KyHoc;
          return String(kyHocId) === String(this.nienLuanFilterKyHoc);
        });
      }

      // Lọc theo năm học
      if (this.nienLuanFilterNamHoc) {
        result = result.filter((nl) => {
          const namHocId =
            typeof nl.MaDotNop?.NamHoc === 'object'
              ? nl.MaDotNop?.NamHoc?._id
              : nl.MaDotNop?.NamHoc;
          return String(namHocId) === String(this.nienLuanFilterNamHoc);
        });
      }

      // Lọc theo trạng thái
      if (this.selectedNienLuanStatus !== 'all') {
        result = result.filter(
          (nl) => nl.TrangThai === this.selectedNienLuanStatus
        );
      }

      return result;
    },

    paginatedNienLuanList() {
      const start = (this.nienLuanCurrentPage - 1) * this.nienLuanPageSize;
      const end = start + this.nienLuanPageSize;
      return this.filteredNienLuanList.slice(start, end);
    },

    nienLuanTotalPages() {
      return Math.ceil(
        this.filteredNienLuanList.length / this.nienLuanPageSize
      );
    },

    // Filter danh sách đợt nộp niên luận (Giảng viên)
    filteredDotNopNienLuanList() {
      let result = [...this.dotNopNienLuanList];

      // Lọc theo kỳ học
      if (this.nienLuanFilterKyHoc) {
        result = result.filter((dot) => {
          const kyHocId =
            typeof dot.KyHoc === 'object' ? dot.KyHoc?._id : dot.KyHoc;
          return String(kyHocId) === String(this.nienLuanFilterKyHoc);
        });
      }

      // Lọc theo năm học
      if (this.nienLuanFilterNamHoc) {
        result = result.filter((dot) => {
          const namHocId =
            typeof dot.NamHoc === 'object' ? dot.NamHoc?._id : dot.NamHoc;
          return String(namHocId) === String(this.nienLuanFilterNamHoc);
        });
      }

      // Lọc theo trạng thái
      if (this.selectedNienLuanStatus !== 'all') {
        result = result.filter(
          (dot) => dot.TrangThai === this.selectedNienLuanStatus
        );
      }

      return result;
    },

    // Lọc danh sách đợt nộp theo từ khóa tìm kiếm
    filteredDotNopList() {
      if (!this.dotNopSearchKeyword.trim()) {
        return this.availableDotNopList;
      }

      const keyword = removeVietnameseTones(
        this.dotNopSearchKeyword.toLowerCase()
      );

      return this.availableDotNopList.filter((dot) => {
        const tenDot = removeVietnameseTones(dot.TenDot.toLowerCase());
        const tenGV = removeVietnameseTones(
          `${dot.MaGiangVien.HoLot} ${dot.MaGiangVien.Ten}`.toLowerCase()
        );

        return tenDot.includes(keyword) || tenGV.includes(keyword);
      });
    },

    // Lấy thông tin đợt nộp đã chọn
    selectedDotNopInfo() {
      if (!this.selectedDotNop) return null;
      return this.availableDotNopList.find(
        (dot) => dot._id === this.selectedDotNop
      );
    },

    hasSubmittedForSelectedDot() {
      return this.submittedForCurrentDot;
    },

    submittedDotInfo() {
      if (!this.hasSubmittedForSelectedDot) return null;

      // Trả về thông tin đợt nộp đã nộp
      return this.availableDotNopList.find(
        (dot) => dot._id === this.selectedDotNop
      );
    },

    // Filter danh sách niên luận khoa
    filteredNienLuanKhoaList() {
      let result = [...this.nienLuanKhoaList];

      // Lọc theo từ khóa tên đề tài
      if (this.nienLuanKhoaSearchKeyword.trim()) {
        result = smartSearch(
          result,
          this.nienLuanKhoaSearchKeyword,
          (nl) => nl.TenDeTai
        );
      }

      // Lọc theo kỳ học
      if (this.nienLuanKhoaFilterKyHoc) {
        result = result.filter((nl) => {
          const kyHocId =
            typeof nl.MaDotNop?.KyHoc === 'object'
              ? nl.MaDotNop?.KyHoc?._id
              : nl.MaDotNop?.KyHoc;
          return String(kyHocId) === String(this.nienLuanKhoaFilterKyHoc);
        });
      }

      // Lọc theo năm học
      if (this.nienLuanKhoaFilterNamHoc) {
        result = result.filter((nl) => {
          const namHocId =
            typeof nl.MaDotNop?.NamHoc === 'object'
              ? nl.MaDotNop?.NamHoc?._id
              : nl.MaDotNop?.NamHoc;
          return String(namHocId) === String(this.nienLuanKhoaFilterNamHoc);
        });
      }

      return result;
    },

    paginatedNienLuanKhoaList() {
      const start =
        (this.nienLuanKhoaCurrentPage - 1) * this.nienLuanKhoaPageSize;
      const end = start + this.nienLuanKhoaPageSize;
      return this.filteredNienLuanKhoaList.slice(start, end);
    },

    nienLuanKhoaTotalPages() {
      return Math.ceil(
        this.filteredNienLuanKhoaList.length / this.nienLuanKhoaPageSize
      );
    },
  },
  watch: {
    activeTab(newTab) {
      // Tự động chọn tab con khi chuyển sang tab Niên luận
      if (newTab === 'nienluan') {
        if (userState && userState.userType === 'Sinh viên') {
          this.nienLuanTab = 'nop';
        } else if (userState && userState.userType === 'Giảng viên') {
          this.nienLuanTab = 'quanlydot';
        }
      }
      // Tự động chọn tab con khi chuyển sang tab Luận văn
      else if (newTab === 'luanvan') {
        this.thesisTab = 'nop';
      }
    },

    '$route.query.page'(newPage) {
      const page = parseInt(newPage);
      if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    '$route.query.genre'(newGenre) {
      if (newGenre) {
        this.selectedGenres = [newGenre];
      } else {
        this.selectedGenres = [];
      }
    },

    '$route.query.sort'(newSort) {
      if (newSort && ['popular', 'new', 'title'].includes(newSort)) {
        this.sortOption = newSort;
      }
    },

    '$route.query.author'(newAuthor) {
      // THÊM WATCH NÀY
      if (newAuthor) {
        this.searchAuthor = newAuthor;
      }
    },

    '$route.query.tab'(newTab) {
      if (
        newTab &&
        ['sach', 'giaotrinh', 'luanvan', 'nienluan'].includes(newTab)
      ) {
        this.activeTab = newTab;
      }
    },

    sortOption() {
      this.goToPage(1);
    },

    searchKeyword() {
      this.goToPage(1);
    },

    selectedGenres() {
      this.goToPage(1);
    },

    searchAuthor() {
      // THÊM WATCH NÀY
      this.goToPage(1);
    },

    selectedRatings() {
      this.goToPage(1);
    },

    thesisSearchKeyword() {
      this.thesisCurrentPage = 1;
    },
    thesisSearchSupervisor() {
      this.thesisCurrentPage = 1;
    },
    selectedDefenseYear() {
      this.thesisCurrentPage = 1;
    },
    selectedEducationLevel() {
      this.thesisCurrentPage = 1;
    },
    selectedMajor() {
      this.thesisCurrentPage = 1;
    },
    selectedFaculty() {
      this.thesisCurrentPage = 1;
    },
    selectedKhoas() {
      this.goToPage(1);
    },
    thesisFilterKyHoc() {
      this.thesisCurrentPage = 1;
    },
    thesisFilterNamHoc() {
      this.thesisCurrentPage = 1;
    },

    nienLuanSearchKeyword() {
      this.nienLuanCurrentPage = 1;
    },

    nienLuanFilterKyHoc() {
      this.nienLuanCurrentPage = 1;
    },

    nienLuanFilterNamHoc() {
      this.nienLuanCurrentPage = 1;
    },

    selectedNienLuanStatus() {
      this.nienLuanCurrentPage = 1;
    },

    nienLuanKhoaSearchKeyword() {
      this.nienLuanKhoaCurrentPage = 1;
    },

    nienLuanKhoaFilterKyHoc() {
      this.nienLuanKhoaCurrentPage = 1;
    },

    nienLuanKhoaFilterNamHoc() {
      this.nienLuanKhoaCurrentPage = 1;
    },
    nienLuanFilterDotNop() {
      this.nienLuanCurrentPage = 1;
    },

    selectedPublishers() {
      this.goToPage(1);
    },

    selectedPublishYears() {
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
