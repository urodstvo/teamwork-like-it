import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  yaml: true,
  toml: false,
  jsonc: false,
  markdown: false,
  stylistic: false,
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
  },
})
