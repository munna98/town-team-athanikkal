import { defineConfig } from 'prisma/config'

export default defineConfig({
  seed: {
    command: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
})
