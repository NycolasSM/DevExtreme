'use strict';

const gulp = require('gulp');
const Vinyl = require('vinyl');
const env = require('./env-variables');
const fs = require('fs');
const path = require('path');
const through2 = require('through2');

gulp.task('skippedTask', done => done());

const isEsmPackage = env.BUILD_ESM_PACKAGE;
const packageDir = 'devextreme';
const packageDistDir = 'devextreme-dist';

const runTaskByCondition = (condition, task) => {
    if(condition) {
        return task;
    }
    return (done) => done ? done() : gulp.series('skippedTask');
};

const errorHandler = (errorPrefix) =>
    (error) => {
        if(error) {
            console.error(`${errorPrefix}: ${error}`);
        }
    };

const writeFileAsync = async(filePath, fileData) => {
    const dirPath = path.dirname(filePath);
    await fs.promises.mkdir(
        dirPath,
        { recursive: true },
        errorHandler(`Cannot create directory: ${dirPath}`),
    );
    await fs.promises.writeFile(
        filePath,
        fileData,
        errorHandler(`Cannot create file: ${filePath}`),
    );
};

const writeFilePipe = (modifyFilePathFunc) => {
    return through2.obj(async(file, _, callback) => {
        const targetPath = modifyFilePathFunc(file.path);
        await writeFileAsync(targetPath, file.contents);
        callback(null, file);
    });
};

const replaceArtifactPath = (path, oldSubPath, targetSubPath) =>
    path.replace(new RegExp(`/${oldSubPath}/`), `/${targetSubPath}/`);

const stringSrc = (filename, str) => {
    const src = require('stream').Readable({ objectMode: true });

    src._read = function() {
        this.push(new Vinyl({
            cwd: '',
            path: filename,
            contents: Buffer.from(str, 'utf-8')
        }));
        this.push(null);
    };

    return src;
};

module.exports = {
    packageDir,
    packageDistDir,
    stringSrc,
    isEsmPackage,
    runTaskByCondition,
    ifEsmPackage: (task) => runTaskByCondition(isEsmPackage, task),
    writeFileAsync,
    writeFilePipe,
    replaceArtifactPath,
};
