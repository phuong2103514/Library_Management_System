<template>
  <div>
    <router-view></router-view>

    <!-- Chatbot Widget -->
    <div class="chatbot-widget">
      <!-- Chat Button (khi thu gọn) -->
      <transition name="fade">
        <button
          v-if="!isOpen"
          @click="toggleChat"
          @mousedown="startDrag"
          @touchstart="startDrag"
          class="chat-button"
          :style="{
            bottom: buttonPosition.bottom + 'px',
            right: buttonPosition.right + 'px',
            cursor: isDragging ? 'grabbing' : 'grab',
          }"
          aria-label="Mở chat hỗ trợ"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            ></path>
          </svg>
          <span class="notification-badge" v-if="hasNewMessage">1</span>
        </button>
      </transition>

      <!-- Chat Window -->
      <transition name="slide-up">
        <div
          v-if="isOpen"
          class="chat-window"
          :style="{
            bottom: getSafePosition().bottom + 'px',
            right: getSafePosition().right + 'px',
          }"
        >
          <!-- Header -->
          <div class="chat-header">
            <div class="header-content">
              <div class="avatar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="header-info">
                <h3>Trợ lý thư viện</h3>
                <span class="status">
                  <span
                    class="status-dot"
                    :class="{ offline: !isServerOnline }"
                  ></span>
                  {{ isServerOnline ? 'Trực tuyến' : 'Ngoại tuyến' }}
                </span>
              </div>
            </div>
            <button
              @click="toggleChat"
              class="close-button"
              aria-label="Đóng chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Messages Area -->
          <div class="chat-messages" ref="messagesContainer">
            <!-- Welcome Message -->
            <div v-if="messages.length === 0" class="welcome-message">
              <div class="welcome-icon">👋</div>
              <h4>Xin chào!</h4>
              <p>Tôi là trợ lý ảo của thư viện. Tôi có thể giúp gì cho bạn?</p>
              <div class="quick-questions">
                <button
                  v-for="(q, index) in quickQuestions"
                  :key="index"
                  @click="sendQuickQuestion(q)"
                  class="quick-question-btn"
                >
                  {{ q }}
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="['message', message.type]"
            >
              <div class="message-avatar" v-if="message.type === 'bot'">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="message-content">
                <div
                  class="message-bubble"
                  v-html="formatMessage(message.text)"
                ></div>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div v-if="isLoading" class="message bot">
              <div class="message-avatar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="chat-input">
            <form @submit.prevent="sendMessage">
              <input
                v-model="inputMessage"
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                :disabled="isLoading || !isServerOnline"
                ref="inputField"
              />
              <button
                type="submit"
                :disabled="!inputMessage.trim() || isLoading || !isServerOnline"
                class="send-button"
                aria-label="Gửi tin nhắn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { chatbotService } from './services/chatbot/chatbot.service';

