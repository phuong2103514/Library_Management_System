<template>
  <div class="book__footer">
    <div class="book__footer-content">
      <div class="book__footer-location-and-contact">
        <div class="book__footer-location">
          <div class="book__footer-location-brand">
            <div class="book__footer-location-icon-brand">
              <i class="fa-solid fa-book-open"></i>
            </div>

            <div class="book__footer-location-name-brand">ReadNest</div>
          </div>

          <div class="book__footer-location-name">
            <div>35 Nguyễn Huệ, Phường Bến Nghé</div>
          </div>

          <div class="book__footer-location-social-icon">
            <i class="fa-brands fa-facebook"></i>
            <i class="fa-brands fa-instagram"></i>
            <i class="fa-brands fa-pinterest"></i>
            <i class="fa-brands fa-twitter"></i>
          </div>
        </div>

        <div class="book__footer-contact">
          <div class="book__footer-contact-title">Cần hỗ trợ?</div>
          <div class="book__footer-contact-phone-number">
            (+84) 028 1234 5678
          </div>
          <div class="book__footer-contact-time-open">
            <div>Thứ Hai – Thứ Sáu: 9:00 - 20:00</div>
            <div>Thứ Bảy: 11:00 – 15:00</div>
          </div>
          <div class="book__footer-contact-email">readnest@gmail.com</div>
        </div>
      </div>

      <div class="book__footer-discover">
        <div class="book__footer-explore">
          <div class="book__footer-explore-title">Khám phá</div>
          <div>Về chúng tôi</div>
          <div>Sơ đồ trang</div>
          <div>Đánh dấu</div>
          <div>Đăng nhập/Đăng ký</div>
        </div>

        <div class="book__footer-our-service">
          <div class="book__footer-our-service-title">Dịch vụ</div>
          <div>Trung tâm trợ giúp</div>
          <div>Trả hàng</div>
          <div>Thu hồi sản phẩm</div>
          <div>Hỗ trợ truy cập</div>
          <div>Liên hệ</div>
          <div>Nhận tại cửa hàng</div>
        </div>

        <div class="book__footer-category">
          <div class="book__footer-category-title">Thể loại</div>
          <div>Hành động</div>
          <div>Hài hước</div>
          <div>Tâm lý</div>
          <div>Kinh dị</div>
          <div>Thiếu nhi</div>
        </div>
      </div>
    </div>

    <div class="book__footer-copyright">
      <div>Bản quyền © 2025 <span>ReadNest</span>. Đã đăng ký mọi quyền.</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Footer',
};
</script>

<style scoped>
/* ==================== RESPONSIVE STYLES FOR FOOTER ==================== */

/* Tablet và laptop nhỏ (max-width: 1200px) */
@media (max-width: 1200px) {
  .book__footer-content {
    flex-direction: column;
    gap: 40px;
    padding: 60px 30px;
  }

  .book__footer-location-and-contact {
    gap: 50px;
    width: 100%;
  }

  .book__footer-discover {
    gap: 80px;
    width: 100%;
  }
}

/* Tablet (max-width: 1024px) */
@media (max-width: 1024px) {
  .book__footer-content {
    padding: 50px 20px;
    gap: 35px;
  }

  .book__footer-location-and-contact {
    flex-wrap: wrap;
    gap: 40px;
  }

  .book__footer-contact {
    padding-left: 0;
    padding-right: 0;
    border-left: none;
    border-top: 1px solid #454545;
    padding-top: 30px;
  }

  .book__footer-discover {
    gap: 60px;
  }
}

/* Mobile lớn (max-width: 768px) */
@media (max-width: 768px) {
  .book__footer-content {
    padding: 40px 15px;
    gap: 30px;
  }

  .book__footer-location-and-contact {
    flex-direction: column;
    gap: 30px;
  }

  .book__footer-location {
    gap: 25px;
  }

  .book__footer-contact {
    gap: 20px;
    padding-top: 25px;
  }

  .book__footer-discover {
    flex-direction: column;
    gap: 30px;
  }

  .book__footer-explore,
  .book__footer-our-service,
  .book__footer-category {
    gap: 12px;
  }

  .book__footer-copyright {
    padding: 35px 15px;
  }
}

/* Mobile nhỏ (max-width: 480px) */
@media (max-width: 480px) {
  .book__footer-content {
    padding: 30px 10px;
    gap: 25px;
  }

  .book__footer-location {
    gap: 20px;
  }

  .book__footer-location-brand {
    gap: 8px;
  }

  .book__footer-location-social-icon {
    gap: 12px;
  }

  .book__footer-contact {
    gap: 15px;
    padding-top: 20px;
  }

  .book__footer-discover {
    gap: 25px;
  }

  .book__footer-explore,
  .book__footer-our-service,
  .book__footer-category {
    gap: 10px;
  }

  .book__footer-copyright {
    padding: 30px 10px;
  }
}

/* Mobile rất nhỏ (max-width: 360px) */
@media (max-width: 360px) {
  .book__footer-content {
    padding: 25px 8px;
  }

  .book__footer-location-social-icon {
    gap: 10px;
  }

  .book__footer-copyright {
    padding: 25px 8px;
  }
}
</style>