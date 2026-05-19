<template>
  <div class="nienluan_library">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar tabs dọc -->
        <div class="col-lg-2 nienluan_sidebar">
          <ul class="nav flex-column">
            <li v-if="userState && userState.userType === 'Sinh viên'">
              <a
                href="#"
                :class="{ active: nienLuanTab === 'nop' }"
                @click.prevent="changeNienLuanTab('nop')"
              >📂 Nộp niên luận</a>
            </li>
            <li v-if="userState && userState.userType === 'Giảng viên'">
              <a
                href="#"
                :class="{ active: nienLuanTab === 'quanlydot' }"
                @click.prevent="changeNienLuanTab('quanlydot')"
              >📅 Quản lý đợt nộp</a>
            </li>
            <li v-if="userState && userState.userType === 'Giảng viên'">
              <a
                href="#"
                :class="{ active: nienLuanTab === 'danhsach' }"
                @click.prevent="changeNienLuanTab('danhsach')"
              >📑 Danh sách niên luận</a>
            </li>
          </ul>
        </div>

        <!-- Nội dung chính -->
        <div class="col-lg-10 nienluan_content">

          <!-- ===== SINH VIÊN: NỘP NIÊN LUẬN ===== -->
          <div v-if="nienLuanTab === 'nop' && userState && userState.userType === 'Sinh viên'">
            <div class="nienluan_content_upload">
              <div class="nienluan__select-dot">
                <!-- Thông báo có đợt đang mở -->
                <div
                  v-if="!hasSubmittedForSelectedDot && availableDotNopList.length > 0"
                  class="nienluan__dot-notification"
                >
                  <div class="nienluan__dot-notification-icon"><i class="fas fa-info-circle"></i></div>
                  <div class="nienluan__dot-notification-content">
                    <strong>Đang có {{ availableDotNopList.length }} đợt nộp niên luận đang mở</strong>
                    <p>Vui lòng chọn đợt nộp phù hợp để tiếp tục</p>
                  </div>
                </div>

                <!-- Thông báo không có đợt mở -->
                <div
                  v-else-if="!hasSubmittedForSelectedDot && availableDotNopList.length === 0"
                  class="nienluan__dot-notification nienluan__dot-notification--warning"
                >
                  <div class="nienluan__dot-notification-icon"><i class="fas fa-exclamation-triangle"></i></div>
                  <div class="nienluan__dot-notification-content">
                    <strong>Hiện tại không có đợt nộp nào đang mở</strong>
                    <p>Vui lòng chờ thông báo từ giảng viên hoặc nhà trường</p>
                  </div>
                </div>

                <!-- Đã nộp -->
                <div v-if="hasSubmittedForSelectedDot && submittedDotInfo" class="nienluan__submitted-status">
                  <div class="nienluan__submitted-info">
                    <i class="fas fa-check-circle"></i>
                    <div class="nienluan__submitted-text">
                      <strong>Đã nộp niên luận</strong>
                      <span><strong>Đợt nộp:</strong> {{ submittedDotInfo.TenDot }}</span>
                      <span><strong>Giảng viên:</strong> {{ submittedDotInfo.MaGiangVien.HoLot }} {{ submittedDotInfo.MaGiangVien.Ten }}</span>
                      <span><strong>Tên đề tài:</strong> {{ submittedDotDetails?.tenDeTai }}</span>
                      <span><strong>Ngày nộp:</strong> {{ formatDate(submittedDotDetails?.ngayNop) }}</span>
                      <span
                        class="status-badge"
                        :class="{
                          'status-badge--pending': submittedDotDetails?.trangThai === 'Chờ duyệt',
                          'status-badge--approved': submittedDotDetails?.trangThai === 'Đã duyệt',
                        }"
                      >{{ submittedDotDetails?.trangThai }}</span>
                    </div>
                  </div>
                </div>

                <!-- Đã chọn đợt nhưng chưa nộp -->
                <div
                  v-else-if="!hasSubmittedForSelectedDot && selectedDotNopInfo"
                  class="nienluan__selected-dot-compact"
                >
                  <div class="nienluan__selected-info">
                    <i class="fas fa-calendar-check"></i>
                    <div class="nienluan__selected-text">
                      <strong>{{ selectedDotNopInfo.TenDot }}</strong>
                      <span>GV: {{ selectedDotNopInfo.MaGiangVien.HoLot }} {{ selectedDotNopInfo.MaGiangVien.Ten }}</span>
                    </div>
                  </div>
                  <button type="button" class="nienluan__btn-change" @click="showSelectDotModal = true">
                    <i class="fas fa-exchange-alt"></i> Đổi đợt nộp
                  </button>
                </div>

                <!-- Chưa chọn đợt -->
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

              <!-- Banner đợt nộp -->
              <div class="nienluan__dot-nop-info" v-if="activeDotNopNienLuan">
                <div class="nienluan__dot-nop-banner">
                  <i class="fas fa-calendar-check"></i>
                  <div class="nienluan__dot-nop-details">
                    <strong>{{ activeDotNopNienLuan.TenDot }}</strong>
                    <p>Thời gian: <span class="highlight">{{ formatDateTime(activeDotNopNienLuan.ThoiGianMoNop) }}</span> đến <span class="highlight">{{ formatDateTime(activeDotNopNienLuan.ThoiGianDongNop) }}</span></p>
                    <p>Kỳ học: <span class="highlight">{{ activeDotNopNienLuan.KyHoc?.TenKyHoc }}</span></p>
                    <p>Năm học: <span class="highlight">{{ activeDotNopNienLuan.NamHoc?.TenNamHoc }}</span></p>
                  </div>
                </div>
              </div>

              <div class="row">
                <!-- Upload ảnh -->
                <div class="col-lg-6">
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
                      <label for="nienLuanImageInput" class="nienluan__camera-label">
                        <div
                          class="nienluan__camera-icon"
                          v-if="!(nienLuanStatus === 'Chờ duyệt' || nienLuanStatus === 'Đã duyệt')"
                        >
                          <i class="fas fa-camera"></i>
                        </div>
                      </label>
                    </div>
                    <img v-if="nienLuanImagePreview" :src="nienLuanImagePreview" alt="Preview" />
                  </div>
                </div>

                <!-- Thông tin niên luận -->
                <div class="col-lg-6">
                  <div class="nienluan__info">
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
                        <label for="nienLuanPdfInput" class="nienluan__pdf-label">
                          <i class="fas fa-file-pdf"></i> Chọn file PDF
                        </label>
                        <span
                          v-if="nienLuanPdfPreview"
                          class="nienluan__pdf-preview"
                          @click="openNienLuanPdf"
                          style="cursor: pointer"
                        >{{ nienLuanPdfPreview }}</span>
                      </div>
                    </div>

                    <div class="nienluan__info-button">
                      <button
                        type="button"
                        class="nienluan__btn-submit"
                        :class="{
                          'nienluan__btn-waiting': nienLuanStatus === 'Chờ duyệt',
                          'nienluan__btn-approved': nienLuanStatus === 'Đã duyệt',
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

          <!-- ===== GIẢNG VIÊN: QUẢN LÝ ĐỢT NỘP ===== -->
          <div v-if="nienLuanTab === 'quanlydot' && userState && userState.userType === 'Giảng viên'">
            <div class="dot-nop-management">
              <div class="dot-nop-header">
                <button class="btn-create-dot" @click="openCreateDotNienLuanModal">
                  <i class="fas fa-plus"></i> Tạo đợt nộp mới
                </button>
              </div>

              <!-- Nút toggle filter (mobile) -->
              <button class="nienluan__filter-toggle-btn" @click="quanLyDrawerOpen = true">
                <i class="fas fa-filter"></i> Bộ lọc
                <span v-if="quanLyActiveFilterCount > 0" class="nienluan__filter-badge">{{ quanLyActiveFilterCount }}</span>
              </button>

              <!-- Overlay -->
              <div
                class="nienluan__filter-overlay"
                :class="{ open: quanLyDrawerOpen }"
                @click="quanLyDrawerOpen = false"
              ></div>

              <!-- Filters (drawer on mobile) -->
              <div
                class="nienluan__quanly-filters"
                :class="{ 'nienluan__quanly-filters--open': quanLyDrawerOpen }"
              >
                <!-- Drawer header -->
                <div class="nienluan__filter-drawer-header">
                  <span><i class="fas fa-filter"></i> Bộ lọc</span>
                  <button class="nienluan__filter-drawer-close" @click="quanLyDrawerOpen = false">&times;</button>
                </div>

                <div class="nienluan__filter-drawer-body">
                  <select class="status-select" v-model="nienLuanFilterKyHoc">
                    <option value="">Tất cả kỳ học</option>
                    <option v-for="ky in kyHocList" :key="ky._id" :value="ky._id">{{ ky.TenKyHoc }}</option>
                  </select>

                  <select class="status-select ml-2" v-model="nienLuanFilterNamHoc">
                    <option value="">Tất cả năm học</option>
                    <option v-for="nam in namHocList" :key="nam._id" :value="nam._id">{{ nam.TenNamHoc }}</option>
                  </select>

                  <select class="status-select ml-2" v-model="selectedNienLuanStatus">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Chưa mở">Chưa mở</option>
                    <option value="Đang mở">Đang mở</option>
                    <option value="Đã đóng">Đã đóng</option>
                  </select>
                  
                  <button class="thesis__reset-btn ml-2" @click="resetNienLuanFilters">Reset</button>
                </div>

                <!-- Drawer footer -->
                <div class="nienluan__filter-drawer-footer">
                  <button class="nienluan__filter-apply-btn" @click="quanLyDrawerOpen = false">
                    <i class="fas fa-check"></i> Áp dụng
                  </button>
                </div>
              </div>

              <!-- Table đợt nộp -->
              <table class="management-table mt-4 table w-100">
                <thead>
                  <tr>
                    <th class="management-table__header">Tên đợt</th>
                    <th class="management-table__header">Kỳ học</th>
                    <th class="management-table__header">Năm học</th>
                    <th class="management-table__header">Số lượng phải nộp</th>
                    <th class="management-table__header">Thời gian mở</th>
                    <th class="management-table__header">Thời gian đóng</th>
                    <th class="management-table__header">Trạng thái</th>
                    <th class="management-table__header">Đã nộp</th>
                    <th class="management-table__header">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dot in filteredDotNopNienLuanListWithCount" :key="dot._id">
                    <td class="management-table__content">{{ dot.TenDot }}</td>
                    <td class="management-table__content">{{ dot.KyHoc?.TenKyHoc }}</td>
                    <td class="management-table__content">{{ dot.NamHoc?.TenNamHoc }}</td>
                    <td class="management-table__content" style="text-align: center">{{ dot.SoLuongPhaiNop }}</td>
                    <td class="management-table__content">{{ formatDate(dot.ThoiGianMoNop) }}</td>
                    <td class="management-table__content">{{ formatDate(dot.ThoiGianDongNop) }}</td>
                    <td class="management-table__content">
                      <div
                        class="status-badge"
                        :class="{
                          'status-badge--approved': dot.TrangThai === 'Đang mở',
                          'status-badge--pending': dot.TrangThai === 'Chưa mở',
                          'status-badge--denied': dot.TrangThai === 'Đã đóng',
                        }"
                      >{{ dot.TrangThai }}</div>
                    </td>
                    <td class="management-table__content">
                      <div class="submission-count">
                        <i class="fas fa-file-alt"></i> {{ dot.soLuongDaNop || 0 }}
                      </div>
                    </td>
                    <td class="management-table__content">
                      <button class="action-btn action-btn--approve" @click="openEditDotNienLuanModal(dot)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="action-btn action-btn--deny" @click="deleteDotNienLuan(dot._id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ===== GIẢNG VIÊN: DANH SÁCH NIÊN LUẬN ===== -->
          <div v-if="nienLuanTab === 'danhsach' && userState && userState.userType === 'Giảng viên'">
            <!-- Sub-tabs -->
            <div class="nienluan-sub-tabs">
              <button
                class="nienluan-sub-tab-btn"
                :class="{ active: nienLuanTabSub === 'cuatoi' }"
                @click="nienLuanTabSub = 'cuatoi'"
              ><i class="fas fa-user-check"></i> Niên luận của tôi</button>
              <button
                class="nienluan-sub-tab-btn"
                :class="{ active: nienLuanTabSub === 'trongkhoa' }"
                @click="nienLuanTabSub = 'trongkhoa'"
              ><i class="fas fa-building"></i> Niên luận trong khoa</button>
            </div>

            <!-- Sub-tab: Của tôi -->
            <div v-if="nienLuanTabSub === 'cuatoi'">

              <!-- Nút toggle filter (mobile) -->
              <button class="nienluan__filter-toggle-btn" @click="cuaToiDrawerOpen = true">
                <i class="fas fa-filter"></i> Bộ lọc
                <span v-if="cuaToiActiveFilterCount > 0" class="nienluan__filter-badge">{{ cuaToiActiveFilterCount }}</span>
              </button>

              <!-- Overlay -->
              <div
                class="nienluan__filter-overlay"
                :class="{ open: cuaToiDrawerOpen }"
                @click="cuaToiDrawerOpen = false"
              ></div>

              <div
                class="thesis__filters"
                :class="{ 'thesis__filters--drawer-open': cuaToiDrawerOpen }"
              >
                <!-- Drawer header -->
                <div class="nienluan__filter-drawer-header">
                  <span><i class="fas fa-filter"></i> Bộ lọc</span>
                  <button class="nienluan__filter-drawer-close" @click="cuaToiDrawerOpen = false">&times;</button>
                </div>

                <div class="thesis__filters-row">
                  <div class="thesis__filter-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Tìm theo tên niên luận..." v-model="nienLuanSearchKeyword" />
                  </div>
                  <button class="thesis__reset-btn" @click="resetNienLuanFilters">Reset</button>
                </div>
                <div class="thesis__filters-row">
                  <select class="thesis__filter-select" v-model="nienLuanFilterDotNop">
                    <option value="">Tất cả các đợt</option>
                    <option v-for="dot in dotNopNienLuanList" :key="dot._id" :value="dot._id">{{ dot.TenDot }}</option>
                  </select>
                  <select class="thesis__filter-select" v-model="nienLuanFilterKyHoc">
                    <option value="">Tất cả kỳ học</option>
                    <option v-for="ky in kyHocList" :key="ky._id" :value="ky._id">{{ ky.TenKyHoc }}</option>
                  </select>
                  <select class="thesis__filter-select" v-model="nienLuanFilterNamHoc">
                    <option value="">Tất cả năm học</option>
                    <option v-for="nam in namHocList" :key="nam._id" :value="nam._id">{{ nam.TenNamHoc }}</option>
                  </select>
                  <select class="thesis__filter-select" v-model="selectedNienLuanStatus">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã duyệt">Đã duyệt</option>
                    <option value="Từ chối">Từ chối</option>
                  </select>
                </div>

                <!-- Drawer footer -->
                <div class="nienluan__filter-drawer-footer">
                  <button class="nienluan__filter-apply-btn" @click="cuaToiDrawerOpen = false">
                    <i class="fas fa-check"></i> Áp dụng
                  </button>
                </div>
              </div>

              <div class="thesis__list-container">
                <div v-if="filteredNienLuanList.length === 0" class="text-center py-5">
                  <p style="color: #666; font-size: 2.8rem">📑 Chưa có niên luận nào</p>
                </div>
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
                      <td class="nienluan-table__content">{{ (nienLuanCurrentPage - 1) * nienLuanPageSize + index + 1 }}</td>
                      <td class="nienluan-table__content nienluan-table__title">
                        <span v-html="highlightText(nienLuan.TenDeTai, nienLuanSearchKeyword)"></span>
                      </td>
                      <td class="nienluan-table__content nienluan-table__title">
                        {{ nienLuan.MaDocGia.HoLot }} {{ nienLuan.MaDocGia.Ten }}
                      </td>
                      <td class="nienluan-table__content">{{ nienLuan.MaDotNop?.KyHoc?.TenKyHoc || 'N/A' }}</td>
                      <td class="nienluan-table__content">{{ nienLuan.MaDotNop?.NamHoc?.TenNamHoc || 'N/A' }}</td>
                      <td class="nienluan-table__content">{{ formatDate(nienLuan.NgayNop) }}</td>
                      <td class="nienluan-table__content">
                        <div
                          class="status-badge"
                          :class="{
                            'status-badge--pending': nienLuan.TrangThai === 'Chờ duyệt',
                            'status-badge--approved': nienLuan.TrangThai === 'Đã duyệt',
                            'status-badge--denied': nienLuan.TrangThai === 'Từ chối',
                          }"
                        >{{ nienLuan.TrangThai }}</div>
                      </td>
                      <td class="nienluan-table__content nienluan-table__actions">
                        <template v-if="nienLuan.TrangThai === 'Chờ duyệt'">
                          <button class="action-btn action-btn--approve" @click.stop="approveNienLuanInTable(nienLuan._id)" title="Duyệt">
                            <i class="fas fa-check"></i>
                          </button>
                          <button class="action-btn action-btn--deny" @click.stop="rejectNienLuanInTable(nienLuan._id)" title="Từ chối">
                            <i class="fas fa-times"></i>
                          </button>
                        </template>
                        <span v-else class="processed-label"><i class="fas fa-check-circle"></i> Đã xử lý</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Pagination cuatoi -->
                <div class="thesis__list-navigation-page" v-if="filteredNienLuanList.length > 0 && nienLuanTotalPages > 1">
                  <ul class="pagination">
                    <li class="page-item" :class="{ disabled: nienLuanCurrentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanPage(1)">«</a>
                    </li>
                    <li class="page-item" :class="{ disabled: nienLuanCurrentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanPage(nienLuanCurrentPage - 1)">‹</a>
                    </li>
                    <li class="page-item active">
                      <a class="page-link" href="#" @click.prevent>{{ nienLuanCurrentPage }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: nienLuanCurrentPage === nienLuanTotalPages }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanPage(nienLuanCurrentPage + 1)">›</a>
                    </li>
                    <li class="page-item" :class="{ disabled: nienLuanCurrentPage === nienLuanTotalPages }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanPage(nienLuanTotalPages)">»</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Sub-tab: Trong khoa -->
            <div v-if="nienLuanTabSub === 'trongkhoa'">

              <!-- Nút toggle filter (mobile) -->
              <button class="nienluan__filter-toggle-btn" @click="trongKhoaDrawerOpen = true">
                <i class="fas fa-filter"></i> Bộ lọc
                <span v-if="trongKhoaActiveFilterCount > 0" class="nienluan__filter-badge">{{ trongKhoaActiveFilterCount }}</span>
              </button>

              <!-- Overlay -->
              <div
                class="nienluan__filter-overlay"
                :class="{ open: trongKhoaDrawerOpen }"
                @click="trongKhoaDrawerOpen = false"
              ></div>

              <div
                class="thesis__filters"
                :class="{ 'thesis__filters--drawer-open': trongKhoaDrawerOpen }"
              >
                <!-- Drawer header -->
                <div class="nienluan__filter-drawer-header">
                  <span><i class="fas fa-filter"></i> Bộ lọc</span>
                  <button class="nienluan__filter-drawer-close" @click="trongKhoaDrawerOpen = false">&times;</button>
                </div>

                <div class="thesis__filters-row">
                  <div class="thesis__filter-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Tìm theo tên niên luận..." v-model="nienLuanKhoaSearchKeyword" />
                  </div>
                  <button class="thesis__reset-btn" @click="resetNienLuanKhoaFilters">Reset</button>
                </div>
                <div class="thesis__filters-row">
                  <select class="thesis__filter-select" v-model="nienLuanKhoaFilterKyHoc">
                    <option value="">Tất cả kỳ học</option>
                    <option v-for="ky in kyHocList" :key="ky._id" :value="ky._id">{{ ky.TenKyHoc }}</option>
                  </select>
                  <select class="thesis__filter-select" v-model="nienLuanKhoaFilterNamHoc">
                    <option value="">Tất cả năm học</option>
                    <option v-for="nam in namHocList" :key="nam._id" :value="nam._id">{{ nam.TenNamHoc }}</option>
                  </select>
                </div>

                <!-- Drawer footer -->
                <div class="nienluan__filter-drawer-footer">
                  <button class="nienluan__filter-apply-btn" @click="trongKhoaDrawerOpen = false">
                    <i class="fas fa-check"></i> Áp dụng
                  </button>
                </div>
              </div>

              <div class="thesis__list-container">
                <div v-if="filteredNienLuanKhoaList.length === 0" class="text-center py-5">
                  <p style="color: #666; font-size: 2.8rem">📑 Chưa có niên luận nào trong khoa</p>
                </div>
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
                      <td class="nienluan-table__content">{{ (nienLuanKhoaCurrentPage - 1) * nienLuanKhoaPageSize + index + 1 }}</td>
                      <td class="nienluan-table__content nienluan-table__title">
                        <span v-html="highlightText(nienLuan.TenDeTai, nienLuanKhoaSearchKeyword)"></span>
                      </td>
                      <td class="nienluan-table__content">{{ nienLuan.MaDocGia.HoLot }} {{ nienLuan.MaDocGia.Ten }}</td>
                      <td class="nienluan-table__content">{{ nienLuan.MaDotNop?.MaGiangVien?.HoLot }} {{ nienLuan.MaDotNop?.MaGiangVien?.Ten }}</td>
                      <td class="nienluan-table__content">{{ nienLuan.MaDotNop?.KyHoc?.TenKyHoc || 'N/A' }}</td>
                      <td class="nienluan-table__content">{{ nienLuan.MaDotNop?.NamHoc?.TenNamHoc || 'N/A' }}</td>
                      <td class="nienluan-table__content">{{ formatDate(nienLuan.NgayNop) }}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Pagination trongkhoa -->
                <div class="thesis__list-navigation-page" v-if="filteredNienLuanKhoaList.length > 0 && nienLuanKhoaTotalPages > 1">
                  <ul class="pagination">
                    <li class="page-item" :class="{ disabled: nienLuanKhoaCurrentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanKhoaPage(1)">«</a>
                    </li>
                    <li class="page-item" :class="{ disabled: nienLuanKhoaCurrentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanKhoaPage(nienLuanKhoaCurrentPage - 1)">‹</a>
                    </li>
                    <li class="page-item active">
                      <a class="page-link" href="#" @click.prevent>{{ nienLuanKhoaCurrentPage }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: nienLuanKhoaCurrentPage === nienLuanKhoaTotalPages }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanKhoaPage(nienLuanKhoaCurrentPage + 1)">›</a>
                    </li>
                    <li class="page-item" :class="{ disabled: nienLuanKhoaCurrentPage === nienLuanKhoaTotalPages }">
                      <a class="page-link" href="#" @click.prevent="goToNienLuanKhoaPage(nienLuanKhoaTotalPages)">»</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL TẠO/SỬA ĐỢT NỘP NIÊN LUẬN ===== -->
    <transition name="modal-fade">
      <div class="modal" v-if="showDotNienLuanModal" tabindex="-1" @click="showDotNienLuanModal = false">
        <div class="modal-dialog" style="max-width: 600px" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingDotNienLuan ? 'Chỉnh sửa đợt nộp' : 'Tạo đợt nộp mới' }}</h5>
              <button type="button" class="btn-close" @click="showDotNienLuanModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên đợt:</label>
                <input type="text" v-model="dotNienLuanForm.TenDot" class="form-control" placeholder="Ví dụ: Đợt nộp niên luận K20" />
              </div>
              <div class="form-group">
                <label>Kỳ học:</label>
                <div class="input-with-button">
                  <select v-model="dotNienLuanForm.KyHoc" class="form-control">
                    <option value="">-- Chọn kỳ học --</option>
                    <option v-for="ky in kyHocList" :key="ky._id" :value="ky._id">{{ ky.TenKyHoc }}</option>
                  </select>
                  <button type="button" class="btn-add-inline" @click="showAddKyHocModal = true">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Năm học:</label>
                <div class="input-with-button">
                  <select v-model="dotNienLuanForm.NamHoc" class="form-control">
                    <option value="">-- Chọn năm học --</option>
                    <option v-for="nam in namHocList" :key="nam._id" :value="nam._id">{{ nam.TenNamHoc }}</option>
                  </select>
                  <button type="button" class="btn-add-inline" @click="showAddNamHocModal = true">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Thời gian mở nộp:</label>
                <input type="datetime-local" v-model="dotNienLuanForm.ThoiGianMoNop" class="form-control" />
              </div>
              <div class="form-group">
                <label>Thời gian đóng nộp:</label>
                <input type="datetime-local" v-model="dotNienLuanForm.ThoiGianDongNop" class="form-control" />
              </div>
              <div class="form-group">
                <label>Số lượng phải nộp:</label>
                <input type="number" v-model.number="dotNienLuanForm.SoLuongPhaiNop" class="form-control" min="1" placeholder="Nhập số lượng niên luận phải nộp" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showDotNienLuanModal = false">Hủy</button>
              <button class="btn btn-primary" @click="saveDotNienLuan">{{ editingDotNienLuan ? 'Cập nhật' : 'Tạo mới' }}</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== MODAL CHI TIẾT NIÊN LUẬN ===== -->
    <transition name="modal-fade">
      <div class="modal" v-if="showNienLuanModal" tabindex="-1" @click="showNienLuanModal = false">
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết niên luận</h5>
              <button type="button" class="btn-close" @click="showNienLuanModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="modal-body__details">
                <div class="modal-body__image">
                  <img :src="selectedNienLuan?.Image || '/image/avatar_comment.png'" alt="Avatar" />
                </div>
                <div class="modal-body__info">
                  <p><strong>Mã sinh viên:</strong> {{ selectedNienLuan?.MaDocGia?.SinhVien?.MaSinhVien }}</p>
                  <p><strong>Họ tên:</strong> {{ selectedNienLuan?.MaDocGia?.HoLot }} {{ selectedNienLuan?.MaDocGia?.Ten }}</p>
                  <p><strong>Ngành học:</strong> {{ selectedNienLuan?.MaDocGia?.SinhVien?.MaNganhHoc?.TenNganh || 'Chưa cập nhật' }}</p>
                  <p><strong>Khoa:</strong> {{ selectedNienLuan?.MaDocGia?.SinhVien?.MaNganhHoc?.Khoa?.TenKhoa || 'Chưa cập nhật' }}</p>
                  <p><strong>Tên đề tài:</strong> {{ selectedNienLuan?.TenDeTai }}</p>
                  <p v-if="selectedNienLuan?.MaDotNop?.MaGiangVien">
                    <strong>Giảng viên HD:</strong> {{ selectedNienLuan?.MaDotNop?.MaGiangVien?.HoLot }} {{ selectedNienLuan?.MaDotNop?.MaGiangVien?.Ten }}
                  </p>
                  <p><strong>Trạng thái:</strong> {{ selectedNienLuan?.TrangThai }}</p>
                  <p><strong>Ngày nộp:</strong> {{ formatDate(selectedNienLuan?.NgayNop) }}</p>
                  <p>
                    <strong>File Niên luận:</strong>
                    <button v-if="selectedNienLuan?.Pdf" class="btn btn-link btn-view-pdf" @click="openNienLuanPdfInModal">Xem file</button>
                    <span v-else>Chưa có</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== MODAL THÊM KỲ HỌC ===== -->
    <transition name="modal-fade">
      <div class="modal" v-if="showAddKyHocModal" @click="showAddKyHocModal = false">
        <div class="modal-dialog" @click.stop style="max-width: 400px">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Thêm Kỳ Học</h5>
              <button type="button" class="btn-close" @click="showAddKyHocModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên kỳ học:</label>
                <input type="text" v-model="newKyHoc" class="form-control" placeholder="VD: Kỳ 1, Kỳ 2" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showAddKyHocModal = false">Hủy</button>
              <button class="btn btn-primary" @click="saveKyHoc">Lưu</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== MODAL THÊM NĂM HỌC ===== -->
    <transition name="modal-fade">
      <div class="modal" v-if="showAddNamHocModal" @click="showAddNamHocModal = false">
        <div class="modal-dialog" @click.stop style="max-width: 400px">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Thêm Năm Học</h5>
              <button type="button" class="btn-close" @click="showAddNamHocModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên năm học:</label>
                <input type="text" v-model="newNamHoc" class="form-control" placeholder="VD: 2024-2025" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showAddNamHocModal = false">Hủy</button>
              <button class="btn btn-primary" @click="saveNamHoc">Lưu</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== MODAL CHỌN ĐỢT NỘP NIÊN LUẬN ===== -->
    <transition name="modal-fade">
      <div class="modal-select-dot" v-if="showSelectDotModal" @click="showSelectDotModal = false">
        <div class="modal-select-dot-dialog" @click.stop>
          <div class="modal-select-dot-header">
            <h3 class="modal-select-dot-title"><i class="fas fa-list-ul"></i> Chọn đợt nộp niên luận</h3>
            <button type="button" class="modal-select-dot-close" @click="showSelectDotModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-select-dot-body">
            <div class="modal-select-dot-search">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="dotNopSearchKeyword"
                placeholder="Tìm theo tên đợt hoặc giảng viên..."
                class="modal-select-dot-search-input"
              />
              <button v-if="dotNopSearchKeyword" class="modal-select-dot-search-clear" @click="dotNopSearchKeyword = ''">
                <i class="fas fa-times-circle"></i>
              </button>
            </div>

            <div class="modal-select-dot-list">
              <div v-if="filteredDotNopList.length === 0" class="modal-select-dot-empty">
                <i class="fas fa-inbox"></i>
                <p>{{ dotNopSearchKeyword ? 'Không tìm thấy đợt nộp phù hợp' : 'Chưa có đợt nộp nào' }}</p>
              </div>

              <div
                v-for="dot in filteredDotNopList"
                :key="dot._id"
                class="modal-select-dot-item"
                :class="{ selected: selectedDotNop === dot._id }"
                @click="selectDotNopAndClose(dot)"
              >
                <div class="modal-select-dot-item-icon"><i class="fas fa-calendar-alt"></i></div>
                <div class="modal-select-dot-item-content">
                  <div class="modal-select-dot-item-title">{{ dot.TenDot }}</div>
                  <div class="modal-select-dot-item-info">
                    <span class="info-item"><i class="fas fa-user-tie"></i> {{ dot.MaGiangVien.HoLot }} {{ dot.MaGiangVien.Ten }}</span>
                    <span class="info-item"><i class="fas fa-book-open"></i> {{ dot.KyHoc?.TenKyHoc }}</span>
                    <span class="info-item"><i class="fas fa-calendar"></i> {{ dot.NamHoc?.TenNamHoc }}</span>
                  </div>
                  <div class="modal-select-dot-item-dates">
                    <span class="date-item date-item--open">Mở: {{ formatDateTime(dot.ThoiGianMoNop) }}</span>
                    <span class="date-item date-item--close">Đóng: {{ formatDateTime(dot.ThoiGianDongNop) }}</span>
                  </div>
                  <div class="modal-select-dot-item-deadline">
                    <i class="fas fa-clock"></i> Ngày mở: {{ formatDateTime(dot.ThoiGianMoNop) }}
                  </div>
                  <div class="modal-select-dot-item-deadline">
                    <i class="fas fa-clock"></i> Hạn nộp: {{ formatDateTime(dot.ThoiGianDongNop) }}
                  </div>
                </div>
                <div v-if="selectedDotNop === dot._id" class="modal-select-dot-item-check">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-select-dot-footer">
            <button type="button" class="btn-modal-cancel" @click="showSelectDotModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { bookService } from '../services/book/book.service';
