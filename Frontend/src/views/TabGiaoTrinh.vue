<template>
  <div class="container-fluid">
    <!-- Overlay backdrop (mobile) -->
    <div
      class="book__library-filter-overlay"
      :class="{ open: filterDrawerOpen }"
      @click="filterDrawerOpen = false"
    />

    <div class="row d-flex align-items-start">
      <!-- Nút mở filter (chỉ hiện mobile) -->
      <div class="col-12 d-lg-none">
        <button
          class="book__library-filter-toggle-btn"
          @click="filterDrawerOpen = true"
        >
          <i class="fas fa-sliders-h" />
          Bộ lọc
          <span
            v-if="activeFilterCount > 0"
            class="filter-badge"
          >{{ activeFilterCount }}</span>
        </button>
      </div>

      <!-- Sidebar filter -->
      <div
        class="col-lg-3 book__library-filter-wrapper"
        :class="{ open: filterDrawerOpen }"
      >
        <!-- Nút đóng drawer (chỉ mobile) -->
        <div class="book__library-filter-close-btn">
          <button @click="filterDrawerOpen = false" aria-label="Đóng bộ lọc">
            &times;
          </button>
        </div>

        <div class="book__library-filter">
          <div class="book__library-filter-title">Khoa</div>
          <div class="book__library-filter-content">
            <div class="form-check" v-for="khoa in khoas" :key="khoa._id">
              <input
                class="form-check-input"
                type="checkbox"
                :value="khoa._id"
                :id="'khoa' + khoa._id"
                v-model="localSelectedKhoas"
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
            <div class="form-check" v-for="r in ratingOptions" :key="r.value">
              <input
                class="form-check-input"
                type="checkbox"
                :value="r.value"
                :id="'gt-rating' + r.value"
                v-model="localSelectedRatings"
              />
              <label class="form-check-label" :for="'gt-rating' + r.value">
                <div class="rating">
                  <span v-for="i in 5" :key="i" class="star" :class="i <= r.value ? 'filled' : ''">
                    {{ i <= r.value ? '★' : '☆' }}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Book list -->
      <div class="col-lg-9 book__library-list-wrapper">
        <div class="book__library-list">
          <BookToolbar
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
            @update:searchKeyword="$emit('update:searchKeyword', $event)"
            @update:searchAuthor="$emit('update:searchAuthor', $event)"
            @update:publisherSearchKeyword="$emit('update:publisherSearchKeyword', $event)"
            @update:yearSearchKeyword="$emit('update:yearSearchKeyword', $event)"
            @update:showPublisherDropdown="$emit('update:showPublisherDropdown', $event)"
            @update:showYearDropdown="$emit('update:showYearDropdown', $event)"
            @update:sortOption="$emit('update:sortOption', $event)"
            @togglePublisher="$emit('togglePublisher', $event)"
            @toggleYear="$emit('toggleYear', $event)"
            @hidePublisherDropdown="$emit('hidePublisherDropdown')"
            @hideYearDropdown="$emit('hideYearDropdown')"
            @resetAllFilters="$emit('resetAllFilters')"
          />

          <BookList
            :loading="loading"
            :paginatedBooks="paginatedBooks"
            :sortedBooks="sortedBooks"
            :currentPage="currentPage"
            :totalPages="totalPages"
            :favoriteBookIds="favoriteBookIds"
            :shelfBookIds="shelfBookIds"
            @goToBookDetail="$emit('goToBookDetail', $event)"
            @toggleFavorite="$emit('toggleFavorite', $event)"
            @toggleShelf="$emit('toggleShelf', $event)"
            @quickBorrow="$emit('quickBorrow', $event)"
            @goToPage="$emit('goToPage', $event)"
            :getStarStyle="getStarStyle"
            :formatPrice="formatPrice"
            :isFavorite="isFavorite"
            :isInShelf="isInShelf"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BookToolbar from './BookToolbar.vue';
import BookList from './BookList.vue';

export default {
  name: 'TabGiaoTrinh',
  components: { BookToolbar, BookList },
  props: {
    khoas: Array,
    selectedKhoas: Array,
    selectedRatings: Array,
    loading: Boolean,
    paginatedBooks: Array,
    sortedBooks: Array,
    currentPage: Number,
    totalPages: Number,
    favoriteBookIds: Array,
    shelfBookIds: Array,
    searchKeyword: String,
    searchAuthor: String,
    publisherSearchKeyword: String,
    yearSearchKeyword: String,
    showPublisherDropdown: Boolean,
    showYearDropdown: Boolean,
    filteredPublishers: Array,
    filteredPublishYears: Array,
    selectedPublishers: Array,
    selectedPublishYears: Array,
    sortOption: String,
    hasActiveFilters: Boolean,
    getStarStyle: Function,
    formatPrice: Function,
    isFavorite: Function,
    isInShelf: Function,
  },
  emits: [
    'update:selectedKhoas',
    'update:selectedRatings',
    'update:searchKeyword',
    'update:searchAuthor',
    'update:publisherSearchKeyword',
    'update:yearSearchKeyword',
    'update:showPublisherDropdown',
    'update:showYearDropdown',
    'update:sortOption',
    'togglePublisher',
    'toggleYear',
    'hidePublisherDropdown',
    'hideYearDropdown',
    'resetAllFilters',
    'goToBookDetail',
    'toggleFavorite',
    'toggleShelf',
    'quickBorrow',
    'goToPage',
  ],
  data() {
    return {
      ratingOptions: [{ value: 5 }, { value: 4 }, { value: 3 }],
      filterDrawerOpen: false,
    };
  },
  computed: {
    localSelectedKhoas: {
      get() { return this.selectedKhoas; },
      set(val) { this.$emit('update:selectedKhoas', val); },
    },
    localSelectedRatings: {
      get() { return this.selectedRatings; },
      set(val) { this.$emit('update:selectedRatings', val); },
    },
    activeFilterCount() {
      const khoas = (this.selectedKhoas || []).length;
      const ratings = (this.selectedRatings || []).length;
      const publishers = (this.selectedPublishers || []).length;
      const years = (this.selectedPublishYears || []).length;
      const keyword = this.searchKeyword ? 1 : 0;
      const author = this.searchAuthor ? 1 : 0;
      return khoas + ratings + publishers + years + keyword + author;
    },
  },
  watch: {
    localSelectedKhoas() {
      if (window.innerWidth < 992) this.filterDrawerOpen = false;
    },
    localSelectedRatings() {
      if (window.innerWidth < 992) this.filterDrawerOpen = false;
    },
  },
};
</script>