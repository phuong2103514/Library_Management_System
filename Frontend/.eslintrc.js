module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended", // rule Vue 3
    "prettier", // tắt conflict với Prettier
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "vue/multi-word-component-names": "off", // tắt rule tên component nhiều từ
  },
};
