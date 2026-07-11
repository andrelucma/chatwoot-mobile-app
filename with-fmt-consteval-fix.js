const { withPlugins, createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Xcode 26's clang defines __cpp_consteval, so fmt (transitive dep of
// RCT-Folly, pinned to 11.0.2) computes FMT_USE_CONSTEVAL=1 and hits a
// compiler bug: "call to consteval function ... is not a constant
// expression" in fmt/format-inl.h. A -DFMT_USE_CONSTEVAL=0 build setting
// does NOT work around this: fmt/include/fmt/base.h computes and
// `#define`s FMT_USE_CONSTEVAL itself with no `#ifndef` guard, so it
// silently clobbers any command-line override. The only reliable fix is
// patching the pod's header text directly to force the value to 0 right
// before it's consumed.
const FMT_CONSTEVAL_FIX = `
    fmt_header = File.join(installer.pods_project.path.dirname, 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_header)
      contents = File.read(fmt_header)
      unless contents.include?('#undef FMT_USE_CONSTEVAL')
        contents = contents.sub(/^#if FMT_USE_CONSTEVAL$/, "#undef FMT_USE_CONSTEVAL\\n#define FMT_USE_CONSTEVAL 0\\n#if FMT_USE_CONSTEVAL")
        File.write(fmt_header, contents)
      end
    end
`;

function addFmtConstevalFix(podfilePath) {
  let contents = fs.readFileSync(podfilePath, 'utf8');
  if (!contents.includes('#undef FMT_USE_CONSTEVAL')) {
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
