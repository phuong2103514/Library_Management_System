<template>
  <div class="import-page">
    <div class="import-container">
      <h2>Quản lý nhập sách</h2>
      <p class="subtitle">Import danh sách sách từ Open Library</p>

      <!-- Import Button -->
      <button
        class="import-btn"
        @click="handleImport"
        :disabled="isLoading"
      >
        <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span v-if="isLoading" class="spinner"></span>
        {{ isLoading ? 'Đang import...' : 'Import' }}
      </button>

      <!-- Status -->
      <p v-if="statusMsg" :class="['status-msg', statusType]">
        {{ statusMsg }}
      </p>

      <!-- Results -->
      <div class="book-list" v-if="books.length > 0">
        <div
          v-for="(book, index) in books"
          :key="index"
          class="book-card"
        >
          <img
            v-if="book.cover_i"
            :src="`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`"
            class="book-cover"
            alt="cover"
          />
          <div v-else class="book-cover placeholder"></div>

          <div class="book-info">
            <h4>{{ book.title }}</h4>
            <p>{{ (book.author_name || ['Không rõ']).slice(0, 2).join(', ') }}</p>
            <p class="year">{{ book.first_publish_year || '' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';

export default {
  name: 'ImportBook',
  data() {
    return {
      isLoading: false,
      books: [],
      statusMsg: '',
      statusType: '',
    };
  },
  methods: {
    async handleImport() {
      this.isLoading = true;
      this.statusMsg = '';
      this.books = [];

      try {
       const result = await bookService.importBookApi();
       console.log(result);
      } catch (error) {
        console.error('❌ Import error:', error);
        this.statusMsg = `✗ Lỗi: ${error.message}`;
        this.statusType = 'error';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.import-page {
  padding: 32px;
}

.import-container {
  max-width: 600px;
}

h2 {
  font-size: 22px;
  margin-bottom: 6px;
}

.subtitle {
  color: #718096;
  font-size: 14px;
  margin-bottom: 24px;
}

.import-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.import-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
}

.import-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-msg {
  margin-top: 16px;
  font-size: 14px;
}

.status-msg.success { color: #38a169; }
.status-msg.error   { color: #e53e3e; }

.book-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-card {
  display: flex;
  gap: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.book-cover {
  width: 48px;
  height: 64px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.book-cover.placeholder {
  background: #e2e8f0;
}

.book-info h4 {
  font-size: 14px;
  margin-bottom: 4px;
}

.book-info p {
  font-size: 12px;
  color: #718096;
}

.year {
  margin-top: 4px;
  color: #a0aec0 !important;
}
</style>