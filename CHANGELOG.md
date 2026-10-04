# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `animated-fluent-emojis/style.css` export for importing the component styles.
- React 19 support in the `react` and `react-dom` peer dependency ranges.

### Changed

- **Breaking:** the package is now ESM-only. The UMD and CommonJS builds were
  removed.

### Fixed

- `sideEffects` now declares the stylesheet so bundlers no longer drop the
  component styles during tree shaking.

## [0.1.2] - 2024-09-02

### Changed

- Version bump with no source changes since 0.1.1.

## [0.1.1] - 2024-08-22

### Added

- Emoji list and preview images in the documentation.

### Changed

- Package metadata in `package.json` (description, keywords, repository, bugs
  and homepage links, `sideEffects`).
- Renamed the `lib` directory to `src` and removed demo code.

### Fixed

- Emoji image source URL.
- Type declarations are now included in the build output.
- CSS classes of the emoji container.

## [0.1.0] - 2024-08-21

### Added

- Initial release of the animated Fluent emoji React components.

[Unreleased]:
  https://github.com/AndryOre/animated-fluent-emojis/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/AndryOre/animated-fluent-emojis/releases/tag/v0.1.2
[0.1.1]: https://github.com/AndryOre/animated-fluent-emojis/releases/tag/v0.1.1
[0.1.0]: https://github.com/AndryOre/animated-fluent-emojis/releases/tag/v0.1.0
