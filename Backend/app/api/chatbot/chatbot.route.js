const express = require("express");
const router = express.Router();

const {
  healthChatbot,
  chatbot,
  timSachLevel1,
  timSachLevel2
} = require("./chatbot.controller");

const chatbotDataService = require("../../../chatbotData");

router.get("/healthChatbot", healthChatbot);
router.post("/chatbot", chatbot);
router.post("/tim_sach_level_1", timSachLevel1);
router.post("/tim_sach_level_2", timSachLevel2);

router.get("/get-quydinh", async (req, res) => {
  try {
    await chatbotDataService.sendDatabaseToChatBot();
    res.status(200).json({ message: "Đã gửi database tới chatbot thành công." });
  } catch (error) {
    console.error("Lỗi khi gửi database:", error);
    res.status(500).json({ message: "Gửi database thất bại.", error: error.message });
  }
});

module.exports = router;
