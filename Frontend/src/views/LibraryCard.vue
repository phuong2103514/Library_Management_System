<template>
  <Header />

  <h1 class="library-card-big-title">THÔNG TIN THẺ THƯ VIỆN</h1>

  <p class="library-intro">
    Đây là thẻ thư viện cá nhân của bạn, hiển thị thông tin cơ bản, lịch sử gia
    hạn và các chức năng nhanh.
  </p>

  <div class="library-card-wrapper" v-if="cardInfo && studentInfo">
    <div class="library-card">
      <div class="library-card-header">
        <h2>THƯ VIỆN ĐẠI HỌC</h2>
        <p>THẺ NGƯỜI DÙNG</p>
      </div>

      <div class="library-card-body">
        <div class="library-card-photo">
          <img
            :src="
              avatarPreview ||
              studentInfo?.Avatar ||
              '/image/avatar_comment.png'
            "
            alt="User Photo"
          />
        </div>

        <div class="library-card-info">
          <p><strong>Mã thẻ:</strong> {{ cardInfo.MaThe }}</p>
          <p><strong>Họ tên:</strong> {{ userState.hoTen }}</p>
          <p>
            <strong>Mã số:</strong>
            {{ isLecturer ? studentInfo.MaCanBo : studentInfo.MaSinhVien }}
          </p>
          <p>
            <strong>Đối tượng:</strong>
            {{ isLecturer ? 'Giảng viên' : 'Sinh viên' }}
          </p>

          <!-- Nếu là sinh viên -->
          <div v-if="!isLecturer">
            <p>
              <strong>Khóa học:</strong>
              {{ studentInfo.MaNienKhoa?.TenNienKhoa }}
            </p>
            <p>
              <strong>Ngành học:</strong> {{ studentInfo.MaNganhHoc?.TenNganh }}
            </p>
          </div>

          <!-- Nếu là giảng viên -->
          <div v-else>
            <p><strong>Bộ môn:</strong> {{ studentInfo.MaBoMon?.TenBoMon }}</p>
            <p><strong>Khoa:</strong> {{ studentInfo.MaBoMon?.MaKhoa?.TenKhoa }}</p>
          </div>
          <p>
            <strong>Ngày hết hạn:</strong> {{ formatDate(cardInfo.NgayHetHan) }}
          </p>
        </div>
      </div>

      <div class="library-card-footer">
        <p>READNEST</p>
      </div>
    </div>

    <div class="library-card-extra">
      <h2>Thông tin bổ sung</h2>
      <ul>
        <li>
          Trạng thái thẻ:
          <span
            class="card-status"
            :class="{
              active: cardInfo.TrangThai === 'Hoạt động',
              expired: cardInfo.TrangThai === 'Hết hạn',
              locked: cardInfo.TrangThai === 'Bị khóa',
            }"
          >
            {{ cardInfo.TrangThai }}
          </span>
        </li>
        <li>Ngày cấp: {{ formatDate(cardInfo.NgayCap) }}</li>
        <li>
          Ghi chú: Bạn sẽ không sử dụng được những tiện ích của thư viện nếu thẻ
          hết hạn
        </li>

        <div class="library-history">
          <h3>Lịch sử gia hạn</h3>
          <ul>
            <li v-if="!validExtendHistory.length">Chưa có dữ liệu</li>
            <li v-for="(item, index) in validExtendHistory" :key="index">
              Lần {{ index + 1 }}: {{ formatDate(item.NgayGiaHan) }} -
              {{ item.PhiGiaHan.toLocaleString('vi-VN') }}đ
            </li>
          </ul>
        </div>

        <div class="library-history">
          <h3>Lịch sử in thẻ</h3>
          <ul>
            <li v-if="!validReprintHistory.length">Chưa có dữ liệu</li>
            <li v-for="(item, index) in validReprintHistory" :key="index">
              Lần {{ index + 1 }}: {{ formatDate(item.NgayCapLai) }} -
              {{ item.PhiCapLai.toLocaleString('vi-VN') }}đ
            </li>
          </ul>
        </div>
      </ul>
    </div>
  </div>

  <div class="library-actions">
    <input
      type="file"
      ref="avatarInput"
      accept="image/*"
      @change="onAvatarChange"
      style="display: none"
    />

    <button class="btn-change-avatar" @click="showAvatarModal = true">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <span>Thay đổi ảnh thẻ</span>
    </button>

    <button
      class="update-avatar-button"
      @click="uploadAvatar"
      :disabled="!avatarFile || isUploading"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Cập nhật ảnh thẻ</span>
    </button>

    <button
      :class="[
        'request-card-reprint-button',
        {
          pending: lastReprintStatus === 'pending',
          approved: lastReprintStatus === 'approve',
        },
      ]"
      @click="requestCardReprint"
      :disabled="
        lastReprintStatus === 'pending' ||
        lastReprintStatus === 'approve' ||
        isRequesting ||
        this.cardInfo?.TrangThai === 'Hết hạn'
      "
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      <span>{{
        lastReprintStatus === 'pending'
          ? 'Đang chờ duyệt in lại thẻ'
          : lastReprintStatus === 'approve'
          ? 'Sẵn sàng nhận thẻ'
          : 'Yêu cầu in lại thẻ'
      }}</span>
    </button>
  </div>

  <!-- Modal chọn phương thức -->
  <div v-if="showAvatarModal" class="avatar-modal-overlay" @click="closeAvatarModal">
    <div class="avatar-modal-content" @click.stop>
      <div class="avatar-modal-header">
        <h3>Chọn ảnh thẻ</h3>
        <button class="close-modal-btn" @click="closeAvatarModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="avatar-modal-body">
        <div class="avatar-option" @click="chooseFromComputer">
          <div class="avatar-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h4>Chọn từ máy tính</h4>
          <p>Tải ảnh từ thiết bị của bạn</p>
        </div>

        <div class="avatar-option" @click="openCamera">
          <div class="avatar-option-icon camera-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <h4>Chụp ảnh</h4>
          <p>Sử dụng camera để chụp ảnh</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Camera -->
  <div v-if="showCamera" class="camera-modal-overlay">
    <div class="camera-modal-content">
      <div class="camera-modal-header">
        <h3>Chụp ảnh thẻ</h3>
        <button class="close-modal-btn" @click="closeCamera">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="camera-container">
        <video ref="videoElement" autoplay playsinline style="max-height: 70vh;"></video>
        <canvas ref="canvasElement" style="display: none;"></canvas>
      </div>

      <div class="camera-controls">
        <button class="btn-capture" @click="capturePhoto">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          Chụp ảnh
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="isUploading"
    :style="{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }"
  >
    <img :src="loadingGif" alt="loading" style="width: 60px; height: 60px" />
  </div>

  <Footer />
