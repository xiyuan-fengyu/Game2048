"use strict";
/// 阅读 api.d.ts 查看文档
///<reference path="api.d.ts"/>
var built_in_1 = require("built-in");
var bricks_1 = require("./bricks/bricks");
var defaultConfig = require("./config");
var config = {
    buildConfig: function (params) {
        var target = params.target, command = params.command, projectName = params.projectName, version = params.version;
        var outputDir = "../" + projectName + "_bricks/PublicBrickEngineGame/Res";
        if (command == 'build') {
            return {
                outputDir: outputDir,
                commands: [
                    new built_in_1.CompilePlugin({ libraryType: "debug", defines: { DEBUG: true, RELEASE: false } }),
                    new built_in_1.ExmlPlugin('commonjs'),
                    new built_in_1.ManifestPlugin({ output: 'manifest.json' }),
                    new bricks_1.BricksPlugin()
                ]
            };
        }
        else if (command == 'publish') {
            console.log('执行publish');
            return {
                outputDir: outputDir,
                commands: [
                    new built_in_1.CompilePlugin({ libraryType: "debug", defines: { DEBUG: true, RELEASE: false } }),
                    new built_in_1.ExmlPlugin('commonjs'),
                    new built_in_1.ManifestPlugin({ output: 'manifest.json' }),
                    new built_in_1.UglifyPlugin([{
                            sources: ["main.js"],
                            target: "js/main.min.js"
                        }
                    ]),
                    new bricks_1.BricksPlugin(),
                ]
            };
        }
        else {
            throw "unknown command : " + params.command;
        }
    },
    mergeSelector: defaultConfig.mergeSelector,
    typeSelector: defaultConfig.typeSelector
};
module.exports = config;
