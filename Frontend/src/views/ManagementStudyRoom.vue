<template>
  <div class="library-card-management">
    <div class="management-util">
      <div class="management-util__search">
        <div class="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            class="search-input"
            v-model="searchKeyword"
          />
          <button class="search-button-card-library">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <input type="date" class="search-date ml-2" v-model="selectedDate" />
      </div>

      <div class="management-util__all-status">
        <select class="status-select" v-model="selectedStatus">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="denied">Từ chối</option>
          <option value="checked_in">Đã nhận phòng</option>
          <option value="no_show">Không nhận phòng</option>
        </select>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="borrow-book__tabs">
      <div
        class="borrow-book__tab"
        :class="{ active: activeTab === 'manage' }"
        @click="activeTab = 'manage'"
      >
        Quản Lý Phòng
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: activeTab === 'borrow' }"
        @click="activeTab = 'borrow'"
      >
        Danh Sách Mượn Phòng
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: activeTab === 'rules' }"
        @click="activeTab = 'rules'"
      >
        Quy Định
      </div>
    </div>

    <!-- TAB 1: Quản Lý Phòng -->
    <div v-if="activeTab === 'manage'">
      <div class="room-management-actions">
        <button class="action-btn action-btn--add" @click="openAddRoomModal">
          <i class="fas fa-plus"></i> Thêm Phòng Mới
        </button>
      </div>

      <table class="management-table mt-4 table w-100">
        <thead>
          <tr>
            <th class="management-table__header">Mã Phòng</th>
            <th class="management-table__header">Tên Phòng</th>
            <th class="management-table__header">Loại Phòng</th>
            <th class="management-table__header">Sức Chứa</th>
            <th class="management-table__header">Vị Trí</th>
            <th class="management-table__header">Ngày Tạo</th>
            <th class="management-table__header">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="room in paginatedRoomList"
            :key="room.id"
            @click="handleRoomRowClick(room)"
          >
            <td class="management-table__content">{{ room.MaPhong }}</td>
            <td
              class="management-table__content management-table__content-ellipsis"
            >
              {{ room.TenPhong }}
            </td>
            <td class="management-table__content">
              <span
                class="room-type-badge"
                :class="{
                  'room-type--group': room.LoaiPhong === 'Nhóm',
                  'room-type--individual': room.LoaiPhong === 'Cá nhân',
                }"
              >
                {{ room.LoaiPhong }}
              </span>
            </td>
            <td class="management-table__content">{{ room.SucChua }} người</td>
            <td
              class="management-table__content management-table__content-ellipsis"
            >
              {{ room.ViTri?.ViTri }}
            </td>
            <td class="management-table__content">
              {{ formatDate(room.createdAt) }}
            </td>
            <td class="management-table__content">
              <button
                class="action-btn action-btn--edit"
                @click.stop="openEditRoomModal(room)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="action-btn action-btn--delete"
                @click.stop="deleteRoom(room._id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination for Room List -->
      <div class="management-pagination" v-if="paginatedRoomList.length > 0">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPageRoom === 1 }">
            <a class="page-link" href="#" @click.prevent="goToPageRoom(1)">«</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPageRoom === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPageRoom(currentPageRoom - 1)"
              >‹</a
            >
          </li>
          <li class="page-item active">
            <a class="page-link" href="#" @click.prevent>{{
              currentPageRoom
            }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPageRoom === totalPagesRoom }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPageRoom(currentPageRoom + 1)"
              >›</a
            >
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPageRoom === totalPagesRoom }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPageRoom(totalPagesRoom)"
              >»</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- TAB 2: Danh Sách Mượn Phòng -->
    <div v-if="activeTab === 'borrow'">
      <table class="management-table mt-4 table w-100">
        <thead>
          <tr>
            <th class="management-table__header">Mã Phòng</th>
            <th class="management-table__header">Tên Phòng</th>
            <th class="management-table__header">Mã Độc Giả</th>
            <th class="management-table__header">Họ Tên</th>
            <th class="management-table__header">Ngày Mượn</th>
            <th class="management-table__header">Thời gian</th>
            <th class="management-table__header">Trạng Thái</th>
            <th class="management-table__header">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in paginatedBorrowList"
            :key="item.id"
            @click="handleBorrowRowClick(item)"
          >
            <td class="management-table__content">
              {{ item.PhongHoc?.MaPhong }}
            </td>
            <td
              class="management-table__content management-table__content-ellipsis"
            >
              {{ item.PhongHoc?.TenPhong }}
            </td>
            <td class="management-table__content">
              {{ item.DocGia?.MaDocGia }}
            </td>
            <td
              class="management-table__content management-table__content-ellipsis"
            >
              {{ item.DocGia?.HoLot }} {{ item.DocGia?.Ten }}
            </td>
            <td class="management-table__content">
              {{ formatDate(item.NgaySuDung) }}
            </td>
            <td class="management-table__content">
              {{ item.GioBatDau }} - {{ item.GioKetThuc }}
            </td>
            <td class="management-table__content">
              <div
                class="status-badge"
                :class="{
                  'status-badge--pending': item.TrangThai === 'pending',
                  'status-badge--approved': item.TrangThai === 'approved',
                  'status-badge--denied': item.TrangThai === 'denied',
                  'status-badge--checked-in': item.TrangThai === 'checked_in',
                  'status-badge--no-show': item.TrangThai === 'no_show',
                }"
              >
                {{ formatStatus(item.TrangThai) }}
              </div>
            </td>
            <td class="management-table__content">
              <div v-if="item.TrangThai === 'pending'">
                <button
                  class="action-btn action-btn--approve"
                  @click.stop="approveBorrow(item._id)"
                >
                  Duyệt
                </button>
                <button
                  class="action-btn action-btn--deny"
                  @click.stop="denyBorrow(item._id)"
                >
                  Từ chối
                </button>
              </div>
              <div v-else-if="item.TrangThai === 'approved'">
                <button
                  class="action-btn action-btn--checkin"
                  :class="{ 'action-btn--disabled': !canCheckIn(item) }"
                  :disabled="!canCheckIn(item)"
                  @click.stop="canCheckIn(item) && checkInRoom(item._id)"
                >
                  Đã nhận phòng
                </button>
              </div>
              <div v-else class="text-muted">Đã xử lý</div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination for Borrow List -->
      <div class="management-pagination" v-if="paginatedBorrowList.length > 0">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPageBorrow === 1 }">
            <a class="page-link" href="#" @click.prevent="goToPageBorrow(1)"
              >«</a
            >
          </li>
          <li class="page-item" :class="{ disabled: currentPageBorrow === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPageBorrow(currentPageBorrow - 1)"
              >‹</a
            >
          </li>
          <li class="page-item active">
            <a class="page-link" href="#" @click.prevent>{{
              currentPageBorrow
            }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPageBorrow === totalPagesBorrow }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPageBorrow(currentPageBorrow + 1)"
              >›</a
            >
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPageBorrow === totalPagesBorrow }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPageBorrow(totalPagesBorrow)"
              >»</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- TAB 3: Quy Định -->
    <div v-if="activeTab === 'rules'" class="penalty-rules">
      <div v-if="roomRules.bookingLeadTime !== undefined">
        <h2 class="penalty-title">⚙️ Quy định đặt phòng học</h2>

        <!-- Quy định cho SINH VIÊN -->
        <div class="rule-section rule-section--student">
          <div class="rule-section-header">
            <h3 class="rule-section-title">👨‍🎓 Quy định cho Sinh Viên</h3>
          </div>

          <div class="rule-grid">
            <div class="rule-card">
              <div class="rule-card-icon">📅</div>
              <div class="rule-card-content">
                <label class="rule-card-label"
                  >Thời gian đặt trước tối thiểu</label
                >
                <div class="rule-card-value" v-if="!isEditingRoomRules">
                  {{ roomRules.bookingLeadTime }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="roomRules.bookingLeadTime"
                  class="rule-card-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Quy định cho GIẢNG VIÊN -->
        <div class="rule-section rule-section--lecturer">
          <div class="rule-section-header">
            <h3 class="rule-section-title">👨‍🏫 Quy định cho Giảng Viên</h3>
            <span class="rule-section-badge">Ưu đãi đặc biệt</span>
          </div>

          <div class="rule-grid">
            <div class="rule-card">
              <div class="rule-card-icon">📅</div>
              <div class="rule-card-content">
                <label class="rule-card-label"
                  >Thời gian đặt trước tối thiểu</label
                >
                <div class="rule-card-value" v-if="!isEditingRoomRules">
                  {{ roomRules.bookingLeadTimeLecturer }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="roomRules.bookingLeadTimeLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Nút Hành Động -->
        <div class="rule-actions">
          <button
            v-if="!isEditingRoomRules"
            class="btn-edit"
            @click="isEditingRoomRules = true"
          >
            ✏️ Chỉnh sửa quy định
          </button>
          <div v-else class="rule-actions-group">
            <button class="btn-save" @click="saveRoomRules">
              💾 Lưu thay đổi
            </button>
            <button class="btn-cancel" @click="cancelEditRoomRules">
              ❌ Hủy bỏ
            </button>
          </div>
        </div>
      </div>

      <div v-else class="loading-state">
        <p>Đang tải quy định...</p>
      </div>
    </div>

    <!-- Modal Chi Tiết Mượn Phòng -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showBorrowModal"
        tabindex="-1"
        @click="showBorrowModal = false"
      >
        <div class="modal-dialog modal-dialog-book-room" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi Tiết Mượn Phòng</h5>
              <button
                type="button"
                class="btn-close"
                @click="showBorrowModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body__info-full">
                <p>
                  <strong>Mã phòng:</strong>
                  {{ selectedBorrowItem?.PhongHoc?.MaPhong }}
                </p>
                <p>
                  <strong>Tên phòng:</strong>
                  {{ selectedBorrowItem?.PhongHoc?.TenPhong }}
                </p>
                <p>
                  <strong>Loại phòng:</strong>
                  {{ selectedBorrowItem?.PhongHoc?.LoaiPhong }}
                </p>

                <!-- THÊM phần này để hiển thị người đại diện cho phòng nhóm -->
                <p v-if="selectedBorrowItem?.PhongHoc?.LoaiPhong === 'Nhóm'">
                  <strong>Người đại diện:</strong>
                  {{ selectedBorrowItem?.DocGia?.HoLot }}
                  {{ selectedBorrowItem?.DocGia?.Ten }}
                  ({{ selectedBorrowItem?.DocGia?.MaDocGia }})
                </p>

                <!-- Nếu không phải phòng nhóm thì hiển thị như cũ -->
                <p v-else>
                  <strong>Họ tên:</strong>
                  {{ selectedBorrowItem?.DocGia?.HoLot }}
                  {{ selectedBorrowItem?.DocGia?.Ten }}
                </p>
                <p v-if="selectedBorrowItem?.PhongHoc?.LoaiPhong !== 'Nhóm'">
                  <strong>Mã sinh viên:</strong>
                  {{ selectedBorrowItem?.DocGia?.MaDocGia }}
                </p>

                <p>
                  <strong>Ngày mượn:</strong>
                  {{ formatDate(selectedBorrowItem?.NgaySuDung) }}
                </p>
                <p>
                  <strong>Giờ bắt đầu:</strong>
                  {{ selectedBorrowItem?.GioBatDau }}
                </p>
                <p>
                  <strong>Giờ kết thúc:</strong>
                  {{ selectedBorrowItem?.GioKetThuc }}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  {{ formatStatus(selectedBorrowItem?.TrangThai) }}
                </p>
                <p>
                  <strong>Ngày yêu cầu:</strong>
                  {{ formatDate(selectedBorrowItem?.NgayDat) }}
                </p>

                <!-- THÊM phần danh sách thành viên cho phòng nhóm -->
                <div
                  v-if="
                    selectedBorrowItem?.PhongHoc?.LoaiPhong === 'Nhóm' &&
                    selectedBorrowItem?.ThanhVien?.length > 0
                  "
                  class="members-section"
                >
                  <p>
                    <strong
                      >Thành viên ({{
                        selectedBorrowItem.ThanhVien.length
                      }}):</strong
                    >
                  </p>
                  <div class="members-list">
                    <div
                      v-for="(member, index) in selectedBorrowItem.ThanhVien"
                      :key="index"
                      class="member-item"
                    >
                      <div class="member-info">
                        <span class="member-number">{{ index + 1 }}.</span>
                        <span class="member-name">
                          {{ member.DocGia?.HoLot }} {{ member.DocGia?.Ten }}
                        </span>
                        <span class="member-code"
                          >({{ member.DocGia?.MaDocGia }})</span
                        >
                      </div>
                      <span
                        class="member-status"
                        :class="{
                          'status-invited': member.TrangThai === 'invited',
                          'status-accepted': member.TrangThai === 'accepted',
                          'status-declined': member.TrangThai === 'declined',
                        }"
                      >
                        {{ formatMemberStatus(member.TrangThai) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  v-if="
                    selectedBorrowItem?.ChoNgoiDaChon &&
                    selectedBorrowItem.ChoNgoiDaChon.length > 0 &&
                    selectedBorrowItem?.PhongHoc?.ChoNgoi
                  "
                  class="seat-section-admin"
                >
                  <p><strong>Chỗ ngồi đã chọn:</strong></p>

                  <div class="admin-seat-map">
                    <div class="admin-screen">
                      <i class="fas fa-tv"></i> Sơ đồ chỗ ngồi
                    </div>

                    <div
                      class="admin-seats-grid"
                      :style="{
                        gridTemplateColumns: `repeat(${getAdminSeatGridColumns(
                          selectedBorrowItem.PhongHoc.ChoNgoi
                        )}, 1fr)`,
                      }"
                    >
                      <div
                        v-for="seat in getAdminSortedSeats(
                          selectedBorrowItem.PhongHoc.ChoNgoi
                        )"
                        :key="seat.SoCho"
                        class="admin-seat"
                        :class="{
                          'admin-seat--selected':
                            selectedBorrowItem.ChoNgoiDaChon.includes(
                              seat.SoCho
                            ),
                        }"
                      >
                        <div class="admin-seat-icon">
                          <i class="fa-solid fa-couch"></i>
                        </div>
                        <div class="admin-seat-label">
                          {{ seat.TenCho }}
                        </div>
                      </div>
                    </div>

                    <div class="admin-seat-legend">
                      <div class="legend-item">
                        <div class="legend-box legend-box--selected"></div>
                        <span
                          >Đã chọn ({{
                            selectedBorrowItem.ChoNgoiDaChon.length
                          }})</span
                        >
                      </div>
                      <div class="legend-item">
                        <div class="legend-box legend-box--available"></div>
                        <span>Chỗ khác</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Thêm/Sửa Phòng -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showRoomModal"
        tabindex="-1"
        @click="showRoomModal = false"
      >
        <div class="modal-dialog-room modal-dialog--form" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditMode ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới' }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showRoomModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <form class="room-form">
                <div class="form-group">
                  <label>Tên Phòng <span class="required">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="roomForm.TenPhong"
                    placeholder="VD: Phòng học nhóm 1"
                  />
                </div>
                <div class="form-group">
                  <label>Loại Phòng <span class="required">*</span></label>
                  <select class="form-control" v-model="roomForm.LoaiPhong">
                    <option value="">-- Chọn loại phòng --</option>
                    <option value="Nhóm">Nhóm</option>
                    <option value="Cá nhân">Cá nhân</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Sức Chứa <span class="required">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="roomForm.SucChua"
                    placeholder="VD: 10"
                    :disabled="roomForm.LoaiPhong === 'Cá nhân'"
                    min="1"
                  />
                </div>
                <div class="form-group">
                  <label>Vị Trí <span class="required">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="roomFormViTri"
                    placeholder="VD: Tầng 2, khu A"
                  />
                </div>
                <div class="form-group">
                  <label>Tiện Ích</label>
                  <textarea
                    class="form-control"
                    v-model="roomFormTienIch"
                    placeholder="VD: Máy chiếu, bảng trắng, điều hòa..."
                    rows="3"
                  ></textarea>
                </div>
              </form>

              <div
                v-if="
                  isEditMode && roomForm.ChoNgoi && roomForm.ChoNgoi.length > 0
                "
                class="seat-map-preview"
              >
                <h6 class="preview-title">
                  <i class="fas fa-couch"></i> Sơ đồ chỗ ngồi hiện tại
                </h6>

                <div class="admin-seat-map">
                  <div class="admin-screen">
                    <i class="fas fa-tv"></i> Vị trí
                  </div>

                  <div
                    class="admin-seats-grid"
                    :style="{
                      gridTemplateColumns: `repeat(${getAdminSeatGridColumns(
                        roomForm.ChoNgoi
                      )}, 1fr)`,
                    }"
                  >
                    <div
                      v-for="seat in getAdminSortedSeats(roomForm.ChoNgoi)"
                      :key="seat.SoCho"
                      class="admin-seat"
                    >
                      <div class="admin-seat-icon">
                        <i class="fa-solid fa-couch"></i>
                      </div>
                      <div class="admin-seat-label">
                        {{ seat.TenCho }}
                      </div>
                    </div>
                  </div>
                </div>

                <p class="seat-info">
                  <i class="fas fa-info-circle"></i>
                  Sơ đồ chỗ ngồi sẽ được tự động tạo lại khi bạn thay đổi sức
                  chứa
                </p>
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="action-btn action-btn--cancel"
                @click="showRoomModal = false"
              >
                Hủy
              </button>
              <button
                class="action-btn action-btn--save"
                @click="isEditMode ? updateRoom() : addRoom()"
              >
                {{ isEditMode ? 'Cập Nhật' : 'Thêm Mới' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chi Tiết Phòng -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showRoomDetailModal"
        tabindex="-1"
        @click="showRoomDetailModal = false"
      >
        <div class="modal-dialog-room" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-door-open"></i> Chi Tiết Phòng
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showRoomDetailModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="room-detail">
                <!-- Thông tin cơ bản -->
                <div class="detail-section">
                  <h6 class="section-title">
                    <i class="fas fa-info-circle"></i> Thông Tin Cơ Bản
                  </h6>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Mã phòng:</span>
                      <span class="detail-value">{{
                        selectedRoom?.MaPhong
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Tên phòng:</span>
                      <span class="detail-value">{{
                        selectedRoom?.TenPhong
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Loại phòng:</span>
                      <span
                        class="room-type-badge"
                        :class="{
                          'room-type--group':
                            selectedRoom?.LoaiPhong === 'Nhóm',
                          'room-type--individual':
                            selectedRoom?.LoaiPhong === 'Cá nhân',
                        }"
                      >
                        {{ selectedRoom?.LoaiPhong }}
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Sức chứa:</span>
                      <span class="detail-value"
                        >{{ selectedRoom?.SucChua }} người</span
                      >
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Vị trí:</span>
                      <span class="detail-value">{{
                        selectedRoom?.ViTri?.ViTri || '--'
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Ngày tạo:</span>
                      <span class="detail-value">{{
                        formatDate(selectedRoom?.createdAt)
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Tiện ích:</span>
                      <span class="detail-value">{{
                        selectedRoom?.TienIch
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- THÊM phần này -->
                <div
                  v-if="
                    selectedRoom?.ChoNgoi && selectedRoom.ChoNgoi.length > 0
                  "
                  class="detail-section"
                >
                  <h6 class="section-title">
                    <i class="fas fa-couch"></i> Sơ đồ chỗ ngồi
                  </h6>

                  <div class="admin-seat-map">
                    <div class="admin-screen">
                      <i class="fas fa-tv"></i> Vị trí
                    </div>

                    <div
                      class="admin-seats-grid"
                      :style="{
                        gridTemplateColumns: `repeat(${getAdminSeatGridColumns(
                          selectedRoom.ChoNgoi
                        )}, 1fr)`,
                      }"
                    >
                      <div
                        v-for="seat in getAdminSortedSeats(
                          selectedRoom.ChoNgoi
                        )"
                        :key="seat.SoCho"
                        class="admin-seat"
                      >
                        <div class="admin-seat-icon">
                          <i class="fa-solid fa-couch"></i>
                        </div>
                        <div class="admin-seat-label">
                          {{ seat.TenCho }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="action-btn action-btn--edit"
                @click="editRoomFromDetail"
              >
                <i class="fas fa-edit"></i> Chỉnh Sửa
              </button>
              <button
                class="action-btn action-btn--close"
                @click="showRoomDetailModal = false"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { roomService } from '../services/room/room.service';
import { notificationService } from '../services/notification/notification.service';

export default {
  name: 'ManagementStudy',
  data() {
    return {
      // Tab control
      activeTab: this.$route.query.tab || 'manage',

      // Dữ liệu giả cho danh sách mượn phòng
      borrowList: [],

      // Dữ liệu giả cho danh sách phòng
      roomList: [],

      // Pagination
      currentPageBorrow: 1,
      currentPageRoom: 1,
      pageSize: 5,

      // Search & Filter
      searchKeyword: '',
      selectedDate: '',
      selectedStatus: 'all',

      // Modal
      showBorrowModal: false,
      selectedBorrowItem: null,

      showRoomModal: false,
      isEditMode: false,
      roomForm: {
        MaPhong: '',
        TenPhong: '',
        LoaiPhong: '',
        SucChua: null,
        ViTri: '',
        TienIch: '',
      },

      showRoomDetailModal: false,
      selectedRoom: null,

      roomRules: {},
      isEditingRoomRules: false,
      originalRoomRules: null,
    };
  },

  async mounted() {
    try {
      const res = await roomService.getAllRoom();
      this.roomList = res;
    } catch (err) {
      console.error('Lỗi tải danh sách phòng:', err);
    }

    try {
      const borrowRes = await roomService.getAllBookRoomAdmin();
      this.borrowList = borrowRes;
    } catch (err) {
      console.error('Lỗi tải danh sách mượn phòng:', err);
    }

    this.fetchRoomRules();
  },

  computed: {
    filteredBorrowList() {
      let filtered = this.borrowList.filter((item) => {
        if (
          item.TrangThai === 'canceled' ||
          item.TrangThai === 'waiting_members'
        )
          return false;

        const keyword = this.searchKeyword.toLowerCase().trim();
        const status = this.selectedStatus;
        const selectedDate = this.selectedDate;

        // SỬA DÒNG NÀY - so sánh đúng với giá trị tiếng Anh
        if (status !== 'all' && item.TrangThai !== status) return false;

        if (keyword) {
          const fullName = `${item.DocGia?.HoLot || ''} ${
            item.DocGia?.Ten || ''
          }`.toLowerCase();
          const studentCode = (item.DocGia?.MaDocGia || '').toLowerCase();
          const roomName = (item.PhongHoc?.TenPhong || '').toLowerCase();

          if (
            !fullName.includes(keyword) &&
            !studentCode.includes(keyword) &&
            !roomName.includes(keyword)
          )
            return false;
        }

        if (selectedDate) {
          const borrowDate = new Date(item.NgaySuDung);
          const formattedDate = this.formatDateToYMD(borrowDate);
          if (formattedDate !== selectedDate) return false;
        }

        return true;
      });

      // Sắp xếp: pending lên đầu, theo NgaySuDung sớm nhất
      filtered.sort((a, b) => {
        // Định nghĩa thứ tự ưu tiên
        const priority = {
          pending: 1,
          approved: 2,
          checked_in: 3,
          no_show: 4,
          denied: 5,
        };

        const priorityA = priority[a.TrangThai] || 999;
        const priorityB = priority[b.TrangThai] || 999;

        // So sánh theo ưu tiên trước
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Nếu cùng ưu tiên thì sắp xếp theo ngày
        const dateA = new Date(a.NgaySuDung);
        const dateB = new Date(b.NgaySuDung);
        return dateA - dateB;
      });

      return filtered;
    },

    paginatedBorrowList() {
      const start = (this.currentPageBorrow - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredBorrowList.slice(start, end);
    },

    totalPagesBorrow() {
      return Math.ceil(this.filteredBorrowList.length / this.pageSize);
    },

    filteredRoomList() {
      return this.roomList.filter((room) => {
        const keyword = this.searchKeyword.toLowerCase().trim();

        if (keyword) {
          const roomCode = room.MaPhong.toLowerCase();
          const roomName = room.TenPhong.toLowerCase();
          const location = room.ViTri?.ViTri?.toLowerCase() || '';

          if (
            !roomCode.includes(keyword) &&
            !roomName.includes(keyword) &&
            !location.includes(keyword)
          )
            return false;
        }

        return true;
      });
    },

    paginatedRoomList() {
      const start = (this.currentPageRoom - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredRoomList.slice(start, end);
    },

    totalPagesRoom() {
      return Math.ceil(this.filteredRoomList.length / this.pageSize);
    },

    roomFormViTri: {
      get() {
        if (typeof this.roomForm.ViTri === 'object' && this.roomForm.ViTri) {
          return this.roomForm.ViTri.ViTri || '';
        }
        return this.roomForm.ViTri || '';
      },
      set(value) {
        this.roomForm.ViTri = value;
      },
    },

    roomFormTienIch: {
      get() {
        return this.roomForm.TienIch || '';
      },
      set(value) {
        this.roomForm.TienIch = value;
      },
    },

    canCheckIn() {
      return (item) => {
        if (item.TrangThai !== 'approved') return false;

        const now = new Date();
        const bookingDate = new Date(item.NgaySuDung);
        const [startHour, startMin] = item.GioBatDau.split(':');

        bookingDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

        return now >= bookingDate;
      };
    },
  },

  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '--';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    formatDateToYMD(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    goToPageBorrow(page) {
      if (page >= 1 && page <= this.totalPagesBorrow) {
        this.currentPageBorrow = page;
      }
    },

    goToPageRoom(page) {
      if (page >= 1 && page <= this.totalPagesRoom) {
        this.currentPageRoom = page;
      }
    },

    handleBorrowRowClick(item) {
      this.selectedBorrowItem = item;
      this.showBorrowModal = true;
    },

    async handleRoomRowClick(room) {
      if (!room.ChoNgoi || room.ChoNgoi.length === 0) {
        try {
          const roomDetail = await roomService.getRoomById({
            roomId: room._id,
          });
          room.ChoNgoi = roomDetail.ChoNgoi || [];
        } catch (error) {
          console.error('Lỗi khi lấy chi tiết phòng:', error);
        }
      }

      this.selectedRoom = room;
      this.showRoomDetailModal = true;
    },

    async approveBorrow(id) {
      try {
        const result = await roomService.approveBooking({ bookingId: id });

        alert('Đã duyệt yêu cầu mượn phòng');

        const borrowRes = await roomService.getAllBookRoomAdmin();
        this.borrowList = borrowRes;
      } catch (error) {
        console.error('Lỗi duyệt booking:', error);
        alert('Duyệt yêu cầu thất bại!');
      }
    },

    async denyBorrow(id) {
      try {
        // Gọi API từ chối booking
        const result = await roomService.denyBooking({ bookingId: id });

        alert('Đã từ chối yêu cầu mượn phòng');
      } catch (error) {
        console.error('Lỗi từ chối booking:', error);
        alert('Từ chối yêu cầu thất bại!');
      }
    },

    openAddRoomModal() {
      this.isEditMode = false;
      this.roomForm = {
        MaPhong: '',
        TenPhong: '',
        LoaiPhong: '',
        SucChua: null,
        ViTri: '',
        TienIch: '',
      };

      this.showRoomModal = true;
    },

    openEditRoomModal(room) {
      this.isEditMode = true;
      this.roomForm = {
        _id: room._id,
        MaPhong: room.MaPhong,
        TenPhong: room.TenPhong,
        LoaiPhong: room.LoaiPhong,
        SucChua: room.SucChua,
        ViTri: { ...room.ViTri },
        TienIch: room.TienIch,
      };

      this.showRoomModal = true;
    },

    resetForm() {
      this.roomForm = {
        TenPhong: '',
        LoaiPhong: '',
        SucChua: '',
        ViTri: '',
        TienIch: '',
      };
    },

    async addRoom() {
      const { TenPhong, LoaiPhong, SucChua } = this.roomForm;
      const ViTri = this.roomFormViTri;

      if (!TenPhong || !LoaiPhong || !SucChua || !ViTri) {
        alert('Vui lòng nhập đầy đủ tất cả các trường bắt buộc.');
        return;
      }

      try {
        const res = await roomService.addRoom({
          TenPhong,
          LoaiPhong,
          SucChua,
          ViTri,
          TienIch: this.roomForm.TienIch,
        });
        if (res) {
          alert('Thêm phòng thành công!');
          this.showRoomModal = false;
          this.resetForm();
          const rooms = await roomService.getAllRoom();
          this.roomList = rooms;
        }
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi thêm phòng.');
      }
    },

    async updateRoom() {
      const { _id, TenPhong, LoaiPhong, SucChua } = this.roomForm;
      const ViTri = this.roomFormViTri;
      const TienIch = this.roomFormTienIch; // THÊM

      // Tìm phòng gốc từ roomList
      const originalRoom = this.roomList.find((room) => room._id === _id);

      if (originalRoom) {
        // Lấy ViTri gốc
        const originalViTri =
          originalRoom.ViTri && typeof originalRoom.ViTri === 'object'
            ? originalRoom.ViTri.ViTri
            : originalRoom.ViTri;

        // SỬA - Thêm kiểm tra TienIch
        const hasChanges =
          originalRoom.TenPhong !== TenPhong ||
          originalRoom.LoaiPhong !== LoaiPhong ||
          Number(originalRoom.SucChua) !== Number(SucChua) ||
          originalViTri !== ViTri ||
          (originalRoom.TienIch || '') !== (TienIch || ''); // THÊM dòng này

        if (!hasChanges) {
          alert('Không có thay đổi nào để cập nhật.');
          this.showRoomModal = false;
          return;
        }
      }

      try {
        const res = await roomService.updateRoom({
          _id,
          TenPhong,
          LoaiPhong,
          SucChua,
          ViTri,
          TienIch, // THÊM
        });
        if (res) {
          alert('Cập nhật phòng thành công!');
          this.showRoomModal = false;
          const rooms = await roomService.getAllRoom();
          this.roomList = rooms;
        }
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi cập nhật phòng.');
      }
    },

    async deleteRoom(id) {
      if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
        try {
          await roomService.deleteRoom(id);
          alert('Xóa phòng thành công');
          const rooms = await roomService.getAllRoom();
          this.roomList = rooms;
        } catch (err) {
          console.error(err);
          alert('Có lỗi xảy ra khi xóa phòng.');
        }
      }
    },

    editRoomFromDetail() {
      this.showRoomDetailModal = false;
      this.openEditRoomModal(this.selectedRoom);
    },

    formatStatus(status) {
      switch (status) {
        case 'pending':
          return 'Chờ duyệt';
        case 'approved':
          return 'Đã duyệt';
        case 'denied':
          return 'Từ chối';
        case 'checked_in':
          return 'Đã nhận phòng';
        case 'no_show':
          return 'Không nhận phòng';
        case 'canceled':
          return 'Đã hủy';
        default:
          return status;
      }
    },

    async saveRoomRules() {
      if (!this.originalRoomRules) {
        alert('Dữ liệu gốc chưa sẵn sàng, vui lòng thử lại!');
        return;
      }

      const isChanged = Object.keys(this.roomRules).some(
        (key) => this.roomRules[key] !== this.originalRoomRules[key]
      );

      if (!isChanged) {
        alert('Không có thay đổi nào được thực hiện.');
        this.isEditingRoomRules = false;
        return;
      }

      try {
        const res = await roomService.updateRoomRule({
          bookingLeadTime: this.roomRules.bookingLeadTime,
          bookingLeadTimeLecturer: this.roomRules.bookingLeadTimeLecturer,
        });

        this.roomRules = {
          bookingLeadTime: res.bookingLeadTime,
          bookingLeadTimeLecturer: res.bookingLeadTimeLecturer,
        };

        this.originalRoomRules = { ...this.roomRules };
        this.isEditingRoomRules = false;
        alert('Cập nhật quy định đặt phòng thành công!');
      } catch (err) {
        console.error('Lỗi khi lưu quy định đặt phòng:', err);
        alert(`Cập nhật thất bại!\n\n${err.message || err}`);
      }
    },

    cancelEditRoomRules() {
      this.roomRules = { ...this.originalRoomRules };
      this.isEditingRoomRules = false;
    },

    async fetchRoomRules() {
      try {
        const response = await roomService.getRoomRule();

        if (response) {
          this.roomRules = {
            bookingLeadTime: response.bookingLeadTime,
            bookingLeadTimeLecturer: response.bookingLeadTimeLecturer,
          };
          this.originalRoomRules = { ...this.roomRules };
        }
      } catch (err) {
        console.error('Lỗi khi lấy quy định đặt phòng:', err);
      }
    },

    async checkInRoom(id) {
      try {
        const result = await roomService.checkInRoom({ bookingId: id });

        const index = this.borrowList.findIndex((item) => item._id === id);
        if (index !== -1) {
          this.borrowList[index].TrangThai = 'checked_in';

          //Tạo thông báo cho độc giả
          const item = this.borrowList[index];
          if (item.DocGia && item.DocGia._id) {
            await notificationService.createNotification({
              DocGia: item.DocGia._id,
              TieuDe: 'Đã nhận phòng học thành công',
              NoiDung: `Bạn đã nhận phòng "${item.PhongHoc?.TenPhong}" thành công.`,
              LoaiThongBao: 'success',
            });
          }
        }

        alert('Đã xác nhận nhận phòng');
      } catch (error) {
        console.error('Lỗi check-in:', error);
        alert('Xác nhận nhận phòng thất bại!');
      }
    },

    formatMemberStatus(status) {
      switch (status) {
        case 'invited':
          return 'Chờ xác nhận';
        case 'accepted':
          return 'Đã chấp nhận';
        case 'declined':
          return 'Đã từ chối';
        default:
          return status;
      }
    },

    getAdminSeatGridColumns(choNgoiList) {
      if (!choNgoiList || choNgoiList.length === 0) return 4;
      const maxCol = Math.max(...choNgoiList.map((seat) => seat.HangNgang));
      return maxCol;
    },

    getAdminSortedSeats(choNgoiList) {
      if (!choNgoiList) return [];
      return [...choNgoiList].sort((a, b) => {
        if (a.HangDoc !== b.HangDoc) {
          return a.HangDoc - b.HangDoc;
        }
        return a.HangNgang - b.HangNgang;
      });
    },

    // ⭐ SỬA method openEditRoomModal():
    openEditRoomModal(room) {
      this.isEditMode = true;
      this.roomForm = {
        _id: room._id,
        MaPhong: room.MaPhong,
        TenPhong: room.TenPhong,
        LoaiPhong: room.LoaiPhong,
        SucChua: room.SucChua,
        ViTri: { ...room.ViTri },
        TienIch: room.TienIch,
        ChoNgoi: room.ChoNgoi || [], // ⭐ THÊM dòng này
      };

      this.showRoomModal = true;
    },

    // ⭐ SỬA method handleBorrowRowClick():
    async handleBorrowRowClick(item) {
      // THÊM - Lấy thông tin đầy đủ của phòng nếu chưa có ChoNgoi
      if (item.PhongHoc && !item.PhongHoc.ChoNgoi) {
        try {
          const roomDetail = await roomService.getRoomById({
            roomId: item.PhongHoc._id,
          });
          item.PhongHoc.ChoNgoi = roomDetail.ChoNgoi || [];
        } catch (error) {
          console.error('Lỗi khi lấy chi tiết phòng:', error);
        }
      }

      this.selectedBorrowItem = item;
      this.showBorrowModal = true;
    },
  },

  watch: {
    searchKeyword() {
      this.currentPageBorrow = 1;
      this.currentPageRoom = 1;
    },
    selectedStatus() {
      this.currentPageBorrow = 1;
    },
    selectedDate() {
      this.currentPageBorrow = 1;
    },
    'roomForm.LoaiPhong'(newValue) {
      if (newValue === 'Cá nhân') {
        this.roomForm.SucChua = 1;
      }
    },
    activeTab(newVal) {
      if (newVal !== 'rules') {
        this.isEditingRoomRules = false;
      }

      // THÊM - Cập nhật URL query
      this.$router
        .push({
          query: {
            ...this.$route.query,
            tab: newVal,
          },
        })
        .catch(() => {});
    },
  },
};
</script>

<style scoped>
.action-btn--checkin:disabled,
.action-btn--disabled {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn--checkin:disabled:hover,
.action-btn--disabled:hover {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  transform: none;
}

.status-badge--checked-in {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.status-badge--no-show {
  background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
  color: #fff;
}

.action-btn--checkin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  min-width: 120px;
}

.action-btn--checkin:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
}

.form-control:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.modal-dialog-book-room {
  width: 80%;
}

/* Tab Navigation */
.borrow-book__tabs {
  display: flex;
  margin: 20px 0;
  border-bottom: 2px solid #e0e0e0;
}

.borrow-book__tab {
  padding: 12px 24px;
  cursor: pointer;
  color: #555;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.borrow-book__tab:hover {
  color: #16a085;
}

.borrow-book__tab.active {
  color: #16a085;
  border-bottom-color: #16a085;
  background-color: #f0f9f7;
}

/* Management Utility */
.management-util {
  display: flex;
  justify-content: space-between;
}

.management-util__search {
  width: 300px;
}

.library-card-management .search-date {
  padding: 10px 15px;
  margin-top: 10px;
  border-radius: 20px;
  border: 1px solid #dedede;
}

.library-card-management .search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.library-card-management .search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.library-card-management .search-input:focus {
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

.library-card-management .search-button-card-library {
  position: absolute;
  right: 5px;
  background: #16a085;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.library-card-management .search-button-card-library:hover {
  background: #1d6b5b;
  transform: scale(1.05);
}

.library-card-management .status-select {
  padding: 10px 15px;
  padding-right: 35px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23555'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 15px;
  min-width: 200px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.status-select:hover {
  border-color: #a1c4d0;
}

.status-select:focus {
  outline: none;
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

/* Room Management Actions */
.room-management-actions {
  margin: 20px 0;
  display: flex;
  justify-content: flex-end;
}

.action-btn--add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.action-btn--add:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Table Styles */
.management-table {
  font-size: 1.6rem;
}

.management-table__header {
  padding: 5px;
  border-bottom: 1px solid #dfe2e6;
}

.management-table__content {
  padding: 5px;
  border-bottom: 1px solid #dfe2e6;
  display: table-cell;
  vertical-align: middle;
}

.management-table tbody tr:hover > td {
  background-color: #f2f2f2;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.management-table__content-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Status Badges */
.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
  min-width: 100px;
  text-align: center;
  font-size: 1.3rem;
}

.status-badge--pending {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe066 100%);
  color: #856404;
}

.status-badge--approved {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: #fff;
}

.status-badge--denied {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
}

/* Room Type Badge */
.room-type-badge {
  padding: 6px 12px;
  border-radius: 15px;
  display: inline-block;
  font-size: 1.3rem;
  font-weight: 500;
  width: 75px;
  text-align: center;
}

.room-type--group {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.room-type--individual {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.text-muted {
  padding: 5px 10px;
  width: 96px;
  background-color: #fff;
  color: #a1a6ab;
  border: 1px solid #a1a6ab;
  border-radius: 7px;
  text-align: center;
  font-size: 1.3rem;
}

/* Action Buttons */
.action-btn {
  padding: 5px 10px;
  min-width: 80px;
  min-height: 30px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.3rem;
}

.action-btn--approve {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: #fff;
}

.action-btn--approve:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
}

.action-btn--deny {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
  margin-left: 8px;
}

.action-btn--deny:hover {
  background: linear-gradient(135deg, #e63950 0%, #e8432b 100%);
}

.action-btn--edit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  min-width: 40px;
  padding: 8px 12px;
}

.action-btn--edit:hover {
  background: linear-gradient(135deg, #3a8cd9 0%, #00d4e0 100%);
}

.action-btn--delete {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
  min-width: 40px;
  padding: 8px 12px;
  margin-left: 8px;
}

.action-btn--delete:hover {
  background: linear-gradient(135deg, #e63950 0%, #e8432b 100%);
}

.action-btn--cancel {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  color: #fff;
  padding: 10px 20px;
}

.action-btn--cancel:hover {
  background: linear-gradient(135deg, #a8aeb2 0%, #7f8c8d 100%);
}

.action-btn--save {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: #fff;
  padding: 10px 20px;
  margin-left: 10px;
}

.action-btn--save:hover {
  background: linear-gradient(135deg, #138d75 0%, #17a589 100%);
}

/* Pagination */
.management-pagination {
  text-align: center;
  margin: 25px 0;
}

.pagination {
  display: inline-flex;
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #ddd;
  font-family: Arial, sans-serif;
}

.page-item {
  margin: 0;
}

.page-link {
  display: block;
  padding: 8px 14px;
  text-decoration: none;
  color: #333;
  background-color: #fff;
  border-right: 1px solid #ddd;
  transition: background-color 0.2s ease;
  font-size: 1.2rem;
}

.page-item:last-child .page-link {
  border-right: none;
}

.page-link:hover {
  background-color: #f2f2f2;
}

.page-item.active .page-link {
  background-color: #007bff;
  color: white;
  cursor: default;
}

.page-item.disabled .page-link {
  color: #aaa;
  background-color: #f9f9f9;
  cursor: not-allowed;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-dialog-room {
  background: white;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
  overflow-y: auto;
  max-height: 90vh;
}

.modal-dialog--form {
  max-width: 500px;
  max-height: 90vh;
}

.modal-content {
  padding: 0;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 15px;
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid #dee2e6;
  text-align: right;
}

.modal-title {
  font-size: 2.5rem;
  font-weight: bold;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.btn-close:hover {
  color: #333;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-body__info-full {
  padding: 20px;
}

.modal-body__info-full p {
  margin-bottom: 12px;
  font-size: 1.6rem;
  line-height: 1.6;
}

.modal-body__info-full strong {
  color: #16a085;
  min-width: 150px;
  display: inline-block;
}

/* Room Form */
.room-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.required {
  color: #ff416c;
}

.form-control {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #16a085;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.2);
}

.form-control::placeholder {
  color: #999;
}

/* Time Slot Styles */
.time-slot-input {
  margin-bottom: 15px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border: 2px dashed #dee2e6;
}

.time-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1.4rem;
  transition: all 0.3s ease;
  background: white;
}

.time-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.time-separator {
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
  padding: 0 5px;
}

.btn-add-timeslot {
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.4rem;
  min-width: 45px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-timeslot:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-add-timeslot:disabled {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-clear-timeslot {
  padding: 10px 16px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.4rem;
  min-width: 45px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear-timeslot:hover:not(:disabled) {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.btn-clear-timeslot:disabled {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Time Slots List */
.time-slots-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.time-slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.time-slot-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-left-color: #764ba2;
}

.time-slot-item:last-child {
  margin-bottom: 0;
}

.time-slot-text {
  font-size: 1.4rem;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-slot-text i {
  color: #667eea;
  font-size: 1.5rem;
}

.time-slot-actions {
  display: flex;
  gap: 8px;
}

.btn-edit-timeslot,
.btn-delete-timeslot {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.btn-edit-timeslot {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-edit-timeslot:hover {
  background: linear-gradient(135deg, #3a8cd9 0%, #00d4e0 100%);
  transform: scale(1.05);
}

.btn-delete-timeslot {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
}

.btn-delete-timeslot:hover {
  background: linear-gradient(135deg, #e63950 0%, #e8432b 100%);
  transform: scale(1.05);
}

/* Empty State */
.empty-timeslots {
  padding: 30px;
  text-align: center;
  color: #6c757d;
  font-size: 1.4rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.empty-timeslots i {
  font-size: 3rem;
  color: #adb5bd;
  display: block;
  margin-bottom: 10px;
}

.empty-timeslots span {
  display: block;
  margin-top: 8px;
}

/* Scrollbar cho danh sách khung giờ */
.time-slots-list::-webkit-scrollbar {
  width: 6px;
}

.time-slots-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.time-slots-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.time-slots-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
}

/* Room Detail Modal */
.room-detail {
  padding: 10px;
}

.detail-section {
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.section-title i {
  color: #667eea;
  font-size: 2rem;
}

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.detail-label {
  font-size: 1.3rem;
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

/* Timeslots Display */
.timeslots-display {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.timeslot-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: white;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.timeslot-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  border-left-color: #764ba2;
}

.timeslot-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-size: 1.6rem;
}

.timeslot-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeslot-time {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.timeslot-duration {
  font-size: 1.2rem;
  color: #6c757d;
  font-style: italic;
}

/* No Timeslots */
.no-timeslots {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-size: 1.4rem;
}

.no-timeslots i {
  font-size: 4rem;
  color: #adb5bd;
  display: block;
  margin-bottom: 15px;
}

/* Action Button Close */
.action-btn--close {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: #fff;
  padding: 10px 20px;
  margin-left: 10px;
}

.action-btn--close:hover {
  background: linear-gradient(135deg, #7f8c8d 0%, #6c7a7b 100%);
}

/* Modal Header Icon */
.modal-title i {
  color: #667eea;
  margin-right: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .timeslots-display {
    grid-template-columns: 1fr;
  }
}

.penalty-rules {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.penalty-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

.rule-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.8rem;
  background: #f9fafc;
}

.rule-heading {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #34495e;
}

.rule-text {
  font-size: 1.6rem;
  line-height: 1.6;
  margin: 0.5rem 0;
  color: #555;
}

.rule-description {
  font-size: 1.4rem;
  color: #7f8c8d;
  font-style: italic;
  margin: 0.5rem 0 0 0;
}

.rule-input {
  max-width: 100px;
  padding: 0.4rem 0.6rem;
  margin: 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
  text-align: center;
  font-size: 1.6rem;
}

.rule-actions {
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.btn-edit,
.btn-save,
.btn-cancel {
  font-size: 1.3rem;
  font-weight: 600;
  padding: 0.6rem 1.4rem;
  border-radius: 0.6rem;
  cursor: pointer;
  border: none;
  margin: 0 0.5rem;
  transition: background 0.3s ease;
}

.btn-edit {
  background: #f39c12;
  color: #fff;
}
.btn-edit:hover {
  background: #d68910;
}

.btn-save {
  background: #3498db;
  color: #fff;
}
.btn-save:hover {
  background: #2980b9;
}

.btn-cancel {
  background: #e74c3c;
  color: #fff;
}
.btn-cancel:hover {
  background: #c0392b;
}

/* Members Section */
.members-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #e9ecef;
}

.members-list {
  margin-top: 10px;
  max-height: 250px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #667eea;
  transition: all 0.3s ease;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
}

.member-number {
  font-weight: 600;
  color: #667eea;
  min-width: 25px;
}

.member-name {
  font-weight: 500;
  color: #333;
}

.member-code {
  color: #6c757d;
  font-size: 1.3rem;
}

.member-status {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 500;
}

.status-invited {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe066 100%);
  color: #856404;
}

.status-accepted {
  background: linear-gradient(135deg, #169e83 0%, #20c997 100%);
  color: #fff;
}

.status-declined {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
}

/* Scrollbar cho danh sách thành viên */
.members-list::-webkit-scrollbar {
  width: 6px;
}

.members-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.members-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

/* Seat Map Preview in Edit Modal */
.seat-map-preview {
  margin-top: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.preview-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-title i {
  color: #667eea;
}

.seat-info {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  font-size: 1.3rem;
  color: #1565c0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Admin Seat Map */
.admin-seat-map {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #dee2e6;
}

.admin-screen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 1.4rem;
}

.admin-screen i {
  margin-right: 8px;
}

/* Admin Seats Grid */
.admin-seats-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 15px;
  max-height: 350px;
  overflow-y: auto;
  padding: 10px;
}

.admin-seat {
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 8px;
  border: 2px solid #e0e0e0;
  background: #f8f9fa;
  color: #495057;
  transition: all 0.3s ease;
}

.admin-seat-icon {
  font-size: 1.8em;
  margin-bottom: 4px;
}

.admin-seat-label {
  font-size: 0.85em;
  font-weight: 600;
}

/* Selected seat in admin view */
.admin-seat--selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: scale(1.05);
}

/* Admin Legend */
.admin-seat-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 12px;
  border-top: 2px dashed #dee2e6;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
}

.legend-box {
  width: 25px;
  height: 25px;
  border-radius: 5px;
  border: 2px solid;
}

.legend-box--selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #5568d3;
}

.legend-box--available {
  background: #f8f9fa;
  border-color: #e0e0e0;
}

/* Seat section in borrow detail modal */
.seat-section-admin {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #e9ecef;
}

.seat-section-admin > p:first-child {
  margin-bottom: 15px;
}

/* Scrollbar */
.admin-seats-grid::-webkit-scrollbar {
  width: 6px;
}

.admin-seats-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.admin-seats-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-seats-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
  }

  .admin-seat {
    width: 60px;
    height: 60px;
  }

  .admin-seat-icon {
    font-size: 1.5em;
  }

  .admin-seat-label {
    font-size: 0.75em;
  }
}

.penalty-rules {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.penalty-title {
  font-size: 3.2rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #2c3e50;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.rule-section {
  background: #fff;
  border-radius: 1.2rem;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rule-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.rule-section--student {
  border-left: 5px solid #3498db;
}

.rule-section--lecturer {
  border-left: 5px solid #f39c12;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.rule-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.rule-section-title {
  font-size: 2.4rem;
  font-weight: 600;
  color: #34495e;
  margin: 0;
}

.rule-section-badge {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: #fff;
  padding: 0.6rem 1.5rem;
  border-radius: 2rem;
  font-size: 1.3rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(243, 156, 18, 0.3);
}

.rule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.rule-card {
  background: #f8f9fa;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.rule-card:hover {
  background: #fff;
  border-color: #3498db;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
}

.rule-card-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.rule-card-content {
  flex: 1;
}

.rule-card-label {
  display: block;
  font-size: 1.4rem;
  color: #7f8c8d;
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.rule-card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.rule-card-input {
  width: 100%;
  padding: 0.8rem 1.2rem;
  font-size: 1.8rem;
  font-weight: 600;
  border: 2px solid #3498db;
  border-radius: 0.6rem;
  outline: none;
  transition: all 0.3s ease;
}

.rule-card-input:focus {
  border-color: #2980b9;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.rule-actions {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #ecf0f1;
}

.rule-actions-group {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.btn-edit,
.btn-save,
.btn-cancel {
  font-size: 1.6rem;
  font-weight: 600;
  padding: 1.2rem 3rem;
  border-radius: 0.8rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-edit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: #fff;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.3);
}

.btn-save {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: #fff;
}

.btn-save:hover {
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.btn-cancel {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: #fff;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
}
</style>
