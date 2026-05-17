<template>
  <div class="signup">
    <form class="signup-form" action="">
      <div class="signup-form-input-group">
        <div class="signup-form-title">Đăng ký</div>

        <div class="signup-form-input">
          <div class="signup-form-double-row">
            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Họ lót</div>
              <input type="text" v-model="firstName" />
            </div>

            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Tên</div>
              <input type="text" v-model="lastName" />
            </div>
          </div>

          <div class="signup-form-double-row">
            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Ngày sinh</div>
              <input type="date" v-model="birthDate" />
            </div>

            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Giới tính</div>
              <div class="signup-form-input-radio">
                <label
                  ><input type="radio" name="gender" value="male" v-model="gender" /> Nam</label
                >
                <label
                  ><input type="radio" name="gender" value="female" v-model="gender" /> Nữ</label
                >
              </div>
            </div>
          </div>

          <div class="signup-form-double-row">
            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Số điện thoại</div>
              <input type="text" v-model="phoneNumber" />
            </div>

            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Địa chỉ</div>
              <input type="text" v-model="address" />
            </div>
          </div>

          <div class="signup-form-wrapper">
            <div class="signup-form-input-title">Tên đăng nhập</div>
            <input type="text" v-model="username" />
          </div>

          <div class="signup-form-double-row">
            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Mật khẩu</div>
              <input type="password" v-model="password" />
            </div>

            <div class="signup-form-wrapper">
              <div class="signup-form-input-title">Nhập lại mật khẩu</div>
              <input type="password" v-model="confirmPassword" />
            </div>
          </div>
        </div>

        <div class="signup-form-btn">
          <button type="button" @click="handleSignup">Đăng ký</button>
        </div>
      </div>

      <div class="signup-form-navigation-login">
        Bạn đã có tài khoản?
        <router-link to="/"><span>Đăng nhập</span></router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { signupService } from '../services/auth/signup.service';

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
      address: '',
      phoneNumber: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    async handleSignup() {
      if (
        !this.firstName ||
        !this.lastName ||
        !this.birthDate ||
        !this.gender ||
        !this.address ||
        !this.phoneNumber ||
        !this.username ||
        !this.password ||
        !this.confirmPassword
      ) {
        alert('Hãy nhập tất cả các thông tin');
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert('Mật khẩu không trùng khớp');
        return;
      }

      try {
        await signupService.signup({
          HoLot: this.firstName,
          Ten: this.lastName,
          NgaySinh: this.birthDate,
          Phai: this.gender === 'male' ? 'Nam' : 'Nữ',
          DiaChi: this.address,
          DienThoai: this.phoneNumber,
          username: this.username,
          password: this.password
        });

        alert('Đăng ký thành công');
        this.$router.push('/');
      } catch (err) {
        alert('Đã xảy ra lỗi!!!');
      }
    }
  }
};
</script>

<style scoped>
.signup {
  height: 100vh;
  width: 100%;
  background-color: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signup-form {
  width: 50%;
  height: 95%;
  background-color: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 32px 113px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 15px;
}

.signup-form-title {
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  position: relative;
  top: -10px;
}

.signup-form-double-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.signup-form-input-group {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
}

.signup-form-btn {
  text-align: center;
}

.signup-form-btn button {
  height: 50px;
  width: 200px;
  background-color: #00bfff;
  border-radius: 30px;
  color: #fff;
}

.signup-form-btn button:hover {
  background-color: #519bfc;
}

.signup-form-wrapper {
  margin-bottom: 24px;
}

.signup-form-wrapper input:not([type="radio"]) {
  height: 30px;
  width: 100%;
  outline: none;
  border: none;
  border-bottom: 2px solid #adadad;
  font-weight: 400;
}

.signup-form-wrapper input:focus {
  border-bottom: 2px solid #00bfff;
}

.signup-form-input-title {
  font-size: 1.9rem;
}

.signup-form-input-radio {
  position: relative;
  top: 12px;
  display: flex;
  gap: 35px;
}

.signup-form-navigation-login {
  text-align: center;
  font-size: 1.3rem;
  font-weight: 400;
}

.signup-form-navigation-login span:hover {
  color: #776bff;
  cursor: pointer;
  font-weight: bold;
}
</style>