</template>

<script>
import '../assets/css/libraryCard.css';
import loadingGif from '/image/loading.gif';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

import { libraryService } from '../services/library/library.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'LibraryCard',
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      cardInfo: null,
      studentInfo: null,
      extendHistory: [],
      reissueHistory: [],
      userState,
      avatarFile: null,
      avatarPreview: null,
      isUploading: false,
      loadingGif,
      isRequesting: false,
      lastReprintStatus: null,
      showAvatarModal: false,
      showCamera: false,
      cameraStream: null,
    };
  },
  computed: {
    daysRemaining() {
      if (!this.cardInfo) return '--';
      const now = new Date();
      const expire = new Date(this.cardInfo.NgayHetHan);
      const diff = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    },

    validExtendHistory() {
      if (!this.extendHistory) return [];
      return [...this.extendHistory]
        .filter((item) => item.NgayGiaHan)
        .sort((a, b) => new Date(a.NgayGiaHan) - new Date(b.NgayGiaHan));
    },

    validReprintHistory() {
      if (!this.reissueHistory) return [];
      return [...this.reissueHistory]
        .filter((item) => item.NgayCapLai)
        .sort((a, b) => new Date(a.NgayCapLai) - new Date(b.NgayCapLai));
    },

    isLecturer() {
      return !!this.studentInfo?.MaCanBo;
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

    closeAvatarModal() {
      this.showAvatarModal = false;
    },

    chooseFromComputer() {
      this.showAvatarModal = false;
      this.$refs.avatarInput.click();
    },

    onAvatarChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.avatarFile = file;
        this.avatarPreview = URL.createObjectURL(file);
      }
    },

    async openCamera() {
      this.showAvatarModal = false;
      this.showCamera = true;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });

        this.cameraStream = stream;

        this.$nextTick(() => {
          if (this.$refs.videoElement) {
            this.$refs.videoElement.srcObject = stream;
          }
        });
      } catch (err) {
        console.error('Không thể truy cập camera:', err);
        alert('Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera.');
        this.showCamera = false;
      }
    },

    closeCamera() {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
      }
      this.showCamera = false;
    },

    capturePhoto() {
      const video = this.$refs.videoElement;
      const canvas = this.$refs.canvasElement;

      if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            this.avatarFile = file;
            this.avatarPreview = URL.createObjectURL(blob);

            this.closeCamera();
            alert('Đã chụp ảnh thành công! Nhấn "Cập nhật ảnh thẻ" để lưu.');
          }
        }, 'image/jpeg', 0.95);
      }
    },

    async uploadAvatar() {
      if (!this.avatarFile) return;

      try {
        this.isUploading = true;
        const formData = new FormData();
        formData.append('image', this.avatarFile);
        formData.append('_id', this.studentInfo._id);

        const res = await libraryService.updateAvatar(formData);

        this.studentInfo.Avatar = res.Avatar;
        this.avatarFile = null;

        alert('Cập nhật ảnh thẻ thành công!');
      } catch (err) {
        console.error('Lỗi cập nhật ảnh:', err);
        alert('Không thể cập nhật ảnh thẻ.');
      } finally {
        this.isUploading = false;
      }
    },

    async requestCardReprint() {
      if (!this.cardInfo) return;

      if (!confirm('Bạn có chắc muốn gửi yêu cầu in lại thẻ không?')) return;

      try {
        this.isRequesting = true;

        const res = await libraryService.requestCardReprint({
          MaThe: this.cardInfo._id,
        });

        this.lastReprintStatus = res.TrangThai;

        alert('Yêu cầu in lại thẻ đã được gửi thành công!');
      } catch (err) {
        console.error('Lỗi gửi yêu cầu in lại thẻ:', err);
        alert('Không thể gửi yêu cầu in lại thẻ.');
      } finally {
        this.isRequesting = false;
      }
    },
  },

  async mounted() {
    const res = await libraryService.getLibraryCard({
      MaDocGia: userState._id,
    });
    this.cardInfo = res.cardInfo;
    this.studentInfo = res.studentInfo;
    this.extendHistory = res.extendHistory || [];
    this.reissueHistory = res.reissueHistory || [];

    const reprintRes = await libraryService.getStatusCardReprint({
      MaThe: this.cardInfo._id,
    });
    this.lastReprintStatus = reprintRes.TrangThai;
  },

  beforeUnmount() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
    }
  },
};
</script>

