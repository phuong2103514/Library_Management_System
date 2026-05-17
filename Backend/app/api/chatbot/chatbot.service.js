const axios = require("axios");
const mongoose = require("mongoose");

const Sach = require("../../models/sachModel");
const TheoDoiMuonSach = require("../../models/theodoimuonsachModel");
const TheoDoiXemSach = require("../../models/theodoixemsachModel");
const DanhGiaSach = require("../../models/danhgiasachModel");
const NhaXuatBan = require("../../models/nhaxuatbanModel");
const TheLoaiSach = require("../../models/theloaisachModel");
const Khoa = require("../../models/khoaModel");

async function checkChatbotHealth() {
  const colabUrl = "https://learncode1000-library-chatbot.hf.space/health";
  const response = await axios.get(colabUrl);
  return response.data;
}

async function chatbot(message) {
  const colabUrl = "https://learncode1000-library-chatbot.hf.space/chatbot";

  const response = await axios.post(
    colabUrl,
    { message: message.trim() },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 120000, // 2 phút
    }
  );

  return response;
}

// HÀM GỌI SEMANTIC SEARCH TỪ COLAB
async function callSemanticSearch(query, field, candidates) {
  try {
    const COLAB_URL = "https://learncode1000-library-chatbot.hf.space"; // ⚠️ Thay URL Colab của anh

    console.log(
      `🔍 Calling Colab semanticSearch: query="${query}", field="${field}"`
    );

    const response = await axios.post(
      `${COLAB_URL}/semanticSearch`,
      {
        query: query,
        field: field,
        candidates: candidates,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    if (response.data.status === "ok") {
      console.log(`✅ Colab trả về ${response.data.results.length} kết quả`);
      return response.data.results; // [{ text: "...", score: 0.85 }]
    } else {
      console.log("⚠️ Colab không trả về kết quả");
      return [];
    }
  } catch (error) {
    console.error("❌ Lỗi khi gọi Colab semanticSearch:", error.message);
    return [];
  }
}

//Hybrid
async function timSachLevel1(classification) {
  try {
    const filters = classification.filters || {};
    const topList = classification.topList || [];
    const sort = classification.sort || {};
    const limit = classification.limit;

    // ============================================
    // BƯỚC 1: XÂY DỰNG QUERY CHO BẢNG SACH
    // ============================================
    let query = {};

    // 1.1. Filter theo LoaiSach (exact match)
    if (filters.LoaiSach) {
      query.LoaiSach = filters.LoaiSach;
    }

    // 1.2. Filter theo TenSach (exact → fallback semanticSearch)
    if (filters.TenSach) {
      const exactBooks = await Sach.find({
        TenSach: { $regex: filters.TenSach, $options: "i" },
      })
        .limit(20)
        .lean();

      if (exactBooks.length === 0) {
        console.log(
          "⚠️ Không tìm thấy exact match TenSach, gọi semanticSearch..."
        );
        const semanticResults = await callSemanticSearch(
          filters.TenSach,
          "TenSach",
          await Sach.find().distinct("TenSach")
        );

        if (semanticResults.length > 0) {
          query.TenSach = { $in: semanticResults.map((r) => r.text) };
        } else {
          return []; // Không tìm thấy gì cả
        }
      } else {
        query.TenSach = { $regex: filters.TenSach, $options: "i" };
      }
    }

    // 1.3. Filter theo TacGia (exact → fallback semanticSearch)
    if (filters.TacGia) {
      const exactAuthors = await Sach.find({
        TacGia: { $regex: filters.TacGia, $options: "i" },
      })
        .limit(20)
        .lean();

      if (exactAuthors.length === 0) {
        console.log(
          "⚠️ Không tìm thấy exact match TacGia, gọi semanticSearch..."
        );
        const semanticResults = await callSemanticSearch(
          filters.TacGia,
          "TacGia",
          await Sach.find().distinct("TacGia")
        );

        if (semanticResults.length > 0) {
          query.TacGia = { $in: semanticResults.map((r) => r.text) };
        } else {
          return [];
        }
      } else {
        query.TacGia = { $regex: filters.TacGia, $options: "i" };
      }
    }

    // 1.4. Filter theo TheLoai (lookup → semanticSearch)
    if (filters.TheLoai) {
      const theLoaiDoc = await TheLoaiSach.findOne({
        TenTheLoai: { $regex: filters.TheLoai, $options: "i" },
      });

      if (!theLoaiDoc) {
        console.log(
          "⚠️ Không tìm thấy exact match TheLoai, gọi semanticSearch..."
        );
        const allTheLoai = await TheLoaiSach.find().distinct("TenTheLoai");
        const semanticResults = await callSemanticSearch(
          filters.TheLoai,
          "TheLoai",
          allTheLoai
        );

        if (semanticResults.length > 0) {
          const matchedTheLoai = await TheLoaiSach.find({
            TenTheLoai: { $in: semanticResults.map((r) => r.text) },
          });
          query.MaTheLoai = { $in: matchedTheLoai.map((t) => t._id) };
        } else {
          return [];
        }
      } else {
        query.MaTheLoai = theLoaiDoc._id;
      }
    }

    // 1.5. Filter theo NXB (lookup → exact match)
    if (filters.NXB) {
      const nxbDoc = await NhaXuatBan.findOne({
        TenNXB: { $regex: filters.NXB, $options: "i" },
      });

      if (!nxbDoc) {
        console.log("⚠️ Không tìm thấy NXB, gọi semanticSearch...");
        const allNXB = await NhaXuatBan.find().distinct("TenNXB");
        const semanticResults = await callSemanticSearch(
          filters.NXB,
          "NXB",
          allNXB
        );

        if (semanticResults.length > 0) {
          const matchedNXB = await NhaXuatBan.find({
            TenNXB: { $in: semanticResults.map((r) => r.text) },
          });
          query.MaNXB = { $in: matchedNXB.map((n) => n._id) };
        } else {
          return [];
        }
      } else {
        query.MaNXB = nxbDoc._id;
      }
    }

    // 1.6. Filter theo Khoa (lookup → semanticSearch)
    if (filters.Khoa) {
      const khoaDoc = await Khoa.findOne({
        TenKhoa: { $regex: filters.Khoa, $options: "i" },
      });

      if (!khoaDoc) {
        console.log("⚠️ Không tìm thấy Khoa, gọi semanticSearch...");
        const allKhoa = await Khoa.find().distinct("TenKhoa");
        const semanticResults = await callSemanticSearch(
          filters.Khoa,
          "Khoa",
          allKhoa
        );

        if (semanticResults.length > 0) {
          const matchedKhoa = await Khoa.find({
            TenKhoa: { $in: semanticResults.map((r) => r.text) },
          });
          query.Khoa = { $in: matchedKhoa.map((k) => k._id) };
        } else {
          return [];
        }
      } else {
        query.Khoa = khoaDoc._id;
      }
    }

    // 1.7. Filter theo MoTaSach (semanticSearch luôn)
    if (filters.MoTaSach) {
      console.log("🔍 MoTaSach: Sử dụng semanticSearch...");
      const allMoTa = await Sach.find().distinct("MoTaSach");
      const semanticResults = await callSemanticSearch(
        filters.MoTaSach,
        "MoTaSach",
        allMoTa
      );

      if (semanticResults.length > 0) {
        query.MoTaSach = { $in: semanticResults.map((r) => r.text) };
      } else {
        return [];
      }
    }

    // 1.8. Filter theo NamXuatBan (range)
    if (filters.NamXuatBanMin || filters.NamXuatBanMax) {
      query.NamXuatBan = {};
      if (filters.NamXuatBanMin) query.NamXuatBan.$gte = filters.NamXuatBanMin;
      if (filters.NamXuatBanMax) query.NamXuatBan.$lte = filters.NamXuatBanMax;
    }

    // 1.9. Filter theo DonGia (range)
    if (filters.DonGiaMin || filters.DonGiaMax) {
      query.DonGia = {};
      if (filters.DonGiaMin) query.DonGia.$gte = filters.DonGiaMin;
      if (filters.DonGiaMax) query.DonGia.$lte = filters.DonGiaMax;
    }

    // ============================================
    // BƯỚC 2: TÌM SÁCH THEO QUERY
    // ============================================
    let books = await Sach.find(query)
      .populate("MaNXB", "TenNXB")
      .populate("MaTheLoai", "TenTheLoai")
      .populate("Khoa", "TenKhoa")
      .lean();

    if (books.length === 0) {
      return [];
    }

    const bookIds = books.map((b) => b._id);

    // ============================================
    // BƯỚC 3: XỬ LÝ TOPLIST (NẾU CÓ) - FIXED NORMALIZATION
    // ============================================
    if (topList && topList.length > 0) {
      console.log(
        "📊 Xử lý topList với weighted scoring (normalized):",
        topList
      );
      // ✅ THÊM ĐOẠN NÀY: Gán weight mặc định nếu không có
      const defaultWeights = {
        LuotMuon: 3, // Ưu tiên cao nhất
        LuotXem: 2, // Bình thường
        DanhGia: 1, // Ưu tiên cao
      };

      for (let i = 0; i < topList.length; i++) {
        if (!topList[i].weight) {
          topList[i].weight = defaultWeights[topList[i].field] || 1;
        }
      }
      console.log("⚙️ Weight sau khi gán:", topList);

      // 3.1. Thu thập dữ liệu cho TẤT CẢ các field cần rank
      const bookScores = {}; // { bookId: { LuotMuon: 10, LuotXem: 50, DanhGia: 4.5 } }
      const rawData = {}; // Lưu giá trị gốc để normalize

      for (const book of books) {
        bookScores[book._id] = {
          bookData: book,
          scores: {},
          normalizedScores: {},
          totalScore: 0,
        };
      }

      // 3.2. Thu thập dữ liệu RAW cho từng field
      for (let i = 0; i < topList.length; i++) {
        const topConfig = topList[i];
        const field = topConfig.field;

        if (field === "LuotMuon") {
          const borrowCounts = await TheoDoiMuonSach.aggregate([
            {
              $match: {
                MaSach: { $in: bookIds },
                TrangThai: { $in: ["approved", "returned", "overdue"] },
              },
            },
            {
              $group: {
                _id: "$MaSach",
                count: { $sum: 1 },
              },
            },
          ]);

          rawData.LuotMuon = borrowCounts.map((item) => item.count);
          for (const item of borrowCounts) {
            if (bookScores[item._id]) {
              bookScores[item._id].scores.LuotMuon = item.count;
            }
          }
        } else if (field === "LuotXem") {
          const viewCounts = await TheoDoiXemSach.aggregate([
            { $match: { MaSach: { $in: bookIds } } },
            {
              $group: {
                _id: "$MaSach",
                count: { $sum: 1 },
              },
            },
          ]);

          rawData.LuotXem = viewCounts.map((item) => item.count);
          for (const item of viewCounts) {
            if (bookScores[item._id]) {
              bookScores[item._id].scores.LuotXem = item.count;
            }
          }
        } else if (field === "DanhGia") {
          const ratings = await DanhGiaSach.aggregate([
            { $match: { MaSach: { $in: bookIds } } },
            {
              $group: {
                _id: "$MaSach",
                avgRating: { $avg: "$SoSao" },
                totalRatings: { $sum: 1 },
              },
            },
          ]);

          rawData.DanhGia = ratings.map((item) => item.avgRating);
          for (const item of ratings) {
            if (bookScores[item._id]) {
              bookScores[item._id].scores.DanhGia = item.avgRating;
            }
          }
        }
      }

      // 3.3. NORMALIZE dữ liệu về thang 0-100
      const normalize = (values) => {
        if (!values || values.length === 0) return { min: 0, max: 1 };
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { min, max: max === min ? min + 1 : max }; // Tránh chia 0
      };

      const normalizers = {};
      for (const field in rawData) {
        normalizers[field] = normalize(rawData[field]);
      }

      // 3.4. Tính điểm NORMALIZED cho từng sách
      for (const bookId in bookScores) {
        const book = bookScores[bookId];

        for (let i = 0; i < topList.length; i++) {
          const topConfig = topList[i];
          const field = topConfig.field;
          const weight = topConfig.weight || 1;

          if (book.scores[field] !== undefined) {
            const rawValue = book.scores[field];
            const { min, max } = normalizers[field];

            // Normalize về 0-100
            const normalizedValue = ((rawValue - min) / (max - min)) * 100;

            book.normalizedScores[field] = normalizedValue;
            book.totalScore += normalizedValue * weight;
          }
        }
      }

      // 3.5. Sắp xếp theo totalScore và lấy top
      let topLimit = 10;
      if (topList && topList.length > 0 && topList[0].limit) {
        topLimit = topList[0].limit;
      }

      const sortedBooks = Object.values(bookScores)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, topLimit);

      // 3.6. Gắn thông tin score vào books
      books = sortedBooks.map(function (item) {
        return {
          ...item.bookData,
          ...item.scores, // Giá trị gốc
          normalizedScores: item.normalizedScores, // Điểm đã chuẩn hóa
          totalScore: item.totalScore, // Tổng điểm
        };
      });

      console.log(
        "✅ Top " + books.length + " sách theo weighted scoring (normalized)"
      );
      console.log("📈 Normalizers:", normalizers);
    }

    // ============================================
    // BƯỚC 4: FILTER THEO SOSAO (NẾU CÓ)
    // ============================================
    if (filters.SoSaoMin || filters.SoSaoMax) {
      console.log("⭐ Filter theo rating...");

      const ratings = await DanhGiaSach.aggregate([
        { $match: { MaSach: { $in: bookIds } } },
        {
          $group: {
            _id: "$MaSach",
            avgRating: { $avg: "$SoSao" },
          },
        },
      ]);

      const validBookIds = ratings
        .filter((r) => {
          if (filters.SoSaoMin && r.avgRating < filters.SoSaoMin) return false;
          if (filters.SoSaoMax && r.avgRating > filters.SoSaoMax) return false;
          return true;
        })
        .map((r) => r._id);

      books = books.filter((b) => validBookIds.some((id) => id.equals(b._id)));

      // Gắn avgRating vào books
      books = books.map((b) => {
        const ratingData = ratings.find((r) => r._id.equals(b._id));
        return { ...b, avgRating: ratingData ? ratingData.avgRating : 0 };
      });
    }

    // ============================================
    // BƯỚC 5: SORT (NẾU CÓ)
    // ============================================
    if (sort && sort.field) {
      books.sort((a, b) => {
        const aVal = a[sort.field] || 0;
        const bVal = b[sort.field] || 0;
        return sort.order === 1 ? aVal - bVal : bVal - aVal;
      });
    }

    // ============================================
    // BƯỚC 6: LIMIT KẾT QUẢ
    // ============================================
    const finalLimit = limit || 10;
    books = books.slice(0, finalLimit);

    return books;
  } catch (error) {
    console.error("❌ Error in timSachLevel1:", error);
    throw error;
  }
}

async function timSachLevel2(classification) {
  try {
    const query = classification.query || {};
    const topList = classification.topList || [];
    const sort = classification.sort || {};
    const limit = classification.limit;

    // ============================================
    // BƯỚC 1: XÂY DỰNG MONGODB QUERY TỪ QUERY TREE
    // ============================================

    /**
     * Hàm đệ quy để build MongoDB query từ query tree
     * @param {Object} queryNode - Node trong query tree (có operator, conditions, subQueries)
     * @returns {Object} - MongoDB query object
     */
    async function buildMongoQuery(queryNode) {
      const operator = queryNode.operator; // "AND" | "OR" | "NOT"
      const conditions = queryNode.conditions || [];
      const subQueries = queryNode.subQueries || [];

      let mongoConditions = [];

      // 1.1. Xử lý các conditions trong node hiện tại
      for (const condition of conditions) {
        const field = condition.field;
        const condOperator = condition.operator; // "contains" | "equals" | "gte" | "lte" | "in"
        const value = condition.value;
        const negate = condition.negate || false;

        let mongoCondition = {};

        // Xử lý theo field
        if (field === "TenSach") {
          if (condOperator === "contains") {
            const exactBooks = await Sach.find({
              TenSach: { $regex: value, $options: "i" },
            })
              .limit(20)
              .lean();

            if (exactBooks.length === 0) {
              console.log(
                "⚠️ TenSach không tìm thấy exact, gọi semanticSearch..."
              );
              const semanticResults = await callSemanticSearch(
                value,
                "TenSach",
                await Sach.find().distinct("TenSach")
              );

              if (semanticResults.length > 0) {
                mongoCondition.TenSach = {
                  $in: semanticResults.map((r) => r.text),
                };
              } else {
                mongoCondition.TenSach = { $in: [] }; // Không tìm thấy gì
              }
            } else {
              mongoCondition.TenSach = { $regex: value, $options: "i" };
            }
          } else if (condOperator === "equals") {
            mongoCondition.TenSach = value;
          }

          // ✅ SỬA: Xử lý negate cho TenSach
          if (negate && Object.keys(mongoCondition).length > 0) {
            const fieldName = Object.keys(mongoCondition)[0];
            const fieldValue = mongoCondition[fieldName];

            if (fieldValue.$in !== undefined) {
              mongoCondition = { [fieldName]: { $nin: fieldValue.$in } };
            } else if (fieldValue.$regex !== undefined) {
              mongoCondition = { [fieldName]: { $not: fieldValue } };
            } else {
              mongoCondition = { [fieldName]: { $ne: fieldValue } };
            }
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "TacGia") {
          if (condOperator === "contains") {
            const exactAuthors = await Sach.find({
              TacGia: { $regex: value, $options: "i" },
            })
              .limit(20)
              .lean();

            if (exactAuthors.length === 0) {
              console.log(
                "⚠️ TacGia không tìm thấy exact, gọi semanticSearch..."
              );
              const semanticResults = await callSemanticSearch(
                value,
                "TacGia",
                await Sach.find().distinct("TacGia")
              );

              if (semanticResults.length > 0) {
                mongoCondition.TacGia = {
                  $in: semanticResults.map((r) => r.text),
                };
              } else {
                mongoCondition.TacGia = { $in: [] };
              }
            } else {
              mongoCondition.TacGia = { $regex: value, $options: "i" };
            }
          } else if (condOperator === "equals") {
            mongoCondition.TacGia = value;
          }

          // ✅ SỬA: Xử lý negate cho TacGia
          if (negate && Object.keys(mongoCondition).length > 0) {
            const fieldName = Object.keys(mongoCondition)[0];
            const fieldValue = mongoCondition[fieldName];

            if (fieldValue.$in !== undefined) {
              mongoCondition = { [fieldName]: { $nin: fieldValue.$in } };
            } else if (fieldValue.$regex !== undefined) {
              mongoCondition = { [fieldName]: { $not: fieldValue } };
            } else {
              mongoCondition = { [fieldName]: { $ne: fieldValue } };
            }
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "TheLoai") {
          const theLoaiDoc = await TheLoaiSach.findOne({
            TenTheLoai: { $regex: value, $options: "i" },
          });

          if (!theLoaiDoc) {
            console.log("⚠️ TheLoai không tìm thấy, gọi semanticSearch...");
            const allTheLoai = await TheLoaiSach.find().distinct("TenTheLoai");
            const semanticResults = await callSemanticSearch(
              value,
              "TheLoai",
              allTheLoai
            );

            if (semanticResults.length > 0) {
              const matchedTheLoai = await TheLoaiSach.find({
                TenTheLoai: { $in: semanticResults.map((r) => r.text) },
              });
              mongoCondition.MaTheLoai = {
                $in: matchedTheLoai.map((t) => t._id),
              };
            } else {
              mongoCondition.MaTheLoai = { $in: [] };
            }
          } else {
            mongoCondition.MaTheLoai = theLoaiDoc._id;
          }

          // ✅ SỬA: Xử lý negate cho TheLoai
          if (negate && Object.keys(mongoCondition).length > 0) {
            const fieldName = Object.keys(mongoCondition)[0];
            const fieldValue = mongoCondition[fieldName];

            if (fieldValue instanceof mongoose.Types.ObjectId) {
              mongoCondition = { [fieldName]: { $ne: fieldValue } };
            } else if (fieldValue.$in !== undefined) {
              mongoCondition = { [fieldName]: { $nin: fieldValue.$in } };
            } else {
              mongoCondition = { $nor: [{ [fieldName]: fieldValue }] };
            }
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "NXB") {
          const nxbDoc = await NhaXuatBan.findOne({
            TenNXB: { $regex: value, $options: "i" },
          });

          if (!nxbDoc) {
            console.log("⚠️ NXB không tìm thấy, gọi semanticSearch...");
            const allNXB = await NhaXuatBan.find().distinct("TenNXB");
            const semanticResults = await callSemanticSearch(
              value,
              "NXB",
              allNXB
            );

            if (semanticResults.length > 0) {
              const matchedNXB = await NhaXuatBan.find({
                TenNXB: { $in: semanticResults.map((r) => r.text) },
              });
              mongoCondition.MaNXB = { $in: matchedNXB.map((n) => n._id) };
            } else {
              mongoCondition.MaNXB = { $in: [] };
            }
          } else {
            mongoCondition.MaNXB = nxbDoc._id;
          }

          // ✅ SỬA: Xử lý negate cho NXB
          if (negate && Object.keys(mongoCondition).length > 0) {
            const fieldName = Object.keys(mongoCondition)[0];
            const fieldValue = mongoCondition[fieldName];

            if (fieldValue instanceof mongoose.Types.ObjectId) {
              mongoCondition = { [fieldName]: { $ne: fieldValue } };
            } else if (fieldValue.$in !== undefined) {
              mongoCondition = { [fieldName]: { $nin: fieldValue.$in } };
            } else {
              mongoCondition = { $nor: [{ [fieldName]: fieldValue }] };
            }
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "LoaiSach") {
          mongoCondition.LoaiSach = value;

          // ✅ SỬA: Xử lý negate cho LoaiSach
          if (negate && Object.keys(mongoCondition).length > 0) {
            mongoCondition = { LoaiSach: { $ne: value } };
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "Khoa") {
          const khoaDoc = await Khoa.findOne({
            TenKhoa: { $regex: value, $options: "i" },
          });

          if (!khoaDoc) {
            console.log("⚠️ Khoa không tìm thấy, gọi semanticSearch...");
            const allKhoa = await Khoa.find().distinct("TenKhoa");
            const semanticResults = await callSemanticSearch(
              value,
              "Khoa",
              allKhoa
            );

            if (semanticResults.length > 0) {
              const matchedKhoa = await Khoa.find({
                TenKhoa: { $in: semanticResults.map((r) => r.text) },
              });
              mongoCondition.Khoa = { $in: matchedKhoa.map((k) => k._id) };
            } else {
              mongoCondition.Khoa = { $in: [] };
            }
          } else {
            mongoCondition.Khoa = khoaDoc._id;
          }

          // ✅ SỬA: Xử lý negate cho Khoa
          if (negate && Object.keys(mongoCondition).length > 0) {
            const fieldName = Object.keys(mongoCondition)[0];
            const fieldValue = mongoCondition[fieldName];

            if (fieldValue instanceof mongoose.Types.ObjectId) {
              mongoCondition = { [fieldName]: { $ne: fieldValue } };
            } else if (fieldValue.$in !== undefined) {
              mongoCondition = { [fieldName]: { $nin: fieldValue.$in } };
            } else {
              mongoCondition = { $nor: [{ [fieldName]: fieldValue }] };
            }
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "MoTaSach") {
          console.log("🔍 MoTaSach: Sử dụng semanticSearch...");
          const allMoTa = await Sach.find().distinct("MoTaSach");
          const semanticResults = await callSemanticSearch(
            value,
            "MoTaSach",
            allMoTa
          );

          if (semanticResults.length > 0) {
            mongoCondition.MoTaSach = {
              $in: semanticResults.map((r) => r.text),
            };
          } else {
            mongoCondition.MoTaSach = { $in: [] };
          }

          // ✅ SỬA: Xử lý negate cho MoTaSach
          if (negate && Object.keys(mongoCondition).length > 0) {
            const fieldName = Object.keys(mongoCondition)[0];
            const fieldValue = mongoCondition[fieldName];

            if (fieldValue.$in !== undefined) {
              mongoCondition = { [fieldName]: { $nin: fieldValue.$in } };
            } else {
              mongoCondition = { $nor: [{ [fieldName]: fieldValue }] };
            }
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "NamXuatBan") {
          if (condOperator === "gte") {
            mongoCondition.NamXuatBan = { $gte: value };
          } else if (condOperator === "lte") {
            mongoCondition.NamXuatBan = { $lte: value };
          } else if (condOperator === "equals") {
            mongoCondition.NamXuatBan = value;
          }

          // ✅ SỬA: Xử lý negate cho NamXuatBan
          if (negate && Object.keys(mongoCondition).length > 0) {
            mongoCondition = { $nor: [mongoCondition] };
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "DonGia") {
          if (condOperator === "gte") {
            mongoCondition.DonGia = { $gte: value };
          } else if (condOperator === "lte") {
            mongoCondition.DonGia = { $lte: value };
          } else if (condOperator === "equals") {
            mongoCondition.DonGia = value;
          }

          // ✅ SỬA: Xử lý negate cho DonGia
          if (negate && Object.keys(mongoCondition).length > 0) {
            mongoCondition = { $nor: [mongoCondition] };
          }

          // ✅ SỬA: Push vào array
          if (Object.keys(mongoCondition).length > 0) {
            mongoConditions.push(mongoCondition);
          }
        } else if (field === "SoSao") {
          // SoSao sẽ xử lý sau (vì cần aggregate từ DanhGiaSach)
          // Tạm thời skip ở đây
          continue;
        }
      }

      // 1.2. Xử lý subQueries (đệ quy)
      if (subQueries && subQueries.length > 0) {
        for (const subQuery of subQueries) {
          const subMongoQuery = await buildMongoQuery(subQuery);
          if (Object.keys(subMongoQuery).length > 0) {
            mongoConditions.push(subMongoQuery);
          }
        }
      }

      // 1.3. Kết hợp các conditions theo operator
      if (mongoConditions.length === 0) {
        return {};
      } else if (mongoConditions.length === 1) {
        return mongoConditions[0];
      } else {
        if (operator === "AND") {
          return { $and: mongoConditions };
        } else if (operator === "OR") {
          return { $or: mongoConditions };
        } else if (operator === "NOT") {
          return { $nor: mongoConditions };
        }
      }
    }

    // Build MongoDB query
    const mongoQuery = await buildMongoQuery(query);
    console.log("🔍 MongoDB Query:", JSON.stringify(mongoQuery, null, 2));

    // ============================================
    // BƯỚC 2: TÌM SÁCH THEO QUERY
    // ============================================
    let books = await Sach.find(mongoQuery)
      .populate("MaNXB", "TenNXB")
      .populate("MaTheLoai", "TenTheLoai")
      .populate("Khoa", "TenKhoa")
      .lean();

    if (books.length === 0) {
      return [];
    }

    const bookIds = books.map((b) => b._id);

    // ============================================
    // BƯỚC 3: XỬ LÝ TOPLIST (WEIGHTED SCORING - FIXED)
    // ============================================
    if (topList && topList.length > 0) {
      console.log(
        "📊 Xử lý topList với weighted scoring (normalized):",
        topList
      );

      // ✅ FIXED: Gán weight mặc định
      const defaultWeights = {
        LuotMuon: 2,
        LuotXem: 1,
        DanhGia: 1.5,
      };

      for (let i = 0; i < topList.length; i++) {
        if (!topList[i].weight) {
          topList[i].weight = defaultWeights[topList[i].field] || 1;
        }
      }
      console.log("⚙️ Weight sau khi gán:", topList);

      // 3.1. Thu thập dữ liệu cho TẤT CẢ các field cần rank
      const bookScores = {};
      const rawData = {}; // ✅ FIXED: Lưu giá trị gốc để normalize

      for (const book of books) {
        bookScores[book._id] = {
          bookData: book,
          scores: {},
          normalizedScores: {},
          totalScore: 0,
        };
      }

      // 3.2. Thu thập dữ liệu RAW cho từng field
      for (let i = 0; i < topList.length; i++) {
        const topConfig = topList[i];
        const field = topConfig.field;

        if (field === "LuotMuon") {
          const borrowCounts = await TheoDoiMuonSach.aggregate([
            {
              $match: {
                MaSach: { $in: bookIds },
                TrangThai: { $in: ["approved", "returned", "overdue"] },
              },
            },
            {
              $group: {
                _id: "$MaSach",
                count: { $sum: 1 },
              },
            },
          ]);

          rawData.LuotMuon = borrowCounts.map((item) => item.count);
          for (const item of borrowCounts) {
            if (bookScores[item._id]) {
              bookScores[item._id].scores.LuotMuon = item.count;
            }
          }
        } else if (field === "LuotXem") {
          const viewCounts = await TheoDoiXemSach.aggregate([
            { $match: { MaSach: { $in: bookIds } } },
            {
              $group: {
                _id: "$MaSach",
                count: { $sum: 1 },
              },
            },
          ]);

          rawData.LuotXem = viewCounts.map((item) => item.count);
          for (const item of viewCounts) {
            if (bookScores[item._id]) {
              bookScores[item._id].scores.LuotXem = item.count;
            }
          }
        } else if (field === "DanhGia") {
          const ratings = await DanhGiaSach.aggregate([
            { $match: { MaSach: { $in: bookIds } } },
            {
              $group: {
                _id: "$MaSach",
                avgRating: { $avg: "$SoSao" },
                totalRatings: { $sum: 1 },
              },
            },
          ]);

          rawData.DanhGia = ratings.map((item) => item.avgRating);
          for (const item of ratings) {
            if (bookScores[item._id]) {
              bookScores[item._id].scores.DanhGia = item.avgRating;
            }
          }
        }
      }

      // ✅ FIXED: 3.3. NORMALIZE dữ liệu về thang 0-100
      const normalize = (values) => {
        if (!values || values.length === 0) return { min: 0, max: 1 };
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { min, max: max === min ? min + 1 : max }; // Tránh chia 0
      };

      const normalizers = {};
      for (const field in rawData) {
        normalizers[field] = normalize(rawData[field]);
      }

      // ✅ FIXED: 3.4. Tính điểm NORMALIZED cho từng sách
      for (const bookId in bookScores) {
        const book = bookScores[bookId];

        for (let i = 0; i < topList.length; i++) {
          const topConfig = topList[i];
          const field = topConfig.field;
          const weight = topConfig.weight || 1;

          if (book.scores[field] !== undefined) {
            const rawValue = book.scores[field];
            const { min, max } = normalizers[field];

            // Normalize về 0-100
            const normalizedValue = ((rawValue - min) / (max - min)) * 100;

            book.normalizedScores[field] = normalizedValue;
            book.totalScore += normalizedValue * weight;
          }
        }
      }

      // 3.5. Sắp xếp theo totalScore và lấy top
      let topLimit = 10;
      if (topList && topList.length > 0 && topList[0].limit) {
        topLimit = topList[0].limit;
      }

      const sortedBooks = Object.values(bookScores)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, topLimit);

      // 3.6. Gắn thông tin score vào books
      books = sortedBooks.map(function (item) {
        return {
          ...item.bookData,
          ...item.scores, // Giá trị gốc
          normalizedScores: item.normalizedScores, // Điểm đã chuẩn hóa
          totalScore: item.totalScore, // Tổng điểm
        };
      });

      console.log(
        "✅ Top " + books.length + " sách theo weighted scoring (normalized)"
      );
      console.log("📈 Normalizers:", normalizers);
    }

    // ============================================
    // BƯỚC 4: FILTER THEO SOSAO (NẾU CÓ)
    // ============================================
    const soSaoConditions =
      query.conditions && Array.isArray(query.conditions)
        ? query.conditions.filter((c) => c.field === "SoSao")
        : [];

    if (soSaoConditions.length > 0) {
      console.log("⭐ Filter theo rating...");

      const ratings = await DanhGiaSach.aggregate([
        { $match: { MaSach: { $in: bookIds } } },
        {
          $group: {
            _id: "$MaSach",
            avgRating: { $avg: "$SoSao" },
          },
        },
      ]);

      let validBookIds = ratings.map((r) => r._id);

      for (const condition of soSaoConditions) {
        const operator = condition.operator;
        const value = condition.value;
        const negate = condition.negate || false;

        validBookIds = validBookIds.filter((bookId) => {
          const rating = ratings.find((r) => r._id.equals(bookId));
          if (!rating) return false;

          let match = false;
          if (operator === "gte") match = rating.avgRating >= value;
          else if (operator === "lte") match = rating.avgRating <= value;
          else if (operator === "equals") match = rating.avgRating === value;

          return negate ? !match : match;
        });
      }

      books = books.filter((b) => validBookIds.some((id) => id.equals(b._id)));

      books = books.map((b) => {
        const ratingData = ratings.find((r) => r._id.equals(b._id));
        return { ...b, avgRating: ratingData ? ratingData.avgRating : 0 };
      });
    }

    // ============================================
    // BƯỚC 5: SORT (NẾU CÓ)
    // ============================================
    if (sort && sort.field) {
      books.sort((a, b) => {
        const aVal = a[sort.field] || 0;
        const bVal = b[sort.field] || 0;
        return sort.order === 1 ? aVal - bVal : bVal - aVal;
      });
    }

    // ============================================
    // BƯỚC 6: LIMIT KẾT QUẢ
    // ============================================
    const finalLimit = limit || 10;
    books = books.slice(0, finalLimit);

    return books;
  } catch (error) {
    console.error("❌ Error in timSachLevel2:", error);
    throw error;
  }
}

module.exports = {
  checkChatbotHealth,
  chatbot,
  timSachLevel1,
  timSachLevel2,
};
