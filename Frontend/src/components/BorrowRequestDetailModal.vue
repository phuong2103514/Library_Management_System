<template>
  <transition name="modal-fade">
    <div
      class="borrow-request-modal"
      v-if="show"
      tabindex="-1"
      @click="$emit('close')"
    >
      <div class="borrow-request-modal__dialog" @click.stop>
        <div class="borrow-request-modal__content">
          <div class="borrow-request-modal__header">
            <h5 class="borrow-request-modal__title">
              Chi tiết yêu cầu mượn sách
            </h5>
            <button
              type="button"
              class="borrow-request-modal__close"
              @click="$emit('close')"
            >
              &times;
            </button>
          </div>

          <div class="borrow-request-modal__body">
            <div class="borrow-request-info">
              <!-- <div class="borrow-request-info__image">
                <img :src="request?.MaSach?.Image || '/placeholder.png'" alt="Book cover" />
              </div> -->

              <div class="borrow-request-info__details">
                <p class="borrow-request-info__row">
                  <span class="borrow-request-info__label">Mã phiếu mượn:</span>
                  <span
                    class="borrow-request-info__value borrow-request-info__value--slip-id"
                  >
                    {{ getSlipId(request) }}
                  </span>
                </p>

                <p class="borrow-request-info__row">
                  <span class="borrow-request-info__label">Mã độc giả:</span>
                  <span class="borrow-request-info__value">{{
                    request?.MaDocGia?.MaDocGia
                  }}</span>
                </p>

                <p class="borrow-request-info__row">
                  <span class="borrow-request-info__label">Họ tên:</span>
                  <span class="borrow-request-info__value">
                    {{ request?.MaDocGia?.HoLot }} {{ request?.MaDocGia?.Ten }}
                  </span>
                </p>

                <!-- ✅ Nếu là phiếu mượn (có nhiều sách) -->
                <div v-if="request?._isGroup">
                  <p class="borrow-request-info__row">
                    <span class="borrow-request-info__label"
                      >Số lượng sách:</span
                    >
                    <span
                      class="borrow-request-info__value borrow-request-info__value--highlight"
                    >
                      {{ request._totalBooks }} cuốn
                    </span>
                  </p>

                  <div class="borrow-request-books">
                    <h4 class="borrow-request-books__title">
                      📚 Danh sách sách trong phiếu mượn:
                    </h4>

                    <div
                      v-for="(book, index) in request._books"
                      :key="book._id"
                      class="borrow-request-books__item"
                    >
                      <div class="borrow-request-books__number">
                        {{ index + 1 }}
                      </div>
                      <div class="borrow-request-books__info">
                        <p class="borrow-request-books__field">
                          <strong>Mã Sách:</strong> {{ book.MaSach?.MaSach }}
                        </p>
                        <p class="borrow-request-books__field">
                          <strong>Tên Sách:</strong> {{ book.MaSach?.TenSach }}
                        </p>
                        <p class="borrow-request-books__field">
                          <strong>Tác giả:</strong> {{ book.MaSach?.TacGia }}
                        </p>
                        <p
                          v-if="shouldShowBookStatus(request)"
                          class="borrow-request-books__field"
                        >
                          <strong>Trạng thái sách:</strong>
                          <span
                            class="book-status-badge"
                            :class="`book-status-badge--${book.TrangThai}`"
                          >
                            {{
                              getBookStatusText(
                                book.TrangThai,
                                book.NgayGhiNhanTra,
                                book.NgayTra
                              )
                            }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ✅ Nếu là sách đơn lẻ -->
                <div v-else>
                  <p class="borrow-request-info__row">
                    <span class="borrow-request-info__label">Mã Sách:</span>
                    <span class="borrow-request-info__value">{{
                      request?.MaSach?.MaSach
                    }}</span>
                  </p>

                  <p class="borrow-request-info__row">
                    <span class="borrow-request-info__label">Sách:</span>
                    <span class="borrow-request-info__value">{{
                      request?.MaSach?.TenSach
                    }}</span>
                  </p>
                </div>

                <p class="borrow-request-info__row">
                  <span class="borrow-request-info__label">Ngày yêu cầu:</span>
                  <span class="borrow-request-info__value">
                   {{ formatDate(request?.MaPhieuMuon?.NgayTao) }}
                  </span>
                </p>

                <p class="borrow-request-info__row">
                  <span class="borrow-request-info__label">Ngày duyệt:</span>
                  <span class="borrow-request-info__value">
                    {{
                      formatDate(
                        request?.NgayDuyet || request?.MaPhieuMuon?.NgayDuyet
                      ) || '--'
                    }}
                  </span>
                </p>

                <p class="borrow-request-info__row">
                  <span class="borrow-request-info__label"
                    >Ngày nhận sách:</span
                  >
                  <span class="borrow-request-info__value">
                    {{ formatDate(request?.NgayMuon) || '--' }}
                  </span>
                </p>

                <p class="borrow-request-info__row">
                  <span class="borrow-request-info__label"
                    >Trạng thái phiếu:</span
                  >
                  <span
                    class="borrow-request-info__status"
                    :class="`borrow-request-info__status--${getStatusClass(
                      request?.MaPhieuMuon?.TrangThai || request?.TrangThai
                    )}`"
                  >
                    {{
                      getStatusText(
                        request?.MaPhieuMuon?.TrangThai || request?.TrangThai,
                        request?.NgayDuyet
                      )
                    }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BorrowRequestDetailModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    request: {
      type: Object,
      default: null,
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('vi-VN');
    },
    getStatusText(status, ngayDuyet) {
      if (status === 'pending') return 'Chờ Duyệt';
      if (status === 'processing') return 'Đã Duyệt';
      if (status === 'approved') return 'Đã Nhận Sách';
      if (status === 'completed') return 'Hoàn Thành';
      if (ngayDuyet && status === 'denied') return 'Quá Hạn Lấy';
      return 'Đã Từ Chối';
    },
    getStatusClass(status) {
      if (status === 'pending') return 'pending';
      if (status === 'processing') return 'processing';
      if (status === 'approved') return 'approved';
      if (status === 'completed') return 'completed';
      return 'denied';
    },
    getBookStatusText(trangThai, ngayGhiNhanTra, ngayTra) {
      if (trangThai === 'approved') return 'Đang Mượn';
      if (trangThai === 'overdue') return 'Quá Hạn';
      if (trangThai === 'returned') {
        if (ngayGhiNhanTra && ngayTra) {
          const ngayTra_date = new Date(ngayTra);
          const ngayGhiNhan_date = new Date(ngayGhiNhanTra);
          return ngayGhiNhan_date > ngayTra_date ? 'Trả Trễ' : 'Đã Trả';
        }
        return 'Đã Trả';
      }
      return 'Chưa xác định';
    },

    getSlipId(request) {
      if (!request) return 'N/A';
      const slipId = request.MaPhieuMuon?._id || request.MaPhieuMuon;
      return slipId ? slipId.slice(-6).toUpperCase() : 'N/A';
    },

    shouldShowBookStatus(request) {
      if (!request) return false;
      const phieuStatus = request.MaPhieuMuon?.TrangThai || request.TrangThai;
      // Chỉ hiển thị trạng thái sách khi phiếu đã được nhận sách hoặc hoàn thành
      return phieuStatus === 'approved' || phieuStatus === 'completed';
    },
  },
};
</script>

<style scoped>
/* ==================== MODAL OVERLAY ==================== */
.borrow-request-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  /* backdrop-filter: blur(3px); */
}

.borrow-request-modal__dialog {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== MODAL CONTENT ==================== */
.borrow-request-modal__content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.borrow-request-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.borrow-request-modal__title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.borrow-request-modal__close {
  background: none;
  border: none;
  color: #fff;
  font-size: 3rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.borrow-request-modal__close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* ==================== MODAL BODY ==================== */
.borrow-request-modal__body {
  padding: 30px 25px;
}

/* .borrow-request-info {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
} */

.borrow-request-info__image {
  width: 200px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.borrow-request-info__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.borrow-request-info__details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.borrow-request-info__row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.6;
}

.borrow-request-info__label {
  font-weight: 600;
  color: #495057;
  min-width: 130px;
  flex-shrink: 0;
}

.borrow-request-info__value {
  color: #2c3e50;
  flex: 1;
}

.borrow-request-info__value--highlight {
  color: #667eea;
  font-weight: 700;
  font-size: 1.6rem;
}

/* ==================== STATUS BADGE ==================== */
.borrow-request-info__status {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1.4rem;
}

.borrow-request-info__status--pending {
  background-color: #fff3cd;
  color: #856404;
}

.borrow-request-info__status--processing {
  background-color: #d1ecf1;
  color: #0c5460;
}

.borrow-request-info__status--approved {
  background-color: #d4edda;
  color: #155724;
}

.borrow-request-info__status--denied {
  background-color: #f8d7da;
  color: #721c24;
}

/* ==================== BOOKS LIST ==================== */
.borrow-request-books {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.borrow-request-books__title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.borrow-request-books__item {
  display: flex;
  gap: 15px;
  padding: 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.borrow-request-books__item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.borrow-request-books__number {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.borrow-request-books__info {
  flex: 1;
}

.borrow-request-books__field {
  margin: 6px 0;
  font-size: 1.4rem;
  color: #495057;
  line-height: 1.6;
}

.borrow-request-books__field strong {
  color: #2c3e50;
  font-weight: 600;
  margin-right: 8px;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 768px) {
  .borrow-request-modal__dialog {
    width: 95%;
  }

  .borrow-request-info {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .borrow-request-info__image {
    width: 100%;
    height: 300px;
    margin: 0 auto;
  }

  .borrow-request-info__label {
    min-width: 110px;
  }

  .borrow-request-modal__title {
    font-size: 1.7rem;
  }

  .borrow-request-books__item {
    flex-direction: column;
  }

  .borrow-request-books__number {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .borrow-request-modal__header {
    padding: 15px 20px;
  }

  .borrow-request-modal__body {
    padding: 20px 15px;
  }

  .borrow-request-info__row {
    flex-direction: column;
    gap: 5px;
  }

  .borrow-request-info__label {
    min-width: auto;
  }
}

/* ==================== TRANSITION ==================== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Thêm sau .borrow-request-info__status--denied */
.borrow-request-info__status--completed {
  background-color: #d4edda;
  color: #155724;
}

/* Thêm vào cuối file CSS */
.book-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 600;
  margin-left: 8px;
}

.book-status-badge--approved {
  background-color: #d1ecf1;
  color: #0c5460;
}

.book-status-badge--overdue {
  background-color: #f8d7da;
  color: #721c24;
}

.book-status-badge--returned {
  background-color: #d4edda;
  color: #155724;
}

/* .borrow-request-info__value--slip-id {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
  letter-spacing: 1px;
} */
</style>
