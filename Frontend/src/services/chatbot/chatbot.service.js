import { apiService } from '../api.service';

export const chatbotService = {
  // Kiểm tra trạng thái server
  async healthChatbot() {
    return apiService.get('chatbot/healthChatbot');
  },

  // Gửi tin nhắn chat
  async sendMessage(message) {
    return apiService.post('chatbot/chatbot', { message });
  },
};
