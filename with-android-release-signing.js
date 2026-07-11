const { withAppBuildGradle, createRunOncePlugin, withPlugins } = require('@expo/config-plugins');

// `expo prebuild --clean` regenerates android/ from scratch every time, so a
// manually-added release signingConfig in build.gradle doesn't survive CI.
// This re-appends it on every prebuild. Values come from env vars set by the
// CI job (ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD),
// falling back to Gradle properties for local builds where gradle.properties
// already has BETELCODE_UPLOAD_* set directly.
const RELEASE_SIGNING_BLOCK = `
android {
    signingConfigs {
        release {
            storeFile file('betelcode-release.keystore')
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: (project.hasProperty('BETELCODE_UPLOAD_STORE_PASSWORD') ? BETELCODE_UPLOAD_STORE_PASSWORD : null)
            keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: (project.hasProperty('BETELCODE_UPLOAD_KEY_ALIAS') ? BETELCODE_UPLOAD_KEY_ALIAS : null)
            keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: (project.hasProperty('BETELCODE_UPLOAD_KEY_PASSWORD') ? BETELCODE_UPLOAD_KEY_PASSWORD : null)
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
`;

function withReleaseSigningConfig(config) {
  return withAppBuildGradle(config, cfg => {
    if (!cfg.modResults.contents.includes("storeFile file('betelcode-release.keystore')")) {
      cfg.modResults.contents += RELEASE_SIGNING_BLOCK;
    }
    return cfg;
  });
}

const withAndroidReleaseSigning = config => withPlugins(config, [withReleaseSigningConfig]);

module.exports = createRunOncePlugin(withAndroidReleaseSigning, 'with-android-release-signing', '1.0.0');
