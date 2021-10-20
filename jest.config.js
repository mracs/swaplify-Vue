module.exports = {
  verbose: true,
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '.*\\.(js)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  globals: {
    mockAxiosError: false,
    url: '',
    params: '',
    body: '',
    axiosErrorRequestBody: { status: 500, response: 'body', responseURL: 'test' },
    axiosErrorTest: undefined,
  },
  setupFiles: ['<rootDir>/tests.setup'],
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)'],
};
