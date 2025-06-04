## Getting Started

1. **Fork the repository** and clone it to your local machine.

2. **Install dependencies** using [corepack](https://yarnpkg.com/):
   ```bash
   corepack enable && yarn
   ```

3. **Format & lint the project**:
   ```bash
   yarn format
   ```

4. **Build the project**:
   ```bash
   yarn build
   ```

5. **Run tests** to ensure everything works:
   ```bash
   yarn test
   ```

## Development Workflow

- Make your changes in a new branch based on `main`.
- Write clear, concise [commit messages](https://www.conventionalcommits.org/) following the [Conventional Commits](https://www.conventionalcommits.org/) specification.
- Add or update tests as needed.
- Run `yarn format` to format and lint your code.
- Ensure all tests pass before submitting a pull request.

## Scripts

- `yarn build` — Compile TypeScript to JavaScript.
- `yarn test` — Run the test suite with Jest.
- `yarn format` — Format and lint code using Biome.
- `yarn type-check` — Run TypeScript type checks.

## Pull Requests

- Describe your changes and the motivation behind them.
- Reference any related issues or pull requests.
- Ensure your branch is up to date with `main` before submitting.
- One feature or fix per pull request is preferred.

## Code Style

- This project uses [Biome](https://biomejs.dev/) for formatting and linting. Run `yarn format` before committing.
- TypeScript is used throughout the codebase. Please follow existing patterns and types.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

