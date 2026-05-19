<template>
  <div class="book__library-list-book">
    <div v-if="!loading && sortedBooks.length === 0" class="text-center py-5">
      <p style="color: #666; font-size: 2.8rem">📚 Không tìm thấy sách phù hợp</p>
    </div>

    <div class="row book__library-list-book-row" v-else-if="!loading">
      <div
        class="col-6 col-sm-6 col-md-4 col-lg-3 book__library-list-book-element-wrapper"
        v-for="book in paginatedBooks"
        :key="book._id"
      >
        <div class="book__library-list-book-element">
          <div v-if="isFavorite(book._id)" class="badge-favorite">
            <span>❤️</span> Yêu thích
          </div>

          <div
            class="book__library-list-book-element-image"
            @click="$emit('goToBookDetail', book._id)"
          >
            <img :src="book.Image" alt="" />

            <div class="home__book-action-icon">
              <div
                class="home__book-action-favorite-icon"
                :class="{ favorite: isFavorite(book._id) }"
                @click.stop="$emit('toggleFavorite', book)"
              >
                <i class="fa-solid fa-heart"></i>
              </div>

              <div
                class="home__book-action-shelf-icon"
                :class="{ 'in-shelf': isInShelf(book._id) }"
                @click.stop="$emit('toggleShelf', book)"
                title="Thêm vào tủ sách"
              >
                <i class="fa-solid fa-bookmark"></i>
              </div>

              <div
                class="home__book-action-borrow-icon"
                @click.stop="$emit('quickBorrow', book)"
                title="Mượn nhanh"
              >
                <i class="fa-solid fa-book-medical"></i>
              </div>
            </div>
          </div>

          <div class="book__library-list-book-element-information">
            <div
              class="book__library-list-book-element-title"
              @click="$emit('goToBookDetail', book._id)"
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
                >★</span>
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

    <!-- Pagination -->
    <div class="book__library-list-book-navigation-page" v-if="sortedBooks.length > 0">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="$emit('goToPage', 1)">«</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="$emit('goToPage', currentPage - 1)">‹</a>
        </li>
        <li class="page-item active">
          <a class="page-link" href="#" @click.prevent>{{ currentPage }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="$emit('goToPage', currentPage + 1)">›</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="$emit('goToPage', totalPages)">»</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookList',
  props: {
    loading: Boolean,
    paginatedBooks: Array,
    sortedBooks: Array,
    currentPage: Number,
    totalPages: Number,
    favoriteBookIds: Array,
    shelfBookIds: Array,
    getStarStyle: Function,
    formatPrice: Function,
    isFavorite: Function,
    isInShelf: Function,
  },
  emits: ['goToBookDetail', 'toggleFavorite', 'toggleShelf', 'quickBorrow', 'goToPage'],
};
</script>