<style scoped>
/* ===== Modal Overlay ===== */
.avatar-modal-overlay,
.camera-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998;
  backdrop-filter: blur(4px);
  padding: 16px;
  box-sizing: border-box;
}

/* ===== Avatar Modal Content ===== */
.avatar-modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Modal Header ===== */
.avatar-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-modal-btn svg {
  color: white;
}

/* ===== Modal Body ===== */
.avatar-modal-body {
  padding: 24px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.avatar-option {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.avatar-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.avatar-option-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 12px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.avatar-option:hover .avatar-option-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-option:hover .avatar-option-icon svg {
  stroke: white;
}

.avatar-option-icon svg {
  stroke: #667eea;
  transition: stroke 0.3s;
}

.camera-icon svg {
  stroke: #764ba2;
}

.avatar-option h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.avatar-option p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

/* ===== Camera Modal ===== */
.camera-modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.camera-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.camera-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.camera-container {
  background: #000;
  position: relative;
  overflow: hidden;
}

.camera-container video {
  width: 100%;
  height: auto;
  display: block;
}

.camera-controls {
  padding: 20px;
  background: white;
  display: flex;
  justify-content: center;
}

.btn-capture {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-capture:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-capture:active {
  transform: translateY(0);
}

/* ===== Action Buttons ===== */
.library-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  padding: 0 16px;
}

.library-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 1.4rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.btn-change-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-change-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.update-avatar-button {
  background: linear-gradient(135deg, #c94bff 0%, #ff4b2b 100%);
  color: white;
}

.update-avatar-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.update-avatar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.request-card-reprint-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.request-card-reprint-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.request-card-reprint-button.pending {
  background: linear-gradient(135deg, #ff512f 0%, #f09819 100%);
}

.request-card-reprint-button.approved {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
}

.request-card-reprint-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== Responsive: Tablet (≤ 900px) ===== */
@media (max-width: 900px) {
  .library-card-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 16px;
  }

  .library-card,
  .library-card-extra {
    width: 100%;
    max-width: 560px;
    box-sizing: border-box;
  }
}

/* ===== Responsive: Mobile (≤ 600px) ===== */
@media (max-width: 600px) {
  .library-card-big-title {
    font-size: 2rem;
    padding: 0 12px;
  }

  .library-intro {
    font-size: 1.2rem;
    padding: 0 12px;
  }

  .library-card-wrapper {
    padding: 0 12px;
  }

  .library-card,
  .library-card-extra {
    width: 100%;
    max-width: 100%;
  }

  /* Card body: stack photo + info vertically on very small screens */
  .library-card-body {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .library-card-photo img {
    width: 100px;
  }

  .library-card-info {
    font-size: 1.3rem;
    text-align: center;
    width: 100%;
  }

  .library-card-extra {
    font-size: 1.3rem;
  }

  .library-card-extra h2 {
    font-size: 15px;
  }

  /* Avatar modal: stack options vertically */
  .avatar-modal-body {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }

  .avatar-option {
    padding: 20px 16px;
  }

  .avatar-option-icon {
    width: 60px;
    height: 60px;
  }

  .avatar-option-icon svg {
    width: 36px;
    height: 36px;
  }

  /* Action buttons: full-width stack */
  .library-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 0 12px;
  }

  .library-actions button {
    width: 100%;
    padding: 14px 16px;
    font-size: 1.3rem;
    white-space: normal;
    text-align: center;
  }

  .btn-capture {
    padding: 12px 20px;
    font-size: 14px;
  }
}

/* ===== Responsive: Very small (≤ 380px) ===== */
@media (max-width: 380px) {
  .library-card-big-title {
    font-size: 1.6rem;
  }

  .library-card-header h2 {
    font-size: 15px;
  }

  .library-card-info {
    font-size: 1.2rem;
  }

  .library-card-extra ul {
    font-size: 1.2rem;
  }

  .library-actions button {
    font-size: 1.2rem;
  }
}
</style>