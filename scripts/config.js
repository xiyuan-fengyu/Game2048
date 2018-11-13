"use strict";
/// 阅读 api.d.ts 查看文档
///<reference path="api.d.ts"/>
var built_in_1 = require("built-in");
var myplugin_1 = require("./myplugin");
var config = {
    buildConfig: function (params) {
        var target = params.target, command = params.command, projectName = params.projectName, version = params.version;
        if (command == 'build') {
            var outputDir = '.';
            return {
                outputDir: outputDir,
                commands: [
                    // new EmitResConfigFilePlugin({
                    //     output: "resource/default.res.json",
                    //     typeSelector: config.typeSelector,
                    //     nameSelector: p => path.basename(p).replace(/\./gi, "_"),
                    //     groupSelector: p => "preload"
                    // }),
                    new built_in_1.ExmlPlugin('debug'),
                    new built_in_1.IncrementCompilePlugin(),
                ]
            };
        }
        else if (command == 'publish') {
            var outputDir = "bin-release/web/" + version;
            return {
                outputDir: outputDir,
                commands: [
                    new myplugin_1.CustomPlugin(),
                    new built_in_1.CompilePlugin({ libraryType: "release", defines: { DEBUG: false, RELEASE: true } }),
                    new built_in_1.ExmlPlugin('commonjs'),
                    new built_in_1.UglifyPlugin([{
                            sources: ["main.js"],
                            target: "main.min.js"
                        }]),
                    new built_in_1.RenamePlugin({
                        verbose: true, hash: 'crc32', matchers: [
                            { from: "**/*.js", to: "[path][name]_[hash].[ext]" }
                        ]
                    }),
                    new built_in_1.ManifestPlugin({ output: "manifest.json" })
                ]
            };
        }
        else {
            throw "unknown command : " + params.command;
        }
    },
    mergeSelector: function (path) {
        if (path.indexOf("assets/bitmap/") >= 0) {
            return "assets/bitmap/sheet.sheet";
        }
        else if (path.indexOf("armature") >= 0 && path.indexOf(".json") >= 0) {
            return "assets/armature/1.zip";
        }
    },
    typeSelector: function (path) {
        var ext = path.substr(path.lastIndexOf(".") + 1);
        var typeMap = {
            "jpg": "image",
            "png": "image",
            "webp": "image",
            "json": "json",
            "fnt": "font",
            "pvr": "pvr",
            "mp3": "sound",
            "zip": "zip",
            "sheet": "sheet",
            "exml": "text"
        };
        var type = typeMap[ext];
        if (type == "json") {
            if (path.indexOf("sheet") >= 0) {
                type = "sheet";
            }
            else if (path.indexOf("movieclip") >= 0) {
                type = "movieclip";
            }
            ;
        }
        return type;
    }
};
module.exports = config;
