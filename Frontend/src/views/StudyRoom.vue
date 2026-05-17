<template>
  <Header />
  <div class="study-room">
    <main class="study-room__main">
      <!-- Sidebar -->
      <aside class="study-room__filters">
        <h4>Bộ lọc & tìm nhanh</h4>

        <!-- Toggle button chỉ hiện trên mobile/tablet -->
        <button
          class="study-room__filter-toggle"
          @click="showFilters = !showFilters"
        >
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-filter'"></i>
          {{ showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc' }}
        </button>

        <div class="study-room__filters-body" :class="{ 'is-open': showFilters }">
          <label>Loại phòng</label>
          <select v-model="filters.loaiPhong">
            <option value="all">Tất cả</option>
            <option value="Nhóm">Nhóm</option>
            <option value="Cá nhân">Cá nhân</option>
          </select>

          <label>Trạng thái đặt phòng</label>
          <select v-model="filters.bookingStatus">
            <option value="all">Tất cả</option>
            <option value="booked">Đã đặt</option>
            <option value="available">Chưa đặt</option>
          </select>

          <label>Số người tối thiểu</label>
          <input
            type="number"
            min="1"
            placeholder="VD: 1"
            v-model="filters.sucChua"
          />

          <label>Ngày sử dụng</label>
          <input type="date" v-model="filters.ngaySuDung" />

          <label>Từ khóa</label>
          <input
            type="text"
            placeholder="Tên phòng, mã phòng..."
            v-model="filters.keyword"
          />

          <div class="study-room__filter-actions">
            <button
              class="study-room__btn study-room__btn--primary"
              @click="applyFilters"
            >
              Áp dụng
            </button>
            <button
              class="study-room__btn study-room__btn--secondary"
              @click="clearFilters"
            >
              Xóa
            </button>
          </div>
        </div>
      </aside>

      <!-- List -->
      <section class="study-room__list">
        <!-- Tab Navigation -->
        <div class="study-room__tabs">
          <div
            class="study-room__tab"
            :class="{ active: activeTab === 'booking' }"
            @click="changeTab('booking')"
          >
            <i class="fas fa-calendar-plus"></i> Đặt Phòng
          </div>

          <div
            class="study-room__tab"
            :class="{ active: activeTab === 'mySchedule' }"
            @click="changeTab('mySchedule')"
          >
            <i class="fas fa-calendar-check"></i> Lịch Của Bạn
          </div>

          <div
            class="study-room__tab"
            :class="{ active: activeTab === 'invitations' }"
            @click="changeTab('invitations')"
          >
            <i class="fas fa-envelope"></i> Lời Mời
            <span
              v-if="
                invitations.filter((i) => i.TrangThai === 'invited').length > 0
              "
              style="
                background: #ef4444;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                margin-left: 5px;
                font-size: 1.2rem;
              "
            >
              {{ invitations.filter((i) => i.TrangThai === 'invited').length }}
            </span>
          </div>
        </div>

        <!-- TAB 1: Đặt Phòng -->
        <div v-if="activeTab === 'booking'">
          <div class="study-room__list-header">
            <div>
              <label for="sort-by">Sắp xếp:</label>
              <select id="sort-by" v-model="sortBy">
                <option value="recommended">Gợi ý</option>
                <option value="capacity_desc">Sức chứa ↓</option>
                <option value="capacity_asc">Sức chứa ↑</option>
              </select>
            </div>
          </div>

          <table class="study-room__table study-room__table-book-room">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên phòng</th>
                <th>Loại</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in paginatedRooms" :key="room.id">
                <td data-label="Mã">{{ room.MaPhong }}</td>
                <td data-label="Tên phòng">{{ room.TenPhong }}</td>
                <td data-label="Loại">
                  <span
                    class="study-room__type-badge"
                    :class="{
                      'study-room__type-badge--group':
                        room.LoaiPhong === 'Nhóm',
                      'study-room__type-badge--individual':
                        room.LoaiPhong === 'Cá nhân',
                    }"
                  >
                    {{ room.LoaiPhong }}
                  </span>
                </td>
                <td data-label="Sức chứa">{{ room.SucChua }} người</td>
                <td data-label="Trạng thái">
                  <span
                    class="study-room__status"
                    :class="{
                      'study-room__status--free':
                        room.TrangThai === 'Còn trống',
                      'study-room__status--busy': room.TrangThai === 'Đã đặt',
                    }"
                  >
                    {{ room.TrangThai }}
                  </span>
                </td>
                <td class="study-room__td--actions">
                  <button
                    class="study-room__btn study-room__btn--small study-room__btn--view"
                    @click="viewRoomDetail(room)"
                  >
                    <i class="fas fa-eye"></i> Xem
                  </button>
                  <button
                    v-if="!hasActiveBooking(room.MaPhong)"
                    class="study-room__btn study-room__btn--small study-room__btn--primary"
                    @click="openBookingModal(room)"
                  >
                    <i class="fas fa-calendar-plus"></i> Đặt phòng
                  </button>
                  <button
                    v-else
                    class="study-room__btn study-room__btn--small study-room__btn--warning"
                    disabled
                  >
                    <i class="fas fa-check-circle"></i> Đã đặt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="study-room__pagination">
            <button
              class="study-room__btn study-room__btn--secondary"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              « Trước
            </button>
            <span>Trang {{ currentPage }} / {{ totalPages }}</span>
            <button
              class="study-room__btn study-room__btn--secondary"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Sau »
            </button>
          </div>
        </div>

        <!-- TAB 2: Lịch Của Bạn -->
        <div v-if="activeTab === 'mySchedule'">
          <div class="study-room__schedule-filters">
            <select v-model="scheduleFilter">
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="denied">Từ chối</option>
              <option value="canceled">Đã hủy</option>
              <option value="checked_in">Đã nhận phòng</option>
              <option value="no_show">Không nhận phòng</option>
            </select>
          </div>

          <table class="study-room__table study-room__table-my-schedule">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên phòng</th>
                <th>Ngày sử dụng</th>
                <th>Khung giờ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in paginatedSchedule" :key="booking.id">
                <td data-label="Mã">{{ booking.MaPhong }}</td>
                <td data-label="Tên phòng">{{ booking.TenPhong }}</td>
                <td data-label="Ngày sử dụng">{{ formatDate(booking.NgaySuDung) }}</td>
                <td data-label="Khung giờ">{{ booking.GioBatDau }} - {{ booking.GioKetThuc }}</td>
                <td data-label="Trạng thái">
                  <span
                    class="study-room__booking-status"
                    :class="{
                      'study-room__booking-status--pending':
                        booking.TrangThai === 'pending',
                      'study-room__booking-status--approved':
                        booking.TrangThai === 'approved',
                      'study-room__booking-status--denied':
                        booking.TrangThai === 'denied',
                      'study-room__booking-status--canceled':
                        booking.TrangThai === 'canceled',
                      'study-room__booking-status--no-show':
                        booking.TrangThai === 'no_show',
                      'study-room__booking-status--checked-in':
                        booking.TrangThai === 'checked_in',
                    }"
                  >
                    {{ getStatusText(booking.TrangThai) }}
                  </span>
                </td>
                <td class="study-room__td--actions">
                  <button
                    class="study-room__btn study-room__btn--small study-room__btn--view"
                    @click="viewBookingDetail(booking)"
                  >
                    <i class="fas fa-eye"></i> Chi tiết
                  </button>
                  <button
                    v-if="booking.TrangThai === 'pending' && booking.isOwner"
                    class="study-room__btn study-room__btn--small study-room__btn--danger"
                    @click="cancelBooking(booking.id)"
                  >
                    <i class="fas fa-times"></i> Hủy
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination cho Schedule -->
          <div class="study-room__pagination">
            <button
              class="study-room__btn study-room__btn--secondary"
              :disabled="scheduleCurrentPage === 1"
              @click="scheduleCurrentPage--"
            >
              « Trước
            </button>
            <span
              >Trang {{ scheduleCurrentPage }} / {{ totalSchedulePages }}</span
            >
            <button
              class="study-room__btn study-room__btn--secondary"
              :disabled="scheduleCurrentPage === totalSchedulePages"
              @click="scheduleCurrentPage++"
            >
              Sau »
            </button>
          </div>
        </div>

        <!-- TAB 3: Lời Mời -->
        <div v-if="activeTab === 'invitations'">
          <table class="study-room__table study-room__table-invitations">
            <thead>
              <tr>
                <th>Mã phòng</th>
                <th>Người mời</th>
                <th>Ngày</th>
                <th>Khung giờ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invite in paginatedInvitations"
                :key="invite.id"
                @click="viewInvitationDetail(invite)"
                style="cursor: pointer"
              >
                <td data-label="Mã phòng">{{ invite.MaPhong }}</td>
                <td data-label="Người mời">{{ invite.NguoiMoi }}</td>
                <td data-label="Ngày">{{ formatDate(invite.NgaySuDung) }}</td>
                <td data-label="Khung giờ">{{ invite.GioBatDau }} - {{ invite.GioKetThuc }}</td>
                <td data-label="Trạng thái">
                  <span
                    class="study-room__booking-status"
                    :class="{
                      'study-room__booking-status--pending':
                        invite.TrangThai === 'invited',
                      'study-room__booking-status--approved':
                        invite.TrangThai === 'accepted',
                      'study-room__booking-status--denied':
                        invite.TrangThai === 'declined',
                    }"
                  >
                    {{
                      invite.TrangThai === 'invited'
                        ? 'Chờ phản hồi'
                        : invite.TrangThai === 'accepted'
                        ? 'Đã chấp nhận'
                        : 'Đã từ chối'
                    }}
                  </span>
                </td>
                <td class="study-room__td--actions" @click.stop>
                  <template v-if="invite.TrangThai === 'invited'">
                    <button
                      class="study-room__btn study-room__btn--small study-room__btn--primary"
                      @click="acceptInvitation(invite.id, invite.bookingId)"
                    >
                      <i class="fas fa-check"></i> Chấp nhận
                    </button>
                    <button
                      class="study-room__btn study-room__btn--small study-room__btn--danger"
                      @click="declineInvitation(invite.id, invite.bookingId)"
                    >
                      <i class="fas fa-times"></i> Từ chối
                    </button>
                  </template>
                  <span v-else style="color: #94a3b8; font-style: italic">
                    Đã phản hồi
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="study-room__pagination">
            <button
              class="study-room__btn study-room__btn--secondary"
              :disabled="currentInvitationPage === 1"
              @click="currentInvitationPage--"
            >
              « Trước
            </button>
            <span
              >Trang {{ currentInvitationPage }} /
              {{ totalInvitationPages }}</span
            >
            <button
              class="study-room__btn study-room__btn--secondary"
              :disabled="currentInvitationPage === totalInvitationPages"
              @click="currentInvitationPage++"
            >
              Sau »
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal Đặt Phòng -->
    <transition name="modal-fade">
      <div
        class="study-room__modal"
        v-if="showBookingModal"
        @click="closeBookingModal"
      >
        <div class="study-room__modal-dialog" @click.stop>
          <div class="study-room__modal-content">
            <div class="study-room__modal-header">
              <h5 class="study-room__modal-title">
                <i class="fas fa-calendar-plus"></i> Đặt Phòng:
                {{ selectedRoom?.TenPhong }}
              </h5>
              <button
                type="button"
                class="study-room__modal-close"
                @click="closeBookingModal"
              >
                &times;
              </button>
            </div>
            <div class="study-room__modal-body">
              <div class="study-room__booking-form">
                <div class="study-room__form-group">
                  <label
                    >Ngày sử dụng
                    <span class="study-room__form-required">*</span></label
                  >
                  <input
                    type="date"
                    class="study-room__form-control"
                    v-model="bookingForm.ngaySuDung"
                    :min="minDate"
                    :max="maxDate"
                  />
                </div>

                <div class="study-room__form-group">
                  <label
                    >Khung giờ
                    <span class="study-room__form-required">*</span></label
                  >
                  <div class="study-room__custom-time-input">
                    <div class="study-room__time-field">
                      <label
                        >Giờ bắt đầu <span style="color: red">*</span></label
                      >
                      <input
                        type="time"
                        class="study-room__form-control"
                        v-model="customTime.gioBatDau"
                        placeholder="VD: 08:00"
                      />
                    </div>

                    <div class="study-room__time-field">
                      <label
                        >Giờ kết thúc <span style="color: red">*</span></label
                      >
                      <input
                        type="time"
                        class="study-room__form-control"
                        v-model="customTime.gioKetThuc"
                        placeholder="VD: 10:00"
                      />
                    </div>
                  </div>

                  <div
                    v-if="
                      customTime.gioBatDau &&
                      customTime.gioKetThuc &&
                      customTime.gioBatDau >= customTime.gioKetThuc
                    "
                    class="study-room__time-error"
                    style="color: red; font-size: 0.9em; margin-top: 5px"
                  >
                    <i class="fas fa-exclamation-circle"></i>
                    Giờ bắt đầu phải nhỏ hơn giờ kết thúc!
                  </div>
                </div>

                <div
                  class="study-room__form-group"
                  v-if="selectedRoom?.LoaiPhong === 'Nhóm'"
                >
                  <label>
                    Thêm thành viên
                    <span class="study-room__form-required">*</span>
                    <span class="study-room__member-count">
                      ({{ memberForm.members.length }}/{{
                        selectedRoom.SucChua - 1
                      }}
                      người)
                    </span>
                  </label>

                  <div class="study-room__add-member">
                    <div style="display: flex; gap: 10px">
                      <input
                        type="text"
                        class="study-room__form-control"
                        placeholder="Nhập Mã Độc Giả..."
                        v-model="memberForm.searchCode"
                        style="flex: 1"
                      />
                      <button
                        type="button"
                        class="study-room__btn study-room__btn--search"
                        @click="searchMemberInfo"
                      >
                        <i class="fas fa-search"></i> Tìm
                      </button>
                    </div>

                    <div
                      class="study-room__member-preview"
                      v-if="memberForm.foundMember"
                    >
                      <div class="study-room__member-preview-info">
                        <i class="fas fa-user-circle"></i>
                        <span
                          >{{ memberForm.foundMember.HoLot }}
                          {{ memberForm.foundMember.Ten }}</span
                        >
                        <span class="study-room__member-code"
                          >({{ memberForm.foundMember.MaDocGia }})</span
                        >
                      </div>
                      <button
                        type="button"
                        class="study-room__btn study-room__btn--primary study-room__btn--small"
                        @click="addMember"
                        :disabled="
                          memberForm.members.length >= selectedRoom.SucChua - 1
                        "
                      >
                        <i class="fas fa-plus"></i> Thêm
                      </button>
                    </div>

                    <div
                      class="study-room__member-error"
                      v-if="memberForm.searchError"
                    >
                      <i class="fas fa-exclamation-circle"></i>
                      {{ memberForm.searchError }}
                    </div>
                  </div>

                  <div class="study-room__added-members">
                    <div class="study-room__member-label">
                      Danh sách thành viên:
                    </div>
                    <div
                      class="study-room__member-list"
                      v-if="memberForm.members.length > 0"
                    >
                      <div
                        v-for="(member, index) in memberForm.members"
                        :key="member._id"
                        class="study-room__member-item"
                      >
                        <div class="study-room__member-info">
                          <i class="fas fa-user"></i>
                          <span>{{ member.HoLot }} {{ member.Ten }}</span>
                          <span class="study-room__member-code"
                            >({{ member.MaDocGia }})</span
                          >
                        </div>
                        <button
                          type="button"
                          class="study-room__btn-remove"
                          @click="removeMember(index)"
                          title="Xóa thành viên"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    <div class="study-room__empty-members" v-else>
                      <i class="fas fa-users"></i>
                      Chưa có thành viên nào
                    </div>
                  </div>
                </div>

                <!-- Chọn chỗ ngồi -->
                <div class="study-room__form-group">
                  <label>
                    Chọn chỗ ngồi
                    <span class="study-room__form-required">*</span>
                    <span class="study-room__seat-count" v-if="selectedRoom">
                      (Đã chọn: {{ seatSelection.selectedSeats.length }}/{{
                        selectedRoom.LoaiPhong === 'Nhóm'
                          ? 1 + memberForm.members.length
                          : 1
                      }})
                    </span>
                  </label>

                  <div
                    v-if="seatSelection.allSeats.length === 0"
                    class="study-room__seat-notice"
                  >
                    <i class="fas fa-info-circle"></i>
                    Chọn ngày và khung giờ để xem chỗ trống
                  </div>

                  <div
                    v-if="seatSelection.loading"
                    class="study-room__seat-loading"
                  >
                    <i class="fas fa-spinner fa-spin"></i> Đang tải sơ đồ chỗ
                    ngồi...
                  </div>

                  <div
                    v-if="seatSelection.error"
                    class="study-room__seat-error"
                  >
                    <i class="fas fa-exclamation-triangle"></i>
                    {{ seatSelection.error }}
                    <button
                      class="study-room__btn study-room__btn--small study-room__btn--secondary"
                      @click="loadAvailableSeats"
                    >
                      Thử lại
                    </button>
                  </div>

                  <div
                    v-if="
                      seatSelection.allSeats.length > 0 &&
                      !seatSelection.loading &&
                      !seatSelection.error
                    "
                    class="study-room__seat-map"
                  >
                    <div class="study-room__screen">
                      <i class="fas fa-tv"></i> Sơ đồ chỗ ngồi
                    </div>

                    <div
                      class="study-room__seats-grid"
                      :style="{
                        gridTemplateColumns: `repeat(${seatGridColumns}, 1fr)`,
                      }"
                    >
                      <div
                        v-for="seat in sortedSeats"
                        :key="seat.SoCho"
                        class="study-room__seat"
                        :class="{
                          'study-room__seat--available':
                            getSeatStatus(seat.SoCho) === 'available',
                          'study-room__seat--selected':
                            getSeatStatus(seat.SoCho) === 'selected',
                          'study-room__seat--booked':
                            getSeatStatus(seat.SoCho) === 'booked',
                        }"
                        @click="toggleSeatSelection(seat.SoCho)"
                        :title="getSeatTooltip(seat)"
                      >
                        <div class="study-room__seat-icon">
                          <i class="fa-solid fa-couch"></i>
                        </div>
                        <div class="study-room__seat-label">
                          {{ seat.TenCho }}
                        </div>
                      </div>
                    </div>

                    <div class="study-room__seat-legend">
                      <div class="study-room__legend-item">
                        <div
                          class="study-room__legend-box study-room__legend-box--available"
                        ></div>
                        <span>Còn trống</span>
                      </div>
                      <div class="study-room__legend-item">
                        <div
                          class="study-room__legend-box study-room__legend-box--selected"
                        ></div>
                        <span>Đã chọn</span>
                      </div>
                      <div class="study-room__legend-item">
                        <div
                          class="study-room__legend-box study-room__legend-box--booked"
                        ></div>
                        <span>Đã đặt</span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="study-room__seat-empty">
                    <i class="fas fa-couch"></i>
                    Phòng này chưa có sơ đồ chỗ ngồi
                  </div>
                </div>

                <div class="study-room__form-group">
                  <div class="study-room__schedule-toggle">
                    <button
                      type="button"
                      class="study-room__btn study-room__btn--secondary"
                      @click="showRoomSchedule = !showRoomSchedule"
                    >
                      <i class="fas fa-calendar-alt"></i>
                      {{
                        showRoomSchedule
                          ? 'Ẩn lịch đã đặt'
                          : 'Xem lịch đã đặt của phòng này'
                      }}
                    </button>
                  </div>

                  <transition name="slide-fade">
                    <div
                      v-if="showRoomSchedule"
                      class="study-room__room-schedule"
                    >
                      <div class="study-room__schedule-header">
                        <h6>Lịch đã đặt - {{ selectedRoom?.TenPhong }}</h6>
                        <div class="study-room__schedule-sort">
                          <select v-model="scheduleSort">
                            <option value="date_desc">Ngày gần nhất</option>
                            <option value="date_asc">Ngày xa nhất</option>
                            <option value="time_asc">Giờ sớm → muộn</option>
                          </select>
                        </div>
                      </div>

                      <div class="study-room__schedule-list">
                        <div
                          v-for="booking in sortedRoomSchedule"
                          :key="booking.id"
                          class="study-room__schedule-item"
                          :class="{
                            'study-room__schedule-item--mine': booking.isMine,
                            'study-room__schedule-item--conflict':
                              checkConflictWithBooking(booking),
                          }"
                        >
                          <div class="study-room__schedule-date">
                            <i class="fas fa-calendar"></i>
                            {{ formatDate(booking.NgaySuDung) }}
                          </div>
                          <div class="study-room__schedule-time">
                            <i class="fas fa-clock"></i>
                            {{ booking.GioBatDau }} - {{ booking.GioKetThuc }}
                          </div>

                          <div
                            class="study-room__schedule-seats"
                            v-if="booking.ChoNgoiDaChon.length > 0"
                          >
                            <i class="fas fa-couch"></i>
                            Chỗ:
                            <span
                              v-for="seat in booking.ChoNgoiDaChon"
                              :key="seat"
                            >
                              {{ getSeatName(selectedRoom.ChoNgoi, seat) }}
                            </span>
                          </div>
                        </div>

                        <div
                          v-if="sortedRoomSchedule.length === 0"
                          class="study-room__schedule-empty"
                        >
                          <i class="fas fa-inbox"></i>
                          Chưa có lịch đặt nào cho phòng này
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <div class="study-room__booking-info">
                  <div class="study-room__info-row">
                    <strong>Mã phòng:</strong> {{ selectedRoom?.MaPhong }}
                  </div>
                  <div class="study-room__info-row">
                    <strong>Loại phòng:</strong> {{ selectedRoom?.LoaiPhong }}
                  </div>
                  <div class="study-room__info-row">
                    <strong>Sức chứa:</strong> {{ selectedRoom?.SucChua }} người
                  </div>
                  <div class="study-room__info-row">
                    <strong>Vị trí:</strong> {{ selectedRoom?.ViTri }}
                  </div>
                  <div
                    class="study-room__info-row"
                    v-if="selectedRoom?.TienIch"
                  >
                    <strong>Tiện ích:</strong> {{ selectedRoom?.TienIch }}
                  </div>
                </div>
              </div>
            </div>
            <div class="study-room__modal-footer">
              <button
                class="study-room__btn study-room__btn--secondary"
                @click="closeBookingModal"
              >
                Hủy
              </button>
              <button
                class="study-room__btn study-room__btn--primary"
                @click="submitBooking"
                :disabled="
                  !bookingForm.ngaySuDung ||
                  !customTime.gioBatDau ||
                  !customTime.gioKetThuc
                "
              >
                <i class="fas fa-check"></i> Xác nhận đặt phòng
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chi Tiết Phòng -->
    <transition name="modal-fade">
      <div
        class="study-room__modal"
        v-if="showDetailModal"
        @click="closeDetailModal"
      >
        <div class="study-room__modal-dialog" @click.stop>
          <div class="study-room__modal-content">
            <div class="study-room__modal-header">
              <h5 class="study-room__modal-title">
                <i class="fas fa-info-circle"></i> Chi Tiết Phòng
              </h5>
              <button
                type="button"
                class="study-room__modal-close"
                @click="closeDetailModal"
              >
                &times;
              </button>
            </div>
            <div class="study-room__modal-body">
              <div class="study-room__room-detail">
                <div class="study-room__detail-row">
                  <strong>Mã phòng:</strong> {{ viewingRoom?.MaPhong }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Tên phòng:</strong> {{ viewingRoom?.TenPhong }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Loại phòng:</strong> {{ viewingRoom?.LoaiPhong }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Sức chứa:</strong> {{ viewingRoom?.SucChua }} người
                </div>
                <div class="study-room__detail-row">
                  <strong>Vị trí:</strong> {{ viewingRoom?.ViTri }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Tiện ích:</strong> {{ viewingRoom?.TienIch }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Trạng thái:</strong>
                  <span
                    class="study-room__status"
                    :class="{
                      'study-room__status--free':
                        viewingRoom?.TrangThai === 'Còn trống',
                      'study-room__status--busy':
                        viewingRoom?.TrangThai === 'Đã đặt',
                    }"
                  >
                    {{ viewingRoom?.TrangThai }}
                  </span>
                </div>

                <div
                  class="study-room__detail-row"
                  style="
                    margin-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 20px;
                  "
                >
                  <button
                    type="button"
                    class="study-room__btn study-room__btn--secondary"
                    @click="showViewingRoomSchedule = !showViewingRoomSchedule"
                    style="width: 100%; justify-content: center"
                  >
                    <i class="fas fa-calendar-alt"></i>
                    {{
                      showViewingRoomSchedule
                        ? 'Ẩn lịch đã đặt'
                        : 'Xem lịch đã đặt của phòng này'
                    }}
                  </button>
                </div>

                <transition name="slide-fade">
                  <div
                    v-if="showViewingRoomSchedule"
                    class="study-room__room-schedule"
                    style="margin-top: 15px"
                  >
                    <div class="study-room__schedule-header">
                      <h6>Lịch đã đặt - {{ viewingRoom?.TenPhong }}</h6>
                      <div class="study-room__schedule-sort">
                        <select v-model="viewingScheduleSort">
                          <option value="date_desc">Ngày gần nhất</option>
                          <option value="date_asc">Ngày xa nhất</option>
                          <option value="time_asc">Giờ sớm → muộn</option>
                        </select>
                      </div>
                    </div>

                    <div class="study-room__schedule-list">
                      <div
                        v-for="booking in sortedViewingRoomSchedule"
                        :key="booking.id"
                        class="study-room__schedule-item"
                        :class="{
                          'study-room__schedule-item--mine': booking.isMine,
                        }"
                      >
                        <div class="study-room__schedule-date">
                          <i class="fas fa-calendar"></i>
                          {{ formatDate(booking.NgaySuDung) }}
                        </div>
                        <div class="study-room__schedule-time">
                          <i class="fas fa-clock"></i>
                          {{ booking.GioBatDau }} - {{ booking.GioKetThuc }}
                        </div>

                        <div
                          class="study-room__schedule-seats"
                          v-if="
                            booking.ChoNgoiDaChon &&
                            booking.ChoNgoiDaChon.length > 0
                          "
                        >
                          <i class="fas fa-couch"></i>
                          Chỗ:
                          <span
                            v-for="seat in booking.ChoNgoiDaChon"
                            :key="seat"
                          >
                            {{ getSeatName(viewingRoom.ChoNgoi, seat) }}
                          </span>
                        </div>
                      </div>

                      <div
                        v-if="sortedViewingRoomSchedule.length === 0"
                        class="study-room__schedule-empty"
                      >
                        <i class="fas fa-inbox"></i>
                        Chưa có lịch đặt nào cho phòng này
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chi Tiết Booking -->
    <transition name="modal-fade">
      <div
        class="study-room__modal"
        v-if="showBookingDetailModal"
        @click="closeBookingDetailModal"
      >
        <div class="study-room__modal-dialog" @click.stop>
          <div class="study-room__modal-content">
            <div class="study-room__modal-header">
              <h5 class="study-room__modal-title">
                <i class="fas fa-info-circle"></i> Chi Tiết Đặt Phòng
              </h5>
              <button
                type="button"
                class="study-room__modal-close"
                @click="closeBookingDetailModal"
              >
                &times;
              </button>
            </div>
            <div class="study-room__modal-body">
              <div class="study-room__room-detail">
                <div class="study-room__detail-row">
                  <strong>Mã phòng:</strong> {{ viewingBooking?.MaPhong }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Tên phòng:</strong> {{ viewingBooking?.TenPhong }}
                </div>
                <div
                  v-if="
                    viewingBooking?.ThanhVien &&
                    viewingBooking.ThanhVien.length > 0
                  "
                  class="study-room__detail-row"
                >
                  <strong>Người đại diện:</strong>
                  {{ viewingBooking?.NguoiDatPhong }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Ngày sử dụng:</strong>
                  {{ formatDate(viewingBooking?.NgaySuDung) }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Khung giờ:</strong> {{ viewingBooking?.GioBatDau }} -
                  {{ viewingBooking?.GioKetThuc }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Trạng thái:</strong>
                  <span
                    class="study-room__booking-status"
                    :class="{
                      'study-room__booking-status--pending':
                        viewingBooking?.TrangThai === 'pending',
                      'study-room__booking-status--approved':
                        viewingBooking?.TrangThai === 'approved',
                      'study-room__booking-status--denied':
                        viewingBooking?.TrangThai === 'denied',
                      'study-room__booking-status--canceled':
                        viewingBooking?.TrangThai === 'canceled',
                      'study-room__booking-status--no-show':
                        viewingBooking?.TrangThai === 'no_show',
                      'study-room__booking-status--checked-in':
                        viewingBooking?.TrangThai === 'checked_in',
                    }"
                  >
                    {{ getStatusText(viewingBooking?.TrangThai) }}
                  </span>
                </div>
                <div
                  v-if="viewingBooking?.TrangThai === 'approved'"
                  class="study-room__detail-row"
                >
                  <strong>Vị trí:</strong> {{ viewingBooking?.ViTri }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Tiện ích:</strong> {{ viewingBooking?.TienIch }}
                </div>

                <div
                  v-if="
                    viewingBooking?.ThanhVien &&
                    viewingBooking.ThanhVien.length > 0
                  "
                  class="study-room__detail-row"
                >
                  <strong>Danh sách thành viên:</strong>
                  <div
                    class="study-room__member-list-detail"
                    style="margin-top: 10px"
                  >
                    <div
                      v-for="member in viewingBooking.ThanhVien"
                      :key="member._id"
                      class="study-room__member-item-detail"
                      style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background: #f8fafc;
                        border-radius: 6px;
                        margin-bottom: 8px;
                        flex-wrap: wrap;
                        gap: 8px;
                      "
                    >
                      <div style="display: flex; align-items: center; gap: 8px">
                        <i class="fas fa-user" style="color: #64748b"></i>
                        <span>{{ member.HoTen }}</span>
                        <span> ({{ member.MaDocGia }}) </span>
                      </div>
                      <span
                        class="study-room__member-status"
                        :class="{
                          'study-room__member-status--invited':
                            member.TrangThai === 'invited',
                          'study-room__member-status--accepted':
                            member.TrangThai === 'accepted',
                          'study-room__member-status--declined':
                            member.TrangThai === 'declined',
                        }"
                        style="
                          padding: 4px 12px;
                          border-radius: 12px;
                          font-size: 0.85em;
                          font-weight: 500;
                        "
                      >
                        {{ getMemberStatusText(member.TrangThai) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  v-if="
                    viewingBooking?.ChoNgoiDaChon &&
                    viewingBooking.ChoNgoiDaChon.length > 0
                  "
                  class="study-room__detail-row study-room__seat-section"
                >
                  <strong>Chỗ ngồi đã chọn:</strong>
                  <div class="study-room__selected-seats-info">
                    <span
                      v-for="seatNumber in viewingBooking.ChoNgoiDaChon"
                      :key="seatNumber"
                      class="study-room__seat-badge"
                    >
                      {{ getSeatName(viewingBooking.ChoNgoi, seatNumber) }}
                    </span>
                  </div>

                  <div
                    class="study-room__seat-map study-room__seat-map--view-only"
                  >
                    <div class="study-room__screen">
                      <i class="fas fa-tv"></i> Sơ đồ chỗ ngồi
                    </div>

                    <div
                      class="study-room__seats-grid"
                      :style="{
                        gridTemplateColumns: `repeat(${getSeatGridColumns(
                          viewingBooking.ChoNgoi
                        )}, 1fr)`,
                      }"
                    >
                      <div
                        v-for="seat in getSortedSeats(viewingBooking.ChoNgoi)"
                        :key="seat.SoCho"
                        class="study-room__seat"
                        :class="{
                          'study-room__seat--selected':
                            viewingBooking.ChoNgoiDaChon.includes(seat.SoCho),
                          'study-room__seat--available':
                            !viewingBooking.ChoNgoiDaChon.includes(seat.SoCho),
                        }"
                      >
                        <div class="study-room__seat-icon">
                          <i class="fa-solid fa-couch"></i>
                        </div>
                        <div class="study-room__seat-label">
                          {{ seat.TenCho }}
                        </div>
                      </div>
                    </div>

                    <div class="study-room__seat-legend">
                      <div class="study-room__legend-item">
                        <div
                          class="study-room__legend-box study-room__legend-box--selected"
                        ></div>
                        <span>Chỗ đã chọn</span>
                      </div>
                      <div class="study-room__legend-item">
                        <div
                          class="study-room__legend-box study-room__legend-box--available"
                        ></div>
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

    <!-- Modal Chi Tiết Lời Mời -->
    <transition name="modal-fade">
      <div
        class="study-room__modal"
        v-if="showInvitationDetailModal"
        @click="closeInvitationDetailModal"
      >
        <div class="study-room__modal-dialog" @click.stop>
          <div class="study-room__modal-content">
            <div class="study-room__modal-header">
              <h5 class="study-room__modal-title">
                <i class="fas fa-envelope"></i> Chi Tiết Lời Mời
              </h5>
              <button
                type="button"
                class="study-room__modal-close"
                @click="closeInvitationDetailModal"
              >
                &times;
              </button>
            </div>
            <div class="study-room__modal-body">
              <div class="study-room__room-detail">
                <div class="study-room__detail-row">
                  <strong>Mã phòng:</strong> {{ viewingInvitation?.MaPhong }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Tên phòng:</strong> {{ viewingInvitation?.TenPhong }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Người mời:</strong> {{ viewingInvitation?.NguoiMoi }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Ngày sử dụng:</strong>
                  {{ formatDate(viewingInvitation?.NgaySuDung) }}
                </div>
                <div class="study-room__detail-row">
                  <strong>Khung giờ:</strong>
                  {{ viewingInvitation?.GioBatDau }} -
                  {{ viewingInvitation?.GioKetThuc }}
                </div>

                <div
                  v-if="
                    viewingInvitation?.ChoNgoiDaChon &&
                    viewingInvitation.ChoNgoiDaChon.length > 0
                  "
                  class="study-room__detail-row study-room__seat-section"
                >
                  <strong>Chỗ ngồi đã chọn:</strong>
                  <div class="study-room__selected-seats-info">
                    <span
                      v-for="seatNumber in viewingInvitation.ChoNgoiDaChon"
                      :key="seatNumber"
                      class="study-room__seat-badge"
                    >
                      {{
                        getSeatName(
                          viewingInvitation.PhongHoc?.ChoNgoi,
                          seatNumber
                        )
                      }}
                    </span>
                  </div>

                  <div
                    v-if="
                      viewingInvitation.PhongHoc?.ChoNgoi &&
                      viewingInvitation.PhongHoc.ChoNgoi.length > 0
                    "
                    class="study-room__seat-map study-room__seat-map--view-only"
                  >
                    <div class="study-room__screen">
                      <i class="fas fa-tv"></i> Sơ đồ chỗ ngồi
                    </div>

                    <div
                      class="study-room__seats-grid"
                      :style="{
                        gridTemplateColumns: `repeat(${getSeatGridColumns(
                          viewingInvitation.PhongHoc.ChoNgoi
                        )}, 1fr)`,
                      }"
                    >
                      <div
                        v-for="seat in getSortedSeats(
                          viewingInvitation.PhongHoc.ChoNgoi
                        )"
                        :key="seat.SoCho"
                        class="study-room__seat"
                        :class="{
                          'study-room__seat--selected':
                            viewingInvitation.ChoNgoiDaChon.includes(
                              seat.SoCho
                            ),
                          'study-room__seat--available':
                            !viewingInvitation.ChoNgoiDaChon.includes(
                              seat.SoCho
                            ),
                        }"
                      >
                        <div class="study-room__seat-icon">
                          <i class="fa-solid fa-couch"></i>
                        </div>
                        <div class="study-room__seat-label">
                          {{ seat.TenCho }}
                        </div>
                      </div>
                    </div>

                    <div class="study-room__seat-legend">
                      <div class="study-room__legend-item">
                        <div
                          class="study-room__legend-box study-room__legend-box--selected"
                        ></div>
                        <span>Chỗ đã chọn</span>
                      </div>
                      <div class="study-room__legend-item">
                        <div
                          class="study-room__legend-box study-room__legend-box--available"
                        ></div>
                        <span>Chỗ khác</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="study-room__detail-row">
                  <strong>Trạng thái:</strong>
                  <span
                    class="study-room__booking-status"
                    :class="{
                      'study-room__booking-status--pending':
                        viewingInvitation?.TrangThai === 'invited',
                      'study-room__booking-status--approved':
                        viewingInvitation?.TrangThai === 'accepted',
                      'study-room__booking-status--denied':
                        viewingInvitation?.TrangThai === 'declined',
                    }"
                  >
                    {{
                      viewingInvitation?.TrangThai === 'invited'
                        ? 'Chờ phản hồi'
                        : viewingInvitation?.TrangThai === 'accepted'
                        ? 'Đã chấp nhận'
                        : 'Đã từ chối'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <Footer />
</template>

<script>
import '../assets/css/studyRoom.css';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

import { roomService } from '../services/room/room.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'StudyRoom',
  components: {
    Header,
    Footer,
  },

  data() {
    return {
      // Tab control
      activeTab: this.$route.query.tab || 'booking',

      // Responsive filter toggle (mobile)
      showFilters: false,

      // Filters
      filters: {
        loaiPhong: 'all',
        sucChua: null,
        ngaySuDung: '',
        keyword: '',
        bookingStatus: 'all',
      },

      // Sort
      sortBy: 'recommended',

      // Pagination
      currentPage: 1,
      pageSize: 10,

      rooms: [],
      myBookings: [],
      allRooms: [],
      allBookings: [],

      // Schedule filter
      scheduleFilter: 'all',

      // Modal states
      showBookingModal: false,
      showDetailModal: false,
      selectedRoom: null,
      viewingRoom: null,
      showBookingDetailModal: false,
      viewingBooking: null,

      // Booking form
      bookingForm: {
        ngaySuDung: '',
        khungGio: '',
      },

      customTime: {
        gioBatDau: '',
        gioKetThuc: '',
      },

      minDate: '',
      maxDate: '',

      showMemberModal: false,
      memberForm: {
        searchCode: '',
        foundMember: null,
        searchError: '',
        members: [],
      },
      availableMembers: [],

      invitations: [],
      currentInvitationPage: 1,
      invitationPageSize: 5,

      showInvitationDetailModal: false,
      viewingInvitation: null,

      scheduleCurrentPage: 1,
      schedulePageSize: 5,

      seatSelection: {
        allSeats: [],
        bookedSeats: [],
        selectedSeats: [],
        loading: false,
        error: '',
      },

      bookingLeadTime: 0,
      bookingLeadTimeLecturer: 0,

      showRoomSchedule: false,
      scheduleSort: 'date_desc',
      currentRoomBookings: [],

      viewingRoomSchedule: [],
      showViewingRoomSchedule: false,
      viewingScheduleSort: 'date_desc',
    };
  },

  async mounted() {
    await this.loadData();
    await this.loadRoomRule();
    await this.loadInvitations();
  },

  methods: {
    async loadData() {
      try {
        try {
          const roomsData = await roomService.getAllRoom();
          this.allRooms = roomsData;
          this.processRoomsData();
        } catch (err) {
          console.error('Lỗi khi lấy phòng:', err);
          this.allRooms = [];
        }

        let myBookings = [];
        try {
          myBookings = await roomService.getAllBookRoomByUserId({
            userId: userState._id,
          });
        } catch (err) {
          console.error('Lỗi khi lấy booking của mình:', err);
          myBookings = [];
        }

        let memberBookings = [];
        try {
          memberBookings = await roomService.getBookingsAsMember({
            userId: userState._id,
          });
        } catch (err) {
          console.error('Lỗi khi lấy booking là thành viên:', err);
          memberBookings = [];
        }

        this.allBookings = [
          ...myBookings.map((b) => ({ ...b, isOwner: true })),
          ...memberBookings.map((b) => ({ ...b, isOwner: false })),
        ];

        this.processMyBookings();
      } catch (error) {
        console.error('Lỗi không xác định:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại!');
      }
    },

    changeTab(tabName) {
      this.activeTab = tabName;
      this.$router
        .push({
          query: { ...this.$route.query, tab: tabName },
        })
        .catch(() => {});
    },

    async loadRoomRule() {
      try {
        const response = await roomService.getRoomRule();
        if (response) {
          this.bookingLeadTime = response.bookingLeadTime;
          this.bookingLeadTimeLecturer = response.bookingLeadTimeLecturer;
          this.setDateLimit();
        }
      } catch (error) {
        console.error('Lỗi khi tải quy định phòng:', error);
      }
    },

    setDateLimit() {
      const today = new Date();

      const leadTime =
        userState.userType === 'Giảng viên'
          ? this.bookingLeadTimeLecturer
          : this.bookingLeadTime;

      const min = new Date();
      min.setDate(today.getDate() + 1);
      this.minDate = min.toISOString().split('T')[0];

      const max = new Date();
      max.setDate(today.getDate() + leadTime);
      this.maxDate = max.toISOString().split('T')[0];
    },

    applyFilters() {
      this.currentPage = 1;
      console.log('Applying filters:', this.filters);
    },

    clearFilters() {
      this.filters = {
        loaiPhong: 'all',
        sucChua: null,
        ngaySuDung: '',
        keyword: '',
        bookingStatus: 'all',
      };
      this.currentPage = 1;
    },

    async openBookingModal(room) {
      this.selectedRoom = room;
      this.bookingForm = {
        ngaySuDung: '',
        khungGio: '',
      };

      this.customTime = {
        gioBatDau: '',
        gioKetThuc: '',
      };

      this.seatSelection = {
        allSeats: [],
        bookedSeats: [],
        selectedSeats: [],
        loading: false,
        error: '',
      };

      if (room.LoaiPhong === 'Nhóm') {
        this.memberForm.memberIds = [];
        try {
          const members = await roomService.getAvailableMembers();
          this.availableMembers = members;
        } catch (error) {
          console.error('Lỗi khi lấy danh sách thành viên:', error);
        }
      }

      await this.loadAllSeatsForRoom();
      await this.loadRoomSchedule(room.id);
      this.showBookingModal = true;
    },

    closeBookingModal() {
      this.showBookingModal = false;
      this.selectedRoom = null;
    },

    async submitBooking() {
      if (
        !this.bookingForm.ngaySuDung ||
        !this.customTime.gioBatDau ||
        !this.customTime.gioKetThuc
      ) {
        alert('Vui lòng chọn đầy đủ ngày và khung giờ!');
        return;
      }

      if (this.customTime.gioBatDau >= this.customTime.gioKetThuc) {
        alert('Giờ bắt đầu phải nhỏ hơn giờ kết thúc!');
        return;
      }

      const requiredSeats =
        this.selectedRoom.LoaiPhong === 'Nhóm'
          ? 1 + this.memberForm.members.length
          : 1;

      if (this.seatSelection.selectedSeats.length === 0) {
        alert('Vui lòng chọn chỗ ngồi!');
        return;
      }

      if (this.seatSelection.selectedSeats.length !== requiredSeats) {
        alert(`Vui lòng chọn đủ ${requiredSeats} chỗ ngồi!`);
        return;
      }

      if (this.selectedRoom.LoaiPhong === 'Nhóm') {
        const totalMembers = 1 + this.memberForm.members.length;

        if (totalMembers > this.selectedRoom.SucChua) {
          alert(
            `Số lượng người (${totalMembers}) vượt quá sức chứa phòng (${this.selectedRoom.SucChua})!`
          );
          return;
        }
      }

      if (
        this.checkMyScheduleConflict(
          this.bookingForm.ngaySuDung,
          this.customTime.gioBatDau,
          this.customTime.gioKetThuc
        )
      ) {
        alert('Bạn đã có lịch đặt phòng trùng giờ vào ngày này!');
        return;
      }

      try {
        const bookingData = {
          _idDocGia: userState._id,
          PhongHoc: this.selectedRoom.id,
          NgaySuDung: this.bookingForm.ngaySuDung,
          GioBatDau: this.customTime.gioBatDau,
          GioKetThuc: this.customTime.gioKetThuc,
          ThanhVien:
            this.selectedRoom.LoaiPhong === 'Nhóm'
              ? this.memberForm.members.map((m) => m._id)
              : [],
          ChoNgoiDaChon: this.seatSelection.selectedSeats,
        };

        await roomService.createBooking(bookingData);

        let message = 'Đặt phòng thành công!';
        if (
          this.selectedRoom.LoaiPhong === 'Nhóm' &&
          this.memberForm.members.length > 0
        ) {
          message = 'Đã gửi lời mời đến các thành viên! Chờ họ chấp nhận.';
        }

        alert(message);
        await this.loadData();
        this.closeBookingModal();
        this.changeTab('mySchedule');
      } catch (error) {
        console.error('Lỗi khi đặt phòng:', error);

        if (error.response?.data?.includes('Chỗ ngồi')) {
          alert(error.response.data);
        } else if (
          error.response?.data?.includes('Khung giờ này đã có người đặt')
        ) {
          alert('Khung giờ này đã có người đặt, vui lòng chọn giờ khác!');
        } else {
          alert('Đặt phòng thất bại. Vui lòng thử lại!');
        }
      }
    },

    async viewRoomDetail(room) {
      this.viewingRoom = room;
      this.showDetailModal = true;

      await this.loadViewingRoomSchedule(room.id);
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.viewingRoom = null;
    },

    viewBookingDetail(booking) {
      this.viewingBooking = booking;
      this.showBookingDetailModal = true;
    },

    closeBookingDetailModal() {
      this.showBookingDetailModal = false;
      this.viewingBooking = null;
    },

    async cancelBooking(bookingId) {
      if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return;

      try {
        await roomService.cancelBooking({ bookingId });
        alert('Đã hủy đặt phòng thành công!');
        await this.loadData();
      } catch (error) {
        console.error('Lỗi khi hủy đặt phòng:', error);
        alert('Hủy đặt phòng thất bại. Vui lòng thử lại!');
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    getStatusText(status) {
      const statusMap = {
        waiting_members: 'Chờ thành viên',
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        denied: 'Từ chối',
        canceled: 'Đã hủy',
        no_show: 'Không nhận phòng',
        checked_in: 'Đã nhận phòng',
      };
      return statusMap[status] || status;
    },

    processRoomsData() {
      this.rooms = this.allRooms.map((room) => {
        const khungGioList = room.KhungGio || [];

        return {
          id: room._id,
          MaPhong: room.MaPhong,
          TenPhong: room.TenPhong,
          LoaiPhong: room.LoaiPhong,
          SucChua: room.SucChua,
          ViTri: room.ViTri?.ViTri || 'Chưa xác định',
          KhungGio: khungGioList,
          TienIch: room.TienIch || 'Chưa có thông tin',
          TrangThai: this.getRoomStatus(room._id, khungGioList),
        };
      });
    },

    getRoomStatus(roomId, khungGioList) {
      const hasActiveBooking = this.allBookings.some(
        (b) =>
          b.PhongHoc?._id === roomId &&
          ['pending', 'approved', 'waiting_members'].includes(b.TrangThai)
      );

      return hasActiveBooking ? 'Đã đặt' : 'Còn trống';
    },

    isSlotAvailable(roomId, gioBatDau, gioKetThuc, ngaySuDung = null) {
      const bookingsForRoom = this.allBookings.filter((b) => {
        const sameRoom = b.PhongHoc?._id === roomId;
        const sameDate = ngaySuDung
          ? new Date(b.NgaySuDung).toDateString() ===
            new Date(ngaySuDung).toDateString()
          : true;
        const activeStatus = ['pending', 'approved'].includes(b.TrangThai);

        return sameRoom && sameDate && activeStatus;
      });

      const isBooked = bookingsForRoom.some((b) => {
        return this.checkTimeOverlap(
          gioBatDau,
          gioKetThuc,
          b.GioBatDau,
          b.GioKetThuc
        );
      });

      return !isBooked;
    },

    checkTimeOverlap(start1, end1, start2, end2) {
      return start1 < end2 && start2 < end1;
    },

    processMyBookings() {
      this.myBookings = this.allBookings.map((b) => ({
        id: b._id,
        MaPhong: b.PhongHoc?.MaPhong || '',
        TenPhong: b.PhongHoc?.TenPhong || '',
        ViTri: b.PhongHoc?.ViTri?.ViTri || '',
        TienIch: b.PhongHoc?.TienIch || 'Chưa có thông tin',
        NgaySuDung: b.NgaySuDung,
        GioBatDau: b.GioBatDau,
        GioKetThuc: b.GioKetThuc,
        TrangThai: b.TrangThai,
        isOwner: b.isOwner,
        NguoiDatPhong: b.isOwner
          ? 'Bạn'
          : `${b.DocGia?.HoLot} ${b.DocGia?.Ten}`,
        ChoNgoiDaChon: b.ChoNgoiDaChon || [],
        ChoNgoi: b.PhongHoc?.ChoNgoi || [],
        ThanhVien: b.ThanhVien
          ? b.ThanhVien.map((tv) => ({
              _id: tv.DocGia?._id,
              MaDocGia: tv.DocGia?.MaDocGia,
              HoTen: tv.DocGia?.HoTen,
              TrangThai: tv.TrangThai,
            }))
          : [],
      }));
    },

    hasActiveBooking(roomId) {
      return this.myBookings.some(
        (booking) =>
          booking.MaPhong === roomId &&
          ['pending', 'approved'].includes(booking.TrangThai)
      );
    },

    async loadInvitations() {
      try {
        const invites = await roomService.getMyInvitations({
          userId: userState._id,
        });

        this.invitations = invites.map((inv) => ({
          id: inv._id,
          bookingId: inv.bookingId,
          MaPhong: inv.PhongHoc?.MaPhong,
          TenPhong: inv.PhongHoc?.TenPhong,
          NgaySuDung: inv.NgaySuDung,
          GioBatDau: inv.GioBatDau,
          GioKetThuc: inv.GioKetThuc,
          NguoiMoi: inv.DocGia?.HoLot + ' ' + inv.DocGia?.Ten,
          TrangThai: inv.TrangThai,
          ChoNgoiDaChon: inv.ChoNgoiDaChon || [],
          PhongHoc: inv.PhongHoc
            ? {
                _id: inv.PhongHoc._id,
                MaPhong: inv.PhongHoc.MaPhong,
                TenPhong: inv.PhongHoc.TenPhong,
                ChoNgoi: inv.PhongHoc.ChoNgoi || [],
              }
            : null,
        }));
      } catch (error) {
        console.error('Lỗi khi lấy lời mời:', error);
      }
    },

    async acceptInvitation(invitationId, bookingId) {
      try {
        await roomService.respondToInvitation({
          bookingId: bookingId,
          memberId: userState._id,
          status: 'accepted',
        });

        alert('Đã chấp nhận lời mời!');
        await this.loadInvitations();
        await this.loadData();
      } catch (error) {
        if (error.response?.data?.message === 'CONFLICT') {
          alert('Bạn đã có lịch đặt phòng trùng giờ vào thời gian này!');
        } else {
          alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
      }
    },

    async declineInvitation(invitationId, bookingId) {
      if (!confirm('Bạn có chắc muốn từ chối lời mời này?')) return;

      try {
        await roomService.respondToInvitation({
          bookingId: bookingId,
          memberId: userState._id,
          status: 'declined',
        });

        alert('Đã từ chối lời mời!');
        await this.loadInvitations();
      } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra!');
      }
    },

    async searchMemberInfo() {
      const code = this.memberForm.searchCode.trim();

      this.memberForm.foundMember = null;
      this.memberForm.searchError = '';

      if (!code) {
        this.memberForm.searchError = 'Vui lòng nhập mã độc giả!';
        return;
      }

      try {
        const member = await roomService.searchMemberByCode({ MaDocGia: code });

        if (!member) {
          this.memberForm.searchError = 'Không tìm thấy độc giả với mã này!';
          return;
        }

        if (member._id === userState._id) {
          this.memberForm.searchError =
            'Không thể thêm chính bạn vào danh sách!';
          return;
        }

        const exists = this.memberForm.members.find(
          (m) => m._id === member._id
        );
        if (exists) {
          this.memberForm.searchError = 'Thành viên này đã được thêm!';
          return;
        }

        this.memberForm.foundMember = member;
      } catch (error) {
        console.error('Lỗi khi tìm thành viên:', error);
        this.memberForm.searchError = 'Có lỗi xảy ra khi tìm kiếm!';
      }
    },

    async addMember() {
      if (!this.memberForm.foundMember) return;

      if (this.memberForm.members.length >= this.selectedRoom.SucChua - 1) {
        alert('Đã đủ số lượng thành viên!');
        return;
      }

      if (
        this.bookingForm.ngaySuDung &&
        this.customTime.gioBatDau &&
        this.customTime.gioKetThuc
      ) {
        const hasConflict = await this.checkMemberScheduleConflict(
          this.memberForm.foundMember._id,
          this.bookingForm.ngaySuDung,
          this.customTime.gioBatDau,
          this.customTime.gioKetThuc
        );

        if (hasConflict) {
          this.memberForm.searchError =
            'Thành viên này đã có lịch đặt phòng trùng giờ!';
          return;
        }
      }

      this.memberForm.members.push({
        _id: this.memberForm.foundMember._id,
        MaDocGia: this.memberForm.foundMember.MaDocGia,
        HoLot: this.memberForm.foundMember.HoLot,
        Ten: this.memberForm.foundMember.Ten,
      });

      this.seatSelection.selectedSeats = [];

      this.memberForm.searchCode = '';
      this.memberForm.foundMember = null;
      this.memberForm.searchError = '';
    },

    removeMember(index) {
      this.memberForm.members.splice(index, 1);
      this.seatSelection.selectedSeats = [];
    },

    getMemberStatusText(status) {
      const statusMap = {
        invited: 'Chờ phản hồi',
        accepted: 'Đã chấp nhận',
        declined: 'Đã từ chối',
      };
      return statusMap[status] || status;
    },

    async viewInvitationDetail(invite) {
      try {
        const roomDetail = await roomService.getRoomById({
          roomId: invite.PhongHoc._id,
        });

        this.viewingInvitation = {
          ...invite,
          PhongHoc: {
            ...invite.PhongHoc,
            ChoNgoi: roomDetail.ChoNgoi || [],
          },
        };
        this.showInvitationDetailModal = true;
      } catch (error) {
        console.error('Lỗi khi load chi tiết lời mời:', error);
        this.viewingInvitation = invite;
        this.showInvitationDetailModal = true;
      }
    },

    closeInvitationDetailModal() {
      this.showInvitationDetailModal = false;
      this.viewingInvitation = null;
    },

    async checkMemberScheduleConflict(
      memberId,
      ngaySuDung,
      gioBatDau,
      gioKetThuc
    ) {
      try {
        const response = await roomService.checkMemberConflict({
          memberId: memberId,
          ngaySuDung: ngaySuDung,
          gioBatDau: gioBatDau,
          gioKetThuc: gioKetThuc,
        });
        return response.hasConflict;
      } catch (error) {
        console.error('Lỗi khi kiểm tra lịch thành viên:', error);
        return false;
      }
    },

    checkMyScheduleConflict(ngaySuDung, gioBatDau, gioKetThuc) {
      return this.myBookings.some((booking) => {
        if (!['pending', 'approved'].includes(booking.TrangThai)) {
          return false;
        }

        const bookingDate = new Date(booking.NgaySuDung).toDateString();
        const selectedDate = new Date(ngaySuDung).toDateString();

        if (bookingDate !== selectedDate) {
          return false;
        }

        return this.checkTimeOverlap(
          gioBatDau,
          gioKetThuc,
          booking.GioBatDau,
          booking.GioKetThuc
        );
      });
    },

    async loadAvailableSeats() {
      if (
        !this.bookingForm.ngaySuDung ||
        !this.customTime.gioBatDau ||
        !this.customTime.gioKetThuc
      ) {
        this.seatSelection.bookedSeats = [];
        return;
      }

      if (this.customTime.gioBatDau >= this.customTime.gioKetThuc) {
        return;
      }

      this.seatSelection.loading = true;
      this.seatSelection.error = '';

      try {
        const response = await roomService.getAvailableSeats({
          phongHocId: this.selectedRoom.id,
          ngaySuDung: this.bookingForm.ngaySuDung,
          gioBatDau: this.customTime.gioBatDau,
          gioKetThuc: this.customTime.gioKetThuc,
        });

        this.seatSelection.bookedSeats = response.bookedSeats;
      } catch (error) {
        console.error('Lỗi khi tải chỗ ngồi:', error);
        this.seatSelection.error =
          'Không thể kiểm tra chỗ trống. Vui lòng thử lại!';
      } finally {
        this.seatSelection.loading = false;
      }
    },

    toggleSeatSelection(seatNumber) {
      if (this.seatSelection.bookedSeats.includes(seatNumber)) {
        return;
      }

      const index = this.seatSelection.selectedSeats.indexOf(seatNumber);

      if (index > -1) {
        this.seatSelection.selectedSeats.splice(index, 1);
      } else {
        const maxSeats =
          this.selectedRoom.LoaiPhong === 'Nhóm'
            ? 1 + this.memberForm.members.length
            : 1;

        if (this.seatSelection.selectedSeats.length >= maxSeats) {
          alert(`Bạn chỉ có thể chọn tối đa ${maxSeats} chỗ ngồi!`);
          return;
        }

        this.seatSelection.selectedSeats.push(seatNumber);
      }
    },

    getSeatStatus(seatNumber) {
      if (this.seatSelection.bookedSeats.includes(seatNumber)) {
        return 'booked';
      }
      if (this.seatSelection.selectedSeats.includes(seatNumber)) {
        return 'selected';
      }
      return 'available';
    },

    getSeatTooltip(seat) {
      const status = this.getSeatStatus(seat.SoCho);

      if (status === 'booked') {
        return `Chỗ ${seat.TenCho} - Đã có người đặt`;
      } else if (status === 'selected') {
        return `Chỗ ${seat.TenCho} - Đang chọn (Click để bỏ chọn)`;
      } else {
        return `Chỗ ${seat.TenCho} - Còn trống (Click để chọn)`;
      }
    },

    async loadAllSeatsForRoom() {
      if (!this.selectedRoom) return;

      this.seatSelection.loading = true;
      this.seatSelection.error = '';

      try {
        const room = await roomService.getRoomById({
          roomId: this.selectedRoom.id,
        });

        if (room && room.ChoNgoi) {
          this.seatSelection.allSeats = room.ChoNgoi;
        } else {
          this.seatSelection.allSeats = [];
        }

        this.seatSelection.bookedSeats = [];
      } catch (error) {
        console.error('Lỗi khi tải sơ đồ chỗ ngồi:', error);
        this.seatSelection.error = 'Không thể tải sơ đồ chỗ ngồi';
      } finally {
        this.seatSelection.loading = false;
      }
    },

    getSeatName(choNgoiList, seatNumber) {
      if (!choNgoiList || choNgoiList.length === 0) return `Chỗ ${seatNumber}`;
      const seat = choNgoiList.find((s) => s.SoCho === seatNumber);
      return seat ? seat.TenCho : `Chỗ ${seatNumber}`;
    },

    getSeatGridColumns(choNgoiList) {
      if (!choNgoiList || choNgoiList.length === 0) return 4;
      const maxCol = Math.max(...choNgoiList.map((seat) => seat.HangNgang));
      return maxCol;
    },

    getSortedSeats(choNgoiList) {
      if (!choNgoiList) return [];
      return [...choNgoiList].sort((a, b) => {
        if (a.HangDoc !== b.HangDoc) {
          return a.HangDoc - b.HangDoc;
        }
        return a.HangNgang - b.HangNgang;
      });
    },

    async loadRoomSchedule(roomId) {
      try {
        const bookings = await roomService.getBookingsByRoom({ roomId });

        this.currentRoomBookings = bookings.map((b) => ({
          id: b._id,
          NgaySuDung: b.NgaySuDung,
          GioBatDau: b.GioBatDau,
          GioKetThuc: b.GioKetThuc,
          TrangThai: b.TrangThai,
          ChoNgoiDaChon: b.ChoNgoiDaChon || [],
          NguoiDat: b.DocGia
            ? `${b.DocGia.HoLot || ''} ${b.DocGia.Ten || ''}`.trim()
            : 'Không rõ',
          isMine: b.DocGia?._id === userState._id,
        }));

        console.log('✅ Loaded room schedule:', this.currentRoomBookings);
      } catch (error) {
        console.error('Lỗi khi load lịch phòng:', error);
        this.currentRoomBookings = [];
      }
    },

    checkConflictWithBooking(booking) {
      if (
        !this.bookingForm.ngaySuDung ||
        !this.customTime.gioBatDau ||
        !this.customTime.gioKetThuc
      ) {
        return false;
      }

      const sameDate =
        new Date(booking.NgaySuDung).toDateString() ===
        new Date(this.bookingForm.ngaySuDung).toDateString();

      if (!sameDate) return false;

      return this.checkTimeOverlap(
        this.customTime.gioBatDau,
        this.customTime.gioKetThuc,
        booking.GioBatDau,
        booking.GioKetThuc
      );
    },

    async loadViewingRoomSchedule(roomId) {
      try {
        const bookings = await roomService.getBookingsByRoom({ roomId });

        this.viewingRoomSchedule = bookings.map((b) => ({
          id: b._id,
          NgaySuDung: b.NgaySuDung,
          GioBatDau: b.GioBatDau,
          GioKetThuc: b.GioKetThuc,
          TrangThai: b.TrangThai,
          ChoNgoiDaChon: b.ChoNgoiDaChon || [],
          NguoiDat: b.DocGia
            ? `${b.DocGia.HoLot || ''} ${b.DocGia.Ten || ''}`.trim()
            : 'Không rõ',
          isMine: b.DocGia?._id === userState._id,
        }));
      } catch (error) {
        console.error('Lỗi khi load lịch phòng xem chi tiết:', error);
        this.viewingRoomSchedule = [];
      }
    },
  },

  computed: {
    filteredRooms() {
      let result = [...this.rooms];

      if (this.filters.loaiPhong !== 'all') {
        result = result.filter(
          (room) => room.LoaiPhong === this.filters.loaiPhong
        );
      }

      if (this.filters.sucChua) {
        result = result.filter((room) => room.SucChua >= this.filters.sucChua);
      }

      if (this.filters.keyword) {
        const keyword = this.filters.keyword.toLowerCase();
        result = result.filter(
          (room) =>
            room.MaPhong.toLowerCase().includes(keyword) ||
            room.TenPhong.toLowerCase().includes(keyword) ||
            room.ViTri.toLowerCase().includes(keyword)
        );
      }

      if (this.filters.bookingStatus === 'booked') {
        result = result.filter((room) => this.hasActiveBooking(room.MaPhong));
      } else if (this.filters.bookingStatus === 'available') {
        result = result.filter((room) => !this.hasActiveBooking(room.MaPhong));
      }

      if (this.sortBy === 'capacity_desc') {
        result.sort((a, b) => b.SucChua - a.SucChua);
      } else if (this.sortBy === 'capacity_asc') {
        result.sort((a, b) => a.SucChua - b.SucChua);
      }

      result.sort((a, b) => {
        const aBooked = this.hasActiveBooking(a.MaPhong);
        const bBooked = this.hasActiveBooking(b.MaPhong);

        if (aBooked && !bBooked) return -1;
        if (!aBooked && bBooked) return 1;
        return 0;
      });

      return result;
    },

    paginatedRooms() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredRooms.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredRooms.length / this.pageSize) || 1;
    },

    filteredSchedule() {
      let result =
        this.scheduleFilter === 'all'
          ? [...this.myBookings]
          : this.myBookings.filter(
              (booking) => booking.TrangThai === this.scheduleFilter
            );

      result.sort((a, b) => {
        const statusPriority = {
          pending: 1,
          approved: 2,
          checked_in: 3,
          denied: 4,
          no_show: 5,
          canceled: 6,
        };

        const priorityA = statusPriority[a.TrangThai] || 99;
        const priorityB = statusPriority[b.TrangThai] || 99;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const dateA = new Date(a.NgaySuDung);
        const dateB = new Date(b.NgaySuDung);
        return dateB - dateA;
      });

      return result;
    },

    sortedInvitations() {
      if (!this.invitations) return [];

      let result = [...this.invitations];

      result.sort((a, b) => {
        const statusPriority = {
          invited: 1,
          accepted: 2,
          declined: 3,
        };

        const priorityA = statusPriority[a.TrangThai] || 99;
        const priorityB = statusPriority[b.TrangThai] || 99;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const dateA = new Date(a.NgaySuDung);
        const dateB = new Date(b.NgaySuDung);
        return dateB - dateA;
      });

      return result;
    },

    paginatedInvitations() {
      const start = (this.currentInvitationPage - 1) * this.invitationPageSize;
      const end = start + this.invitationPageSize;
      return this.sortedInvitations.slice(start, end);
    },

    totalInvitationPages() {
      return (
        Math.ceil(this.sortedInvitations.length / this.invitationPageSize) || 1
      );
    },

    paginatedSchedule() {
      const start = (this.scheduleCurrentPage - 1) * this.schedulePageSize;
      const end = start + this.schedulePageSize;
      return this.filteredSchedule.slice(start, end);
    },

    totalSchedulePages() {
      return (
        Math.ceil(this.filteredSchedule.length / this.schedulePageSize) || 1
      );
    },

    seatGridColumns() {
      if (this.seatSelection.allSeats.length === 0) return 4;

      const maxCol = Math.max(
        ...this.seatSelection.allSeats.map((seat) => seat.HangNgang)
      );

      return maxCol;
    },

    sortedSeats() {
      if (!this.seatSelection.allSeats) return [];

      return [...this.seatSelection.allSeats].sort((a, b) => {
        if (a.HangDoc !== b.HangDoc) {
          return a.HangDoc - b.HangDoc;
        }
        return a.HangNgang - b.HangNgang;
      });
    },

    sortedRoomSchedule() {
      if (!this.currentRoomBookings) return [];

      let result = [...this.currentRoomBookings];

      if (this.scheduleSort === 'date_desc') {
        result.sort((a, b) => new Date(b.NgaySuDung) - new Date(a.NgaySuDung));
      } else if (this.scheduleSort === 'date_asc') {
        result.sort((a, b) => new Date(a.NgaySuDung) - new Date(b.NgaySuDung));
      } else if (this.scheduleSort === 'time_asc') {
        result.sort((a, b) => {
          const dateCompare = new Date(a.NgaySuDung) - new Date(b.NgaySuDung);
          if (dateCompare !== 0) return dateCompare;
          return a.GioBatDau.localeCompare(b.GioBatDau);
        });
      }

      return result;
    },

    sortedViewingRoomSchedule() {
      if (!this.viewingRoomSchedule) return [];

      let result = [...this.viewingRoomSchedule];

      if (this.viewingScheduleSort === 'date_desc') {
        result.sort((a, b) => new Date(b.NgaySuDung) - new Date(a.NgaySuDung));
      } else if (this.viewingScheduleSort === 'date_asc') {
        result.sort((a, b) => new Date(a.NgaySuDung) - new Date(b.NgaySuDung));
      } else if (this.viewingScheduleSort === 'time_asc') {
        result.sort((a, b) => {
          const dateCompare = new Date(a.NgaySuDung) - new Date(b.NgaySuDung);
          if (dateCompare !== 0) return dateCompare;
          return a.GioBatDau.localeCompare(b.GioBatDau);
        });
      }

      return result;
    },
  },

  watch: {
    currentPage() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    'bookingForm.ngaySuDung'(newVal) {
      if (newVal) {
        this.loadAvailableSeats();
      }
    },

    'customTime.gioBatDau'(newVal) {
      if (newVal && this.customTime.gioKetThuc) {
        this.loadAvailableSeats();
      }
    },

    'customTime.gioKetThuc'(newVal) {
      if (newVal && this.customTime.gioBatDau) {
        this.loadAvailableSeats();
      }
    },
  },
};
</script>