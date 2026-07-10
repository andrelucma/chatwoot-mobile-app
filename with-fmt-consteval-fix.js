const { withPlugins, createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Xcode 26's clang enforces C++20 `consteval` evaluation even though RN
// targets C++17, which breaks the `fmt` pod (transitive dep of RCT-Folly):
// "call to consteval function ... is not a constant expression" in
// fmt/format-inl.h. Forcing FMT_CONSTEVAL to be empty makes fmt fall back to
// `constexpr`, which compiles fine. See fmtlib/fmt and community RN issues
// about this exact error under newer Xcode toolchains.
const FMT_CONSTEVAL_FIX = `
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |config|
          defs = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
          defs = [defs] unless defs.is_a?(Array)
          defs << 'FMT_CONSTEVAL=' unless defs.include?('FMT_CONSTEVAL=')
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
        end
      end
    end
`;

function addFmtConstevalFix(podfilePath) {
  let contents = fs.readFileSync(podfilePath, 'utf8');
  if (!contents.includes('FMT_CONSTEVAL=')) {
    contents = contents.replace(
      /post_install do \|installer\|/,
      `post_install do |installer|\n${FMT_CONSTEVAL_FIX}`,
    );
  }
  fs.writeFileSync(podfilePath, contents, 'utf8');
}

function withFmtConstevalFixMod(config) {
  return withDangerousMod(config, [
    'ios',
    cfg => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      addFmtConstevalFix(podfilePath);
      return cfg;
    },
  ]);
}

const withFmtConstevalFix = config => {
  return withPlugins(config, [withFmtConstevalFixMod]);
};

module.exports = createRunOncePlugin(withFmtConstevalFix, 'with-fmt-consteval-fix', '1.0.0');
