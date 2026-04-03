const { withXcodeProject, withPodfileProperties } = require("expo/config-plugins");

function withMinimumDeploymentTarget(config, targetVersion = "16.0") {
  config = withPodfileProperties(config, (config) => {
    config.modResults["ios.deploymentTarget"] = targetVersion;
    return config;
  });

  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const buildSettings = configurations[key].buildSettings;
      if (buildSettings) {
        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = targetVersion;
      }
    }
    return config;
  });

  return config;
}

module.exports = withMinimumDeploymentTarget;
