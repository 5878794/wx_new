
let fs = require('fs'),
    pug = require('pug'),
    exec = require('child_process').execSync;


module.exports = {
    runExec(cmdText){
        exec(cmdText);
    },
    readFile(filePath){
        return fs.readFileSync(filePath,'utf-8');
    },
    writeFile(filePath,text){
        fs.writeFileSync(filePath,text);
    },
    readLessFileAndCompile(filePath){
        let cmd = 'lessc --plugin=less-plugin-clean-css '+filePath,
            text = exec(cmd);
        text = text.toString();
        return text;
    },
    readPugFileAndCompile(filePath){
        return pug.renderFile(
            filePath,
            {pretty:true}
        );
    },
    dirIsExistOrCreate(filePath){
        if(!fs.existsSync(filePath)){
            fs.mkdirSync(filePath, '0777');
        }
    }
};