export default {
  name: 'App',
  data() {
    return {
      isOpen: false,
      inputMessage: '',
      messages: [],
      isLoading: false,
      hasNewMessage: false,
      isServerOnline: false,
      healthCheckInterval: null,
      quickQuestions: [
        'Phí gia hạn thẻ là bao nhiêu?',
        'Tìm cho tôi những cuốn sách về Blockchain?',
      ],

      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      buttonPosition: {
        bottom: 24,
        right: 24,
      },
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  },
  async mounted() {
    await this.checkServerHealth();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    // Clear interval khi component bị destroy
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async checkServerHealth() {
      try {
        const response = await chatbotService.healthChatbot();

        if (response.status === 'ok' && response.data) {
          this.isServerOnline = response.data.status === 'ok';

          if (!response.data.database_loaded && this.messages.length === 0) {
            console.warn('⚠️ Database chưa được load vào Chatbot server');
          }
        } else {
          this.isServerOnline = false;
        }
      } catch (error) {
        this.isServerOnline = false;
        console.error('❌ Lỗi kiểm tra server health:', error);
      }
    },

    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.hasNewMessage = false;
        this.$nextTick(() => {
          if (this.$refs.inputField) {
            this.$refs.inputField.focus();
          }
        });
      }
    },

    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading || !this.isServerOnline)
        return;

      const userMessage = this.inputMessage.trim();

      // Add user message
      this.messages.push({
        type: 'user',
        text: userMessage,
        time: this.getCurrentTime(),
      });

      this.inputMessage = '';
      this.isLoading = true;

      this.scrollToBottom();

      try {
        // Gọi API qua backend
        const response = await chatbotService.sendMessage(userMessage);

        if (response.status === 'ok') {
          // Add bot response
          this.messages.push({
            type: 'bot',
            text: response.response,
            time: this.getCurrentTime(),
          });
        } else {
          // Add error message
          this.messages.push({
            type: 'error',
            text:
              response.message ||
              'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
            time: this.getCurrentTime(),
          });
        }
      } catch (error) {
        console.error('❌ Error:', error);

        let errorMsg = 'Xin lỗi, không thể kết nối đến server.';

        // Xử lý các loại lỗi khác nhau
        if (error.response) {
          if (error.response.status === 504) {
            errorMsg = 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.';
          } else if (error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }

        this.messages.push({
          type: 'error',
          text: errorMsg,
          time: this.getCurrentTime(),
        });

        // Kiểm tra lại server health
        await this.checkServerHealth();
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    sendQuickQuestion(question) {
      this.inputMessage = question;
      this.sendMessage();
    },

    getCurrentTime() {
      const now = new Date();
      return (
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0')
      );
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    formatMessage(text) {
      return text.replace(/\n{2,}/g, '\n').replace(/\n/g, '<br>');
    },

    startDrag(e) {
      if (this.isOpen) return; // Không cho kéo khi chat đang mở

      this.isDragging = true;
      const touch = e.type.includes('touch') ? e.touches[0] : e;
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;

      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
      document.addEventListener('touchmove', this.onDrag);
      document.addEventListener('touchend', this.stopDrag);
    },

    onDrag(e) {
      if (!this.isDragging) return;

      e.preventDefault();
      const touch = e.type.includes('touch') ? e.touches[0] : e;

      const deltaX = this.dragStartX - touch.clientX;
      const deltaY = touch.clientY - this.dragStartY;

      this.buttonPosition.right = Math.max(
        24,
        this.buttonPosition.right + deltaX
      );
      this.buttonPosition.bottom = Math.max(
        24,
        this.buttonPosition.bottom - deltaY
      );

      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
    },

    stopDrag() {
      this.isDragging = false;

      // Điều chỉnh vị trí để đảm bảo button không ra ngoài viewport
      const buttonSize = 60;
      const padding = 24;

      this.buttonPosition.right = Math.min(
        Math.max(padding, this.buttonPosition.right),
        this.windowWidth - buttonSize - padding
      );

      this.buttonPosition.bottom = Math.min(
        Math.max(padding, this.buttonPosition.bottom),
        this.windowHeight - buttonSize - padding
      );

      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
      document.removeEventListener('touchmove', this.onDrag);
      document.removeEventListener('touchend', this.stopDrag);
    },
    getSafePosition() {
      const chatWidth = 380;
      const chatHeight = 600;
      const padding = 16;

      // Giới hạn right
      const maxRight = this.windowWidth - chatWidth - padding;
      const safeRight = Math.min(
        Math.max(padding, this.buttonPosition.right),
        maxRight
      );

      // Giới hạn bottom
      const maxBottom = this.windowHeight - chatHeight - padding;
      const safeBottom = Math.min(
        Math.max(padding, this.buttonPosition.bottom),
        maxBottom
      );

      return {
        right: safeRight,
        bottom: safeBottom,
      };
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;

      // Điều chỉnh lại vị trí nếu cần
      this.stopDrag();
    },
  },
};
</script>

<style scoped>
.chatbot-widget {
  position: fixed;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}

/* Chat Button */
.chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: fixed;
}

.chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.chat-button:active {
  transform: scale(0.95);
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ff4757;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* Chat Window */
.chat-window {
  position: fixed;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
  margin-top: 2px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.offline {
  background: #f87171;
  animation: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

/* Welcome Message */
.welcome-message {
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome-message h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #2d3748;
}

.welcome-message p {
  color: #718096;
  margin: 0 0 24px 0;
  font-size: 14px;
}

.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-question-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4a5568;
  transition: all 0.2s;
  text-align: left;
}

.quick-question-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* Messages */
.message {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.message-content {
  max-width: 75%;
}

.message.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.bot .message-bubble {
  background: white;
  color: #2d3748;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.error .message-bubble {
  background: #fee;
  color: #c53030;
  border-left: 3px solid #fc8181;
}

.error-icon {
  display: inline;
  margin-right: 6px;
}

.message-time {
  font-size: 11px;
  color: #a0aec0;
  margin-top: 4px;
  padding: 0 4px;
}

/* Typing Indicator */
.typing-indicator {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  display: inline-flex;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #cbd5e0;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Input Area */
.chat-input {
  padding: 16px;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.chat-input form {
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.chat-input input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.chat-input input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.send-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* Responsive */
@media (max-width: 480px) {
  .chatbot-widget {
    bottom: 16px;
    right: 16px;
  }

  .chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    max-height: 600px;
  }

  .chat-button {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    max-height: 600px;
    bottom: 16px !important;
    right: 16px !important;
    left: 16px;
  }
}
</style>
