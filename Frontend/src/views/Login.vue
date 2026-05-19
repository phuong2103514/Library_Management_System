<template>
  <div class="login">
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="login-form-welcome">
        <div class="login-form-welcome-title">Xin chào</div>
        <div class="login-form-welcome-logo">
          <img src="/image/logo_login.png" alt="" />
        </div>
      </div>

      <div class="login-form-input-and-button">
        <div class="login-form-input-username">
          <input v-model="username" type="text" placeholder="Tên đăng nhập" />
        </div>

        <div class="login-form-input-password">
          <input v-model="password" type="password" placeholder="Mật khẩu" />
          <i class="fa-solid fa-eye"></i>
        </div>

        <button type="submit" class="login-form-btn">Đăng nhập</button>
      </div>

      <div class="login-form-ask">
        Bạn chưa có tài khoản?
        <router-link to="/signup"><span>Đăng ký</span></router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { loginService } from '../services/auth/login.service';
import { userState } from '../assets/js/userState';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await loginService.login({
          username: this.username,
          password: this.password,
        });

        if (response) {
          if (response.role !== 'Admin' && response.role !== 'Manager') {
            if (response.cardStatus === 'Bị khóa') {
              alert(
                'Thẻ thư viện của bạn đang bị khóa.\nVui lòng đến thư viện để mở lại thẻ.'
              );
              return;
            }

            const updatedUser = await loginService.updateStatusAccount({
              maDocGia: response._id,
            });

            if (updatedUser.status === 'suspended') {
              alert(
                'Tài khoản của bạn đã bị tạm khóa do chưa thanh toán phí phạt.\nVui lòng đến thư viện để thanh toán.'
              );
              return;
            }
          }

          localStorage.setItem('_id', response._id);
          localStorage.setItem('role', response.role);
          userState._id = response._id;
          userState.role = response.role;
          userState.hoTen = response.hoTen || null;

          if(response.role === "User") {
            localStorage.setItem('userType', response.userType);
          }
            
          if (response.hoTen) {
            localStorage.setItem('hoTen', response.hoTen);
          }

          if (response.role === 'Admin' || response.role === 'Manager') {
            this.$router.push('/homeAdmin/managementLibraryCard');
          } else {
            this.$router.push('/home');
          }
        } else {
          alert('Tên đăng nhập hoặc mật khẩu không đúng!');
        }
      } catch {
        alert('Đã xảy ra lỗi!!!');
      }
    },
  },
};
</script>

<style scoped>
.login {
  height: 100vh;
  width: 100%;
  background-color: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: center;

  background-image: url("/image/background_login.jpg"); /* đường dẫn ảnh */
  background-size: cover;        /* phủ kín */
  background-position: center;   /* căn giữa */
  background-repeat: no-repeat;  /* không lặp */

  overflow: hidden;
}



.login-form {
  width: 400px;
  height: 95%;
  background-color: #fff;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 77px 55px 33px 55px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}

.login-form-welcome {
  text-align: center;
}

.login-form-welcome-title {
  font-size: 3.2rem;
  font-weight: bold;
}

.login-form-welcome-logo img {
  height: 70px;
  width: 84px;
  margin-top: 6px;
}

.login-form-input-and-button {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 38px;
}

.login-form-input-and-button input {
  padding: 0 5px;
  height: 45px;
  width: 100%;
  border: none;
  outline: none;
  border-bottom: 2px solid #adadad;
}

.login-form-input-and-button input:focus {
  border-bottom: 2px solid #00bfff;
}

.login-form-input-and-button input::placeholder {
  font-size: 1.5rem;
}

.login-form-input-password {
  position: relative;
}

.login-form-input-password i {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 5px;
  font-size: 1.4rem;
  color: #adadad;
  cursor: pointer;
}

.login-form-input-password i:hover {
  color: #4e9dfc;
}

.login-form-btn {
  height: 50px;
  background-color: #00bfff;
  border-radius: 30px;
  color: #fff;
}

.login-form-btn:hover {
  background-color: #519bfc;
}

.login-form-ask {
  font-size: 1.3rem;
  font-weight: 400;
}

.login-form-ask {
  text-align: center;
}

.login-form-ask span:hover {
  color: #776bff;
  cursor: pointer;
  font-weight: bold;
}
</style>
