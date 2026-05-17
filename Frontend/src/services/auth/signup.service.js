import { apiService } from '../api.service';

export const signupService = {
  async signup(data) {
    return apiService.post('auth/signup', data);
  },
};
