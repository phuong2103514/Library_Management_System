<template>
  <div class="borrow-book">
    <div class="borrow-book__util">
      <div class="borrow-book__util-search">
        <div class="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            class="search-input"
            v-model="searchKeyword"
          />
          <button class="search-button-management-borrow">
            <i class="fas fa-search"></i>
          </button>
        </div>

        <input type="date" class="search-date ml-2" v-model="selectedDate" />
      </div>

      <div class="borrow-book__util-all-status">
        <select class="status-select" v-model="selectedStatus">
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>

    <div class="borrow-book__tabs">
      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'require' }"
        @click="currentTab = 'require'"
      >
        Danh Sách Yêu Cầu Mượn
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'borrowed' }"
        @click="currentTab = 'borrowed'"
      >
        Danh Sách Đã Mượn
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'punish' }"
        @click="currentTab = 'punish'"
      >
        Danh Sách Xử Phạt
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'rules' }"
        @click="currentTab = 'rules'"
      >
        Quy định
      </div>
    </div>

    <!-- Danh sách yêu cầu mượn -->
    <table
      class="borrow-book__list-require-borrow mt-4 table w-100"
      v-if="currentTab === 'require'"
    >
      <thead>
        <tr>
          <th class="borrow-book__list-require-borrow-title">Mã Phiếu</th>
          <th class="borrow-book__list-require-borrow-title">Mã Độc Giả</th>
          <th class="borrow-book__list-require-borrow-title">Độc Giả</th>
          <th class="borrow-book__list-require-borrow-title">Sách</th>
          <th class="borrow-book__list-require-borrow-title">Ngày Yêu Cầu</th>
          <!-- <th class="borrow-book__list-require-borrow-title">Ngày Duyệt</th> -->
          <th
            class="borrow-book__list-require-borrow-title borrow-book__list-require-borrow-title-receive-book-date"
          >
            Ngày Nhận Sách
          </th>
          <th class="borrow-book__list-require-borrow-title">Trạng thái</th>
          <th class="borrow-book__list-require-borrow-title">Xử Lý</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in paginatedTrackBorrowList"
          :key="item._id"
          @click="handleRowClick(item)"
        >
          <td class="borrow-book__list-require-borrow-content">
            <span class="slip-id-badge--compact">
              {{
                (item.MaPhieuMuon?._id || item.MaPhieuMuon)
                  .slice(-6)
                  .toUpperCase()
              }}
            </span>
          </td>
          <td class="borrow-book__list-require-borrow-content">
            {{ item.MaDocGia?.MaDocGia }}
          </td>
          <td
            class="borrow-book__list-require-borrow-content borrow-book__list-require-borrow-content-author"
          >
            {{ item.MaDocGia?.HoLot }} {{ item.MaDocGia?.Ten }}
          </td>
          <td
            class="borrow-book__list-require-borrow-content borrow-book__list-require-borrow-content-title-book"
          >
            <span v-if="!item._isGroup">{{ item.MaSach?.TenSach }}</span>
            <span v-else style="font-weight: 600; color: #667eea">
              {{ item._totalBooks }} cuốn sách
              <i
                class="fa-solid fa-chevron-right"
                style="margin-left: 8px; font-size: 1.2rem"
              ></i>
            </span>
          </td>

          <td class="borrow-book__list-require-borrow-content">
            {{
              new Date(item.MaPhieuMuon?.NgayTao).toLocaleDateString('vi-VN')
            }}
          </td>
          <!-- <td
            class="borrow-book__list-require-borrow-content borrow-book__list-require-borrow-content-receive-book-date"
          >
            {{
              item.NgayDuyet
                ? new Date(item.NgayDuyet).toLocaleDateString('vi-VN')
                : '--'
            }}
          </td> -->
          <td
            class="borrow-book__list-require-borrow-content borrow-book__list-require-borrow-content-receive-book-date"
          >
            {{
              item.NgayMuon
                ? new Date(item.NgayMuon).toLocaleDateString('vi-VN')
                : '--'
            }}
          </td>
          <td class="borrow-book__list-require-borrow-content">
            <div
              class="borrow-book__list-require-borrow-status"
              :class="{
                'borrow-book__list-require-borrow-status-waiting':
                  (item.MaPhieuMuon?.TrangThai || item.TrangThai) === 'pending',
                'borrow-book__list-require-borrow-status-processing':
                  (item.MaPhieuMuon?.TrangThai || item.TrangThai) ===
                  'processing',
                'borrow-book__list-require-borrow-status-approved':
                  (item.MaPhieuMuon?.TrangThai || item.TrangThai) ===
                  'approved',
                'borrow-book__list-require-borrow-status-denied':
                  (item.MaPhieuMuon?.TrangThai || item.TrangThai) === 'denied',
                'borrow-book__list-require-borrow-status-completed':
                  (item.MaPhieuMuon?.TrangThai || item.TrangThai) ===
                  'completed',
              }"
            >
              {{ getPhieuMuonStatusText(item) }}
            </div>
          </td>
          <td class="borrow-book__list-require-borrow-content">
            <div v-if="getPhieuMuonStatus(item) === 'pending'">
              <button
                type="button"
                class="borrow-book__list-require-borrow-btn-accept borrow-book__list-require-borrow-status"
                @click.stop="processRequest(item._id)"
              >
                Duyệt
              </button>
              <button
                type="button"
                class="borrow-book__list-require-borrow-deny borrow-book__list-require-borrow-status"
                @click.stop="denyRequest(item._id)"
              >
                Từ chối
              </button>
            </div>
            <div v-else-if="getPhieuMuonStatus(item) === 'processing'">
              <button
                type="button"
                class="borrow-book__list-require-borrow-btn-accept borrow-book__list-require-processing-status"
                @click.stop="approveRequest(item._id)"
              >
                Nhận sách
              </button>
            </div>
            <div v-else>
              <div
                class="borrow-book__list-require-borrow-btn-done borrow-book__list-require-borrow-status"
              >
                Đã xử lý
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="book__library-list-book-navigation-page"
      v-if="currentTab === 'require' && paginatedTrackBorrowList.length > 0"
    >
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(1)">«</a>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage - 1)"
            >‹</a
          >
        </li>

        <li class="page-item active">
          <a class="page-link" href="#" @click.prevent>{{ currentPage }}</a>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage + 1)"
            >›</a
          >
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(totalPages)"
            >»</a
          >
        </li>
      </ul>
    </div>

    <!-- Danh sách đã mượn -->
    <table
      class="borrow-book__list-borrowed mt-4 table w-100"
      v-if="currentTab === 'borrowed'"
    >
      <thead>
        <tr>
          <th class="borrow-book__list-borrowed-title">Mã Phiếu</th>
          <th class="borrow-book__list-borrowed-title">Mã Độc Giả</th>
          <th class="borrow-book__list-borrowed-title">Sách</th>
          <th class="borrow-book__list-borrowed-title">Ngày Mượn</th>
          <th class="borrow-book__list-borrowed-title">Hạn Trả</th>
          <th class="borrow-book__list-borrowed-title">Ngày Trả</th>
          <th class="borrow-book__list-borrowed-title">Tình Trạng</th>
          <th class="borrow-book__list-borrowed-title">Thao Tác</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in paginatedBorrowedList"
          :key="item._id"
          @click="handleRowClick(item)"
          :class="getSlipGroupClass(item, index, paginatedBorrowedList)"
        >
          <td class="borrow-book__list-borrowed-content">
            <span
              class="slip-id-badge"
              :class="{
                'slip-id-badge--first': isFirstInSlipGroup(
                  item,
                  index,
                  paginatedBorrowedList
                ),
              }"
            >
              {{
                isFirstInSlipGroup(item, index, paginatedBorrowedList)
                  ? (item.MaPhieuMuon?._id || item.MaPhieuMuon)
                      .slice(-6)
                      .toUpperCase()
                  : '↳'
              }}
            </span>
          </td>
          <td class="borrow-book__list-borrowed-content">
            {{ item.MaDocGia?.MaDocGia }}
          </td>

          <td
            class="borrow-book__list-borrowed-content borrow-book__list-borrowed-content-title-book"
          >
            {{ item.MaSach?.TenSach }}
          </td>

          <td class="borrow-book__list-borrowed-content">
            {{ new Date(item.NgayMuon).toLocaleDateString('vi-VN') }}
          </td>

          <td class="borrow-book__list-borrowed-content">
            {{ new Date(item.NgayTra).toLocaleDateString('vi-VN') }}
          </td>

          <td
            class="borrow-book__list-borrowed-content borrow-book__list-borrowed-content-return-date"
          >
            {{
              item.NgayGhiNhanTra
                ? new Date(item.NgayGhiNhanTra).toLocaleDateString('vi-VN')
                : '--'
            }}
          </td>

          <td class="borrow-book__list-borrowed-content">
            <div
              class="borrow-book__list-require-borrow-status"
              :class="{
                'borrow-book__list-borrowed-status-borrowing':
                  item.TrangThai === 'approved',
                'borrow-book__list-borrowed-status-overdue':
                  item.TrangThai === 'overdue',
                'borrow-book__list-borrowed-status-returned':
                  item.TrangThai === 'returned' &&
                  new Date(item.NgayGhiNhanTra) <= new Date(item.NgayTra),
                'borrow-book__list-borrowed-status-late':
                  item.TrangThai === 'returned' &&
                  new Date(item.NgayGhiNhanTra) > new Date(item.NgayTra),
              }"
            >
              {{
                item.TrangThai === 'approved'
                  ? 'Đang Mượn'
                  : item.TrangThai === 'overdue'
                  ? 'Quá Hạn'
                  : new Date(item.NgayGhiNhanTra) > new Date(item.NgayTra)
                  ? 'Trả Trễ'
                  : 'Đã Trả'
              }}
            </div>
          </td>

          <td class="borrow-book__list-borrowed-content">
            <!-- Hiện cả 2 nút khi approved hoặc overdue -->
            <button
              v-if="
                item.TrangThai === 'approved' || item.TrangThai === 'overdue'
              "
              type="button"
              class="borrow-book__list-borrowed-btn-return borrow-book__list-require-borrow-status"
              @click.stop="openReturnStatusModal(item)"
            >
              Trả sách
            </button>

            <button
              v-if="
                item.TrangThai === 'approved' || item.TrangThai === 'overdue'
              "
              type="button"
              class="borrow-book__list-borrowed-btn-extend borrow-book__list-require-borrow-status"
              :disabled="item.TrangThai === 'overdue' || item.DaGiaHan"
              @click.stop="handleExtendBorrow(item)"
            >
              {{ item.DaGiaHan ? 'Đã gia hạn' : 'Gia hạn' }}
            </button>

            <div
              v-else
              class="borrow-book__list-borrowed-btn-completed borrow-book__list-require-borrow-status"
            >
              Hoàn thành
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="book__library-list-book-navigation-page"
      v-if="currentTab === 'borrowed' && paginatedBorrowedList.length > 0"
    >
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPageBorrowed === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPageBorrowed(1)"
            >«</a
          >
        </li>

        <li class="page-item" :class="{ disabled: currentPageBorrowed === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPageBorrowed(currentPageBorrowed - 1)"
            >‹</a
          >
        </li>

        <li class="page-item active">
          <a class="page-link" href="#" @click.prevent>{{
            currentPageBorrowed
          }}</a>
        </li>

        <li
          class="page-item"
          :class="{ disabled: currentPageBorrowed === totalPagesBorrowed }"
        >
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPageBorrowed(currentPageBorrowed + 1)"
            >›</a
          >
        </li>

        <li
          class="page-item"
          :class="{ disabled: currentPageBorrowed === totalPagesBorrowed }"
        >
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPageBorrowed(totalPagesBorrowed)"
            >»</a
          >
        </li>
      </ul>
    </div>

    <!-- Danh sách xử phạt -->
    <table
      class="borrow-book__list-penalty mt-4 table w-100"
      v-if="currentTab === 'punish'"
    >
      <thead>
        <tr>
          <th class="borrow-book__list-penalty-title">Mã Phiếu</th>
          <th class="borrow-book__list-penalty-title">Mã Độc Giả</th>
          <th class="borrow-book__list-penalty-title">Sách</th>
          <th class="borrow-book__list-penalty-title">Tình Trạng</th>
          <th class="borrow-book__list-penalty-title">Phí Quá Hạn</th>
          <th class="borrow-book__list-penalty-title">Phí Bồi Thường</th>
          <th class="borrow-book__list-penalty-title">Tổng Tiền</th>
          <th class="borrow-book__list-penalty-title">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in paginatedPunishList"
          :key="item._id"
          @click="handleRowClick(item)"
          :class="getSlipGroupClass(item, index, paginatedPunishList)"
        >
          <td class="borrow-book__list-penalty-content">
            <span
              class="slip-id-badge"
              :class="{
                'slip-id-badge--first': isFirstInSlipGroup(
                  item,
                  index,
                  paginatedPunishList
                ),
              }"
            >
              {{
                isFirstInSlipGroup(item, index, paginatedPunishList)
                  ? (item.MaPhieuMuon?._id || item.MaPhieuMuon)
                      .slice(-6)
                      .toUpperCase()
                  : '↳'
              }}
            </span>
          </td>
          <td class="borrow-book__list-penalty-content">
            {{ item.MaDocGia?.MaDocGia }}
          </td>
          <td
            class="borrow-book__list-penalty-content borrow-book__list-penalty-content-reader"
          >
            {{ item.MaSach?.TenSach }}
          </td>
          <td>
            <div
              class="borrow-book__list-penalty-content"
              :class="{
                'penalty-status-intact': item.TinhTrangSach === 'Nguyên vẹn',
                'penalty-status-lost': item.TinhTrangSach === 'Mất sách',
                'penalty-status-damaged': item.TinhTrangSach === 'Hư sách',
                'penalty-status-empty': !item.TinhTrangSach,
              }"
            >
              {{ item.TinhTrangSach || '--' }}
            </div>
          </td>
          <td class="borrow-book__list-penalty-content">
            {{ (item.PhiQuaHan || 0).toLocaleString() }}đ
          </td>
          <td class="borrow-book__list-penalty-content">
            {{ (item.PhiBoiThuong || 0).toLocaleString() }}đ
          </td>
          <td
            class="borrow-book__list-penalty-content"
            style="color: red; font-weight: bold"
          >
            {{ calculateTotalFee(item).toLocaleString() }}đ
            <span
              v-if="
                item.TongPhiDaSua !== null && item.TongPhiDaSua !== undefined
              "
              style="
                font-size: 10px;
                color: #ff9800;
                font-weight: normal;
                margin-left: 3px;
              "
            >
              *
            </span>
          </td>
          <td class="borrow-book__list-penalty-content">
            <!-- Nút Thanh toán -->
            <button
              v-if="!item.DaThanhToan"
              type="button"
              class="borrow-book__list-borrowed-btn-return borrow-book__list-require-borrow-status"
              @click.stop="confirmPaid(item._id)"
              :disabled="
                !['Nguyên vẹn', 'Hư sách', 'Mất sách'].includes(
                  item.TinhTrangSach
                )
              "
            >
              Thanh toán
            </button>

            <!-- Trạng thái Đã thanh toán -->
            <div
              v-if="item.DaThanhToan"
              class="borrow-book__list-borrowed-btn-completed borrow-book__list-require-borrow-status"
              style="display: inline-block; margin-right: 10px"
            >
              Thanh toán
            </div>

            <!-- Nút Đã sửa -->
            <button
              v-if="item.TinhTrangSach === 'Hư sách' && !item.DaSua"
              type="button"
              class="borrow-book__list-borrowed-btn-fix"
              @click.stop="markAsRepaired(item._id)"
            >
              Sửa sách
            </button>

            <!-- Nút Điều chỉnh phí -->
            <button
              v-if="
                !item.DaThanhToan &&
                (item.PhiBoiThuong > 0 || item.PhiQuaHan > 0) &&
                (item.TongPhiDaSua === null || item.TongPhiDaSua === undefined)
              "
              type="button"
              class="borrow-book__list-borrowed-btn-extend borrow-book__list-require-borrow-status"
              @click.stop="openEditFeeModal(item)"
            >
              Sửa phí
            </button>

            <!-- Trạng thái Đã sửa phí -->
            <div
              v-if="
                !item.DaThanhToan &&
                (item.PhiBoiThuong > 0 || item.PhiQuaHan > 0) &&
                item.TongPhiDaSua !== null &&
                item.TongPhiDaSua !== undefined
              "
              class="borrow-book__list-borrowed-btn-completed borrow-book__list-require-borrow-status"
              style="display: inline-block"
            >
              Đã sửa phí
            </div>

            <!-- Trạng thái Đã sửa xong -->
            <div
              v-if="item.TinhTrangSach === 'Hư sách' && item.DaSua"
              class="borrow-book__list-borrowed-btn-completed borrow-book__list-require-borrow-status"
              style="display: inline-block"
            >
              Đã sửa
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="book__library-list-book-navigation-page"
      v-if="currentTab === 'punish' && paginatedPunishList.length > 0"
    >
      <ul class="pagination">
        <!-- Về trang đầu -->
        <li class="page-item" :class="{ disabled: currentPagePunish === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPagePunish(1)">«</a>
        </li>

        <!-- Lùi 1 trang -->
        <li class="page-item" :class="{ disabled: currentPagePunish === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPagePunish(currentPagePunish - 1)"
            >‹</a
          >
        </li>

        <!-- Trang hiện tại -->
        <li class="page-item active">
          <a class="page-link" href="#" @click.prevent>
            {{ currentPagePunish }}
          </a>
        </li>

        <!-- Tiến 1 trang -->
        <li
          class="page-item"
          :class="{ disabled: currentPagePunish === totalPagesPunish }"
        >
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPagePunish(currentPagePunish + 1)"
            >›</a
          >
        </li>

        <!-- Về trang cuối -->
        <li
          class="page-item"
          :class="{ disabled: currentPagePunish === totalPagesPunish }"
        >
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPagePunish(totalPagesPunish)"
            >»</a
          >
        </li>
      </ul>
    </div>

    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showReturnStatusModal"
        tabindex="-1"
        @click="showReturnStatusModal = false"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Tình trạng sách khi trả</h5>
              <button
                type="button"
                class="btn-close"
                @click="showReturnStatusModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <p>
                <strong>Độc giả:</strong>
                {{ currentReturnItem?.MaDocGia?.HoLot }}
                {{ currentReturnItem?.MaDocGia?.Ten }}
              </p>

              <p>
                <strong>Mã Sách:</strong>
                {{ currentReturnItem?.MaSach?.MaSach }}
              </p>

              <p>
                <strong>Sách:</strong> {{ currentReturnItem?.MaSach?.TenSach }}
              </p>

              <p><strong>Tình trạng sách:</strong></p>
              <div class="return-status-options">
                <label v-for="status in returnStatusOptions" :key="status">
                  <input
                    type="radio"
                    name="returnStatus"
                    :value="status"
                    v-model="selectedReturnStatus"
                  />
                  {{ status }}
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button
                class="return-status-btn return-status-btn-confirm"
                :disabled="!selectedReturnStatus"
                @click="confirmReturnStatus"
              >
                Xác nhận
              </button>
              <button
                class="return-status-btn return-status-btn-cancel"
                @click="showReturnStatusModal = false"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chi tiết yêu cầu mượn - Chỉ hiện khi tab require -->
    <BorrowRequestDetailModal
      v-if="currentTab === 'require'"
      :show="showModal && currentTab === 'require'"
      :request="selectedItem"
      @close="showModal = false"
    />

    <!-- Modal cũ cho tab borrowed và punish - GIỮ NGUYÊN -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="
          showModal && (currentTab === 'borrowed' || currentTab === 'punish')
        "
        tabindex="-1"
        @click="showModal = false"
      >
        <div
          class="modal-dialog"
          :class="{ 'modal-dialog--penalty': currentTab === 'punish' }"
          @click.stop
        >
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{
                  currentTab === 'borrowed'
                    ? 'Chi tiết mượn sách'
                    : 'Chi tiết xử phạt'
                }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body-request-book">
                <div class="modal-body-request-book-image">
                  <img :src="selectedItem?.MaSach?.Image" alt="" />
                </div>

                <div class="modal-body-request-book-information">
                  <p>
                    <strong>Mã độc giả:</strong>
                    {{ selectedItem?.MaDocGia?.MaDocGia }}
                  </p>

                  <p>
                    <strong>Họ tên:</strong> {{ selectedItem?.MaDocGia?.HoLot }}
                    {{ selectedItem?.MaDocGia?.Ten }}
                  </p>

                  <p>
                    <strong>Mã Sách:</strong> {{ selectedItem?.MaSach?.MaSach }}
                  </p>

                  <p>
                    <strong>Sách:</strong> {{ selectedItem?.MaSach?.TenSach }}
                  </p>

                  <!-- Tab borrowed -->
                  <div v-show="currentTab === 'borrowed'">
                    <p>
                      <strong>Ngày mượn:</strong>
                      {{
                        selectedItem?.NgayMuon
                          ? new Date(selectedItem.NgayMuon).toLocaleDateString(
                              'vi-VN'
                            )
                          : ''
                      }}
                    </p>

                    <p>
                      <strong>Hạn trả:</strong>
                      {{
                        selectedItem?.NgayTra
                          ? new Date(selectedItem.NgayTra).toLocaleDateString(
                              'vi-VN'
                            )
                          : ''
                      }}
                    </p>

                    <p>
                      <strong>Ngày trả:</strong>
                      {{
                        selectedItem?.NgayGhiNhanTra
                          ? new Date(
                              selectedItem.NgayGhiNhanTra
                            ).toLocaleDateString('vi-VN')
                          : '--'
                      }}
                    </p>

                    <p>
                      <strong>Tình trạng:</strong>
                      {{
                        selectedItem?.TrangThai === 'approved'
                          ? 'Đang Mượn'
                          : selectedItem?.TrangThai === 'overdue'
                          ? 'Quá Hạn'
                          : new Date(selectedItem?.NgayGhiNhanTra) >
                            new Date(selectedItem?.NgayTra)
                          ? 'Trả Trễ'
                          : 'Đã Trả'
                      }}
                    </p>
                  </div>

                  <!-- Tab punish -->
                  <div v-show="currentTab === 'punish'">
                    <p>
                      <strong>Hạn trả:</strong>
                      {{
                        selectedItem?.NgayTra
                          ? new Date(selectedItem.NgayTra).toLocaleDateString(
                              'vi-VN'
                            )
                          : ''
                      }}
                    </p>

                    <p>
                      <strong>Ngày trả:</strong>
                      {{
                        selectedItem?.NgayGhiNhanTra
                          ? new Date(
                              selectedItem.NgayGhiNhanTra
                            ).toLocaleDateString('vi-VN')
                          : '--'
                      }}
                    </p>

                    <p>
                      <strong>Tình trạng sách:</strong>
                      {{ selectedItem?.TinhTrangSach || 'Chưa rõ' }}
                    </p>

                    <p v-if="selectedItem?.TinhTrangSach === 'Hư sách'">
                      <strong>Tình trạng sửa:</strong>
                      {{ selectedItem?.DaSua ? 'Đã sửa' : 'Chưa sửa' }}
                    </p>

                    <p>
                      <strong>Phí quá hạn: </strong>
                      <span>
                        {{ (selectedItem?.PhiQuaHan || 0).toLocaleString() }}đ
                      </span>
                    </p>

                    <p>
                      <strong>Phí bồi thường: </strong>
                      <span>
                        {{
                          (selectedItem?.PhiBoiThuong || 0).toLocaleString()
                        }}đ
                      </span>
                    </p>

                    <p>
                      <strong>Tổng tiền phạt: </strong>
                      <span style="color: red; font-weight: bold">
                        {{ calculateTotalFee(selectedItem).toLocaleString() }}đ
                        <span
                          v-if="
                            selectedItem?.TongPhiDaSua !== null &&
                            selectedItem?.TongPhiDaSua !== undefined
                          "
                          style="color: #ff9800; font-size: 1.4rem"
                        >
                          (đã điều chỉnh)
                        </span>
                      </span>
                    </p>

                    <div
                      v-if="selectedItem?.LyDoSua"
                      style="
                        margin-top: 10px;
                        padding: 10px;
                        background: #fff3e0;
                        border-radius: 4px;
                        border-left: 3px solid #ff9800;
                      "
                    >
                      <p style="margin: 0; color: #666; font-size: 13px">
                        <strong style="color: #333">Lý do điều chỉnh:</strong
                        ><br />
                        {{ selectedItem.LyDoSua }}
                      </p>
                    </div>

                    <p>
                      <strong>Thanh Toán: </strong>
                      <span>
                        {{
                          selectedItem?.DaThanhToan
                            ? 'Đã thanh toán'
                            : 'Chưa thanh toán'
                        }}
                      </span>
                    </p>

                    <p v-if="selectedItem?.DaThanhToan">
                      <strong>Ngày Thanh Toán: </strong>
                      <span>
                        {{
                          new Date(
                            selectedItem.NgayGhiNhanThanhToan
                          ).toLocaleDateString()
                        }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Điều chỉnh Phí -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showEditFeeModal"
        tabindex="-1"
        @click="showEditFeeModal = false"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Điều chỉnh tổng phí phạt</h5>
              <button
                type="button"
                class="btn-close"
                @click="showEditFeeModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <p>
                <strong>Độc giả:</strong>
                {{ currentEditFeeItem?.MaDocGia?.HoLot }}
                {{ currentEditFeeItem?.MaDocGia?.Ten }}
              </p>

              <p>
                <strong>Sách:</strong> {{ currentEditFeeItem?.MaSach?.TenSach }}
              </p>

              <div
                style="
                  background: #f5f5f5;
                  padding: 10px;
                  border-radius: 4px;
                  margin: 10px 0;
                "
              >
                <p style="margin: 5px 0">
                  <strong>Phí quá hạn:</strong>
                  {{ (currentEditFeeItem?.PhiQuaHan || 0).toLocaleString() }}đ
                </p>
                <p style="margin: 5px 0">
                  <strong>Phí bồi thường:</strong>
                  {{
                    (currentEditFeeItem?.PhiBoiThuong || 0).toLocaleString()
                  }}đ
                </p>
                <p style="margin: 5px 0; color: red; font-weight: bold">
                  <strong>Tổng hiện tại:</strong>
                  {{ calculateTotalFee(currentEditFeeItem).toLocaleString() }}đ
                </p>
              </div>

              <div style="margin-top: 15px">
                <label style="display: block; margin-bottom: 5px">
                  <strong
                    >Tổng phí mới (VNĐ):
                    <span style="color: red">*</span></strong
                  >
                </label>
                <input
                  type="number"
                  v-model.number="displayTotalFee"
                  class="search-input"
                  placeholder="Nhập số tiền mới"
                  min="0"
                  step="1"
                  style="width: 100%"
                />
              </div>

              <div style="margin-top: 15px">
                <label style="display: block; margin-bottom: 5px">
                  <strong
                    >Lý do điều chỉnh: <span style="color: red">*</span></strong
                  >
                </label>
                <textarea
                  v-model="editFeeReason"
                  class="search-input"
                  placeholder="Ví dụ: Học sinh có hoàn cảnh khó khăn, giảm 50% phí..."
                  rows="3"
                  style="width: 100%; resize: vertical; font-family: inherit"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button
                class="return-status-btn return-status-btn-confirm"
                :disabled="
                  newTotalFee === null ||
                  newTotalFee === undefined ||
                  !editFeeReason.trim()
                "
                @click="confirmEditFee"
              >
                Xác nhận
              </button>
              <button
                class="return-status-btn return-status-btn-cancel"
                @click="showEditFeeModal = false"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="currentTab === 'rules'" class="penalty-rules">
      <div
        v-if="
          borrowRules.maxBooks !== undefined &&
          penaltyRules.coefLost !== undefined
        "
      >
        <h2 class="penalty-title">⚙️ Quy định mượn và trả sách</h2>

        <!-- QUY ĐỊNH MƯỢN SÁCH - SINH VIÊN -->
        <div class="rule-section rule-section--student">
          <div class="rule-section-header">
            <h3 class="rule-section-title">
              👨‍🎓 Quy định mượn sách - Sinh Viên
            </h3>
          </div>

          <div class="rule-grid">
            <div class="rule-card">
              <div class="rule-card-icon">📚</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Số sách được mượn tối đa</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.maxBooks }} cuốn
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.maxBooks"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📚</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Số sách được mượn/ngày</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.maxBooksPerDay }} cuốn
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.maxBooksPerDay"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">⏰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Thời hạn mượn sách</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.borrowDuration }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.borrowDuration"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">🕐</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Hạn nhận sách</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.pickupDeadline }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.pickupDeadline"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📅</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Số ngày gia hạn</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.renewalDuration }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.renewalDuration"
                  class="rule-card-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- QUY ĐỊNH MƯỢN SÁCH - GIẢNG VIÊN -->
        <div class="rule-section rule-section--lecturer">
          <div class="rule-section-header">
            <h3 class="rule-section-title">
              👨‍🏫 Quy định mượn sách - Giảng Viên
            </h3>
            <span class="rule-section-badge">Ưu đãi đặc biệt</span>
          </div>

          <div class="rule-grid">
            <div class="rule-card">
              <div class="rule-card-icon">📚</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Số sách được mượn tối đa</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.maxBooksLecturer }} cuốn
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.maxBooksLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📚</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Số sách được mượn/ngày</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.maxBooksPerDayLecturer }} cuốn
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.maxBooksPerDayLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">⏰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Thời hạn mượn sách</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.borrowDurationLecturer }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.borrowDurationLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">🕐</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Hạn nhận sách</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.pickupDeadlineLecturer }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.pickupDeadlineLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📅</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Số ngày gia hạn</label>
                <div class="rule-card-value" v-if="!isEditingBorrow">
                  {{ borrowRules.renewalDurationLecturer }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="borrowRules.renewalDurationLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Nút Hành Động cho Quy Định Mượn -->
        <div class="rule-actions">
          <button
            v-if="!isEditingBorrow"
            class="btn-edit"
            @click="isEditingBorrow = true"
          >
            ✏️ Chỉnh sửa quy định mượn sách
          </button>
          <div v-else class="rule-actions-group">
            <button class="btn-save" @click="saveBorrowRules">
              💾 Lưu thay đổi
            </button>
            <button class="btn-cancel" @click="cancelEditBorrowRules">
              ❌ Hủy bỏ
            </button>
          </div>
        </div>

        <h2 class="penalty-title" style="margin-top: 50px">
          ⚙️ Quy định phạt sách
        </h2>

        <!-- CÔNG THỨC TÍNH PHÍ -->
        <div class="penalty-formula-section">
          <h3 class="penalty-formula-title">📋 Công thức tính phí</h3>

          <div class="formula-grid">
            <!-- Công thức Mất sách -->
            <div class="formula-card">
              <div class="formula-card-header">
                <span class="formula-icon">📕</span>
                <h4 class="formula-card-title">Mất sách</h4>
              </div>
              <div class="formula-card-body">
                <div class="formula-expression">
                  <span class="formula-label">Phí bồi thường =</span>
                  <div class="formula-calc">
                    (Giá sách × Hệ số mất sách) + Phụ phí quản lý
                  </div>
                </div>
              </div>
            </div>

            <!-- Công thức Hư sách -->
            <div class="formula-card">
              <div class="formula-card-header">
                <span class="formula-icon">📙</span>
                <h4 class="formula-card-title">Hư sách</h4>
              </div>
              <div class="formula-card-body">
                <div class="formula-sub-item">
                  <span class="formula-sub-label">• Hư nhẹ:</span>
                  <div class="formula-expression">
                    <span class="formula-label">Phí bồi thường =</span>
                    <div class="formula-calc">Hệ số bồi thường × Giá sách</div>
                  </div>
                </div>
                <div class="formula-sub-item">
                  <span class="formula-sub-label">• Hư nặng:</span>
                  <div class="formula-note">Tính như mất sách</div>
                </div>
              </div>
            </div>

            <!-- Công thức Quá hạn -->
            <div class="formula-card">
              <div class="formula-card-header">
                <span class="formula-icon">💰</span>
                <h4 class="formula-card-title">Quá hạn</h4>
              </div>
              <div class="formula-card-body">
                <div class="formula-expression">
                  <span class="formula-label">Phí quá hạn =</span>
                  <div class="formula-calc">
                    Mức phạt mỗi ngày trễ × Số ngày trễ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- QUY ĐỊNH XỬ PHẠT - SINH VIÊN -->
        <div
          class="rule-section rule-section--student"
          style="margin-top: 3rem"
        >
          <div class="rule-section-header">
            <h3 class="rule-section-title">👨‍🎓 Quy định xử phạt - Sinh Viên</h3>
          </div>

          <div class="rule-grid">
            <div class="rule-card">
              <div class="rule-card-icon">📕</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Hệ số mất sách</label>
                <div class="rule-card-value" v-if="!isEditing">
                  {{ penaltyRules.coefLost }}
                </div>
                <input
                  v-else
                  type="number"
                  step="0.1"
                  v-model.number="penaltyRules.coefLost"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phụ phí quản lý</label>
                <div class="rule-card-value" v-if="!isEditing">
                  {{ penaltyRules.feeManage.toLocaleString('vi-VN') }}đ
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="penaltyRules.feeManage"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📙</div>
              <div class="rule-card-content">
                <label class="rule-card-label"
                  >Hệ số bồi thường hư sách nhẹ</label
                >
                <div class="rule-card-value" v-if="!isEditing">
                  {{ penaltyRules.coefDamageLight }}%
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="penaltyRules.coefDamageLight"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phí quá hạn/ngày</label>
                <div class="rule-card-value" v-if="!isEditing">
                  {{ penaltyRules.feeLate.toLocaleString('vi-VN') }}đ
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="penaltyRules.feeLate"
                  class="rule-card-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- QUY ĐỊNH XỬ PHẠT - GIẢNG VIÊN -->
        <div class="rule-section rule-section--lecturer">
          <div class="rule-section-header">
            <h3 class="rule-section-title">👨‍🏫 Quy định xử phạt - Giảng Viên</h3>
            <span class="rule-section-badge">Ưu đãi đặc biệt</span>
          </div>

          <div class="rule-grid">
            <div class="rule-card">
              <div class="rule-card-icon">📕</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Hệ số mất sách</label>
                <div class="rule-card-value" v-if="!isEditing">
                  {{ penaltyRules.coefLostLecturer }}
                </div>
                <input
                  v-else
                  type="number"
                  step="0.1"
                  v-model.number="penaltyRules.coefLostLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phụ phí quản lý</label>
                <div class="rule-card-value" v-if="!isEditing">
                  {{ penaltyRules.feeManageLecturer.toLocaleString('vi-VN') }}đ
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="penaltyRules.feeManageLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📙</div>
              <div class="rule-card-content">
                <label class="rule-card-label"
                  >Hệ số bồi thường hư sách nhẹ</label
                >
                <div class="rule-card-value" v-if="!isEditing">
                  {{ penaltyRules.coefDamageLightLecturer }}%
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="penaltyRules.coefDamageLightLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phí quá hạn/ngày</label>
                <div class="rule-card-value" v-if="!isEditing">
                  <span
                    v-if="penaltyRules.feeLateLecturer === 0"
                    class="free-badge"
                  >
                    Miễn phí
                  </span>
                  <span v-else>
                    {{ penaltyRules.feeLateLecturer.toLocaleString('vi-VN') }}đ
                  </span>
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="penaltyRules.feeLateLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Nút Hành Động cho Quy Định Phạt -->
        <div class="rule-actions">
          <button v-if="!isEditing" class="btn-edit" @click="isEditing = true">
            ✏️ Chỉnh sửa quy định xử phạt
          </button>
          <div v-else class="rule-actions-group">
            <button class="btn-save" @click="savePenaltyRules">
              💾 Lưu thay đổi
            </button>
            <button class="btn-cancel" @click="cancelEditPenaltyRules">
              ❌ Hủy bỏ
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="loading-state"
        style="text-align: center; padding: 50px"
      >
        <p style="font-size: 1.6rem; color: #666">Đang tải quy định...</p>
      </div>
    </div>
  </div>
</template>

<script>
import '../assets/css/managementBorrowBook.css';
import BorrowRequestDetailModal from '../components/BorrowRequestDetailModal.vue';

import { bookService } from '../services/book/book.service';
import { notificationService } from '../services/notification/notification.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'ManagementBorrowBook',
  components: {
    BorrowRequestDetailModal,
  },
  data() {
    return {
      currentTab: this.$route.query.tab || 'require',
      trackBorrowList: [],
      selectedStatus: 'all',
      searchKeyword: '',
      selectedDate: '',
      selectedRow: null,
      selectedItem: null, // ✅ Đổi từ selectedRow thành selectedItem
      showModal: false, // ✅ Đổi từ selectedRow thành selectedItem
      currentPage: 1,
      pageSize: 6,
      currentPageBorrowed: 1,
      showReturnStatusModal: false,
      returnStatusOptions: ['Nguyên vẹn', 'Hư sách', 'Mất sách'],
      selectedReturnStatus: '',
      currentReturnItem: null,
      currentPagePunish: 1,
      penaltyRules: {},
      isEditing: false,
      originalPenaltyRules: null,
      isEditingBorrow: false,
      borrowRules: {},
      originalBorrowRules: null,

      showEditFeeModal: false,
      currentEditFeeItem: null,
      newTotalFee: null,
      editFeeReason: '',
    };
  },

  watch: {
    currentTab(newTab) {
      this.currentPage = 1;
      this.currentPageBorrowed = 1;
      this.currentPagePunish = 1;
      this.selectedStatus = 'all';
      this.selectedDate = '';

      // THÊM - Tắt chế độ edit khi chuyển tab khỏi rules
      if (newTab !== 'rules') {
        this.isEditing = false;
        this.isEditingBorrow = false;
      }

      // THÊM - Cập nhật URL query
      this.$router
        .push({
          query: {
            ...this.$route.query,
            tab: newTab,
          },
        })
        .catch(() => {});
    },
    searchKeyword() {
      if (this.currentTab === 'require') this.currentPage = 1;
      else if (this.currentTab === 'borrowed') this.currentPageBorrowed = 1;
      else if (this.currentTab === 'punish') this.currentPagePunish = 1;
    },
    selectedStatus() {
      if (this.currentTab === 'require') this.currentPage = 1;
      else if (this.currentTab === 'borrowed') this.currentPageBorrowed = 1;
      else if (this.currentTab === 'punish') this.currentPagePunish = 1;
    },
    selectedDate() {
      if (this.currentTab === 'require') this.currentPage = 1;
      else if (this.currentTab === 'borrowed') this.currentPageBorrowed = 1;
      else if (this.currentTab === 'punish') this.currentPagePunish = 1;
    },
  },

  mounted() {
    this.fetchTrackBorrowList();
    this.fetchPenaltyRules();
    this.fetchBorrowRules();
  },

  methods: {
    async fetchTrackBorrowList() {
      try {
        const response = await bookService.getTrackBorrowBook();
        // const result = [];

        // for (const item of response || []) {
        //   let updatedItem = await this.updateOverdueIfNeeded(item);
        //   result.push(updatedItem);
        // }

        this.trackBorrowList = response;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách mượn:', error);
      }
    },

    async approveRequest(id) {
      try {
        await bookService.updateBorrowStatus({
          requestId: id,
          adminId: userState._id,
          status: 'approved',
        });

        await this.fetchTrackBorrowList();
        // ✅ SỬA: Lấy thông tin phiếu mượn
        const item = this.trackBorrowList.find((item) => item._id === id);
        if (item && item.MaDocGia && item.MaDocGia._id) {
          const phieuMuonId = item.MaPhieuMuon?._id || item.MaPhieuMuon;
          const allBooksInSlip = this.trackBorrowList.filter(
            (book) =>
              (book.MaPhieuMuon?._id || book.MaPhieuMuon) === phieuMuonId
          );

          const ngayMuon = new Date(item.NgayMuon).toLocaleDateString('vi-VN');
          const ngayTra = new Date(item.NgayTra).toLocaleDateString('vi-VN');

          // ✅ Tạo danh sách tên sách
          const bookList = allBooksInSlip
            .map((book, index) => `${index + 1}. ${book.MaSach?.TenSach}`)
            .join('\n');

          await notificationService.createNotification({
            DocGia: item.MaDocGia._id,
            TieuDe: 'Đã nhận sách thành công',
            NoiDung: `Bạn đã nhận ${allBooksInSlip.length} cuốn sách.\nNgày mượn: ${ngayMuon}\nHạn trả: ${ngayTra}\n\nDanh sách sách:\n${bookList}`,
            LoaiThongBao: 'success',
          });
        }

        alert('Người mượn đã nhận sách');
        this.fetchTrackBorrowList();
      } catch (err) {
        console.error('Đã xảy ra lỗi:', err);
      }
    },

    async denyRequest(id) {
      try {
        await bookService.updateBorrowStatus({
          requestId: id,
          adminId: userState._id,
          status: 'denied',
        });

        // ✅ SỬA: Lấy thông tin phiếu mượn
        const item = this.trackBorrowList.find((item) => item._id === id);
        if (item && item.MaDocGia && item.MaDocGia._id) {
          const phieuMuonId = item.MaPhieuMuon?._id || item.MaPhieuMuon;
          const allBooksInSlip = this.trackBorrowList.filter(
            (book) =>
              (book.MaPhieuMuon?._id || book.MaPhieuMuon) === phieuMuonId
          );

          // ✅ Tạo danh sách tên sách
          const bookList = allBooksInSlip
            .map((book, index) => `${index + 1}. ${book.MaSach?.TenSach}`)
            .join('\n');

          await notificationService.createNotification({
            DocGia: item.MaDocGia._id,
            TieuDe: 'Yêu cầu mượn sách bị từ chối',
            NoiDung: `Yêu cầu mượn ${allBooksInSlip.length} cuốn sách của bạn đã bị từ chối.\n\nDanh sách sách:\n${bookList}`,
            LoaiThongBao: 'error',
          });
        }

        alert('Đã từ chối sách');
        this.fetchTrackBorrowList();
      } catch (err) {
        console.error('Lỗi từ chối yêu cầu:', err);
      }
    },

    async processRequest(id) {
      try {
        await bookService.updateBorrowStatus({
          requestId: id,
          adminId: userState._id,
          status: 'processing',
        });

        const item = this.trackBorrowList.find((item) => item._id === id);
        if (item && item.MaDocGia && item.MaDocGia._id) {
          const phieuMuonId = item.MaPhieuMuon?._id || item.MaPhieuMuon;
          const allBooksInSlip = this.trackBorrowList.filter(
            (book) =>
              (book.MaPhieuMuon?._id || book.MaPhieuMuon) === phieuMuonId
          );

          // ✅ Tạo danh sách tên sách
          const bookList = allBooksInSlip
            .map((book, index) => `${index + 1}. ${book.MaSach?.TenSach}`)
            .join('\n');

          await notificationService.createNotification({
            DocGia: item.MaDocGia._id,
            TieuDe: 'Yêu cầu mượn sách đã được duyệt',
            NoiDung: `Yêu cầu mượn ${allBooksInSlip.length} cuốn sách của bạn đã được phê duyệt. Vui lòng đến thư viện để nhận sách.\n\nDanh sách sách:\n${bookList}`,
            LoaiThongBao: 'success',
          });
        }

        alert('Đã duyệt sách!');
        this.fetchTrackBorrowList();
      } catch (err) {
        console.error('Đã xảy ra lỗi:', err);
      }
    },

    async updateOverdueIfNeeded(item) {
      const now = new Date();
      const NgayTra = new Date(item.NgayTra);

      if (item.TrangThai === 'approved' && NgayTra < now) {
        try {
          await bookService.updateBorrowStatus({
            requestId: item._id,
            adminId: userState._id,
            status: 'overdue',
          });
          item.TrangThai = 'overdue';
        } catch (err) {
          console.error(`Lỗi cập nhật quá hạn cho ${item._id}:`, err);
        }
      }

      return item;
    },

    async updateOverdueFeeIfNeeded(item) {
      const now = new Date();
      const NgayTra = new Date(item.NgayTra);

      if (item.TrangThai === 'overdue' && NgayTra < now) {
        try {
          await bookService.updateOverdueFee({
            requestId: item._id,
          });

          const daysLate = Math.max(
            0,
            Math.floor((now - NgayTra) / (1000 * 60 * 60 * 24))
          );
          item.PhiQuaHan = daysLate * 5000;
        } catch (err) {
          console.error(`Lỗi cập nhật phí quá hạn cho ${item._id}:`, err);
        }
      }

      return item;
    },

    async handleExtendBorrow(item) {
      const confirmExtend = confirm(`Bạn có chắc muốn gia hạn sách này không?`);
      if (!confirmExtend) return;

      try {
        const response = await bookService.extendBorrowTime({
          requestId: item._id,
          adminId: userState._id,
        });

        // Lấy ngày trả mới từ response
        const ngayTraMoi = new Date(response.NgayTra).toLocaleDateString(
          'vi-VN'
        );

        if (item.MaDocGia && item.MaDocGia._id) {
          await notificationService.createNotification({
            DocGia: item.MaDocGia._id,
            TieuDe: 'Gia hạn sách thành công',
            NoiDung: `Sách "${item.MaSach?.TenSach}" đã được gia hạn. Hạn trả mới: ${ngayTraMoi}.`,
            LoaiThongBao: 'info',
          });
        }

        alert(`Đã gia hạn đến ngày ${ngayTraMoi}`);
        this.fetchTrackBorrowList(); // Load lại danh sách mượn
      } catch (error) {
        console.error('Gia hạn thất bại:', error);
        alert(error.message || 'Gia hạn thất bại. Vui lòng thử lại sau.');
      }
    },

    formatDateToYMD(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    handleRowClick(item) {
      this.selectedItem = item; // ✅ Sử dụng selectedItem thay vì selectedRow
      this.showModal = true; // ✅ Sử dụng showModal thay vì showDetailModal
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    goToPageBorrowed(page) {
      if (page >= 1 && page <= this.totalPagesBorrowed) {
        this.currentPageBorrowed = page;
      }
    },

    openReturnStatusModal(item) {
      this.currentReturnItem = item; // ✅ lưu item đang thao tác
      this.selectedReturnStatus = ''; // reset lựa chọn
      this.showReturnStatusModal = true; // mở modal
    },

    async markAsReturned(id) {
      try {
        await bookService.updateBorrowStatus({
          requestId: id,
          adminId: userState._id,
          status: 'returned',
        });
        this.fetchTrackBorrowList(); // Refresh lại danh sách
      } catch (err) {
        console.error('Lỗi đánh dấu đã trả:', err);
      }
    },

    async confirmReturnStatus() {
      if (!this.selectedReturnStatus) return;

      try {
        const res = await bookService.updateReturnStatus({
          requestId: this.currentReturnItem._id,
          adminId: userState._id,
          status: 'returned',
          bookCondition: this.selectedReturnStatus, // ✅ gửi trạng thái trả sách
        });

        this.showReturnStatusModal = false;
        this.fetchTrackBorrowList(); // ✅ refresh danh sách

        alert(`Đã trả sách với trạng thái: ${this.selectedReturnStatus}`);

        if (res?.PhiBoiThuong > 0 || res?.PhiQuaHan > 0) {
          this.currentTab = 'punish';
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái trả:', err);
        alert('Cập nhật thất bại, vui lòng thử lại.');
      }
    },

    goToPagePunish(page) {
      if (page >= 1 && page <= this.totalPagesPunish) {
        this.currentPagePunish = page;
      }
    },

    async confirmPaid(id) {
      try {
        await bookService.confirmPaidCompensation({ requestId: id });
        alert('Đã xác nhận thanh toán!');
        this.fetchTrackBorrowList();
      } catch (err) {
        console.error('Lỗi khi xác nhận thanh toán:', err);
        alert('Xác nhận thất bại, vui lòng thử lại!');
      }
    },

    async fetchPenaltyRules() {
      try {
        const res = await bookService.getBookPenaltyRule();
        if (res) {
          this.penaltyRules = {
            coefLost: res.coefLost,
            feeManage: res.feeManage,
            coefDamageLight: res.coefDamageLight,
            feeLate: res.feeLate,
            coefLostLecturer: res.coefLostLecturer,
            feeManageLecturer: res.feeManageLecturer,
            coefDamageLightLecturer: res.coefDamageLightLecturer,
            feeLateLecturer: res.feeLateLecturer,
          };
          this.originalPenaltyRules = { ...this.penaltyRules };
        }
      } catch (err) {
        console.error('Lỗi khi lấy quy định phạt:', err);
      }
    },

    async savePenaltyRules() {
      // ✅ Nếu chưa có dữ liệu gốc thì không cho lưu
      if (!this.originalPenaltyRules) {
        alert('Dữ liệu gốc chưa sẵn sàng, vui lòng thử lại!');
        return;
      }

      // ✅ So sánh thay đổi
      const isChanged = Object.keys(this.penaltyRules).some(
        (key) => this.penaltyRules[key] !== this.originalPenaltyRules[key]
      );

      if (!isChanged) {
        alert('Không có thay đổi nào được thực hiện.');
        return;
      }

      try {
        const res = await bookService.updateBookPenaltyRule({
          coefLost: this.penaltyRules.coefLost,
          feeManage: this.penaltyRules.feeManage,
          coefDamageLight: this.penaltyRules.coefDamageLight,
          feeLate: this.penaltyRules.feeLate,
          coefLostLecturer: this.penaltyRules.coefLostLecturer,
          feeManageLecturer: this.penaltyRules.feeManageLecturer,
          coefDamageLightLecturer: this.penaltyRules.coefDamageLightLecturer,
          feeLateLecturer: this.penaltyRules.feeLateLecturer,
        });

        this.penaltyRules = {
          coefLost: res.coefLost,
          feeManage: res.feeManage,
          coefDamageLight: res.coefDamageLight,
          feeLate: res.feeLate,
          coefLostLecturer: res.coefLostLecturer,
          feeManageLecturer: res.feeManageLecturer,
          coefDamageLightLecturer: res.coefDamageLightLecturer,
          feeLateLecturer: res.feeLateLecturer,
        };
        this.originalPenaltyRules = { ...this.penaltyRules }; // ✅ cập nhật lại bản gốc

        this.isEditing = false;
        alert('Cập nhật quy định phạt thành công!');
      } catch (err) {
        console.error('Lỗi khi lưu quy định phạt:', err);
        alert('Cập nhật thất bại!');
      }
    },

    async fetchBorrowRules() {
      try {
        const res = await bookService.getBookBorrowRule();
        if (res) {
          this.borrowRules = {
            maxBooks: res.maxBooks,
            maxBooksPerDay: res.maxBooksPerDay,
            borrowDuration: res.borrowDuration,
            pickupDeadline: res.pickupDeadline,
            renewalDuration: res.renewalDuration,
            maxBooksLecturer: res.maxBooksLecturer,
            maxBooksPerDayLecturer: res.maxBooksPerDayLecturer,
            borrowDurationLecturer: res.borrowDurationLecturer,
            pickupDeadlineLecturer: res.pickupDeadlineLecturer,
            renewalDurationLecturer: res.renewalDurationLecturer,
          };
          this.originalBorrowRules = { ...this.borrowRules }; // ✅ lưu bản gốc
        }
      } catch (err) {
        console.error('Lỗi khi lấy quy định mượn sách:', err);
      }
    },

    async saveBorrowRules() {
      // ✅ Nếu chưa có dữ liệu gốc thì không cho lưu
      if (!this.originalBorrowRules) {
        alert('Dữ liệu gốc chưa sẵn sàng, vui lòng thử lại!');
        return;
      }

      // ✅ So sánh thay đổi
      const isChanged = Object.keys(this.borrowRules).some(
        (key) => this.borrowRules[key] !== this.originalBorrowRules[key]
      );

      if (!isChanged) {
        alert('Không có thay đổi nào được thực hiện.');
        return;
      }

      try {
        const res = await bookService.updateBookBorrowRule({
          maxBooks: this.borrowRules.maxBooks,
          maxBooksPerDay: this.borrowRules.maxBooksPerDay,
          borrowDuration: this.borrowRules.borrowDuration,
          pickupDeadline: this.borrowRules.pickupDeadline,
          renewalDuration: this.borrowRules.renewalDuration,
          maxBooksLecturer: this.borrowRules.maxBooksLecturer,
          maxBooksPerDayLecturer: this.borrowRules.maxBooksPerDayLecturer,
          borrowDurationLecturer: this.borrowRules.borrowDurationLecturer,
          pickupDeadlineLecturer: this.borrowRules.pickupDeadlineLecturer,
          renewalDurationLecturer: this.borrowRules.renewalDurationLecturer,
        });

        this.borrowRules = {
          maxBooks: res.maxBooks,
          maxBooksPerDay: res.maxBooksPerDay,
          borrowDuration: res.borrowDuration,
          pickupDeadline: res.pickupDeadline,
          renewalDuration: res.renewalDuration,
          maxBooksLecturer: res.maxBooksLecturer,
          maxBooksPerDayLecturer: res.maxBooksPerDayLecturer,
          borrowDurationLecturer: res.borrowDurationLecturer,
          pickupDeadlineLecturer: res.pickupDeadlineLecturer,
          renewalDurationLecturer: res.renewalDurationLecturer,
        };
        this.originalBorrowRules = { ...this.borrowRules }; // ✅ cập nhật lại bản gốc

        this.isEditingBorrow = false;
        alert('Cập nhật quy định mượn sách thành công!');
      } catch (err) {
        console.error('Lỗi khi lưu quy định mượn sách:', err);
        alert('Cập nhật thất bại!');
      }
    },

    async markAsRepaired(id) {
      try {
        await bookService.confirmRepaired({ requestId: id });
        alert('Đã xác nhận sách đã được sửa!');
        this.fetchTrackBorrowList();
      } catch (err) {
        console.error('Lỗi khi xác nhận đã sửa:', err);
        alert('Xác nhận thất bại, vui lòng thử lại!');
      }
    },

    cancelEditBorrowRules() {
      this.borrowRules = { ...this.originalBorrowRules };
      this.isEditingBorrow = false;
    },

    cancelEditPenaltyRules() {
      this.penaltyRules = { ...this.originalPenaltyRules };
      this.isEditing = false;
    },

    openEditFeeModal(item) {
      this.currentEditFeeItem = item;
      // Lấy tổng phí hiện tại
      this.newTotalFee = this.calculateTotalFee(item);
      this.editFeeReason = '';
      this.showEditFeeModal = true;
    },

    async confirmEditFee() {
      if (this.newTotalFee === null || this.newTotalFee === undefined) {
        alert('Vui lòng nhập tổng phí mới');
        return;
      }

      if (this.newTotalFee < 0) {
        alert('Tổng phí không hợp lệ');
        return;
      }

      if (!this.editFeeReason.trim()) {
        alert('Vui lòng nhập lý do điều chỉnh');
        return;
      }

      try {
        await bookService.updatePenaltyFee({
          requestId: this.currentEditFeeItem._id,
          adminId: userState._id,
          newTotalFee: this.newTotalFee,
          reason: this.editFeeReason.trim(),
        });

        alert('Điều chỉnh phí thành công!');
        this.showEditFeeModal = false;
        this.fetchTrackBorrowList();
      } catch (err) {
        console.error('Lỗi khi điều chỉnh phí:', err);
        alert(err.message || 'Điều chỉnh phí thất bại!');
      }
    },

    getSlipGroupClass(item, index, list) {
      const currentSlipId = item.MaPhieuMuon?._id || item.MaPhieuMuon;
      const prevSlipId =
        index > 0
          ? list[index - 1].MaPhieuMuon?._id || list[index - 1].MaPhieuMuon
          : null;

      // Nếu khác phiếu với dòng trước đó => bắt đầu nhóm mới
      if (currentSlipId !== prevSlipId) {
        return 'slip-group-start';
      }

      return 'slip-group-continue';
    },

    isFirstInSlipGroup(item, index, list) {
      if (index === 0) return true;
      const currentSlipId = item.MaPhieuMuon?._id || item.MaPhieuMuon;
      const prevSlipId =
        list[index - 1].MaPhieuMuon?._id || list[index - 1].MaPhieuMuon;
      return currentSlipId !== prevSlipId;
    },

    getPhieuMuonStatusText(item) {
      const phieuStatus = item.MaPhieuMuon?.TrangThai || item.TrangThai;

      if (phieuStatus === 'pending') return 'Chờ Duyệt';
      if (phieuStatus === 'processing') return 'Đã Duyệt';
      if (phieuStatus === 'approved') return 'Đã Nhận Sách';
      if (phieuStatus === 'completed') return 'Hoàn Thành';
      if (phieuStatus === 'denied') {
        // Kiểm tra xem có phải quá hạn lấy không
        if (item.NgayDuyet || item.MaPhieuMuon?.NgayDuyet) {
          return 'Quá Hạn Lấy';
        }
        return 'Đã Từ Chối';
      }
      return 'Không xác định';
    },
    getPhieuMuonStatus(item) {
      return item.MaPhieuMuon?.TrangThai || item.TrangThai;
    },
  },

  computed: {
    filteredTrackBorrowList() {
      // ✅ BƯỚC 1: Lọc theo tab và điều kiện
      let filtered = this.trackBorrowList.filter((item) => {
        const keyword = this.searchKeyword.toLowerCase().trim();
        const status = this.selectedStatus;
        const selectedDate = this.selectedDate;

        // Tab punish giữ nguyên logic cũ (không group)
        if (this.currentTab === 'punish') {
          if (!(item.PhiBoiThuong > 0 || item.PhiQuaHan > 0)) return false;

          if (status !== 'all') {
            if (status === 'paid' && !item.DaThanhToan) return false;
            if (status === 'unpaid' && item.DaThanhToan) return false;
            if (
              status === 'repaired' &&
              (!item.DaSua || item.TinhTrangSach !== 'Hư sách')
            )
              return false;
            if (
              status === 'not-repaired' &&
              (item.DaSua || item.TinhTrangSach !== 'Hư sách')
            )
              return false;
          }

          if (keyword) {
            const hoTen = `${item.MaDocGia?.HoLot || ''} ${
              item.MaDocGia?.Ten || ''
            }`.toLowerCase();
            const maDocGia = item.MaDocGia?.MaDocGia?.toLowerCase() || '';
            const tenSach = item.MaSach?.TenSach?.toLowerCase() || '';
            const maPhieu = (item.MaPhieuMuon?._id || item.MaPhieuMuon || '') // ✅ THÊM DÒNG NÀY
              .slice(-6)
              .toUpperCase();

            const matched =
              hoTen.includes(keyword) ||
              maDocGia.includes(keyword) ||
              tenSach.includes(keyword) ||
              maPhieu.includes(keyword.toUpperCase()); // ✅ THÊM DÒNG NÀY

            if (!matched) return false;
          }

          if (selectedDate) {
            const targetDate = new Date(item.NgayTra);
            const formattedTarget = this.formatDateToYMD(targetDate);
            if (formattedTarget !== selectedDate) return false;
          }

          return true;
        }

        // ✅ SỬA: Tab require - lọc theo trạng thái PhieuMuon
        if (this.currentTab === 'require') {
          const phieuMuonStatus = item.MaPhieuMuon?.TrangThai;
          const validPhieuStatuses = [
            'pending',
            'processing',
            'approved',
            'denied',
            'completed',
          ];

          if (!validPhieuStatuses.includes(phieuMuonStatus)) return false;

          if (status !== 'all' && phieuMuonStatus !== status) return false;

          if (keyword) {
            const hoTen = `${item.MaDocGia?.HoLot || ''} ${
              item.MaDocGia?.Ten || ''
            }`.toLowerCase();
            const maDocGia = item.MaDocGia?.MaDocGia?.toLowerCase() || '';
            const tenSach = item.MaSach?.TenSach?.toLowerCase() || '';
            const maPhieu = (item.MaPhieuMuon?._id || item.MaPhieuMuon || '') // ✅ THÊM DÒNG NÀY
              .slice(-6)
              .toUpperCase();

            const matched =
              hoTen.includes(keyword) ||
              maDocGia.includes(keyword) ||
              tenSach.includes(keyword) ||
              maPhieu.includes(keyword.toUpperCase()); // ✅ THÊM DÒNG NÀY

            if (!matched) return false;
          }

          if (selectedDate) {
            const targetDate = new Date(item.MaPhieuMuon?.NgayTao);
            const formattedTarget = this.formatDateToYMD(targetDate);
            if (formattedTarget !== selectedDate) return false;
          }

          return true;
        }

        // Tab borrowed - GIỮ NGUYÊN logic cũ
        if (this.currentTab === 'borrowed') {
          const validStatusList = ['approved', 'overdue', 'returned'];

          if (!validStatusList.includes(item.TrangThai)) return false;

          if (status !== 'all' && item.TrangThai !== status) return false;

          if (keyword) {
            const hoTen = `${item.MaDocGia?.HoLot || ''} ${
              item.MaDocGia?.Ten || ''
            }`.toLowerCase();
            const maDocGia = item.MaDocGia?.MaDocGia?.toLowerCase() || '';
            const tenSach = item.MaSach?.TenSach?.toLowerCase() || '';
            const maPhieu = (item.MaPhieuMuon?._id || item.MaPhieuMuon || '') // ✅ THÊM DÒNG NÀY
              .slice(-6)
              .toUpperCase();

            const matched =
              hoTen.includes(keyword) ||
              maDocGia.includes(keyword) ||
              tenSach.includes(keyword) ||
              maPhieu.includes(keyword.toUpperCase()); // ✅ THÊM DÒNG NÀY

            if (!matched) return false;
          }

          if (selectedDate) {
            const targetDate = new Date(item.NgayMuon);
            const formattedTarget = this.formatDateToYMD(targetDate);
            if (formattedTarget !== selectedDate) return false;
          }

          return true;
        }

        return false;
      });

      // ✅ BƯỚC 2: Nếu là tab "require", group theo MaPhieuMuon
      if (this.currentTab === 'require') {
        const grouped = {};

        filtered.forEach((item) => {
          const phieuMuonId = item.MaPhieuMuon?._id || item.MaPhieuMuon;

          if (!grouped[phieuMuonId]) {
            grouped[phieuMuonId] = {
              ...item,
              _isGroup: true, // Đánh dấu đây là nhóm
              _books: [item], // Lưu danh sách sách trong phiếu
              _totalBooks: 1,
            };
          } else {
            grouped[phieuMuonId]._books.push(item);
            grouped[phieuMuonId]._totalBooks++;
          }
        });

        return Object.values(grouped);
      }

      // ✅ BƯỚC 3: Tab borrowed và punish giữ nguyên (không group)
      return filtered;
    },

    paginatedTrackBorrowList() {
      if (this.currentTab === 'require') {
        const sorted = [...this.filteredTrackBorrowList].sort((a, b) => {
          // ✅ Lấy trạng thái từ MaPhieuMuon, không phải từ item
          const statusA = a.MaPhieuMuon?.TrangThai || a.TrangThai;
          const statusB = b.MaPhieuMuon?.TrangThai || b.TrangThai;

          const order = {
            pending: 1,
            processing: 2,
            approved: 3,
            completed: 4,
            denied: 5,
          };

          // Nếu cùng trạng thái thì sort theo thời gian tạo mới nhất lên trước
          if (order[statusA] === order[statusB]) {
            return (
              new Date(b.MaPhieuMuon?.NgayTao) -
              new Date(a.MaPhieuMuon?.NgayTao)
            );
          }

          return order[statusA] - order[statusB];
        });

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return sorted.slice(start, end);
      }

      // ✅ Các tab khác giữ nguyên logic cũ
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTrackBorrowList.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredTrackBorrowList.length / this.pageSize);
    },

    paginatedBorrowedList() {
      if (this.currentTab !== 'borrowed') return [];

      const sorted = [...this.filteredTrackBorrowList].sort((a, b) => {
        // ✅ BƯỚC 1: Ưu tiên theo trạng thái trước (Đang mượn > Quá hạn > Đã trả)
        const order = {
          approved: 1, // Đang mượn
          overdue: 2, // Quá hạn
          returned: 3, // Đã trả
        };

        if (order[a.TrangThai] !== order[b.TrangThai]) {
          return order[a.TrangThai] - order[b.TrangThai];
        }

        // ✅ BƯỚC 2: Nếu cùng trạng thái, sort theo MaPhieuMuon
        const phieuA = a.MaPhieuMuon?._id || a.MaPhieuMuon;
        const phieuB = b.MaPhieuMuon?._id || b.MaPhieuMuon;

        if (phieuA !== phieuB) {
          return phieuB.localeCompare(phieuA); // Phiếu mới nhất lên trước
        }

        // ✅ BƯỚC 3: Nếu cùng phiếu, sort theo NgayMuon
        return new Date(b.NgayMuon) - new Date(a.NgayMuon);
      });

      const start = (this.currentPageBorrowed - 1) * this.pageSize;
      const end = start + this.pageSize;
      return sorted.slice(start, end);
    },

    // total pages for borrowed tab
    totalPagesBorrowed() {
      if (this.currentTab !== 'borrowed') return 1;
      return Math.max(
        1,
        Math.ceil(this.filteredTrackBorrowList.length / this.pageSize)
      );
    },

    statusOptions() {
      if (this.currentTab === 'require') {
        return [
          { value: 'all', text: 'Tất cả trạng thái' },
          { value: 'pending', text: 'Chờ duyệt' },
          { value: 'processing', text: 'Đã duyệt' },
          { value: 'approved', text: 'Đã nhận sách' },
          { value: 'denied', text: 'Từ chối' },
          { value: 'completed', text: 'Hoàn thành' },
        ];
      } else if (this.currentTab === 'borrowed') {
        return [
          { value: 'all', text: 'Tất cả trạng thái' },
          { value: 'approved', text: 'Đang Mượn' },
          { value: 'overdue', text: 'Quá Hạn' },
          { value: 'returned', text: 'Đã Trả' },
        ];
      } else if (this.currentTab === 'punish') {
        return [
          { value: 'all', text: 'Tất cả' },
          { value: 'paid', text: 'Đã Thanh Toán' },
          { value: 'unpaid', text: 'Chưa Thanh Toán' },
          { value: 'repaired', text: 'Đã Sửa' },
          { value: 'not-repaired', text: 'Chưa Sửa' },
        ];
      }
      return [];
    },

    paginatedPunishList() {
      if (this.currentTab !== 'punish') return [];

      const sorted = [...this.filteredTrackBorrowList].sort((a, b) => {
        // ✅ Ưu tiên sort theo MaPhieuMuon trước
        const phieuA = a.MaPhieuMuon?._id || a.MaPhieuMuon;
        const phieuB = b.MaPhieuMuon?._id || b.MaPhieuMuon;

        if (phieuA !== phieuB) {
          return phieuB.localeCompare(phieuA); // Sort theo phiếu mượn
        }

        // Nếu cùng phiếu thì ưu tiên "chưa thanh toán" lên trên
        if (this.selectedStatus === 'not-repaired') {
          if (a.DaThanhToan !== b.DaThanhToan) {
            return a.DaThanhToan ? -1 : 1;
          }
        } else {
          if (a.DaThanhToan !== b.DaThanhToan) {
            return a.DaThanhToan ? 1 : -1;
          }
        }

        // Cùng trạng thái thanh toán thì sort theo ngày
        const dateA = new Date(a.NgayCapNhatTinhTrangSach || 0);
        const dateB = new Date(b.NgayCapNhatTinhTrangSach || 0);
        return dateB - dateA;
      });

      const start = (this.currentPagePunish - 1) * this.pageSize;
      const end = start + this.pageSize;
      return sorted.slice(start, end);
    },

    totalPagesPunish() {
      if (this.currentTab !== 'punish') return 1;
      return Math.max(
        1,
        Math.ceil(this.filteredTrackBorrowList.length / this.pageSize)
      );
    },

    calculateTotalFee() {
      return (item) => {
        if (item.TongPhiDaSua !== null && item.TongPhiDaSua !== undefined) {
          return item.TongPhiDaSua;
        }
        return (item.PhiQuaHan || 0) + (item.PhiBoiThuong || 0);
      };
    },

    displayTotalFee: {
      get() {
        return this.newTotalFee ? Math.round(this.newTotalFee) : null;
      },
      set(value) {
        this.newTotalFee = value ? Math.round(parseFloat(value)) : null;
      },
    },
  },
};
</script>
