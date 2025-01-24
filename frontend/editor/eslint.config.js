import antfu from '@antfu/eslint-config'

export default antfu({
	typescript: true,
	vue: true,
	yaml: true,
	toml: false,
	jsonc: false,
	markdown: false,
	rules: {
		'curly': 'off',
		'no-unused-vars': 'off',
		'no-var': 'error',
		'unused-imports/no-unused-imports': 'error',
		'style/no-tabs': 'off',
		'antfu/if-newline': 'off',
		'style/indent': ['error', 'tab'],
		'eslint-comments/no-unlimited-disable': 'off',
		'style/comma-dangle': ['error', 'always-multiline'],
	},
})
