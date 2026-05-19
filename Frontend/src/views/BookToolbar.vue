<template>
  <div class="book__library-list-toolbar">
    <div class="book__library-toolbar-row">
      <!-- Tìm theo mã/tên sách -->
      <div class="book__library-search-input">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm theo mã hoặc tên sách..."
          :value="searchKeyword"
          @input="$emit('update:searchKeyword', $event.target.value)"
        />
      </div>

      <!-- Tìm theo tác giả -->
      <div class="book__library-search-input">
        <span class="search-icon">👤</span>
        <input
          type="text"
          placeholder="Tìm theo tác giả..."
          :value="searchAuthor"
          @input="$emit('update:searchAuthor', $event.target.value)"
        />
      </div>

      <!-- Nhà xuất bản autocomplete -->
      <div class="book__library-filter-autocomplete">
        <span class="filter-icon">🏢</span>
        <input
          type="text"
          placeholder="Nhà xuất bản..."
          :value="publisherSearchKeyword"
          @input="$emit('update:publisherSearchKeyword', $event.target.value)"
          @focus="$emit('update:showPublisherDropdown', true)"
          @blur="$emit('hidePublisherDropdown')"
        />
        <div
          v-if="showPublisherDropdown && filteredPublishers.length > 0"
          class="autocomplete-dropdown"
        >
          <div
            v-for="pub in filteredPublishers"
            :key="pub._id"
            class="autocomplete-item"
            :class="{ selected: selectedPublishers.includes(pub._id) }"
            @mousedown.prevent="$emit('togglePublisher', pub._id)"
          >
            <i v-if="selectedPublishers.includes(pub._id)" class="fas fa-check-circle"></i>
            {{ pub.TenNXB }}
          </div>
        </div>
        <span v-if="selectedPublishers.length > 0" class="selected-count">
          {{ selectedPublishers.length }}
        </span>
      </div>

      <!-- Năm xuất bản autocomplete -->
      <div class="book__library-filter-autocomplete">
        <span class="filter-icon">📅</span>
        <input
          type="text"
          placeholder="Năm xuất bản..."
          :value="yearSearchKeyword"
          @input="$emit('update:yearSearchKeyword', $event.target.value)"
          @focus="$emit('update:showYearDropdown', true)"
          @blur="$emit('hideYearDropdown')"
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
            @mousedown.prevent="$emit('toggleYear', year)"
          >
            <i v-if="selectedPublishYears.includes(year)" class="fas fa-check-circle"></i>
            {{ year }}
          </div>
        </div>
        <span v-if="selectedPublishYears.length > 0" class="selected-count">
          {{ selectedPublishYears.length }}
        </span>
      </div>

      <!-- Sort -->
      <div class="book__library-sort-select">
        <select
          :value="sortOption"
          @change="$emit('update:sortOption', $event.target.value)"
        >
          <option value="popular">📊 Phổ biến nhất</option>
          <option value="new">🆕 Mới nhất</option>
          <option value="title">🔤 Tên sách (A-Z)</option>
        </select>
      </div>

      <!-- Reset -->
      <button
        class="book__library-reset-btn"
        @click="$emit('resetAllFilters')"
        v-if="hasActiveFilters"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookToolbar',
  props: {
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
  },
  emits: [
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
  ],
};
</script>