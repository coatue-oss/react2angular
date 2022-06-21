module.exports = {
    setupFiles: ['./src/setup.ts'],
    setupFilesAfterEnv: ["jest-extended/all"],
    testEnvironment: 'jsdom',
    transform: {
      '.*\\.(tsx?)$': [
        '@swc/jest',
        {
          jsc: {
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
      ],
    },
  };