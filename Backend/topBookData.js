const Sach = require("./app/models/sachModel");
const DocGia = require("./app/models/docgiaModel");
const DanhGiaSach = require("./app/models/danhgiasachModel");
const TheoDoiXemSach = require("./app/models/theodoixemsachModel");

// Hàm random số trong khoảng
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm random phần tử từ mảng
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Phân phối ngày lệch về gần đây để các service lấy được dữ liệu
function weightedRandomDate() {
  const r = Math.random();
  const now = Date.now();
  let daysAgo;
  if (r < 0.40) daysAgo = randomInt(0, 3);   // 40% → 0-3 ngày trước
  else if (r < 0.70) daysAgo = randomInt(4, 7);  // 30% → 4-7 ngày trước
  else daysAgo = randomInt(8, 14);                // 30% → 8-14 ngày trước
  return new Date(now - daysAgo * 86400000);
}

async function seedTopBookData() {
  try {
    console.log("🚀 Bắt đầu tạo dữ liệu xem và đánh giá sách...");

    const allBooks = await Sach.find({}).lean();
    const allReaders = await DocGia.find({}).lean();

    if (allBooks.length === 0 || allReaders.length === 0) {
      console.error("❌ Chưa có sách hoặc độc giả trong hệ thống!");
      return;
    }

    console.log(`📚 Tìm thấy ${allBooks.length} sách và ${allReaders.length} độc giả`);

    // ── Tạo lượt XEM ──────────────────────────────────────────────────────────
    console.log("\n👁️  Đang tạo lượt xem...");
    let viewCount = 0;

    for (const book of allBooks) {
      const numViews = randomInt(5, 20);
      for (let i = 0; i < numViews; i++) {
        const theoDoiXem = new TheoDoiXemSach({
          MaSach: book._id,
          MaDocGia: randomChoice(allReaders)._id,
          ThoiDiemXem: weightedRandomDate(),
        });
        await theoDoiXem.save();
        viewCount++;
      }

      if (viewCount % 50 === 0) {
        console.log(`   ✅ Đã tạo ${viewCount} lượt xem...`);
      }
    }

    console.log(`   ✔ Hoàn thành ${viewCount} lượt xem`);

    // ── Tạo ĐÁNH GIÁ ──────────────────────────────────────────────────────────
    console.log("\n⭐ Đang tạo đánh giá...");

    const binhLuanMau = [
      "Sách hay, đáng đọc!",
      "Nội dung phong phú.",
      "Khá bổ ích.",
      "Tạm ổn, không có gì đặc biệt.",
      "Rất thú vị!",
      "Hơi khó đọc nhưng bổ ích.",
      "Tuyệt vời, recommend cho mọi người.",
      "Nội dung cũ, cần cập nhật.",
      "", // một số không để lại bình luận
    ];

    let ratingCount = 0;
    let skipCount = 0;

    for (const book of allBooks) {
      // Mỗi sách: 3-10 đánh giá, mỗi độc giả chỉ đánh giá 1 lần / sách
      const shuffled = [...allReaders].sort(() => Math.random() - 0.5);
      const numRatings = Math.min(randomInt(3, 10), shuffled.length);

      for (let i = 0; i < numRatings; i++) {
        try {
          const danhGia = new DanhGiaSach({
            SoSao: randomInt(1, 5),
            BinhLuan: randomChoice(binhLuanMau),
            NgayDanhGia: weightedRandomDate(),
            MaSach: book._id,
            MaDocGia: shuffled[i]._id,
          });
          await danhGia.save();
          ratingCount++;
        } catch (err) {
          // Bỏ qua lỗi duplicate nếu model có unique constraint
          skipCount++;
        }
      }

      if (ratingCount % 30 === 0 && ratingCount > 0) {
        console.log(`   ✅ Đã tạo ${ratingCount} đánh giá...`);
      }
    }

    console.log(`   ✔ Hoàn thành ${ratingCount} đánh giá (bỏ qua ${skipCount} trùng lặp)`);

    console.log("\n🎉 Seed topBookData hoàn tất!");
  } catch (error) {
    console.error("❌ Lỗi tổng thể:", error);
  }
}

module.exports = { seedTopBookData };