import { smartSearch, removeVietnameseTones } from '../assets/js/fuzzySearch';
import { userState } from '../assets/js/userState';

export default {
  name: 'TabNienLuan',
  props: {
    kyHocList: Array,
    namHocList: Array,
    initialNienLuanTab: { type: String, default: '' },
  },
  emits: ['changeNienLuanTab', 'setLoading'],
  data() {
    return {
      userState,
      nienLuanTab: this.initialNienLuanTab,
      nienLuanTabSub: 'cuatoi',

      // Drawer state cho từng bộ lọc
      cuaToiDrawerOpen: false,
      trongKhoaDrawerOpen: false,
      quanLyDrawerOpen: false,

      // Sinh viên - nộp niên luận
      nienLuanImageFile: null,
      nienLuanImagePreview: null,
      nienLuanPdfFile: null,
      nienLuanPdfPreview: null,
      nienLuanPdfPath: null,
      nienLuanTopicName: '',
      nienLuanStatus: null,
      selectedDotNop: '',
      availableDotNopList: [],
      submittedForCurrentDot: false,
      submittedDotDetails: null,
      activeDotNopNienLuan: null,
      showSelectDotModal: false,
      dotNopSearchKeyword: '',

      // Giảng viên - quản lý đợt nộp
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

      // Giảng viên - danh sách niên luận
      nienLuanList: [],
      nienLuanCurrentPage: 1,
      nienLuanPageSize: 8,
      showNienLuanModal: false,
      selectedNienLuan: null,
      nienLuanSearchKeyword: '',
      nienLuanFilterKyHoc: '',
      nienLuanFilterNamHoc: '',
      nienLuanFilterDotNop: '',
      selectedNienLuanStatus: 'all',

      // Giảng viên - niên luận trong khoa
      nienLuanKhoaList: [],
      nienLuanKhoaSearchKeyword: '',
      nienLuanKhoaFilterKyHoc: '',
      nienLuanKhoaFilterNamHoc: '',
      nienLuanKhoaCurrentPage: 1,
      nienLuanKhoaPageSize: 8,

      // Modals phụ
      showAddKyHocModal: false,
      showAddNamHocModal: false,
      newKyHoc: '',
      newNamHoc: '',
    };
  },
  async mounted() {
    if (!this.nienLuanTab) {
      if (userState.userType === 'Sinh viên') this.nienLuanTab = 'nop';
      else if (userState.userType === 'Giảng viên') this.nienLuanTab = 'quanlydot';
    }

    if (userState && userState.userType === 'Sinh viên') {
      await this.loadAvailableDotNopList();
      await this.fetchNienLuan();
    } else if (userState && userState.userType === 'Giảng viên') {
      await this.loadDotNopNienLuanData();
      await this.loadAllNienLuanByGiangVien();
      await this.loadNienLuanKhoa();
    }
  },
  methods: {
    changeNienLuanTab(tab) {
      this.nienLuanTab = tab;
      this.$emit('changeNienLuanTab', tab);
    },

    // ---- Sinh viên ----
    async loadAvailableDotNopList() {
      try {
        const response = await bookService.getAllActiveDotNopNienLuan(userState._id);
        this.availableDotNopList = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách đợt nộp:', error);
      }
    },

    onNienLuanImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.nienLuanImageFile = file;
        this.nienLuanImagePreview = URL.createObjectURL(file);
      }
    },

    onNienLuanPdfChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.nienLuanPdfFile = file;
        this.nienLuanPdfPreview = file.name;
      }
    },

    openNienLuanPdf() {
      if (this.nienLuanPdfFile) {
        window.open(URL.createObjectURL(this.nienLuanPdfFile), '_blank');
      } else if (this.nienLuanPdfPath) {
        window.open(this.nienLuanPdfPath, '_blank');
      } else {
        alert('Chưa có file PDF để mở.');
      }
    },

    async fetchNienLuan() {
      try {
        const nienLuan = await bookService.getOneNienLuan({ userId: userState._id });
        if (!nienLuan || nienLuan.TrangThai === 'Từ chối') {
          this.submittedForCurrentDot = false;
          this.submittedDotDetails = null;
          return;
        }
        if (nienLuan && nienLuan._id) {
          this.nienLuanTopicName = nienLuan.TenDeTai || '';
          this.nienLuanPdfPreview = nienLuan.Pdf ? this.nienLuanTopicName + '.pdf' : null;
          this.nienLuanPdfPath = nienLuan.Pdf || null;
          this.nienLuanImagePreview = nienLuan.Image || null;
          this.nienLuanStatus = nienLuan.TrangThai;
          if (nienLuan.MaDotNop) {
            const dotNopId = typeof nienLuan.MaDotNop === 'object' ? nienLuan.MaDotNop._id : nienLuan.MaDotNop;
            this.selectedDotNop = dotNopId;
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

    async submitNienLuan() {
      if (!this.selectedDotNop) {
        alert('Vui lòng chọn đợt nộp!');
        return;
      }
      if (!this.nienLuanTopicName || !this.nienLuanImageFile || !this.nienLuanPdfFile) {
        alert('Vui lòng nhập đầy đủ thông tin và chọn file!');
        return;
      }
      this.$emit('setLoading', true);
      try {
        const formData = new FormData();
        formData.append('userId', userState._id);
        formData.append('image', this.nienLuanImageFile);
        formData.append('pdfFile', this.nienLuanPdfFile);
        formData.append('topicName', this.nienLuanTopicName);
        formData.append('maDotNop', this.selectedDotNop);
        await bookService.addNienLuan(formData);
        alert('Nộp niên luận thành công!');
        await this.fetchNienLuan();
      } catch (err) {
        alert('Có lỗi xảy ra khi nộp niên luận!');
      } finally {
        this.$emit('setLoading', false);
      }
    },

    selectDotNopAndClose(dot) {
      this.selectedDotNop = dot._id;
      this.showSelectDotModal = false;
      this.dotNopSearchKeyword = '';
    },

    // ---- Giảng viên - đợt nộp ----
    async loadDotNopNienLuanData() {
      try {
        const response = await bookService.getAllDotNopNienLuan({ maGiangVien: userState._id });
        this.dotNopNienLuanList = response;
      } catch (error) {
        console.error('Lỗi khi tải đợt nộp niên luận:', error);
      }
    },

    openCreateDotNienLuanModal() {
      this.editingDotNienLuan = null;
      this.dotNienLuanForm = { TenDot: '', KyHoc: '', NamHoc: '', ThoiGianMoNop: '', ThoiGianDongNop: '', SoLuongPhaiNop: 1 };
      this.showDotNienLuanModal = true;
    },

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

    async saveDotNienLuan() {
      const f = this.dotNienLuanForm;
      if (!f.TenDot || !f.KyHoc || !f.NamHoc || !f.ThoiGianMoNop || !f.ThoiGianDongNop || !f.SoLuongPhaiNop || f.SoLuongPhaiNop < 1) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }
      try {
        if (this.editingDotNienLuan) {
          await bookService.updateDotNopNienLuan({ dotNopId: this.editingDotNienLuan._id, ...f });
          alert('Cập nhật đợt nộp niên luận thành công');
        } else {
          await bookService.createDotNopNienLuan({ ...f, MaGiangVien: userState._id });
          alert('Tạo đợt nộp niên luận thành công');
        }
        this.showDotNienLuanModal = false;
        await this.loadDotNopNienLuanData();
      } catch (error) {
        console.error('Lỗi khi lưu đợt nộp:', error);
        alert('Có lỗi xảy ra');
      }
    },

    async deleteDotNienLuan(dotNopId) {
      if (!confirm('Bạn có chắc muốn xóa đợt nộp này?')) return;
      try {
        await bookService.deleteDotNopNienLuan({ dotNopId });
        alert('Xóa thành công');
        await this.loadDotNopNienLuanData();
      } catch (error) {
        alert(error.response?.data?.error || 'Có lỗi xảy ra');
      }
    },

    // ---- Giảng viên - danh sách niên luận ----
    async loadAllNienLuanByGiangVien() {
      try {
        const response = await bookService.getAllNienLuanByGiangVien({ maGiangVien: userState._id });
        this.nienLuanList = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách niên luận:', error);
      }
    },

    async approveNienLuanInTable(nienLuanId) {
      if (!confirm('Bạn có chắc chắn muốn duyệt niên luận này không?')) return;
      try {
        await bookService.approveNienLuan({ nienLuanId });
        const idx = this.nienLuanList.findIndex((i) => i._id === nienLuanId);
        if (idx !== -1) {
          this.nienLuanList[idx].TrangThai = 'Đã duyệt';
          this.nienLuanList[idx].NgayNop = new Date();
        }
        alert('Duyệt thành công');
      } catch (error) {
        alert('Duyệt thất bại');
      }
    },

    async rejectNienLuanInTable(nienLuanId) {
      if (!confirm('Bạn có chắc chắn muốn từ chối niên luận này không?')) return;
      try {
        await bookService.rejectNienLuan({ nienLuanId });
        const idx = this.nienLuanList.findIndex((i) => i._id === nienLuanId);
        if (idx !== -1) this.nienLuanList[idx].TrangThai = 'Từ chối';
        alert('Từ chối thành công');
      } catch (error) {
        alert('Từ chối thất bại');
      }
    },

    handleNienLuanClick(nienLuan) {
      this.selectedNienLuan = nienLuan;
      this.showNienLuanModal = true;
    },

    openNienLuanPdfInModal() {
      if (this.selectedNienLuan?.Pdf) {
        window.open(this.selectedNienLuan.Pdf, '_blank');
      } else {
        alert('Chưa có file niên luận');
      }
    },

    // ---- Niên luận trong khoa ----
    async loadNienLuanKhoa() {
      try {
        const response = await bookService.getAllNienLuanCuaKhoa({ maGiangVien: userState._id });
        this.nienLuanKhoaList = response;
      } catch (error) {
        console.error('Lỗi khi tải niên luận khoa:', error);
      }
    },

    goToNienLuanPage(page) {
      if (page >= 1 && page <= this.nienLuanTotalPages) this.nienLuanCurrentPage = page;
    },

    goToNienLuanKhoaPage(page) {
      if (page >= 1 && page <= this.nienLuanKhoaTotalPages) this.nienLuanKhoaCurrentPage = page;
    },

    resetNienLuanFilters() {
      this.nienLuanSearchKeyword = '';
      this.nienLuanFilterDotNop = '';
      this.nienLuanFilterKyHoc = '';
      this.nienLuanFilterNamHoc = '';
      this.selectedNienLuanStatus = 'all';
      this.nienLuanCurrentPage = 1;
    },

    resetNienLuanKhoaFilters() {
      this.nienLuanKhoaSearchKeyword = '';
      this.nienLuanKhoaFilterKyHoc = '';
      this.nienLuanKhoaFilterNamHoc = '';
      this.nienLuanKhoaCurrentPage = 1;
    },

    // ---- Modals phụ ----
    async saveKyHoc() {
      if (!this.newKyHoc.trim()) { alert('Vui lòng nhập tên kỳ học'); return; }
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
      if (!this.newNamHoc.trim()) { alert('Vui lòng nhập tên năm học'); return; }
      try {
        const result = await bookService.addNamHoc({ TenNamHoc: this.newNamHoc });
        this.namHocList.push(result);
        this.dotNienLuanForm.NamHoc = result._id;
        this.showAddNamHocModal = false;
        this.newNamHoc = '';
        alert('Thêm năm học thành công');
      } catch (error) {
        alert('Lỗi khi thêm năm học');
      }
    },

    // ---- Helpers ----
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

    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? 'chiều' : 'sáng';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${day}/${month}/${year} ${displayHours}:${minutes} ${period}`;
    },

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
  },
  computed: {
    canSubmitNienLuan() {
      if (this.nienLuanStatus === 'Chờ duyệt' || this.nienLuanStatus === 'Đã duyệt') return false;
      if (!this.selectedDotNop) return false;
      return true;
    },

    hasSubmittedForSelectedDot() {
      return this.submittedForCurrentDot;
    },

    submittedDotInfo() {
      if (!this.hasSubmittedForSelectedDot) return null;
      return this.availableDotNopList.find((dot) => dot._id === this.selectedDotNop);
    },

    selectedDotNopInfo() {
      if (!this.selectedDotNop) return null;
      return this.availableDotNopList.find((dot) => dot._id === this.selectedDotNop);
    },

    filteredDotNopList() {
      if (!this.dotNopSearchKeyword.trim()) return this.availableDotNopList;
      const kw = removeVietnameseTones(this.dotNopSearchKeyword.toLowerCase());
      return this.availableDotNopList.filter((dot) => {
        const tenDot = removeVietnameseTones(dot.TenDot.toLowerCase());
        const tenGV = removeVietnameseTones(`${dot.MaGiangVien.HoLot} ${dot.MaGiangVien.Ten}`.toLowerCase());
        return tenDot.includes(kw) || tenGV.includes(kw);
      });
    },

    filteredDotNopNienLuanList() {
      let result = [...this.dotNopNienLuanList];
      if (this.nienLuanFilterKyHoc) {
        result = result.filter((dot) => {
          const id = typeof dot.KyHoc === 'object' ? dot.KyHoc?._id : dot.KyHoc;
          return String(id) === String(this.nienLuanFilterKyHoc);
        });
      }
      if (this.nienLuanFilterNamHoc) {
        result = result.filter((dot) => {
          const id = typeof dot.NamHoc === 'object' ? dot.NamHoc?._id : dot.NamHoc;
          return String(id) === String(this.nienLuanFilterNamHoc);
        });
      }
      if (this.selectedNienLuanStatus !== 'all') {
        result = result.filter((dot) => dot.TrangThai === this.selectedNienLuanStatus);
      }
      return result;
    },

    filteredDotNopNienLuanListWithCount() {
      return this.filteredDotNopNienLuanList.map((dot) => {
        const approvedCount = this.nienLuanList.filter((nl) => {
          const dotNopId = typeof nl.MaDotNop === 'object' ? nl.MaDotNop?._id : nl.MaDotNop;
          return String(dotNopId) === String(dot._id) && nl.TrangThai === 'Đã duyệt';
        }).length;
        return { ...dot, soLuongDaNop: approvedCount };
      });
    },

    filteredNienLuanList() {
      let result = [...this.nienLuanList];
      if (this.nienLuanSearchKeyword.trim()) {
        result = smartSearch(result, this.nienLuanSearchKeyword, (nl) => nl.TenDeTai);
      }
      if (this.nienLuanFilterDotNop) {
        result = result.filter((nl) => {
          const id = typeof nl.MaDotNop === 'object' ? nl.MaDotNop?._id : nl.MaDotNop;
          return String(id) === String(this.nienLuanFilterDotNop);
        });
      }
      if (this.nienLuanFilterKyHoc) {
        result = result.filter((nl) => {
          const id = typeof nl.MaDotNop?.KyHoc === 'object' ? nl.MaDotNop?.KyHoc?._id : nl.MaDotNop?.KyHoc;
          return String(id) === String(this.nienLuanFilterKyHoc);
        });
      }
      if (this.nienLuanFilterNamHoc) {
        result = result.filter((nl) => {
          const id = typeof nl.MaDotNop?.NamHoc === 'object' ? nl.MaDotNop?.NamHoc?._id : nl.MaDotNop?.NamHoc;
          return String(id) === String(this.nienLuanFilterNamHoc);
        });
      }
      if (this.selectedNienLuanStatus !== 'all') {
        result = result.filter((nl) => nl.TrangThai === this.selectedNienLuanStatus);
      }
      return result;
    },

    paginatedNienLuanList() {
      const start = (this.nienLuanCurrentPage - 1) * this.nienLuanPageSize;
      return this.filteredNienLuanList.slice(start, start + this.nienLuanPageSize);
    },

    nienLuanTotalPages() {
      return Math.ceil(this.filteredNienLuanList.length / this.nienLuanPageSize);
    },

    filteredNienLuanKhoaList() {
      let result = [...this.nienLuanKhoaList];
      if (this.nienLuanKhoaSearchKeyword.trim()) {
        result = smartSearch(result, this.nienLuanKhoaSearchKeyword, (nl) => nl.TenDeTai);
      }
      if (this.nienLuanKhoaFilterKyHoc) {
        result = result.filter((nl) => {
          const id = typeof nl.MaDotNop?.KyHoc === 'object' ? nl.MaDotNop?.KyHoc?._id : nl.MaDotNop?.KyHoc;
          return String(id) === String(this.nienLuanKhoaFilterKyHoc);
        });
      }
      if (this.nienLuanKhoaFilterNamHoc) {
        result = result.filter((nl) => {
          const id = typeof nl.MaDotNop?.NamHoc === 'object' ? nl.MaDotNop?.NamHoc?._id : nl.MaDotNop?.NamHoc;
          return String(id) === String(this.nienLuanKhoaFilterNamHoc);
        });
      }
      return result;
    },

    paginatedNienLuanKhoaList() {
      const start = (this.nienLuanKhoaCurrentPage - 1) * this.nienLuanKhoaPageSize;
      return this.filteredNienLuanKhoaList.slice(start, start + this.nienLuanKhoaPageSize);
    },

    nienLuanKhoaTotalPages() {
      return Math.ceil(this.filteredNienLuanKhoaList.length / this.nienLuanKhoaPageSize);
    },

    // Đếm số filter đang active cho badge
    cuaToiActiveFilterCount() {
      let count = 0;
      if (this.nienLuanSearchKeyword.trim()) count++;
      if (this.nienLuanFilterDotNop) count++;
      if (this.nienLuanFilterKyHoc) count++;
      if (this.nienLuanFilterNamHoc) count++;
      if (this.selectedNienLuanStatus !== 'all') count++;
      return count;
    },

    trongKhoaActiveFilterCount() {
      let count = 0;
      if (this.nienLuanKhoaSearchKeyword.trim()) count++;
      if (this.nienLuanKhoaFilterKyHoc) count++;
      if (this.nienLuanKhoaFilterNamHoc) count++;
      return count;
    },

    quanLyActiveFilterCount() {
      let count = 0;
      if (this.nienLuanFilterKyHoc) count++;
      if (this.nienLuanFilterNamHoc) count++;
      if (this.selectedNienLuanStatus !== 'all') count++;
      return count;
    },
  },
  watch: {
    nienLuanSearchKeyword() { this.nienLuanCurrentPage = 1; },
    nienLuanFilterDotNop() { this.nienLuanCurrentPage = 1; },
    nienLuanFilterKyHoc() { this.nienLuanCurrentPage = 1; },
    nienLuanFilterNamHoc() { this.nienLuanCurrentPage = 1; },
    selectedNienLuanStatus() { this.nienLuanCurrentPage = 1; },
    nienLuanKhoaSearchKeyword() { this.nienLuanKhoaCurrentPage = 1; },
    nienLuanKhoaFilterKyHoc() { this.nienLuanKhoaCurrentPage = 1; },
    nienLuanKhoaFilterNamHoc() { this.nienLuanKhoaCurrentPage = 1; },
    initialNienLuanTab(val) { if (val) this.nienLuanTab = val; },
  },
};
</script>