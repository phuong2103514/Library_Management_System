const TheoDoiMuonSach = require("./app/models/theodoimuonsachModel");
const PhieuMuon = require("./app/models/phieumuonModel");
const Sach = require("./app/models/sachModel");
const DocGia = require("./app/models/docgiaModel");
const QuyDinhMuonSach = require("./app/models/quydinhmuonsachModel");
const QuyDinhXuPhat = require("./app/models/quydinhphatsachModel");

// Hàm chuẩn hóa ngày (bỏ giờ phút giây)
function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Hàm random số trong khoảng
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm random phần tử từ mảng
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Hàm tính phí quá hạn
function calculateOverdueFee(ngayTra, ngayGhiNhanTra, doiTuong, quyDinhXuPhat) {
  const diffTime = ngayGhiNhanTra.getTime() - ngayTra.getTime();
  const daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const feePerDay =
    doiTuong === "Giảng viên"
      ? quyDinhXuPhat.feeLateLecturer
      : quyDinhXuPhat.feeLate;

  return daysLate * feePerDay;
}

// Hàm tính phí bồi thường
function calculateCompensationFee(
  tinhTrangSach,
  giaSach,
  doiTuong,
  quyDinhXuPhat
) {
  if (tinhTrangSach === "Mất sách") {
    const coef =
      doiTuong === "Giảng viên"
        ? quyDinhXuPhat.coefLostLecturer
        : quyDinhXuPhat.coefLost;
    const feeManage =
      doiTuong === "Giảng viên"
        ? quyDinhXuPhat.feeManageLecturer
        : quyDinhXuPhat.feeManage;
    return giaSach * coef + feeManage;
  }

  if (tinhTrangSach === "Hư sách") {
    const coef =
      doiTuong === "Giảng viên"
        ? quyDinhXuPhat.coefDamageLightLecturer
        : quyDinhXuPhat.coefDamageLight;
    return giaSach * (coef / 100);
  }

  return 0;
}

