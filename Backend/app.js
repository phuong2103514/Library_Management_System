const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./app/api/auth/auth.routes"));
app.use("/api/book", require("./app/api/book/book.routes"));
app.use("/api/library", require("./app/api/library/library.routes"));
app.use("/api/room", require("./app/api/room/room.routes"));
app.use(
  "/api/notification",
  require("./app/api/notification/notification.routes")
);
app.use("/api/chatbot", require("./app/api/chatbot/chatbot.route"));

module.exports = app;

const notificationService = require("./app/api/notification/notification.service");
const DocGia = require("./app/models/docgiaModel");

// Auto check hạn của thẻ thư viện
const TheThuVien = require("./app/models/thethuvienModel");
const ThongTinGiaHan = require("./app/models/thongtingiahanModel");
const QuyDinhThuVien = require("./app/models/quydinhthuvienModel");

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

(async () => {
  try {
    const now = new Date();
    const today = normalizeDate(now);

    // Lấy các thẻ đang hoạt động, hết hạn nhưng chưa được check hôm nay
    const expiredCards = await TheThuVien.find({
      TrangThai: "Hoạt động",
      NgayHetHan: { $lt: now },
      $or: [{ NgayKiemTraHetHan: null }, { NgayKiemTraHetHan: { $lt: today } }],
    });

    let updatedCount = 0;

    // Lấy quy định thư viện (chỉ nên có 1 bản ghi)
    const rule = await QuyDinhThuVien.findOne();

    for (const card of expiredCards) {
      // 🔹 Lấy thông tin độc giả để biết là GV hay SV
      const docGia = await DocGia.findById(card.DocGia);
      if (!docGia) {
        console.warn(`⚠️ Không tìm thấy DocGia cho thẻ ${card.MaThe}`);
        continue;
      }

      // 🔹 Xác định phí gia hạn theo đối tượng
      let renewalFee = 10000; // fallback mặc định
      if (rule) {
        if (docGia.DoiTuong === "Giảng viên") {
          renewalFee = rule.renewalFeeLecturer;
        } else if (docGia.DoiTuong === "Sinh viên") {
          renewalFee = rule.renewalFee;
        }
      }

      // 🔹 Cập nhật trạng thái thẻ
      card.TrangThai = "Hết hạn";
      card.NgayKiemTraHetHan = now;
      await card.save();

      // 🔹 Ghi log gia hạn
      await ThongTinGiaHan.create({
        MaThe: card._id,
        PhiGiaHan: renewalFee,
      });

      // 🔹 Gửi thông báo
      try {
        await notificationService.createNotification({
          DocGia: card.DocGia,
          TieuDe: "Thẻ thư viện hết hạn",
          NoiDung: `Thẻ thư viện của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ. Phí gia hạn: ${renewalFee.toLocaleString(
            "vi-VN"
          )}đ`,
          LoaiThongBao: "error",
        });
      } catch (notifErr) {
        console.error(
          `Lỗi tạo thông báo cho thẻ ${card.MaThe}:`,
          notifErr.message
        );
      }

      updatedCount++;
    }

    if (updatedCount > 0) {
      console.log(
        `✅ Đã cập nhật trạng thái "Hết hạn" cho ${updatedCount} thẻ`
      );
    } else {
      console.log("✅ Hôm nay đã kiểm tra thẻ hết hạn rồi");
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra thẻ hết hạn:", err.message);
  }
})();

// Auto check quá hạn in thẻ
const ThongTinCapLaiThe = require("./app/models/thongtincaplaitheModel");

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

(async () => {
  try {
    const quyDinh = await QuyDinhThuVien.findOne({});
    if (!quyDinh) throw new Error("Chưa có quy định thư viện");

    // Lấy tất cả yêu cầu cấp lại thẻ đã được duyệt nhưng chưa in
    // ✅ POPULATE NGAY TỪ ĐẦU
    const approvedRequests = await ThongTinCapLaiThe.find({
      TrangThai: "approve",
      NgayDuyet: { $ne: null },
    }).populate({
      path: "MaThe",
      select: "DocGia MaThe", // Chỉ lấy field cần thiết
    });

    const today = normalizeDate(new Date());
    let hasLate = false;

    for (const request of approvedRequests) {
      const ngayDuyet = normalizeDate(request.NgayDuyet);

      let printWaitingDays;
      if (request.MaThe && request.MaThe.DocGia) {
        const docGia = await DocGia.findById(request.MaThe.DocGia).select(
          "DoiTuong"
        );
        if (docGia) {
          if (docGia.DoiTuong === "Giảng viên") {
            printWaitingDays = quyDinh.printWaitingDaysLecturer;
          } else {
            printWaitingDays = quyDinh.printWaitingDays;
          }
        }
      }

      const diffTime = today.getTime() - ngayDuyet.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > printWaitingDays) {
        // ✅ TẠO THÔNG BÁO TRƯỚC KHI SAVE (vì đã có dữ liệu populate)
        try {
          if (request.MaThe && request.MaThe.DocGia) {
            await notificationService.createNotification({
              DocGia: request.MaThe.DocGia,
              TieuDe: "Yêu cầu cấp lại thẻ bị từ chối",
              NoiDung: `Yêu cầu cấp lại thẻ thư viện của bạn đã bị từ chối do quá thời gian chờ in (${printWaitingDays} ngày). Vui lòng liên hệ thư viện để được hỗ trợ.`,
              LoaiThongBao: "error",
            });
          }
        } catch (notifErr) {
          console.error(
            `Lỗi tạo thông báo cho yêu cầu ${request._id}:`,
            notifErr.message
          );
        }

        // Quá hạn chờ in thẻ → chuyển sang denied
        request.TrangThai = "denied";
        await request.save();

        console.log(
          `Yêu cầu cấp lại thẻ ${request._id} đã quá hạn in, chuyển sang denied`
        );

        hasLate = true;
      }
    }

    if (!hasLate) {
      console.log("✅ Không có yêu cầu cấp lại thẻ nào quá hạn in.");
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra tự động printWaitingDays:", err);
  }
})();

//Auto check quá hạn nhận sách
const TheoDoiMuonSach = require("./app/models/theodoimuonsachModel");
const QuyDinhMuonSach = require("./app/models/quydinhmuonsachModel");
const { updateBorrowStatus } = require("./app/api/book/book.service");

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

(async () => {
  try {
    const quyDinh = await QuyDinhMuonSach.findOne({});
    // Lấy tất cả yêu cầu đang ở trạng thái processing
    const processingRequests = await TheoDoiMuonSach.find({
      TrangThai: "processing",
      NgayDuyet: { $ne: null },
    })
      .populate("MaSach", "TenSach")
      .populate("MaDocGia", "DoiTuong");

    const today = normalizeDate(new Date());
    let hasLate = false;

    for (const request of processingRequests) {
      const doiTuong = request.MaDocGia.DoiTuong;
      const pickupDeadlineDays =
        doiTuong === "Giảng viên"
          ? quyDinh
            ? quyDinh.pickupDeadlineLecturer
            : 0
          : quyDinh
          ? quyDinh.pickupDeadline
          : 0;

      const ngayDuyet = normalizeDate(request.NgayDuyet);

      const diffTime = today.getTime() - ngayDuyet.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > pickupDeadlineDays) {
        // Quá hạn pickupDeadline → chuyển sang denied
        await updateBorrowStatus(request._id, null, "denied"); // adminId null vì tự động
        console.log(
          `Yêu cầu ${request._id} đã quá hạn nhận sách, chuyển sang denied`
        );
        hasLate = true;

        //Tạo thông báo
        try {
          const sach = request.MaSach.TenSach;
          await notificationService.createNotification({
            DocGia: request.MaDocGia._id,
            TieuDe: "Yêu cầu mượn sách bị hủy do quá hạn nhận",
            NoiDung: `Yêu cầu mượn sách "${sach}" đã bị hủy vì bạn không đến nhận trong ${pickupDeadlineDays} ngày kể từ khi được duyệt.`,
            LoaiThongBao: "warning",
          });
        } catch (notifyErr) {
          console.error("❌ Lỗi khi tạo thông báo:", notifyErr);
        }
      }
    }

    if (!hasLate) {
      console.log("✅ Không có yêu cầu mượn nào quá hạn nhận sách.");
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra tự động pickupDeadline:", err);
  }
})();

// Auto check sách mượn quá hạn
(async () => {
  try {
    const today = normalizeDate(new Date());
    let hasLog = false;

    const approvedBorrows = await TheoDoiMuonSach.find({
      TrangThai: "approved",
      NgayTra: { $ne: null },
    })
      .populate("MaSach", "TenSach")
      .populate("MaDocGia", "_id HoTen");

    for (const borrow of approvedBorrows) {
      const ngayTra = normalizeDate(borrow.NgayTra);
      const diffDays = Math.floor(
        (ngayTra.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // --- TH1: Còn 2 ngày ---
      if (diffDays === 2) {
        // Kiểm tra xem hôm nay đã gửi thông báo chưa
        const daGuiHomNay =
          borrow.ThongBaoNhacTra2Ngay &&
          normalizeDate(borrow.ThongBaoNhacTra2Ngay).getTime() ===
            today.getTime();

        if (!daGuiHomNay) {
          hasLog = true;
          await notificationService.createNotification({
            DocGia: borrow.MaDocGia._id,
            TieuDe: "Nhắc nhở trả sách",
            NoiDung: `Sách "${borrow.MaSach.TenSach}" còn 2 ngày nữa đến hạn trả.`,
            LoaiThongBao: "info",
          });

          // Cập nhật trạng thái đã gửi
          borrow.ThongBaoNhacTra2Ngay = today;
          await borrow.save();
          console.log(
            `Đã gửi thông báo 2 ngày cho sách: ${borrow.MaSach.TenSach}`
          );
        }
      }

      // --- TH2: Còn 1 ngày ---
      else if (diffDays === 1) {
        const daGuiHomNay =
          borrow.ThongBaoNhacTra1Ngay &&
          normalizeDate(borrow.ThongBaoNhacTra1Ngay).getTime() ===
            today.getTime();

        if (!daGuiHomNay) {
          hasLog = true;
          await notificationService.createNotification({
            DocGia: borrow.MaDocGia._id,
            TieuDe: "Sắp đến hạn trả sách",
            NoiDung: `Sách "${borrow.MaSach.TenSach}" sẽ đến hạn trả vào ngày mai.`,
            LoaiThongBao: "warning",
          });

          borrow.ThongBaoNhacTra1Ngay = today;
          await borrow.save();
          console.log(
            `Đã gửi thông báo 1 ngày cho sách: ${borrow.MaSach.TenSach}`
          );
        }
      }

      // --- TH3: Hôm nay phải trả ---
      else if (diffDays === 0) {
        const daGuiHomNay =
          borrow.ThongBaoNhacTraHomNay &&
          normalizeDate(borrow.ThongBaoNhacTraHomNay).getTime() ===
            today.getTime();

        if (!daGuiHomNay) {
          hasLog = true;
          await notificationService.createNotification({
            DocGia: borrow.MaDocGia._id,
            TieuDe: "Hôm nay là hạn trả sách",
            NoiDung: `Hôm nay là hạn trả sách "${borrow.MaSach.TenSach}". Vui lòng hoàn trả đúng hạn để tránh phát sinh phí.`,
            LoaiThongBao: "warning",
          });

          borrow.ThongBaoNhacTraHomNay = today;
          await borrow.save();
          console.log(
            `Đã gửi thông báo hôm nay cho sách: ${borrow.MaSach.TenSach}`
          );
        }
      }

      // --- TH4: Đã quá hạn ---
      else if (diffDays < 0) {
        hasLog = true;
        // Chỉ cập nhật trạng thái nếu chưa phải overdue
        if (borrow.TrangThai !== "overdue") {
          borrow.TrangThai = "overdue";
          borrow.NgayGhiNhanQuaHan = today;
          await borrow.save();

          await notificationService.createNotification({
            DocGia: borrow.MaDocGia._id,
            TieuDe: "Sách mượn đã quá hạn trả",
            NoiDung: `Sách "${
              borrow.MaSach.TenSach
            }" đã quá hạn trả kể từ ngày ${borrow.NgayTra.toLocaleDateString(
              "vi-VN"
            )}. Vui lòng hoàn trả sớm.`,
            LoaiThongBao: "error",
          });
          console.log(
            `Đã chuyển sang overdue và gửi thông báo cho sách: ${borrow.MaSach.TenSach}`
          );
        }
      }
    }

    if (!hasLog) {
      console.log("✅ Không có sách nào sắp đến hạn hoặc quá hạn hôm nay.");
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra hạn trả sách:", err);
  }
})();

// Auto check phòng "no_show"
const TheoDoiDatPhong = require("./app/models/theodoimuonphongModel");

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

(async () => {
  try {
    const now = new Date();
    const today = normalizeDate(now);

    // Lấy danh sách đặt phòng đã duyệt (approved)
    const approvedBookings = await TheoDoiDatPhong.find({
      TrangThai: "approved",
    }).populate("PhongHoc");

    let countNoShow = 0;

    for (const booking of approvedBookings) {
      const ngaySuDung = normalizeDate(new Date(booking.NgaySuDung));

      // Nếu ngày sử dụng < hôm nay → no_show
      if (ngaySuDung < today) {
        booking.TrangThai = "no_show";
        await booking.save();
        console.log(
          `📅 Đặt phòng ${booking._id} đã quá ngày sử dụng, chuyển sang no_show`
        );
        countNoShow++;

        // ===== THÊM THÔNG BÁO Ở ĐÂY =====
        try {
          await notificationService.createNotification({
            DocGia: booking.DocGia,
            TieuDe: "Đặt phòng không được sử dụng",
            NoiDung: `Đặt phòng ${
              booking.PhongHoc.TenPhong || "phòng học"
            } ngày ${booking.NgaySuDung.toLocaleDateString(
              "vi-VN"
            )} đã được hủy do bạn chưa đến nhận phòng đúng ngày.`,
            LoaiThongBao: "warning",
          });
        } catch (notifErr) {
          console.error(
            `Lỗi tạo thông báo cho booking ${booking._id}:`,
            notifErr.message
          );
        }

        continue;
      }

      // Nếu ngày sử dụng là hôm nay → kiểm tra giờ kết thúc
      if (ngaySuDung.getTime() === today.getTime()) {
        // Tạo Date object với giờ kết thúc của đặt phòng
        const [endHour, endMinute] = booking.GioKetThuc.split(":").map(Number);
        const endTime = new Date(ngaySuDung);
        endTime.setHours(endHour, endMinute, 0, 0);

        if (now > endTime) {
          booking.TrangThai = "no_show";
          await booking.save();
          console.log(
            `⏰ Đặt phòng ${booking._id} đã qua giờ kết thúc, chuyển sang no_show`
          );
          countNoShow++;

          // ===== THÊM THÔNG BÁO Ở ĐÂY =====
          try {
            await notificationService.createNotification({
              DocGia: booking.DocGia,
              TieuDe: "Đặt phòng không được sử dụng",
              NoiDung: `Đặt phòng ${
                booking.PhongHoc.TenPhong || "phòng học"
              } ngày ${booking.NgaySuDung.toLocaleDateString("vi-VN")} từ ${
                booking.GioBatDau
              } đến ${booking.GioKetThuc} đã bị hủy do bạn không đến sử dụng.`,
              LoaiThongBao: "warning",
            });
          } catch (notifErr) {
            console.error(
              `Lỗi tạo thông báo cho booking ${booking._id}:`,
              notifErr.message
            );
          }
        }
      }
    }

    if (countNoShow > 0) {
      console.log(
        `✅ Đã cập nhật ${countNoShow} lượt đặt phòng sang trạng thái "no_show"`
      );
    } else {
      console.log("✅ Không có phòng nào cần chuyển sang no_show hôm nay.");
    }
  } catch (err) {
    console.error("❌ Lỗi khi auto check no_show:", err.message);
  }
})();

// Auto check phòng pending quá giờ → denied
(async () => {
  try {
    const now = new Date();
    const today = normalizeDate(now);

    // Lấy danh sách đặt phòng đang pending
    const pendingBookings = await TheoDoiDatPhong.find({
      TrangThai: "pending",
    }).populate("PhongHoc");

    let countDenied = 0;

    for (const booking of pendingBookings) {
      const ngaySuDung = normalizeDate(new Date(booking.NgaySuDung));

      // Nếu ngày sử dụng < hôm nay → denied
      if (ngaySuDung < today) {
        booking.TrangThai = "denied";
        await booking.save();
        console.log(
          `📅 Đặt phòng ${booking._id} đã quá ngày sử dụng, chuyển sang denied`
        );
        countDenied++;

        // ===== THÊM THÔNG BÁO =====
        try {
          await notificationService.createNotification({
            DocGia: booking.DocGia,
            TieuDe: "Đặt phòng bị từ chối",
            NoiDung: `Đặt phòng ${
              booking.PhongHoc.TenPhong || "phòng học"
            } vào ngày ${booking.NgaySuDung.toLocaleDateString(
              "vi-VN"
            )} đã bị từ chối do quá thời gian chờ duyệt.`,
            LoaiThongBao: "error",
          });
        } catch (notifErr) {
          console.error(
            `Lỗi tạo thông báo cho booking ${booking._id}:`,
            notifErr.message
          );
        }

        continue;
      }

      // Nếu ngày sử dụng là hôm nay → kiểm tra giờ bắt đầu
      if (ngaySuDung.getTime() === today.getTime()) {
        const [startHour, startMinute] =
          booking.GioBatDau.split(":").map(Number);
        const startTime = new Date(ngaySuDung);
        startTime.setHours(startHour, startMinute, 0, 0);

        if (now >= startTime) {
          booking.TrangThai = "denied";
          await booking.save();
          console.log(
            `⏰ Đặt phòng ${booking._id} đã tới giờ bắt đầu mà chưa duyệt, chuyển sang denied`
          );
          countDenied++;

          // ===== THÊM THÔNG BÁO =====
          try {
            await notificationService.createNotification({
              DocGia: booking.DocGia,
              TieuDe: "Đặt phòng bị từ chối",
              NoiDung: `Đặt phòng ${
                booking.PhongHoc.TenPhong || "phòng học"
              } vào ngày ${booking.NgaySuDung.toLocaleDateString(
                "vi-VN"
              )} lúc ${booking.GioBatDau} - ${
                booking.GioKetThuc
              } đã bị từ chối do chưa được duyệt đúng giờ.`,
              LoaiThongBao: "error",
            });
          } catch (notifErr) {
            console.error(
              `Lỗi tạo thông báo cho booking ${booking._id}:`,
              notifErr.message
            );
          }
        }
      }
    }

    if (countDenied > 0) {
      console.log(
        `✅ Đã cập nhật ${countDenied} lượt đặt phòng sang trạng thái "denied"`
      );
    } else {
      console.log("✅ Không có phòng pending nào cần chuyển sang denied.");
    }
  } catch (err) {
    console.error("❌ Lỗi khi auto check pending → denied:", err.message);
  }
})();

// Auto check phòng waiting_members quá giờ → canceled
(async () => {
  try {
    const now = new Date();
    const today = normalizeDate(now);

    // Lấy danh sách đặt phòng đang waiting_members
    const waitingBookings = await TheoDoiDatPhong.find({
      TrangThai: "waiting_members",
    }).populate("PhongHoc");

    let countCanceled = 0;

    for (const booking of waitingBookings) {
      const ngaySuDung = normalizeDate(new Date(booking.NgaySuDung));

      // Nếu ngày sử dụng < hôm nay → canceled
      if (ngaySuDung < today) {
        // ===== LƯU DANH SÁCH THÀNH VIÊN CHƯA PHẢN HỒI TRƯỚC KHI THAY ĐỔI =====
        const invitedMembers = booking.ThanhVien.filter(
          (member) => member.TrangThai === "invited" && member.DocGia
        );

        // ===== TỰ ĐỘNG DECLINED CÁC THÀNH VIÊN CHƯA PHẢN HỒI =====
        booking.ThanhVien.forEach((member) => {
          if (member.TrangThai === "invited") {
            member.TrangThai = "declined";
          }
        });

        booking.TrangThai = "canceled";
        await booking.save();
        console.log(
          `📅 Đặt phòng ${booking._id} đã quá ngày sử dụng, chuyển sang canceled`
        );
        countCanceled++;

        // ===== THÔNG BÁO CHO NGƯỜI TẠO PHÒNG =====
        try {
          await notificationService.createNotification({
            DocGia: booking.DocGia,
            TieuDe: "Đặt phòng nhóm bị hủy",
            NoiDung: `Đặt phòng nhóm ${
              booking.PhongHoc.TenPhong || "phòng học"
            } vào ngày ${booking.NgaySuDung.toLocaleDateString(
              "vi-VN"
            )} đã bị hủy do quá thời gian chờ thành viên xác nhận.`,
            LoaiThongBao: "error",
          });
        } catch (notifErr) {
          console.error(
            `Lỗi tạo thông báo cho người tạo booking ${booking._id}:`,
            notifErr.message
          );
        }

        // ===== THÔNG BÁO CHO CÁC THÀNH VIÊN CHƯA PHẢN HỒI =====
        for (const member of invitedMembers) {
          try {
            await notificationService.createNotification({
              DocGia: member.DocGia,
              TieuDe: "Lời mời đặt phòng nhóm đã hết hạn",
              NoiDung: `Lời mời tham gia phòng nhóm ${
                booking.PhongHoc.TenPhong || "phòng học"
              } vào ngày ${booking.NgaySuDung.toLocaleDateString(
                "vi-VN"
              )} đã hết hạn do bạn chưa phản hồi.`,
              LoaiThongBao: "warning",
            });
          } catch (notifErr) {
            console.error(
              `Lỗi tạo thông báo cho thành viên ${member.DocGia}:`,
              notifErr.message
            );
          }
        }

        continue;
      }

      // Nếu ngày sử dụng là hôm nay → kiểm tra giờ bắt đầu
      if (ngaySuDung.getTime() === today.getTime()) {
        const [startHour, startMinute] =
          booking.GioBatDau.split(":").map(Number);
        const startTime = new Date(ngaySuDung);
        startTime.setHours(startHour, startMinute, 0, 0);

        if (now >= startTime) {
          // ===== LƯU DANH SÁCH THÀNH VIÊN CHƯA PHẢN HỒI TRƯỚC KHI THAY ĐỔI =====
          const invitedMembers = booking.ThanhVien.filter(
            (member) => member.TrangThai === "invited" && member.DocGia
          );

          // ===== TỰ ĐỘNG DECLINED CÁC THÀNH VIÊN CHƯA PHẢN HỒI =====
          booking.ThanhVien.forEach((member) => {
            if (member.TrangThai === "invited") {
              member.TrangThai = "declined";
            }
          });

          booking.TrangThai = "canceled";
          await booking.save();
          console.log(
            `⏰ Đặt phòng ${booking._id} đã tới giờ bắt đầu mà vẫn chờ thành viên, chuyển sang canceled`
          );
          countCanceled++;

          // ===== THÔNG BÁO CHO NGƯỜI TẠO PHÒNG =====
          try {
            await notificationService.createNotification({
              DocGia: booking.DocGia,
              TieuDe: "Đặt phòng nhóm bị hủy",
              NoiDung: `Đặt phòng nhóm ${
                booking.PhongHoc.TenPhong || "phòng học"
              } vào ngày ${booking.NgaySuDung.toLocaleDateString(
                "vi-VN"
              )} lúc ${booking.GioBatDau} - ${
                booking.GioKetThuc
              } đã bị hủy do chưa đủ thành viên xác nhận đúng giờ.`,
              LoaiThongBao: "error",
            });
          } catch (notifErr) {
            console.error(
              `Lỗi tạo thông báo cho người tạo booking ${booking._id}:`,
              notifErr.message
            );
          }

          // ===== THÔNG BÁO CHO CÁC THÀNH VIÊN CHƯA PHẢN HỒI =====
          for (const member of invitedMembers) {
            try {
              await notificationService.createNotification({
                DocGia: member.DocGia,
                TieuDe: "Lời mời đặt phòng nhóm đã hết hạn",
                NoiDung: `Lời mời tham gia phòng nhóm ${
                  booking.PhongHoc.TenPhong || "phòng học"
                } vào ngày ${booking.NgaySuDung.toLocaleDateString(
                  "vi-VN"
                )} lúc ${booking.GioBatDau} - ${
                  booking.GioKetThuc
                } đã hết hạn do bạn chưa phản hồi.`,
                LoaiThongBao: "warning",
              });
            } catch (notifErr) {
              console.error(
                `Lỗi tạo thông báo cho thành viên ${member.DocGia}:`,
                notifErr.message
              );
            }
          }
        }
      }
    }

    if (countCanceled > 0) {
      console.log(
        `✅ Đã cập nhật ${countCanceled} lượt đặt phòng sang trạng thái "canceled"`
      );
    } else {
      console.log(
        "✅ Không có phòng waiting_members nào cần chuyển sang canceled."
      );
    }
  } catch (err) {
    console.error(
      "❌ Lỗi khi auto check waiting_members → canceled:",
      err.message
    );
  }
})();


// Auto check đóng đợt nộp luận văn

const DotNopLuanVan = require("./app/models/dotnopluanvanModel");

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

(async () => {
  try {
    const today = normalizeDate(new Date());

    // Lấy tất cả đợt nộp có trạng thái khác "Đã đóng"
    const dots = await DotNopLuanVan.find({
      TrangThai: { $ne: "Đã đóng" },
    });

    let hasClosed = false;

    for (const dot of dots) {
      const thoiGianDong = normalizeDate(dot.ThoiGianDongNop);

      if (today > thoiGianDong) {
        dot.TrangThai = "Đã đóng";
        await dot.save();
        console.log(
          `Đợt nộp "${dot.TenDot}" đã được cập nhật sang trạng thái "Đã đóng".`
        );
        hasClosed = true;
      }
    }

    if (!hasClosed) {
      console.log("✅ Không có đợt nộp nào cần đóng hôm nay.");
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra tự động đóng đợt nộp:", err);
  }
})();

// Auto check đóng đợt nộp niên luận
const DotNopNienLuan = require("./app/models/dotnopnienluanModel");

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

(async () => {
  try {
    const today = normalizeDate(new Date());

    // Lấy tất cả đợt nộp có trạng thái khác "Đã đóng"
    const dots = await DotNopNienLuan.find({ TrangThai: { $ne: "Đã đóng" } });

    let hasClosed = false;

    for (const dot of dots) {
      const thoiGianDong = normalizeDate(dot.ThoiGianDongNop);

      if (today > thoiGianDong) {
        dot.TrangThai = "Đã đóng";
        await dot.save();

        console.log(
          `Đợt nộp niên luận "${dot.TenDot}" đã được cập nhật sang trạng thái "Đã đóng".`
        );
        hasClosed = true;
      }
    }

    if (!hasClosed) {
      console.log("✅ Không có đợt nộp niên luận nào cần đóng hôm nay.");
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra tự động đóng đợt nộp niên luận:", err);
  }
})();

// const bcrypt = require('bcryptjs');
// const NhanVien = require("./app/models/nhanvienModel"); 
// (async () => {
//   try {
//     const saltRounds = 10;

//     // Thủ Thư
//     const thuThuPassword = await bcrypt.hash("thuthu", saltRounds);
//     const thuThu = await NhanVien.create({
//       Msnv: "NV001",
//       HoTenNV: "Nguyễn Văn Anh",
//       Username: "thuthu",
//       Password: thuThuPassword,
//       ChucVu: "Thủ Thư",
//       DiaChi: "Cần Thơ",
//       SoDienThoai: "0900000001",
//     });

//     // Admin (Quản Lý)
//     const adminPassword = await bcrypt.hash("admin", saltRounds);
//     const admin = await NhanVien.create({
//       Msnv: "NV002",
//       HoTenNV: "Trần Văn Hoàng",
//       Username: "admin123",
//       Password: adminPassword,
//       ChucVu: "Quản Lý",
//       DiaChi: "Cần Thơ",
//       SoDienThoai: "0900000002",
//     });

//     console.log("✅ Đã tạo nhân viên:");
//     console.log(thuThu);
//     console.log(admin);

//   } catch (err) {
//     console.error("❌ Lỗi:", err.message);
//   }
// })();

// const QuyDinhPhongHoc = require('./app/models/quydinhphonghocModel');
// (async () => {
//   try {
//     // Tạo dữ liệu mẫu (giống default trong schema)
//     const rule = await QuyDinhPhongHoc.create({
//       bookingLeadTime: 2, // Thời hạn đặt trước (số ngày)
//     });

//     console.log("✅ Đã tạo quy định phòng học:");
//     console.log(`bookingLeadTime: ${rule.bookingLeadTime} ngày`);
//   } catch (err) {
//     console.error("❌ Lỗi:", err.message);
//   }
// })();


// (async () => {
//   try {
//     const rule = await QuyDinhThuVien.create({});

//     console.log("✅ Đã tạo quy định thư viện:");
//     console.log(rule);
//   } catch (err) {
//     console.error("❌ Lỗi:", err.message);
//   }
// })();

// (async () => {
//   try {
//     const rule = await QuyDinhMuonSach.create({});

//     console.log("✅ Đã tạo quy định mượn sách:");
//     console.log(rule);
//   } catch (err) {
//     console.error("❌ Lỗi:", err.message);
//   }
// })();

// const QuyDinhPhatSach = require("./app/models/quydinhphatsachModel");
// (async () => {
//   try {
//     const rule = await QuyDinhPhatSach.create({});

//     console.log("✅ Đã tạo quy định phạt sách:");
//     console.log(rule);
//   } catch (err) {
//     console.error("❌ Lỗi:", err.message);
//   }
// })();


// ----------------------Create Room Booking Data-------------------------
// const PhongHoc = require('./app/models/phonghocModel');

// // Hàm tạo lượt đặt phòng trực tiếp vào database
// async function createRoomBooking(bookingData) {
//     const newBooking = new TheoDoiDatPhong(bookingData);
//     const savedBooking = await newBooking.save();
//     return savedBooking;
// }

// // Lấy danh sách độc giả từ database
// async function getAllReaders() {
//     try {
//         const readers = await DocGia.find({}).select('_id MaDocGia HoLot Ten DoiTuong');
//         console.log(`✅ Đã tải ${readers.length} độc giả từ database`);
//         return readers;
//     } catch (error) {
//         console.error('❌ Lỗi khi tải độc giả:', error.message);
//         return [];
//     }
// }

// // Lấy danh sách phòng học từ database
// async function getAllRooms() {
//     try {
//         const rooms = await PhongHoc.find({}).select('_id MaPhong TenPhong LoaiPhong SucChua ChoNgoi');
//         console.log(`✅ Đã tải ${rooms.length} phòng học từ database`);
//         return rooms;
//     } catch (error) {
//         console.error('❌ Lỗi khi tải phòng học:', error.message);
//         return [];
//     }
// }

// // Hàm random độc giả (một số active hơn)
// function getRandomReader(readers) {
//     const activeCount = Math.floor(readers.length * 0.6); // 60% độc giả active
//     const activeReaders = readers.slice(0, activeCount);
//     const normalReaders = readers.slice(activeCount);

//     // 70% cơ hội chọn độc giả active
//     if (Math.random() < 0.7 && activeReaders.length > 0) {
//         return activeReaders[Math.floor(Math.random() * activeReaders.length)];
//     } else if (normalReaders.length > 0) {
//         return normalReaders[Math.floor(Math.random() * normalReaders.length)];
//     }
//     return readers[Math.floor(Math.random() * readers.length)];
// }

// // Hàm random phòng học
// function getRandomRoom(rooms) {
//     return rooms[Math.floor(Math.random() * rooms.length)];
// }

// // Hàm random trạng thái (phân bố thực tế)
// function getRandomStatus() {
//     const rand = Math.random();
//     if (rand < 0.05) return 'pending';        // 5% chờ duyệt
//     if (rand < 0.10) return 'waiting_members'; // 5% chờ thành viên
//     if (rand < 0.50) return 'approved';       // 40% đã duyệt
//     if (rand < 0.60) return 'checked_in';     // 10% đã nhận phòng
//     if (rand < 0.75) return 'no_show';        // 15% không nhận phòng
//     if (rand < 0.85) return 'denied';         // 10% bị từ chối
//     return 'canceled';                         // 15% đã hủy
// }

// // Hàm random giờ sử dụng phòng
// function getRandomTimeSlot() {
//     const startHours = [7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19];
//     const startHour = startHours[Math.floor(Math.random() * startHours.length)];
//     const duration = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)]; // 1-5 giờ
    
//     const endHour = Math.min(startHour + duration, 22);
    
//     return {
//         start: `${String(startHour).padStart(2, '0')}:00`,
//         end: `${String(endHour).padStart(2, '0')}:00`
//     };
// }

// // Hàm random chọn chỗ ngồi
// function getRandomSeats(room, isGroupRoom) {
//     const availableSeats = room.ChoNgoi.map(seat => seat.SoCho);
    
//     if (!isGroupRoom || availableSeats.length === 0) {
//         // Phòng cá nhân: chọn 1 chỗ
//         return [availableSeats[Math.floor(Math.random() * availableSeats.length)] || 1];
//     }
    
//     // Phòng nhóm: chọn 2-5 chỗ
//     const numSeats = Math.min(
//         Math.floor(Math.random() * 4) + 2, // 2-5 chỗ
//         availableSeats.length
//     );
    
//     const shuffled = availableSeats.sort(() => Math.random() - 0.5);
//     return shuffled.slice(0, numSeats);
// }

// // Hàm random thành viên cho phòng nhóm
// function getRandomMembers(readers, mainReader, numMembers) {
//     const members = [];
//     const availableReaders = readers.filter(r => r._id.toString() !== mainReader._id.toString());
    
//     const shuffled = availableReaders.sort(() => Math.random() - 0.5);
    
//     for (let i = 0; i < Math.min(numMembers, shuffled.length); i++) {
//         const memberStatus = Math.random() < 0.85 ? 'accepted' : 
//                            Math.random() < 0.5 ? 'invited' : 'declined';
        
//         members.push({
//             DocGia: shuffled[i]._id,
//             TrangThai: memberStatus
//         });
//     }
    
//     return members;
// }

// // Hàm tạo ngày đặt phòng phân bố đều TRONG 1 NĂM
// function generateYearBookingDates(targetCount) {
//     const now = new Date();
//     const oneYearAgo = new Date();
//     oneYearAgo.setFullYear(now.getFullYear() - 1);
//     oneYearAgo.setDate(now.getDate());

//     const dates = [];
//     const totalDays = Math.floor((now - oneYearAgo) / (1000 * 60 * 60 * 24));
    
//     console.log(`📅 Tạo dữ liệu từ ${oneYearAgo.toLocaleDateString('vi-VN')} đến ${now.toLocaleDateString('vi-VN')} (${totalDays} ngày)`);

//     // Tạo trọng số cho mỗi tháng (tháng gần có nhiều hơn)
//     const monthWeights = [];
//     for (let month = 0; month < 12; month++) {
//         // Tháng càng gần hiện tại càng có trọng số cao
//         const weight = 0.6 + (month / 12) * 0.8; // Từ 0.6 đến 1.4
//         monthWeights.push(weight);
//     }

//     // Điều chỉnh trọng số theo thứ trong tuần
//     const adjustWeightByDayOfWeek = (date, weight) => {
//         const dayOfWeek = date.getDay();
//         const weekdayMultiplier = {
//             0: 0.5,  // Chủ nhật - ít nhất
//             1: 1.0,  // Thứ 2
//             2: 1.2,  // Thứ 3
//             3: 1.3,  // Thứ 4 - nhiều nhất
//             4: 1.2,  // Thứ 5
//             5: 1.1,  // Thứ 6
//             6: 0.7   // Thứ 7
//         };
//         return weight * weekdayMultiplier[dayOfWeek];
//     };

//     // Tạo dữ liệu cho từng ngày
//     for (let day = 0; day < totalDays; day++) {
//         const currentDate = new Date(oneYearAgo);
//         currentDate.setDate(oneYearAgo.getDate() + day);

//         // Lấy trọng số của tháng
//         const monthIndex = Math.floor((day / totalDays) * 12);
//         let weight = monthWeights[Math.min(monthIndex, 11)];
        
//         // Điều chỉnh theo thứ trong tuần
//         weight = adjustWeightByDayOfWeek(currentDate, weight);

//         // Tính số lượt đặt cho ngày này
//         const baseCount = targetCount / totalDays * weight;
//         const randomVariation = (Math.random() - 0.5) * 3;
//         const dayCount = Math.max(0, Math.round(baseCount + randomVariation));

//         // Tạo các lượt đặt trong ngày
//         for (let i = 0; i < dayCount; i++) {
//             const bookingDate = new Date(currentDate);
            
//             // Random giờ đặt (thường đặt trước 1-5 ngày)
//             const daysBeforeUsage = Math.floor(Math.random() * 5) + 1;
//             bookingDate.setDate(bookingDate.getDate() - daysBeforeUsage);
            
//             // Random giờ trong ngày (7h-21h)
//             const hourRand = Math.random();
//             let hour;
//             if (hourRand < 0.15) {
//                 hour = 7 + Math.floor(Math.random() * 2);  // 7-8h: 15%
//             } else if (hourRand < 0.35) {
//                 hour = 9 + Math.floor(Math.random() * 3);  // 9-11h: 20%
//             } else if (hourRand < 0.45) {
//                 hour = 12 + Math.floor(Math.random() * 2); // 12-13h: 10%
//             } else if (hourRand < 0.70) {
//                 hour = 14 + Math.floor(Math.random() * 4); // 14-17h: 25%
//             } else {
//                 hour = 18 + Math.floor(Math.random() * 4); // 18-21h: 30%
//             }

//             const minute = Math.floor(Math.random() * 60);
//             bookingDate.setHours(hour, minute, 0, 0);
            
//             dates.push({
//                 bookingDate: bookingDate,
//                 usageDate: new Date(currentDate)
//             });
//         }
//     }

//     // Shuffle để random hơn
//     for (let i = dates.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [dates[i], dates[j]] = [dates[j], dates[i]];
//     }

//     return dates.slice(0, targetCount);
// }

// // Hàm chính tạo dữ liệu
// (async () => {
//     try {
//         console.log("\n" + "🚀 ".repeat(30));
//         console.log("       BẮT ĐẦU TẠO DỮ LIỆU ĐẶT PHÒNG HỌC       ");
//         console.log("🚀 ".repeat(30) + "\n");

//         // Tải dữ liệu từ database
//         console.log("📥 Đang tải dữ liệu từ database...\n");
//         const readers = await getAllReaders();
//         const rooms = await getAllRooms();

//         if (readers.length === 0) {
//             console.error("❌ Không có độc giả trong database! Vui lòng thêm độc giả trước.");
//             return;
//         }

//         if (rooms.length === 0) {
//             console.error("❌ Không có phòng học trong database! Vui lòng thêm phòng trước.");
//             return;
//         }

//         console.log("\n✅ Đã tải thành công:");
//         console.log(`   📚 ${readers.length} độc giả`);
//         console.log(`   🏫 ${rooms.length} phòng học`);

//         // Cấu hình - TẠO DỮ LIỆU TRONG 1 NĂM
//         const TARGET_BOOKING_COUNT = 800; // Tăng lên 800 để phân bố đủ trong 1 năm

//         console.log("\n" + "=".repeat(60));
//         console.log("⚙️  CẤU HÌNH TẠO DỮ LIỆU");
//         console.log("=".repeat(60));
//         console.log(`📊 Số lượt đặt mục tiêu: ${TARGET_BOOKING_COUNT}`);
//         console.log(`📅 Khoảng thời gian: 1 năm (từ năm ngoái đến nay)`);
//         console.log(`📈 Phân bố: Tháng gần đây có nhiều hơn tháng cũ`);

//         let successCount = 0;
//         let errorCount = 0;

//         console.log("\n⏳ Đang tạo phân bố ngày đặt trong 1 năm...");
//         const bookingDates = generateYearBookingDates(TARGET_BOOKING_COUNT);
//         console.log(`✅ Đã tạo ${bookingDates.length} khoảng thời gian phân bố\n`);

//         console.log("=".repeat(60));
//         console.log("💾 BẮT ĐẦU TẠO VÀ LƯU DỮ LIỆU VÀO DATABASE");
//         console.log("=".repeat(60) + "\n");

//         const startTime = Date.now();

//         for (let i = 0; i < bookingDates.length; i++) {
//             try {
//                 const { bookingDate, usageDate } = bookingDates[i];
//                 const reader = getRandomReader(readers);
//                 const room = getRandomRoom(rooms);
//                 const status = getRandomStatus();
//                 const timeSlot = getRandomTimeSlot();
                
//                 const isGroupRoom = room.LoaiPhong === 'Nhóm';
//                 const selectedSeats = getRandomSeats(room, isGroupRoom);
                
//                 // Tạo thành viên nếu là phòng nhóm
//                 let members = [];
//                 if (isGroupRoom && selectedSeats.length > 1) {
//                     members = getRandomMembers(readers, reader, selectedSeats.length - 1);
//                 }

//                 // Tạo ngày duyệt nếu đã duyệt
//                 let approvalDate = null;
//                 if (['approved', 'checked_in', 'no_show', 'denied'].includes(status)) {
//                     approvalDate = new Date(bookingDate);
//                     const hoursToAdd = Math.floor(Math.random() * 48) + 1; // 1-48 giờ sau
//                     approvalDate.setHours(bookingDate.getHours() + hoursToAdd);
//                 }

//                 const bookingData = {
//                     NgayDat: bookingDate,
//                     NgaySuDung: usageDate,
//                     NgayDuyet: approvalDate,
//                     GioBatDau: timeSlot.start,
//                     GioKetThuc: timeSlot.end,
//                     TrangThai: status,
//                     PhongHoc: room._id,
//                     DocGia: reader._id,
//                     ThanhVien: members,
//                     ChoNgoiDaChon: selectedSeats
//                 };

//                 const result = await createRoomBooking(bookingData);

//                 if (result) {
//                     successCount++;
                    
//                     if (successCount % 50 === 0) {
//                         const progress = ((successCount / bookingDates.length) * 100).toFixed(1);
//                         const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
//                         console.log(`[${successCount}/${bookingDates.length}] Tiến độ: ${progress}% - Thời gian: ${elapsed}s`);
//                     }
//                 }

//                 // Delay nhỏ để tránh quá tải database
//                 if (i % 30 === 0 && i > 0) {
//                     await new Promise(resolve => setTimeout(resolve, 30));
//                 }

//             } catch (error) {
//                 errorCount++;
//                 if (errorCount <= 3) {
//                     console.log(`❌ Lỗi [${errorCount}]: ${error.message}`);
//                 }
//             }
//         }

//         const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

//         // Kết quả chi tiết
//         console.log("\n" + "=".repeat(60));
//         console.log("📊 KẾT QUẢ TẠO DỮ LIỆU");
//         console.log("=".repeat(60));
//         console.log(`✅ Thành công: ${successCount} lượt đặt`);
//         console.log(`❌ Lỗi: ${errorCount} lượt`);
//         console.log(`⏱️  Thời gian: ${totalTime}s`);
//         console.log(`📈 Tỷ lệ thành công: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

//         console.log("\n" + "=".repeat(60));
//         console.log("📈 THỐNG KÊ CHI TIẾT");
//         console.log("=".repeat(60));
//         console.log(`📚 Trung bình mỗi phòng: ~${(successCount / rooms.length).toFixed(1)} lượt đặt`);
//         console.log(`👥 Trung bình mỗi độc giả: ~${(successCount / readers.length).toFixed(1)} lượt đặt`);
//         console.log(`📅 Trung bình mỗi ngày: ~${(successCount / 365).toFixed(1)} lượt đặt`);
//         console.log(`📅 Trung bình mỗi tuần: ~${(successCount / 52).toFixed(1)} lượt đặt`);
//         console.log(`📅 Trung bình mỗi tháng: ~${(successCount / 12).toFixed(1)} lượt đặt`);
//         console.log(`📅 Trung bình mỗi quý: ~${(successCount / 4).toFixed(1)} lượt đặt`);

//         console.log("\n📅 PHÂN BỐ THỜI GIAN:");
//         console.log(`   ✓ Dữ liệu trong 1 năm (365 ngày)`);
//         console.log(`   ✓ Tháng gần đây có nhiều lượt hơn tháng cũ`);
//         console.log(`   ✓ Thứ 4 có nhiều nhất, Chủ nhật ít nhất`);
//         console.log(`   ✓ Giờ cao điểm: 14h-18h (25%) và 18h-22h (30%)`);

//         console.log("\n🎯 PHÂN BỐ TRẠNG THÁI:");
//         console.log(`   ✓ 40% Đã duyệt`);
//         console.log(`   ✓ 15% Không nhận phòng`);
//         console.log(`   ✓ 15% Đã hủy`);
//         console.log(`   ✓ 10% Đã nhận phòng`);
//         console.log(`   ✓ 10% Bị từ chối`);
//         console.log(`   ✓ 5% Chờ duyệt`);
//         console.log(`   ✓ 5% Chờ thành viên`);

//         console.log("\n👥 PHÂN TÍCH HÀNH VI:");
//         console.log(`   ✓ 70% lượt đặt từ độc giả tích cực`);
//         console.log(`   ✓ Random đều trên tất cả phòng`);
//         console.log(`   ✓ Phòng nhóm có 2-5 chỗ ngồi được chọn`);
//         console.log(`   ✓ Đặt trước 1-5 ngày trước ngày sử dụng`);

//         console.log("\n" + "✨ ".repeat(30));
//         console.log("           HOÀN THÀNH TẠO DỮ LIỆU!           ");
//         console.log("✨ ".repeat(30) + "\n");

//         console.log("💡 GỢI Ý:");
//         console.log("   - Bây giờ bạn có thể xem thống kê theo ngày/tuần/tháng/quý/năm");
//         console.log("   - Dữ liệu phân bố đều trong 12 tháng qua");
//         console.log("   - Nếu muốn xóa, chạy phần script xóa bên dưới\n");

//     } catch (err) {
//         console.error("\n❌ LỖI CHUNG KHI CHẠY SCRIPT:", err.message);
//         console.error(err.stack);
//     }
// })();


//=============================================================================
//                     SCRIPT XÓA DỮ LIỆU ĐẶT PHÒNG
//=============================================================================
// async function deleteAllRoomBookings() {
//     try {
//         console.log("\n" + "=".repeat(60));
//         console.log("⚠️  XÓA TẤT CẢ DỮ LIỆU ĐẶT PHÒNG");
//         console.log("=".repeat(60) + "\n");

//         // Đếm trước khi xóa
//         const countBefore = await TheoDoiDatPhong.countDocuments();
//         console.log(`📊 Số lượng hiện tại: ${countBefore} lượt đặt\n`);

//         if (countBefore === 0) {
//             console.log("✅ Database đã trống, không cần xóa.\n");
//             return 0;
//         }

//         console.log("⏳ Đang xóa...");
//         const result = await TheoDoiDatPhong.deleteMany({});
        
//         console.log("\n" + "=".repeat(60));
//         console.log(`✅ ĐÃ XÓA THÀNH CÔNG ${result.deletedCount} LƯỢT ĐẶT PHÒNG`);
//         console.log("=".repeat(60) + "\n");
        
//         return result.deletedCount;
//     } catch (error) {
//         console.error("❌ Lỗi khi xóa dữ liệu:", error.message);
//         throw error;
//     }
// }
// (async () => {
//     try {
//         await deleteAllRoomBookings();
//     } catch (err) {
//         console.error("\n❌ LỖI:", err.message);
//     }
// })();


// Dọn dẹp trạng thái no_show checked_in khi tạo tự động
// (async () => {
//   try {
//     // Lấy danh sách đặt phòng bị no_show hoặc checked_in
//     const bookings = await TheoDoiDatPhong.find({
//       TrangThai: { $in: ["no_show", "checked_in"] }
//     });

//     let countUpdated = 0;

//     for (const booking of bookings) {
//       // Thành viên nào còn invited -> accepted
//       booking.ThanhVien.forEach(member => {
//         if (member.TrangThai === "invited") {
//           member.TrangThai = "accepted";
//         }
//       });

//       await booking.save();
//       countUpdated++;
//     }

//     if (countUpdated > 0) {
//       console.log(`Đã cập nhật ${countUpdated} booking no_show/checked_in.`);
//     } else {
//       console.log("Không có booking no_show/checked_in nào cần cập nhật.");
//     }

//   } catch (err) {
//     console.error("Lỗi khi xử lý no_show/checked_in:", err.message);
//   }
// })();


// Dọn dẹp trạng thái denied khi tạo tự động
// (async () => {
//   try {
//     // Lấy tất cả booking bị denied
//     const deniedBookings = await TheoDoiDatPhong.find({
//       TrangThai: "denied"
//     });

//     let countUpdated = 0;

//     for (const booking of deniedBookings) {
//       // Thành viên nào còn invited -> declined
//       booking.ThanhVien.forEach(member => {
//         if (member.TrangThai === "invited") {
//           member.TrangThai = "declined";
//         }
//       });

//       await booking.save();
//       countUpdated++;
//     }

//     if (countUpdated > 0) {
//       console.log(`Đã cập nhật ${countUpdated} booking denied.`);
//     } else {
//       console.log("Không có booking denied nào cần cập nhật.");
//     }

//   } catch (err) {
//     console.error("Lỗi khi xử lý denied:", err.message);
//   }
// })();


//Test gửi mail
// const { emailSender } = require("./app/services/email.service");
// (async () => {
//   try {
//     await emailSender({
//       email: "learncode10002003@gmail.com",
//       subject: "Test gửi mail từ Node.js",
//       html: `
//         <h3>Xin chào!</h3>
//         <p>Đây là email test gửi tự động bằng <b>Nodemailer</b>.</p>
//         <p>Thời gian gửi: ${new Date().toLocaleString("vi-VN")}</p>
//       `,
//     });

//     console.log("✅ Test hoàn tất");
//   } catch (err) {
//     console.error("❌ Lỗi test gửi mail:", err);
//   }
// })();



// const axios = require("axios");

// const a = "Học lập trình giúp tôi phát triển tư duy logic.";
// const b = "Việc lập trình giúp rèn luyện khả năng suy nghĩ theo logic.";

// axios.post("https://kerchieft-crescentic-lavon.ngrok-free.dev/chatbot", { a, b })
//   .then(res => console.log("Similarity từ Colab:", res.data.similarity))
//   .catch(err => console.error(err));



const chatbotDataService = require("./chatbotData");
chatbotDataService.sendDatabaseToChatBot();

// const bookDataService = require("./data");
// bookDataService.fixNgayYeuCau();
// bookDataService.seedBorrowData();

// const seedTopBookData = require("./topBookData");
// seedTopBookData.seedTopBookData();