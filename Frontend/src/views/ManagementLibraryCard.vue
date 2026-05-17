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

          <!-- Options cho tab renew -->
          <option value="expired" v-if="currentTab === 'renew'">Hết hạn</option>
          <option value="renewed" v-if="currentTab === 'renew'">
            Đã Gia Hạn
          </option>

          <!-- Options cho tab reissue -->
          <option value="pending" v-if="currentTab === 'reissue'">
            Chờ Duyệt
          </option>
          <option value="approved" v-if="currentTab === 'reissue'">
            Đã Duyệt
          </option>
          <option value="printed" v-if="currentTab === 'reissue'">Đã In</option>
          <option value="denied" v-if="currentTab === 'reissue'">
            Đã Từ Chối
          </option>

          <!-- Options cho tab list -->
          <option value="active" v-if="currentTab === 'list'">Hoạt động</option>
          <option value="expired" v-if="currentTab === 'list'">Hết hạn</option>
          <option value="locked" v-if="currentTab === 'list'">Khóa thẻ</option>
        </select>
      </div>
    </div>

    <!-- Thay đổi tên các tab -->
    <div class="borrow-book__tabs">
      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'list' }"
        @click="currentTab = 'list'"
      >
        Danh Sách Thẻ Thư Viện
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'renew' }"
        @click="currentTab = 'renew'"
      >
        Danh Sách Cần Gia Hạn
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'reissue' }"
        @click="currentTab = 'reissue'"
      >
        Danh Sách Làm Lại Thẻ
      </div>

      <div
        class="borrow-book__tab"
        :class="{ active: currentTab === 'rules' }"
        @click="currentTab = 'rules'"
      >
        Quy định
      </div>
    </div>

    <!-- Bảng Thẻ Hết Hạn -->
    <table
      class="management-table mt-4 table w-100"
      v-if="currentTab === 'renew'"
    >
      <thead>
        <tr>
          <th class="management-table__header">Mã Thẻ</th>
          <th class="management-table__header">Mã Định Danh</th>
          <th class="management-table__header">Họ Tên</th>
          <th class="management-table__header">Ngày Cấp</th>
          <th class="management-table__header">Ngày Hết Hạn</th>
          <th class="management-table__header">Phí Gia Hạn</th>
          <th class="management-table__header">Trạng Thái</th>
          <th class="management-table__header">Thao Tác</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in paginatedCardList"
          :key="item.id"
          @click="handleRowClick(item)"
        >
          <td class="management-table__content">{{ item.cardInfo.MaThe }}</td>
          <td class="management-table__content">
            {{
              item.studentInfo?.MaSinhVien || item.studentInfo?.MaCanBo || '-'
            }}
          </td>
          <td class="management-table__content text-ellipsis--md">
            {{ item.cardInfo.DocGia.HoLot }} {{ item.cardInfo.DocGia.Ten }}
          </td>
          <td class="management-table__content">
            {{ formatDate(item.cardInfo.NgayCap) }}
          </td>
          <td class="management-table__content">
            {{ formatDate(item.cardInfo.NgayHetHan) }}
          </td>
          <td class="management-table__content">
            {{
              item.extendHistory.length
                ? item.extendHistory[
                    item.extendHistory.length - 1
                  ].PhiGiaHan.toLocaleString('vi-VN') + 'đ'
                : '-'
            }}
          </td>
          <td class="management-table__content">
            <div
              class="status-badge"
              :class="{
                'status-badge--expired': item.cardInfo.TrangThai === 'Hết hạn',
                'status-badge--denied': item.cardInfo.TrangThai === 'Khóa thẻ',
                'status-badge--active': item.cardInfo.TrangThai === 'Hoạt động',
              }"
            >
              {{
                item.cardInfo.TrangThai === 'Hoạt động'
                  ? 'Đã Gia Hạn'
                  : item.cardInfo.TrangThai
              }}
            </div>
          </td>
          <td class="management-table__content">
            <button
              type="button"
              class="action-btn action-btn--approve"
              :disabled="item.cardInfo.TrangThai === 'Hoạt động'"
              @click.stop="renewCard(item.cardInfo._id)"
            >
              Gia hạn
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div
      class="management-pagination"
      v-if="currentTab === 'renew' && paginatedCardList.length > 0"
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

    <!-- Modal Chi Tiết -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showModal && currentTab === 'renew'"
        tabindex="-1"
        @click="showModal = false"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết thẻ thư viện</h5>
              <button
                type="button"
                class="btn-close"
                @click="showModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body__details">
                <div class="modal-body__image">
                  <img
                    :src="
                      selectedItem?.studentInfo?.Avatar ||
                      '/image/avatar_comment.png'
                    "
                    alt="Avatar"
                  />
                </div>

                <div class="modal-body__info">
                  <p>
                    <strong>Mã thẻ:</strong> {{ selectedItem?.cardInfo.MaThe }}
                  </p>
                  <p v-if="selectedItem?.studentInfo?.MaSinhVien">
                    <strong>Mã sinh viên:</strong>
                    {{ selectedItem?.studentInfo?.MaSinhVien }}
                  </p>
                  <p v-else-if="selectedItem?.studentInfo?.MaCanBo">
                    <strong>Mã cán bộ:</strong>
                    {{ selectedItem?.studentInfo?.MaCanBo }}
                  </p>
                  <p>
                    <strong>Họ tên:</strong>
                    {{ selectedItem?.cardInfo.DocGia.HoLot }}
                    {{ selectedItem?.cardInfo.DocGia.Ten }}
                  </p>
                  <p>
                    <strong>Ngày cấp:</strong>
                    {{ formatDate(selectedItem?.cardInfo.NgayCap) }}
                  </p>
                  <p>
                    <strong>Ngày hết hạn:</strong>
                    {{ formatDate(selectedItem?.cardInfo.NgayHetHan) }}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>
                    {{ selectedItem?.cardInfo.TrangThai }}
                  </p>
                  <p><strong>Lịch sử gia hạn:</strong></p>
                  <ul class="">
                    <li
                      v-for="(
                        extend, index
                      ) in selectedItem?.extendHistory.filter(
                        (e) => e.NgayGiaHan
                      )"
                      :key="index"
                    >
                      Lần {{ index + 1 }}: {{ formatDate(extend.NgayGiaHan) }} -
                      {{ extend.PhiGiaHan.toLocaleString('vi-VN') }}đ
                    </li>
                    <li
                      v-if="
                        !selectedItem?.extendHistory ||
                        selectedItem.extendHistory.filter((e) => e.NgayGiaHan)
                          .length === 0
                      "
                    >
                      Chưa gia hạn lần nào
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bảng Thẻ Làm Lại -->
    <table
      class="management-table mt-4 table w-100"
      v-if="currentTab === 'reissue'"
    >
      <thead>
        <tr>
          <th class="management-table__header">Mã Thẻ</th>
          <th class="management-table__header">Mã Định Danh</th>
          <th class="management-table__header">Họ Tên</th>
          <th class="management-table__header">Ngày Yêu Cầu</th>
          <th class="management-table__header">Ngày Duyệt</th>
          <th class="management-table__header">Ngày In</th>
          <th class="management-table__header">Phí In Thẻ</th>
          <th class="management-table__header">Trạng Thái</th>
          <th class="management-table__header">Thao Tác</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in paginatedReissueList"
          :key="index"
          @click="handleRowClick(item)"
        >
          <td class="management-table__content">{{ item.cardInfo.MaThe }}</td>
          <td class="management-table__content">
            {{
              item.studentInfo?.MaSinhVien || item.studentInfo?.MaCanBo || '-'
            }}
          </td>
          <td class="management-table__content">
            {{ item.cardInfo.DocGia.HoLot }} {{ item.cardInfo.DocGia.Ten }}
          </td>
          <td class="management-table__content">
            {{
              formatDate(
                item.reissueHistory[item.reissueHistory.length - 1]?.NgayYeuCau
              )
            }}
          </td>
          <td class="management-table__content">
            {{
              item.reissueHistory[item.reissueHistory.length - 1]?.NgayDuyet
                ? formatDate(
                    item.reissueHistory[item.reissueHistory.length - 1]
                      ?.NgayDuyet
                  )
                : '--'
            }}
          </td>

          <td class="management-table__content">
            {{
              item.reissueHistory[item.reissueHistory.length - 1]?.NgayCapLai
                ? formatDate(
                    item.reissueHistory[item.reissueHistory.length - 1]
                      ?.NgayCapLai
                  )
                : '--'
            }}
          </td>
          <td class="management-table__content">
            {{
              item.reissueHistory[
                item.reissueHistory.length - 1
              ]?.PhiCapLai.toLocaleString('vi-VN')
            }}đ
          </td>
          <td class="management-table__content">
            <div
              class="status-badge"
              :class="{
                'status-badge--pending':
                  item.reissueHistory[item.reissueHistory.length - 1]
                    ?.TrangThai === 'pending',
                'status-badge--approved':
                  item.reissueHistory[item.reissueHistory.length - 1]
                    ?.TrangThai === 'approve',
                'status-badge--denied':
                  item.reissueHistory[item.reissueHistory.length - 1]
                    ?.TrangThai === 'denied',
                'status-badge--printed':
                  item.reissueHistory[item.reissueHistory.length - 1]
                    ?.TrangThai === 'printed',
              }"
            >
              {{
                item.reissueHistory[item.reissueHistory.length - 1]
                  ?.TrangThai === 'pending'
                  ? 'Chờ duyệt'
                  : item.reissueHistory[item.reissueHistory.length - 1]
                      ?.TrangThai === 'approve'
                  ? 'Đã duyệt'
                  : item.reissueHistory[item.reissueHistory.length - 1]
                      ?.TrangThai === 'denied'
                  ? 'Từ chối'
                  : item.reissueHistory[item.reissueHistory.length - 1]
                      ?.TrangThai === 'printed'
                  ? 'Đã in'
                  : ''
              }}
            </div>
          </td>
          <td class="management-table__content">
            <div
              v-if="
                item.reissueHistory[item.reissueHistory.length - 1]
                  ?.TrangThai === 'pending'
              "
            >
              <button
                class="action-btn action-btn--approve"
                @click.stop="approveReissue(item.cardInfo._id)"
              >
                Duyệt
              </button>
              <button
                class="action-btn action-btn--deny"
                @click.stop="denyReissue(item.cardInfo._id)"
              >
                Từ chối
              </button>
            </div>
            <button
              v-else-if="
                item.reissueHistory[item.reissueHistory.length - 1]
                  ?.TrangThai === 'approve'
              "
              class="action-btn action-btn--print"
              @click.stop="printCard(item.cardInfo._id)"
            >
              In thẻ
            </button>
            <div
              v-else-if="
                item.reissueHistory[item.reissueHistory.length - 1]
                  ?.TrangThai === 'printed'
              "
              class="text-muted"
            >
              Đã In
            </div>
            <div v-else class="text-muted">Đã xử lý</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="management-pagination"
      v-if="currentTab === 'reissue' && paginatedReissueList.length > 0"
    >
      <ul class="pagination">
        <!-- Về trang đầu -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(1)">«</a>
        </li>

        <!-- Trang trước -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage - 1)"
            >‹</a
          >
        </li>

        <!-- Trang hiện tại -->
        <li class="page-item active">
          <a class="page-link" href="#" @click.prevent>{{ currentPage }}</a>
        </li>

        <!-- Trang sau -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage + 1)"
            >›</a
          >
        </li>

        <!-- Về trang cuối -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(totalPages)"
            >»</a
          >
        </li>
      </ul>
    </div>

    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showModal && currentTab === 'reissue'"
        tabindex="-1"
        @click="showModal = false"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết yêu cầu làm lại thẻ</h5>
              <button
                type="button"
                class="btn-close"
                @click="showModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body__details">
                <div class="modal-body__image">
                  <img
                    :src="
                      selectedItem?.studentInfo?.Avatar ||
                      '/image/avatar_comment.png'
                    "
                    alt="Avatar"
                  />
                </div>

                <div class="modal-body__info">
                  <p>
                    <strong>Mã thẻ:</strong> {{ selectedItem?.cardInfo.MaThe }}
                  </p>
                  <p v-if="selectedItem?.studentInfo?.MaSinhVien">
                    <strong>Mã sinh viên:</strong>
                    {{ selectedItem?.studentInfo?.MaSinhVien }}
                  </p>
                  <p v-else-if="selectedItem?.studentInfo?.MaCanBo">
                    <strong>Mã cán bộ:</strong>
                    {{ selectedItem?.studentInfo?.MaCanBo }}
                  </p>
                  <p>
                    <strong>Họ tên:</strong>
                    {{ selectedItem?.cardInfo.DocGia.HoLot }}
                    {{ selectedItem?.cardInfo.DocGia.Ten }}
                  </p>
                  <p>
                    <strong>Ngày yêu cầu:</strong>
                    {{
                      formatDate(
                        selectedItem.reissueHistory[
                          selectedItem.reissueHistory.length - 1
                        ]?.NgayYeuCau
                      )
                    }}
                  </p>
                  <p>
                    <strong>Ngày duyệt:</strong>
                    {{
                      formatDate(
                        selectedItem.reissueHistory[
                          selectedItem.reissueHistory.length - 1
                        ]?.NgayDuyet
                      )
                    }}
                  </p>
                  <p>
                    <strong>Ngày cấp lại:</strong>
                    {{
                      formatDate(
                        selectedItem.reissueHistory[
                          selectedItem.reissueHistory.length - 1
                        ]?.NgayCapLai
                      )
                    }}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>
                    {{
                      selectedItem.reissueHistory[
                        selectedItem.reissueHistory.length - 1
                      ]?.TrangThai === 'pending'
                        ? 'Chờ duyệt'
                        : selectedItem.reissueHistory[
                            selectedItem.reissueHistory.length - 1
                          ]?.TrangThai === 'approve'
                        ? 'Đã duyệt'
                        : selectedItem.reissueHistory[
                            selectedItem.reissueHistory.length - 1
                          ]?.TrangThai === 'denied'
                        ? 'Từ chối'
                        : selectedItem.reissueHistory[
                            selectedItem.reissueHistory.length - 1
                          ]?.TrangThai === 'printed'
                        ? 'Đã in'
                        : '--'
                    }}
                  </p>

                  <p><strong>Lịch sử làm lại thẻ:</strong></p>
                  <ul class="list-unstyled m-0 ms-3">
                    <li
                      v-for="(
                        reissue, index
                      ) in selectedItem?.reissueHistory.filter(
                        (r) => r.NgayCapLai
                      )"
                      :key="index"
                    >
                      <strong>Lần {{ index + 1 }}:</strong>
                      {{ formatDate(reissue.NgayCapLai) }} -
                      {{ reissue.PhiCapLai.toLocaleString('vi-VN') }}đ
                    </li>
                    <li
                      v-if="
                        !selectedItem?.reissueHistory ||
                        selectedItem.reissueHistory.filter((r) => r.NgayCapLai)
                          .length === 0
                      "
                    >
                      Chưa có lịch sử in lại thẻ nào
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="currentTab === 'rules'" class="penalty-rules">
      <div v-if="libraryCardRules.renewalFee !== undefined">
        <h2 class="penalty-title">⚙️ Quy định thẻ thư viện</h2>

        <!-- Quy định cho SINH VIÊN -->
        <div class="rule-section rule-section--student">
          <div class="rule-section-header">
            <h3 class="rule-section-title">👨‍🎓 Quy định cho Sinh Viên</h3>
          </div>

          <div class="rule-grid">
            <div class="rule-card">
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phí gia hạn thẻ</label>
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  {{ libraryCardRules.renewalFee.toLocaleString('vi-VN') }}đ
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.renewalFee"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phí làm lại thẻ</label>
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  {{ libraryCardRules.reissueFee.toLocaleString('vi-VN') }}đ
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.reissueFee"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">⏰</div>
              <div class="rule-card-content">
                <label class="rule-card-label"
                  >Số ngày chờ người dùng đến in</label
                >
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  {{ libraryCardRules.printWaitingDays }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.printWaitingDays"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📅</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Thời hạn thẻ có hiệu lực</label>
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  {{ libraryCardRules.cardValidityDays }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.cardValidityDays"
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
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phí gia hạn thẻ</label>
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  <span
                    v-if="libraryCardRules.renewalFeeLecturer === 0"
                    class="free-badge"
                  >
                    Miễn phí
                  </span>
                  <span v-else>
                    {{
                      libraryCardRules.renewalFeeLecturer.toLocaleString(
                        'vi-VN'
                      )
                    }}đ
                  </span>
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.renewalFeeLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">💰</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Phí làm lại thẻ</label>
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  {{
                    libraryCardRules.reissueFeeLecturer.toLocaleString('vi-VN')
                  }}đ
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.reissueFeeLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">⏰</div>
              <div class="rule-card-content">
                <label class="rule-card-label"
                  >Số ngày chờ người dùng đến in</label
                >
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  {{ libraryCardRules.printWaitingDaysLecturer }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.printWaitingDaysLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-card-icon">📅</div>
              <div class="rule-card-content">
                <label class="rule-card-label">Thời hạn thẻ có hiệu lực</label>
                <div class="rule-card-value" v-if="!isEditingCardRules">
                  {{ libraryCardRules.cardValidityDaysLecturer }} ngày
                </div>
                <input
                  v-else
                  type="number"
                  v-model.number="libraryCardRules.cardValidityDaysLecturer"
                  class="rule-card-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Nút Hành Động -->
        <div class="rule-actions">
          <button
            v-if="!isEditingCardRules"
            class="btn-edit"
            @click="isEditingCardRules = true"
          >
            ✏️ Chỉnh sửa quy định
          </button>
          <div v-else class="rule-actions-group">
            <button class="btn-save" @click="saveCardRules">
              💾 Lưu thay đổi
            </button>
            <button class="btn-cancel" @click="cancelEditCardRules">
              ❌ Hủy bỏ
            </button>
          </div>
        </div>
      </div>
      <div v-else class="loading-state">Đang tải quy định...</div>
    </div>

    <!-- Tab Danh Sách Thẻ Thư Viện -->
    <div v-if="currentTab === 'list'" class="library-card-list">
      <div class="list-sub-tabs">
        <div
          class="list-sub-tab"
          :class="{ active: listSubTab === 'student' }"
          @click="listSubTab = 'student'"
        >
          📚 Thẻ Sinh Viên
        </div>
        <div
          class="list-sub-tab"
          :class="{ active: listSubTab === 'lecturer' }"
          @click="listSubTab = 'lecturer'"
        >
          👨‍🏫 Thẻ Giảng Viên
        </div>
      </div>

      <!-- Header với nút Upload -->
      <div class="card-list-header">
        <div class="upload-section">
          <button class="btn-upload" @click="showUploadModal = true">
            📤 Tạo thẻ thư viện
          </button>
          <span class="upload-hint" v-if="uploadedFileName">
            {{ uploadedFileName }}
          </span>
        </div>
        <div class="total-cards">
          Tổng số thẻ: <strong>{{ filteredAllCardsList.length }}</strong>
        </div>
      </div>

      <!-- Bảng danh sách thẻ SINH VIÊN -->
      <table
        class="management-table mt-4 table w-100"
        v-if="listSubTab === 'student'"
      >
        <thead>
          <tr>
            <th class="management-table__header">STT</th>
            <th class="management-table__header">Mã Thẻ</th>
            <th class="management-table__header">Mã Sinh Viên</th>
            <th class="management-table__header">Họ Tên</th>
            <th class="management-table__header">Ngày Cấp</th>
            <th class="management-table__header">Ngày Hết Hạn</th>
            <th class="management-table__header">Trạng Thái</th>
            <th class="management-table__header">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedAllCardsList"
            :key="item._id"
            @click="handleRowClickList(item)"
          >
            <td class="management-table__content">
              {{ (currentPage - 1) * pageSize + index + 1 }}
            </td>
            <td class="management-table__content">{{ item.MaThe }}</td>
            <td class="management-table__content">
              {{ item.additionalInfo?.MaSinhVien || '-' }}
            </td>
            <td class="management-table__content text-ellipsis--md">
              {{ item.DocGia?.HoLot }} {{ item.DocGia?.Ten }}
            </td>
            <td class="management-table__content">
              {{ formatDate(item.NgayCap) }}
            </td>
            <td class="management-table__content">
              {{ formatDate(item.NgayHetHan) }}
            </td>
            <td class="management-table__content">
              <div
                class="status-badge"
                :class="{
                  'status-badge--active': item.TrangThai === 'Hoạt động',
                  'status-badge--expired': item.TrangThai === 'Hết hạn',
                  'status-badge--denied': item.TrangThai === 'Khóa thẻ',
                }"
              >
                {{ item.TrangThai }}
              </div>
            </td>
            <td class="management-table__content">
              <button
                class="action-btn action-btn--edit"
                @click.stop="openEditModal(item)"
              >
                Sửa
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bảng danh sách thẻ GIẢNG VIÊN -->
      <table
        class="management-table mt-4 table w-100"
        v-if="listSubTab === 'lecturer'"
      >
        <thead>
          <tr>
            <th class="management-table__header">STT</th>
            <th class="management-table__header">Mã Thẻ</th>
            <th class="management-table__header">Mã Cán Bộ</th>
            <th class="management-table__header">Họ Tên</th>
            <th class="management-table__header">Ngày Cấp</th>
            <th class="management-table__header">Ngày Hết Hạn</th>
            <th class="management-table__header">Trạng Thái</th>
            <th class="management-table__header">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedAllCardsList"
            :key="item._id"
            @click="handleRowClickList(item)"
          >
            <td class="management-table__content">
              {{ (currentPage - 1) * pageSize + index + 1 }}
            </td>
            <td class="management-table__content">{{ item.MaThe }}</td>
            <td class="management-table__content">
              {{ item.additionalInfo?.MaCanBo || '-' }}
            </td>
            <td class="management-table__content text-ellipsis--md">
              {{ item.DocGia?.HoLot }} {{ item.DocGia?.Ten }}
            </td>
            <td class="management-table__content">
              {{ formatDate(item.NgayCap) }}
            </td>
            <td class="management-table__content">
              {{ formatDate(item.NgayHetHan) }}
            </td>
            <td class="management-table__content">
              <div
                class="status-badge"
                :class="{
                  'status-badge--active': item.TrangThai === 'Hoạt động',
                  'status-badge--expired': item.TrangThai === 'Hết hạn',
                  'status-badge--denied': item.TrangThai === 'Khóa thẻ',
                }"
              >
                {{ item.TrangThai }}
              </div>
            </td>
            <td class="management-table__content">
              <button
                class="action-btn action-btn--edit"
                @click.stop="openEditModal(item)"
              >
                Sửa
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        class="management-pagination"
        v-if="paginatedAllCardsList.length > 0"
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
            <a class="page-link" href="#" @click.prevent="goToPage(totalPages)"
              >»</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- Input file ẩn -->
    <input
      type="file"
      ref="excelFileInput"
      @change="handleFileUpload"
      accept=".xlsx, .xls"
      style="display: none"
    />

    <!-- Modal Upload Excel -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showUploadModal"
        tabindex="-1"
        @click="showUploadModal = false"
      >
        <div class="modal-dialog modal-upload" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chọn loại thẻ thư viện</h5>
              <button
                type="button"
                class="btn-close"
                @click="showUploadModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body modal-body-upload">
              <p class="upload-description">
                Vui lòng chọn loại đối tượng để tạo thẻ thư viện:
              </p>

              <div class="upload-options">
                <div class="upload-option" @click="selectUploadType('student')">
                  <div class="upload-option-icon">👨‍🎓</div>
                  <h4>Sinh Viên</h4>
                  <p>Tạo thẻ thư viện cho sinh viên</p>
                </div>

                <div
                  class="upload-option"
                  @click="selectUploadType('lecturer')"
                >
                  <div class="upload-option-icon">👨‍🏫</div>
                  <h4>Giảng Viên</h4>
                  <p>Tạo thẻ thư viện cho giảng viên</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chi Tiết cho tab List -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showModal && currentTab === 'list'"
        tabindex="-1"
        @click="showModal = false"
      >
        <div class="modal-dialog modal-dialog-list-card" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết thẻ thư viện</h5>
              <button
                type="button"
                class="btn-close"
                @click="showModal = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body__details">
                <div class="modal-body__image">
                  <img
                    :src="
                      selectedItemList?.additionalInfo?.Avatar ||
                      '/image/avatar_comment.png'
                    "
                    alt="Avatar"
                  />
                </div>

                <div class="modal-body__info">
                  <!-- Thông tin chung -->
                  <p><strong>Mã thẻ:</strong> {{ selectedItemList?.MaThe }}</p>

                  <!-- Nếu là Sinh Viên -->
                  <template v-if="selectedItemList?.additionalInfo?.MaSinhVien">
                    <p>
                      <strong>Mã sinh viên:</strong>
                      {{ selectedItemList?.additionalInfo?.MaSinhVien }}
                    </p>
                    <p>
                      <strong>Họ tên:</strong>
                      {{ selectedItemList?.DocGia?.HoLot }}
                      {{ selectedItemList?.DocGia?.Ten }}
                    </p>
                    <p>
                      <strong>Ngày cấp:</strong>
                      {{ formatDate(selectedItemList?.NgayCap) }}
                    </p>
                    <p>
                      <strong>Ngày hết hạn:</strong>
                      {{ formatDate(selectedItemList?.NgayHetHan) }}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>
                      {{ selectedItemList?.TrangThai }}
                    </p>
                    <p>
                      <strong>Đối tượng:</strong>
                      {{ selectedItemList?.DocGia?.DoiTuong }}
                    </p>
                    <p>
                      <strong>Khóa học:</strong>
                      {{
                        selectedItemList?.additionalInfo?.MaNienKhoa
                          ?.TenNienKhoa || '-'
                      }}
                    </p>
                    <p>
                      <strong>Ngành học:</strong>
                      {{
                        selectedItemList?.additionalInfo?.MaNganhHoc
                          ?.TenNganh || '-'
                      }}
                    </p>

                    <p>
                      <strong>Khoa:</strong>
                      {{
                        selectedItemList?.additionalInfo?.MaNganhHoc?.Khoa
                          ?.TenKhoa || '-'
                      }}
                    </p>
                  </template>

                  <!-- Nếu là Giảng Viên -->
                  <template
                    v-else-if="selectedItemList?.additionalInfo?.MaCanBo"
                  >
                    <p>
                      <strong>Mã cán bộ:</strong>
                      {{ selectedItemList?.additionalInfo?.MaCanBo }}
                    </p>
                    <p>
                      <strong>Họ tên:</strong>
                      {{ selectedItemList?.DocGia?.HoLot }}
                      {{ selectedItemList?.DocGia?.Ten }}
                    </p>
                    <p>
                      <strong>Ngày cấp:</strong>
                      {{ formatDate(selectedItemList?.NgayCap) }}
                    </p>
                    <p>
                      <strong>Ngày hết hạn:</strong>
                      {{ formatDate(selectedItemList?.NgayHetHan) }}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>
                      {{ selectedItemList?.TrangThai }}
                    </p>
                    <p>
                      <strong>Đối tượng:</strong>
                      {{ selectedItemList?.DocGia?.DoiTuong }}
                    </p>
                    <p>
                      <strong>Bộ môn:</strong>
                      {{
                        selectedItemList?.additionalInfo?.MaBoMon?.TenBoMon ||
                        '-'
                      }}
                    </p>
                    <p>
                      <strong>Khoa:</strong>
                      {{
                        selectedItemList?.additionalInfo?.MaBoMon?.MaKhoa
                          ?.TenKhoa || '-'
                      }}
                    </p>
                  </template>

                  <!-- Lịch sử gia hạn -->
                  <p><strong>Lịch sử gia hạn:</strong></p>
                  <ul class="">
                    <li
                      v-for="(
                        extend, index
                      ) in selectedItemList?.extendHistory.filter(
                        (e) => e.NgayGiaHan
                      )"
                      :key="index"
                    >
                      Lần {{ index + 1 }}: {{ formatDate(extend.NgayGiaHan) }} -
                      {{ extend.PhiGiaHan.toLocaleString('vi-VN') }}đ
                    </li>
                    <li
                      v-if="
                        !selectedItemList?.extendHistory ||
                        selectedItemList.extendHistory.filter(
                          (e) => e.NgayGiaHan
                        ).length === 0
                      "
                    >
                      Chưa gia hạn lần nào
                    </li>
                  </ul>

                  <!-- Lịch sử in thẻ -->
                  <p><strong>Lịch sử in thẻ:</strong></p>
                  <ul class="">
                    <li
                      v-for="(
                        reissue, index
                      ) in selectedItemList?.reissueHistory.filter(
                        (r) => r.NgayCapLai
                      )"
                      :key="index"
                    >
                      <strong>Lần {{ index + 1 }}:</strong>
                      {{ formatDate(reissue.NgayCapLai) }} -
                      {{ reissue.PhiCapLai.toLocaleString('vi-VN') }}đ
                    </li>
                    <li
                      v-if="
                        !selectedItemList?.reissueHistory ||
                        selectedItemList.reissueHistory.filter(
                          (r) => r.NgayCapLai
                        ).length === 0
                      "
                    >
                      Chưa có lịch sử in lại thẻ nào
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chỉnh Sửa Thẻ -->
    <transition name="modal-fade">
      <div
        class="modal"
        v-if="showEditModal"
        tabindex="-1"
        @click="closeEditModal"
      >
        <div class="modal-dialog modal-edit-card" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chỉnh sửa thông tin thẻ thư viện</h5>
              <button type="button" class="btn-close" @click="closeEditModal">
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="edit-form">
                <!-- Họ lót -->
                <div class="form-group">
                  <label>Họ lót <span class="required">*</span></label>
                  <input
                    type="text"
                    v-model="editForm.HoLot"
                    class="form-control"
                    placeholder="Nhập họ lót"
                  />
                </div>

                <!-- Tên -->
                <div class="form-group">
                  <label>Tên <span class="required">*</span></label>
                  <input
                    type="text"
                    v-model="editForm.Ten"
                    class="form-control"
                    placeholder="Nhập tên"
                  />
                </div>

                <!-- Ngành học (Sinh viên) -->
                <div
                  class="form-group"
                  v-if="editingCard?.additionalInfo?.MaSinhVien"
                >
                  <label>Ngành học <span class="required">*</span></label>
                  <select v-model="editForm.MaNganhHoc" class="form-control">
                    <option value="">-- Chọn ngành học --</option>
                    <option
                      v-for="nganh in nganhHocList"
                      :key="nganh._id"
                      :value="nganh._id"
                    >
                      {{ nganh.TenNganh }} - {{ nganh.Khoa?.TenKhoa }}
                    </option>
                  </select>
                </div>

                <!-- Bộ môn (Giảng viên) -->
                <div
                  class="form-group"
                  v-if="editingCard?.additionalInfo?.MaCanBo"
                >
                  <label>Bộ môn <span class="required">*</span></label>
                  <select v-model="editForm.MaBoMon" class="form-control">
                    <option value="">-- Chọn bộ môn --</option>
                    <option
                      v-for="boMon in boMonList"
                      :key="boMon._id"
                      :value="boMon._id"
                    >
                      {{ boMon.TenBoMon }} - {{ boMon.MaKhoa?.TenKhoa }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-save" @click="saveEditCard">
                💾 Lưu thay đổi
              </button>
              <button class="btn-cancel" @click="closeEditModal">❌ Hủy</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { libraryService } from '../services/library/library.service';
import { notificationService } from '../services/notification/notification.service';

export default {
  name: 'ManagementLibraryCard',
  data() {
    return {
      searchKeyword: '',
      selectedDate: '',
      selectedStatus: 'all',
      showModal: false,
      selectedItem: null,
      currentPage: 1,
      pageSize: 6,
      expiredCardList: [],
      reissueCardList: [],
      libraryCardRules: {},
      isEditingCardRules: false,
      originalLibraryCardRules: null,
      allCardsList: [],
      selectedItemList: null,
      uploadedFileName: '',
      showUploadModal: false,
      uploadType: '',
      currentTab: this.$route.query.tab || 'list',
      listSubTab: this.$route.query.subTab || 'student',

      showEditModal: false,
      editingCard: null,
      editForm: {
        HoLot: '',
        Ten: '',
        MaNganhHoc: '', // cho sinh viên
        MaBoMon: '', // cho giảng viên
      },
      nganhHocList: [], // danh sách ngành học
      boMonList: [], // danh sách bộ môn
    };
  },
  async mounted() {
    const response = await libraryService.getAllInfoExpireCard();
    this.expiredCardList = response;

    const responseReissue = await libraryService.getAllInfoRenewCard();
    this.reissueCardList = responseReissue;

    this.fetchCardRules();
    this.fetchAllCards();

    this.fetchNganhHocList();
    this.fetchBoMonList();
  },
  computed: {
    filteredCardList() {
      let filtered = this.expiredCardList.filter((item) => {
        const keyword = this.searchKeyword.toLowerCase().trim();
        const status = this.selectedStatus;
        const selectedDate = this.selectedDate;

        // Tab renew: chỉ cần hiển thị thẻ Hết hạn hoặc Đã Gia Hạn
        if (this.currentTab === 'renew') {
          if (!['Hết hạn', 'Hoạt động'].includes(item.cardInfo.TrangThai))
            return false;
        } else if (this.currentTab === 'reissue') {
          if (item.cardInfo.TrangThai !== 'Khóa thẻ') return false;
        }

        // Lọc theo status select
        if (status !== 'all') {
          if (status === 'expired' && item.cardInfo.TrangThai !== 'Hết hạn')
            return false;
          if (status === 'renewed' && item.cardInfo.TrangThai !== 'Hoạt động')
            return false;
        }

        // Lọc keyword
        if (keyword) {
          const fullName =
            `${item.cardInfo.DocGia.HoLot} ${item.cardInfo.DocGia.Ten}`.toLowerCase();
          const readerCode = (
            item.studentInfo?.MaSinhVien ||
            item.studentInfo?.MaCanBo ||
            ''
          ).toLowerCase();
          const cardCode = item.cardInfo.MaThe.toLowerCase();

          const matched =
            fullName.includes(keyword) ||
            readerCode.includes(keyword) ||
            cardCode.includes(keyword);

          if (!matched) return false;
        }

        // Lọc theo ngày hết hạn
        if (selectedDate) {
          const targetDate = new Date(item.cardInfo.NgayHetHan);
          const formattedTarget = this.formatDateToYMD(targetDate);
          if (formattedTarget !== selectedDate) return false;
        }

        return true;
      });

      // Sắp xếp theo updatedAt (mới nhất lên đầu)
      return filtered.sort((a, b) => {
        // Ưu tiên "Hết hạn" lên trước "Hoạt động"
        if (
          a.cardInfo.TrangThai === 'Hết hạn' &&
          b.cardInfo.TrangThai !== 'Hết hạn'
        ) {
          return -1;
        }
        if (
          a.cardInfo.TrangThai !== 'Hết hạn' &&
          b.cardInfo.TrangThai === 'Hết hạn'
        ) {
          return 1;
        }

        // Nếu cùng trạng thái thì sắp xếp theo updatedAt (mới nhất lên đầu)
        const dateA = new Date(a.cardInfo.updatedAt || 0);
        const dateB = new Date(b.cardInfo.updatedAt || 0);
        return dateB - dateA;
      });
    },

    paginatedCardList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredCardList.slice(start, end);
    },

    filteredReissueList() {
      let filtered = this.reissueCardList.filter((item) => {
        const keyword = this.searchKeyword.toLowerCase().trim();
        const status = this.selectedStatus;
        const selectedDate = this.selectedDate;

        const currentStatus =
          item.reissueHistory[item.reissueHistory.length - 1]?.TrangThai;

        // Lọc theo status
        if (status !== 'all') {
          if (status === 'pending' && currentStatus !== 'pending') return false;
          if (status === 'approved' && currentStatus !== 'approve')
            return false;
          if (status === 'printed' && currentStatus !== 'printed') return false;
          if (status === 'denied' && currentStatus !== 'denied') return false;
        }

        // Lọc keyword
        if (keyword) {
          const fullName =
            `${item.cardInfo.DocGia.HoLot} ${item.cardInfo.DocGia.Ten}`.toLowerCase();
          const readerCode = (
            item.studentInfo?.MaSinhVien ||
            item.studentInfo?.MaCanBo ||
            ''
          ).toLowerCase();
          const cardCode = item.cardInfo.MaThe.toLowerCase();

          const matched =
            fullName.includes(keyword) ||
            readerCode.includes(keyword) ||
            cardCode.includes(keyword);
          if (!matched) return false;
        }

        // Lọc theo ngày yêu cầu
        if (selectedDate) {
          const requestDate = new Date(
            item.reissueHistory[item.reissueHistory.length - 1]?.NgayYeuCau
          );
          const formattedDate = this.formatDateToYMD(requestDate);
          if (formattedDate !== selectedDate) return false;
        }

        return true;
      });

      // Định nghĩa mức độ ưu tiên: Chờ Duyệt > Đã Duyệt > Đã In > Từ Chối
      const statusPriority = {
        pending: 1,
        approve: 2,
        printed: 3,
        denied: 4,
      };

      // Sắp xếp theo ưu tiên trạng thái trước, sau đó theo updatedAt
      return filtered.sort((a, b) => {
        const statusA =
          a.reissueHistory[a.reissueHistory.length - 1]?.TrangThai;
        const statusB =
          b.reissueHistory[b.reissueHistory.length - 1]?.TrangThai;

        const priorityA = statusPriority[statusA] || 99;
        const priorityB = statusPriority[statusB] || 99;

        // Nếu ưu tiên khác nhau thì sắp xếp theo ưu tiên
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Nếu ưu tiên giống nhau thì sắp xếp theo updatedAt (mới nhất lên đầu)
        const dateA = new Date(a.cardInfo.updatedAt || 0);
        const dateB = new Date(b.cardInfo.updatedAt || 0);
        return dateB - dateA;
      });
    },

    paginatedReissueList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredReissueList.slice(start, end);
    },

    totalPages() {
      if (this.currentTab === 'renew') {
        return Math.ceil(this.filteredCardList.length / this.pageSize);
      } else if (this.currentTab === 'reissue') {
        return Math.ceil(this.filteredReissueList.length / this.pageSize);
      } else if (this.currentTab === 'list') {
        return Math.ceil(this.filteredAllCardsList.length / this.pageSize);
      }
      return 1;
    },

    filteredAllCardsList() {
      return this.allCardsList.filter((item) => {
        const keyword = this.searchKeyword.toLowerCase().trim();
        const selectedDate = this.selectedDate;
        const status = this.selectedStatus;

        // Lọc theo loại thẻ (student/lecturer)
        if (this.listSubTab === 'student') {
          if (!item.additionalInfo?.MaSinhVien) return false;
        } else {
          if (!item.additionalInfo?.MaCanBo) return false;
        }

        // Lọc theo trạng thái
        if (status !== 'all') {
          if (status === 'active' && item.TrangThai !== 'Hoạt động')
            return false;
          if (status === 'expired' && item.TrangThai !== 'Hết hạn')
            return false;
          if (status === 'locked' && item.TrangThai !== 'Khóa thẻ')
            return false;
        }

        // Lọc theo keyword
        if (keyword) {
          const fullName =
            `${item.DocGia?.HoLot} ${item.DocGia?.Ten}`.toLowerCase();
          const idCode = (
            item.additionalInfo?.MaSinhVien ||
            item.additionalInfo?.MaCanBo ||
            ''
          ).toLowerCase();
          const cardCode = item.MaThe.toLowerCase();

          const matched =
            fullName.includes(keyword) ||
            idCode.includes(keyword) ||
            cardCode.includes(keyword);
          if (!matched) return false;
        }

        // Lọc theo ngày hết hạn
        if (selectedDate) {
          const targetDate = new Date(item.NgayHetHan);
          const formattedTarget = this.formatDateToYMD(targetDate);
          if (formattedTarget !== selectedDate) return false;
        }

        return true;
      });
    },

    paginatedAllCardsList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredAllCardsList.slice(start, end);
    },
  },

  watch: {
    searchKeyword() {
      this.currentPage = 1;
    },
    selectedStatus() {
      this.currentPage = 1;
    },
    selectedDate() {
      this.currentPage = 1;
    },

    currentTab(newTab) {
      this.currentPage = 1;
      this.selectedStatus = 'all';

      if (newTab !== 'rules') {
        this.isEditingCardRules = false;
      }

      // Cập nhật URL query
      this.$router
        .push({
          query: {
            ...this.$route.query,
            tab: newTab,
          },
        })
        .catch(() => {});
    },

    listSubTab(newSubTab) {
      this.currentPage = 1;

      // Cập nhật URL query
      this.$router
        .push({
          query: {
            ...this.$route.query,
            subTab: newSubTab,
          },
        })
        .catch(() => {});
    },

    filteredAllCardsList() {
      this.currentPage = 1;
    },
  },

  methods: {
    formatDate(dateStr) {
      // if (!dateStr) return '--';
      // const d = new Date(dateStr);
      // const day = String(d.getUTCDate()).padStart(2, '0');
      // const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      // const year = d.getUTCFullYear();
      // return `${day}/${month}/${year}`;
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

    handleRowClick(item) {
      this.selectedItem = item;
      this.showModal = true;
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    async renewCard(id) {
      try {
        const confirmed = confirm('Bạn có chắc muốn gia hạn thẻ này không?');
        if (!confirmed) return;

        // Gọi API renew
        const response = await libraryService.renewLibraryCard({ cardId: id });

        if (response) {
          const refreshed = await libraryService.getAllInfoExpireCard();
          this.expiredCardList = refreshed;
          alert('Đã gia hạn thẻ thành công!');
        } else {
          alert('Gia hạn thất bại, vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Lỗi gia hạn thẻ:', error);
        alert('Gia hạn thất bại, vui lòng thử lại!');
      }
    },

    async blockCard(id) {
      try {
        const confirmed = confirm('Bạn có chắc muốn khóa thẻ này không?');
        if (!confirmed) return;

        // Giả lập API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Cập nhật trạng thái thành "blocked" thay vì xóa
        const cardIndex = this.expiredCardList.findIndex(
          (item) => item.id === id
        );
        if (cardIndex !== -1) {
          this.expiredCardList[cardIndex].status = 'blocked';
        }

        alert('Đã khóa thẻ thành công!');
      } catch (error) {
        console.error('Lỗi khóa thẻ:', error);
        alert('Khóa thẻ thất bại, vui lòng thử lại!');
      }
    },

    async approveReissue(cardId) {
      try {
        const confirmed = confirm(
          'Bạn có chắc muốn duyệt in lại thẻ này không?'
        );
        if (!confirmed) return;
        const response = await libraryService.approveReissueCard({ cardId });

        if (response) {
          // Refresh danh sách
          const refreshed = await libraryService.getAllInfoRenewCard();
          this.reissueCardList = refreshed;

          alert('Đã duyệt yêu cầu in lại thẻ!');
        } else {
          alert('Duyệt thất bại, vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Lỗi duyệt in lại thẻ:', error);
        alert('Duyệt thất bại, vui lòng thử lại!');
      }
    },

    async printCard(cardId) {
      try {
        const confirmed = confirm('Bạn có chắc muốn in thẻ này không?');
        if (!confirmed) return;

        // Gọi API print card
        const response = await libraryService.printCard({ cardId });

        if (response) {
          // Refresh danh sách
          const refreshed = await libraryService.getAllInfoRenewCard();
          this.reissueCardList = refreshed;

          alert('Đã in thẻ thành công!');
        } else {
          alert('In thẻ thất bại, vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Lỗi in thẻ:', error);
        alert('In thẻ thất bại, vui lòng thử lại!');
      }
    },

    async denyReissue(cardId) {
      try {
        const confirmed = confirm(
          'Bạn có chắc muốn từ chối yêu cầu in lại thẻ này không?'
        );
        if (!confirmed) return;

        const response = await libraryService.denyReissueCard({ cardId });

        if (response) {
          const refreshed = await libraryService.getAllInfoRenewCard();
          this.reissueCardList = refreshed;
          alert('Đã từ chối yêu cầu in lại thẻ!');
        } else {
          alert('Từ chối thất bại, vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Lỗi từ chối in lại thẻ:', error);
        alert('Từ chối thất bại, vui lòng thử lại!');
      }
    },

    async fetchCardRules() {
      try {
        const response = await libraryService.getCardRule();
        if (response) {
          this.libraryCardRules = {
            renewalFee: response.renewalFee,
            reissueFee: response.reissueFee,
            printWaitingDays: response.printWaitingDays,
            cardValidityDays: response.cardValidityDays,

            renewalFeeLecturer: response.renewalFeeLecturer,
            reissueFeeLecturer: response.reissueFeeLecturer,
            printWaitingDaysLecturer: response.printWaitingDaysLecturer,
            cardValidityDaysLecturer: response.cardValidityDaysLecturer,
          };
          this.originalLibraryCardRules = { ...this.libraryCardRules };
        }
      } catch (err) {
        console.error('Lỗi khi lấy quy định thẻ thư viện:', err);
      }
    },

    async saveCardRules() {
      if (!this.originalLibraryCardRules) {
        alert('Dữ liệu gốc chưa sẵn sàng, vui lòng thử lại!');
        return;
      }

      const isChanged = Object.keys(this.libraryCardRules).some(
        (key) =>
          this.libraryCardRules[key] !== this.originalLibraryCardRules[key]
      );

      if (!isChanged) {
        alert('Không có thay đổi nào được thực hiện.');
        this.isEditingCardRules = false;
        return;
      }

      try {
        const res = await libraryService.updateCardRule({
          renewalFee: this.libraryCardRules.renewalFee,
          reissueFee: this.libraryCardRules.reissueFee,
          printWaitingDays: this.libraryCardRules.printWaitingDays,
          cardValidityDays: this.libraryCardRules.cardValidityDays,

          renewalFeeLecturer: this.libraryCardRules.renewalFeeLecturer,
          reissueFeeLecturer: this.libraryCardRules.reissueFeeLecturer,
          printWaitingDaysLecturer:
            this.libraryCardRules.printWaitingDaysLecturer,
          cardValidityDaysLecturer:
            this.libraryCardRules.cardValidityDaysLecturer,
        });

        this.libraryCardRules = {
          renewalFee: res.renewalFee,
          reissueFee: res.reissueFee,
          printWaitingDays: res.printWaitingDays,
          cardValidityDays: res.cardValidityDays,

          renewalFeeLecturer: res.renewalFeeLecturer,
          reissueFeeLecturer: res.reissueFeeLecturer,
          printWaitingDaysLecturer: res.printWaitingDaysLecturer,
          cardValidityDaysLecturer: res.cardValidityDaysLecturer,
        };
        this.originalLibraryCardRules = { ...this.libraryCardRules };

        this.isEditingCardRules = false;
        alert('Cập nhật quy định thẻ thư viện thành công!');
      } catch (err) {
        console.error('Lỗi khi lưu quy định thẻ thư viện:', err);
        alert(
          `Cập nhật thất bại!\n\n${
            err.response?.data?.message || err.message || err
          }`
        );
      }
    },

    cancelEditCardRules() {
      this.libraryCardRules = { ...this.originalLibraryCardRules };
      this.isEditingCardRules = false;
    },

    async fetchAllCards() {
      try {
        const response = await libraryService.getAllLibraryCards();
        this.allCardsList = response || [];
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thẻ:', error);
      }
    },

    handleRowClickList(item) {
      this.selectedItemList = item;
      this.showModal = true;
    },

    selectUploadType(type) {
      this.uploadType = type;
      this.showUploadModal = false;

      // Trigger file input
      this.$nextTick(() => {
        this.$refs.excelFileInput.click();
      });
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Kiểm tra định dạng file
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!validTypes.includes(file.type)) {
        alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
      }

      this.uploadedFileName = file.name;

      try {
        const formData = new FormData();
        formData.append('file', file);

        let response;

        // Gọi API theo loại đã chọn
        if (this.uploadType === 'student') {
          response = await libraryService.uploadLibraryCardsExcelForStudents(
            formData
          );
        } else if (this.uploadType === 'lecturer') {
          response = await libraryService.uploadLibraryCardsExcelForLecturers(
            formData
          );
        }

        if (response) {
          alert('Tạo thẻ thành công');

          // Refresh lại danh sách
          await this.fetchAllCards();

          // Reset input
          this.$refs.excelFileInput.value = '';
          this.uploadedFileName = '';
          this.uploadType = '';
        }
      } catch (error) {
        console.error('Lỗi khi upload file:', error);
        alert(
          `Upload thất bại!\n${
            error.response?.data?.message || error.message || 'Vui lòng thử lại'
          }`
        );

        // Reset input
        this.$refs.excelFileInput.value = '';
        this.uploadedFileName = '';
        this.uploadType = '';
      }
    },

    openEditModal(card) {
      this.editingCard = card;

      // Tách họ lót và tên
      const fullName = `${card.DocGia.HoLot} ${card.DocGia.Ten}`;
      const nameParts = fullName.trim().split(' ');
      const ten = nameParts.pop();
      const hoLot = nameParts.join(' ');

      this.editForm = {
        HoLot: hoLot,
        Ten: ten,
        MaNganhHoc: card.additionalInfo?.MaNganhHoc?._id || '',
        MaBoMon: card.additionalInfo?.MaBoMon?._id || '',
      };

      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editingCard = null;
      this.editForm = {
        HoLot: '',
        Ten: '',
        MaNganhHoc: '',
        MaBoMon: '',
      };
    },

    async saveEditCard() {
      try {
        if (!this.editForm.HoLot || !this.editForm.Ten) {
          alert('Vui lòng nhập đầy đủ họ tên');
          return;
        }

        const isStudent = this.editingCard.additionalInfo?.MaSinhVien;

        if (isStudent) {
          if (!this.editForm.MaNganhHoc) {
            alert('Vui lòng chọn ngành học');
            return;
          }

          await libraryService.updateOneLibraryCardStudent(
            this.editingCard._id,
            {
              HoLot: this.editForm.HoLot,
              Ten: this.editForm.Ten,
              MaNganhHoc: this.editForm.MaNganhHoc,
            }
          );
        } else {
          if (!this.editForm.MaBoMon) {
            alert('Vui lòng chọn bộ môn');
            return;
          }

          await libraryService.updateOneLibraryCardLecturer(
            this.editingCard._id,
            {
              HoLot: this.editForm.HoLot,
              Ten: this.editForm.Ten,
              MaBoMon: this.editForm.MaBoMon,
            }
          );
        }

        alert('Cập nhật thông tin thành công!');
        this.closeEditModal();
        await this.fetchAllCards(); // Refresh danh sách
      } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
        alert(
          'Cập nhật thất bại: ' +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async fetchNganhHocList() {
      const response = await libraryService.getAllNganhHoc();
      // console.log(response);
      this.nganhHocList = response;
    },

    async fetchBoMonList() {
      const response = await libraryService.getAllBoMon();
      this.boMonList = response;
    },
  },
};
</script>

<style>
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

.free-badge {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: #fff;
  padding: 0.4rem 1.2rem;
  border-radius: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  display: inline-block;
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

.status-badge--active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}

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

/* Tab Navigation */
.management-tabs {
  display: flex;
  margin: 20px 0;
  border-bottom: 2px solid #e0e0e0;
}

.management-tab {
  padding: 12px 24px;
  cursor: pointer;
  color: #555;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.management-tab:hover {
  color: #16a085;
}

.management-tab.active {
  color: #16a085;
  border-bottom-color: #16a085;
  background-color: #f0f9f7;
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

/* Text Overflow Handling */
.text-ellipsis--sm {
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.text-ellipsis--md {
  max-width: 230px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.text-ellipsis--lg {
  max-width: 300px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.text-center-offset {
  position: relative;
  left: 23px;
}

.text-center {
  text-align: center;
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

/* Status Colors */
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

.status-badge--borrowing {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #1a237e;
}

.status-badge--overdue {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
}

.status-badge--returned {
  background: linear-gradient(135deg, #29b961 0%, #38ef7d 100%);
  color: #fff;
}

.status-badge--expired {
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
  color: #fff;
}

.status-badge--active {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: #fff;
}

.status-badge--lost {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: #fff;
}

.status-badge--damaged {
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
  color: #4e2600;
}

.status-badge--intact {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #1a237e;
}

.status-badge--empty {
  text-align: center;
  min-width: 100px;
}

.status-badge--printed {
  background: linear-gradient(135deg, #007bff 0%, #3399ff 100%);
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

.action-btn--print {
  background: linear-gradient(135deg, #007bff 0%, #3399ff 100%);
  color: #fff;
}

.action-btn--print:hover {
  background: linear-gradient(135deg, #0069d9 0%, #267fd9 100%);
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

.action-btn--return {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: #fff;
}

.action-btn--return:hover {
  background: linear-gradient(135deg, #2980b9 0%, #2471a3 100%);
}

.action-btn--extend {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: #fff;
  margin-left: 8px;
}

.action-btn--extend:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}

.action-btn--completed {
  width: 96px;
  background-color: #fff;
  color: #a1a6ab;
  border: 1px solid #a1a6ab;
  text-align: center;
}

.action-btn--disabled {
  cursor: not-allowed;
  opacity: 0.8;
  filter: grayscale(100%);
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

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-dialog-list-card {
  max-width: 700px;
  max-height: 100vh;
}

.modal-content {
  padding: 0;
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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-body__details {
  display: flex;
}

.modal-body__image {
  width: 50%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 16px;
}

.modal-body__info {
  width: 50%;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-body__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Return Status Modal */
.return-status-options {
  display: flex;
  justify-content: center;
  gap: 47px;
  flex-wrap: wrap;
  margin-top: 5px;
}

.return-status-options label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.return-status-options label input[type='radio'] {
  position: relative;
  top: 1px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.return-status-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  min-width: 90px;
  font-weight: 500;
}

.return-status-btn--confirm {
  background-color: #0d6efd;
  color: white;
}

.return-status-btn--confirm:hover:not(:disabled) {
  background-color: #0b5ed7;
}

.return-status-btn--confirm:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.return-status-btn--cancel {
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #ced4da;
}

.return-status-btn--cancel:hover {
  background-color: #e2e6ea;
}

.action-btn--approve[disabled] {
  filter: grayscale(100%) brightness(80%);
  cursor: not-allowed;
  opacity: 0.9;
}

/* Library Card List Tab */
.library-card-list {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
}

.card-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-upload {
  background: #fff;
  color: #667eea;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  background: #f8f9ff;
}

.btn-upload:active {
  transform: translateY(0);
}

.upload-hint {
  font-size: 1.4rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.8rem 1.5rem;
  border-radius: 0.6rem;
  backdrop-filter: blur(10px);
}

.total-cards {
  font-size: 1.6rem;
  color: #fff;
  font-weight: 500;
}

.total-cards strong {
  font-size: 2rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

/* Modal Upload */
.modal-upload {
  max-width: 600px;
}

.modal-body-upload {
  padding: 2rem;
}

.upload-description {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 2rem;
  text-align: center;
}

.upload-options {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.upload-option {
  flex: 1;
  max-width: 220px;
  padding: 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.upload-option:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%);
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
}

.upload-option-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.upload-option h4 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.upload-option p {
  font-size: 1.3rem;
  color: #777;
  margin: 0;
}

/* Sub tabs cho List */
.list-sub-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.list-sub-tab {
  flex: 1;
  padding: 1.2rem 2rem;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.list-sub-tab:hover {
  border-color: #667eea;
  background: #f5f7ff;
}

.list-sub-tab.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.action-btn--edit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: #fff;
}

.action-btn--edit:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}

.modal-edit-card {
  max-width: 600px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
}

.required {
  color: #e74c3c;
}

.form-control {
  padding: 1rem;
  font-size: 1.4rem;
  border: 2px solid #ddd;
  border-radius: 0.6rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>