// Hàm sinh dữ liệu mượn sách
async function seedBorrowData() {
  try {
    console.log("🚀 Bắt đầu tạo dữ liệu mượn sách...");

    // Lấy quy định
    const quyDinhMuon = await QuyDinhMuonSach.findOne({});
    const quyDinhXuPhat = await QuyDinhXuPhat.findOne({});

    if (!quyDinhMuon || !quyDinhXuPhat) {
      console.error("❌ Chưa có quy định trong hệ thống!");
      return;
    }

    // Lấy danh sách sách và độc giả
    const allBooks = await Sach.find({});
    const allReaders = await DocGia.find({}).lean();

    if (allBooks.length === 0 || allReaders.length === 0) {
      console.error("❌ Chưa có sách hoặc độc giả trong hệ thống!");
      return;
    }

    console.log(
      `📚 Tìm thấy ${allBooks.length} sách và ${allReaders.length} độc giả`
    );

    const today = normalizeDate(new Date());
    const timeRanges = [
      // 7 ngày gần nhất (30 phiếu)
      { days: 7, count: 15, label: "7 ngày" },
      // 8 tuần (56 ngày) - 7 ngày = 49 ngày (50 phiếu)
      { days: 56, count: 20, startOffset: 7, label: "8 tuần" },
      // 12 tháng (365 ngày) - 56 ngày = 309 ngày (80 phiếu)
      { days: 365, count: 25, startOffset: 56, label: "12 tháng" },
    ];

    let totalCreated = 0;

    for (const range of timeRanges) {
      console.log(`\n📅 Tạo dữ liệu cho khoảng ${range.label}...`);

      const startOffset = range.startOffset || 0;
      const endOffset = range.days;

      for (let i = 0; i < range.count; i++) {
        try {
          // Random ngày tạo phiếu trong khoảng thời gian
          const daysAgo = randomInt(startOffset, endOffset - 1);
          const ngayTaoPhieu = new Date(today);
          ngayTaoPhieu.setDate(today.getDate() - daysAgo);

          // Random độc giả
          const docGia = randomChoice(allReaders);
          const doiTuong = docGia.DoiTuong;

          // Lấy quy định theo đối tượng
          const borrowDuration =
            doiTuong === "Giảng viên"
              ? quyDinhMuon.borrowDurationLecturer
              : quyDinhMuon.borrowDuration;

          const pickupDeadline =
            doiTuong === "Giảng viên"
              ? quyDinhMuon.pickupDeadlineLecturer
              : quyDinhMuon.pickupDeadline;

          // Random số sách mượn (1-3 cuốn)
          const soSachMuon = randomInt(1, 3);
          const selectedBooks = [];
          for (let j = 0; j < soSachMuon; j++) {
            selectedBooks.push(randomChoice(allBooks));
          }

          // Xác định trạng thái phiếu mượn dựa trên thời gian
          let trangThaiPhieu;
          let ngayDuyet = null;
          let ngayMuon = null;
          let ngayTra = null;

          // Nếu phiếu tạo trong 3 ngày gần nhất
          if (daysAgo <= 3) {
            // 40% pending, 30% processing, 30% approved
            const rand = Math.random();
            if (rand < 0.4) {
              trangThaiPhieu = "pending";
            } else if (rand < 0.7) {
              trangThaiPhieu = "processing";
              ngayDuyet = new Date(ngayTaoPhieu);
              ngayDuyet.setDate(ngayDuyet.getDate() + randomInt(0, 1));
            } else {
              trangThaiPhieu = "approved";
              ngayDuyet = new Date(ngayTaoPhieu);
              ngayDuyet.setDate(ngayDuyet.getDate() + randomInt(0, 1));
              ngayMuon = new Date(ngayDuyet);
              ngayMuon.setDate(ngayMuon.getDate() + randomInt(0, 2));
              ngayTra = new Date(ngayMuon);
              ngayTra.setDate(ngayTra.getDate() + borrowDuration);
            }
          } else {
            // Phiếu cũ hơn: 95% completed, 5% overdue
            const rand = Math.random();
            if (rand < 0.95) {
              trangThaiPhieu = "completed";
              ngayDuyet = new Date(ngayTaoPhieu);
              ngayDuyet.setDate(ngayDuyet.getDate() + randomInt(0, 1));
              ngayMuon = new Date(ngayDuyet);
              ngayMuon.setDate(
                ngayMuon.getDate() + randomInt(0, pickupDeadline - 1)
              );
              ngayTra = new Date(ngayMuon);
              ngayTra.setDate(ngayTra.getDate() + borrowDuration);
            } else {
              // Overdue: đã mượn nhưng chưa trả
              trangThaiPhieu = "overdue";
              ngayDuyet = new Date(ngayTaoPhieu);
              ngayDuyet.setDate(ngayDuyet.getDate() + randomInt(0, 1));
              ngayMuon = new Date(ngayDuyet);
              ngayMuon.setDate(ngayMuon.getDate() + randomInt(0, 2));
              ngayTra = new Date(ngayMuon);
              ngayTra.setDate(ngayTra.getDate() + borrowDuration);
            }
          }

          // ✅ FIX: Tạo PhieuMuon với NgayTao được truyền vào
          const phieuMuon = new PhieuMuon({
            MaDocGia: docGia._id,
            TrangThai: trangThaiPhieu,
            NgayTao: ngayTaoPhieu, // ✅ THÊM DÒNG NÀY
            NgayDuyet: ngayDuyet,
            NgayHoanThanh: trangThaiPhieu === "completed" ? ngayTra : null,
          });

          await phieuMuon.save();

          // Tạo TheoDoiMuonSach cho từng sách
          for (const book of selectedBooks) {
            let trangThaiSach;
            let ngayGhiNhanTra = null;
            let tinhTrangSach = "";
            let phiBoiThuong = 0;
            let phiQuaHan = 0;
            let daThanhToan = false;
            let ngayGhiNhanThanhToan = null;
            let daSua = false;

            // Xác định trạng thái từng sách
            if (trangThaiPhieu === "pending") {
              trangThaiSach = "pending";
            } else if (trangThaiPhieu === "processing") {
              trangThaiSach = "processing";
            } else if (trangThaiPhieu === "denied") {
              trangThaiSach = "denied";
            } else if (trangThaiPhieu === "approved") {
              trangThaiSach = "approved";
            } else if (trangThaiPhieu === "overdue") {
              trangThaiSach = "overdue";
              // Tính phí quá hạn
              phiQuaHan = calculateOverdueFee(
                ngayTra,
                today,
                doiTuong,
                quyDinhXuPhat
              );
            } else if (trangThaiPhieu === "completed") {
              trangThaiSach = "returned";

              // 70% trả đúng hạn, 20% trả trễ, 10% có vấn đề
              const returnRand = Math.random();
              if (returnRand < 0.7) {
                // Trả đúng hạn
                ngayGhiNhanTra = new Date(ngayTra);
                ngayGhiNhanTra.setDate(
                  ngayGhiNhanTra.getDate() - randomInt(0, 2)
                );
                tinhTrangSach = "Nguyên vẹn";
              } else if (returnRand < 0.9) {
                // Trả trễ
                ngayGhiNhanTra = new Date(ngayTra);
                ngayGhiNhanTra.setDate(
                  ngayGhiNhanTra.getDate() + randomInt(1, 7)
                );
                tinhTrangSach = "Nguyên vẹn";
                phiQuaHan = calculateOverdueFee(
                  ngayTra,
                  ngayGhiNhanTra,
                  doiTuong,
                  quyDinhXuPhat
                );
                daThanhToan = Math.random() < 0.8; // 80% đã thanh toán
                if (daThanhToan) {
                  ngayGhiNhanThanhToan = new Date(ngayGhiNhanTra);
                  ngayGhiNhanThanhToan.setDate(
                    ngayGhiNhanThanhToan.getDate() + randomInt(0, 3)
                  );
                }
              } else {
                // Có vấn đề
                ngayGhiNhanTra = new Date(ngayTra);
                const isLate = Math.random() < 0.5;
                if (isLate) {
                  ngayGhiNhanTra.setDate(
                    ngayGhiNhanTra.getDate() + randomInt(1, 5)
                  );
                  phiQuaHan = calculateOverdueFee(
                    ngayTra,
                    ngayGhiNhanTra,
                    doiTuong,
                    quyDinhXuPhat
                  );
                }

                // Xác định tình trạng sách
                const conditionRand = Math.random();
                if (conditionRand < 0.7) {
                  tinhTrangSach = "Hư sách";
                  phiBoiThuong = calculateCompensationFee(
                    tinhTrangSach,
                    book.DonGia,
                    doiTuong,
                    quyDinhXuPhat
                  );
                  daSua = Math.random() < 0.6; // 60% đã sửa
                } else {
                  tinhTrangSach = "Mất sách";
                  phiBoiThuong = calculateCompensationFee(
                    tinhTrangSach,
                    book.DonGia,
                    doiTuong,
                    quyDinhXuPhat
                  );
                }

                daThanhToan = Math.random() < 0.7; // 70% đã thanh toán
                if (daThanhToan) {
                  ngayGhiNhanThanhToan = new Date(ngayGhiNhanTra);
                  ngayGhiNhanThanhToan.setDate(
                    ngayGhiNhanThanhToan.getDate() + randomInt(0, 5)
                  );
                }
              }
            }

            const theoDoiMuon = new TheoDoiMuonSach({
              SoLuong: 1,
              NgayDuyet: ngayDuyet,
              NgayMuon: ngayMuon,
              NgayTra: ngayTra,
              NgayGhiNhanTra: ngayGhiNhanTra,
              DaGiaHan: false,
              TrangThai: trangThaiSach,
              TinhTrangSach: tinhTrangSach,
              NgayCapNhatTinhTrangSach: ngayGhiNhanTra,
              PhiBoiThuong: phiBoiThuong,
              PhiQuaHan: phiQuaHan,
              DaThanhToan: daThanhToan,
              NgayGhiNhanThanhToan: ngayGhiNhanThanhToan,
              DaSua: daSua,
              MaSach: book._id,
              MaDocGia: docGia._id,
              MaPhieuMuon: phieuMuon._id,
            });

            await theoDoiMuon.save();
          }

          totalCreated++;

          if (totalCreated % 10 === 0) {
            console.log(`✅ Đã tạo ${totalCreated} phiếu mượn...`);
          }
        } catch (err) {
          console.error(`❌ Lỗi khi tạo phiếu mượn:`, err.message);
        }
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã tạo ${totalCreated} phiếu mượn sách.`);
  } catch (error) {
    console.error("❌ Lỗi tổng thể:", error);
  }
}

async function fixNgayYeuCau() {
  try {
    console.log("🔧 Bắt đầu fix ngày yêu cầu...");

    const allPhieuMuon = await PhieuMuon.find({});
    let fixed = 0;

    for (const phieu of allPhieuMuon) {
      let ngayYeuCauMoi;

      if (phieu.NgayDuyet) {
        // Nếu có NgayDuyet: NgayTao = NgayDuyet - random(0-2 ngày)
        ngayYeuCauMoi = new Date(phieu.NgayDuyet);
        const soNgayTruoc = Math.floor(Math.random() * 3); // 0, 1, hoặc 2 ngày
        ngayYeuCauMoi.setDate(ngayYeuCauMoi.getDate() - soNgayTruoc);
      } else {
        // Nếu chưa duyệt (pending): NgayTao = createdAt hoặc ngày hiện tại - random(0-3 ngày)
        ngayYeuCauMoi = new Date();
        const soNgayTruoc = Math.floor(Math.random() * 4); // 0, 1, 2, hoặc 3 ngày
        ngayYeuCauMoi.setDate(ngayYeuCauMoi.getDate() - soNgayTruoc);
      }

      // Cập nhật NgayTao
      await PhieuMuon.updateOne(
        { _id: phieu._id },
        { $set: { NgayTao: ngayYeuCauMoi } }
      );

      fixed++;
    }

    console.log(`✅ Đã fix ${fixed} phiếu mượn!`);
  } catch (error) {
    console.error("❌ Lỗi khi fix ngày yêu cầu:", error);
  }
}




module.exports = {
  seedBorrowData,
  fixNgayYeuCau
};