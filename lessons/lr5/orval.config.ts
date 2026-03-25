import { defineConfig } from 'orval';

export default defineConfig({
  quiz: {
    input: {
      target: './quiz-api-schema.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './generated/api',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/client.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
        operations: {
          // Явно указываем какие операции должны быть мутациями
          getApiAuthGithubCallback: {
            query: {
              useQuery: true,
              useMutation: true,
            }
            // : true, // Принудительно делаем мутацией
          },
        },
      },
      prettier: true,
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
