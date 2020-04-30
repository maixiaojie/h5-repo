const path = require('path')
const shell = require('shelljs')
const Bundler = require('parcel-bundler')
const bs = require('browser-sync').create()

const cwd = process.cwd()
const { name, parcel, browsersync, hundun } = require(path.join(cwd, 'package.json'))

const rm = files => shell.rm('-rf', files.map(file => `${cwd}/${file}`))

const handleParcel = async (entry, options = {}) => {
    const bundler = new Bundler(entry, options)
    await bundler.bundle()
}
const handleBrowserSync = (options = {}) => {
    bs.init({
      ...options
    })
  }
  
const action = process.argv[2]  // dev build

const dev = (env = 'development') => {
    process.env.NODE_ENV = env

    const options = parcel.development
    const entryFiles = parcel.entryFiles

    rm([options.outDir])
    handleParcel(entryFiles, options)
    handleBrowserSync(browsersync)
}

const build = (env = 'production') => {
    process.env.NODE_ENV = env

    const options = parcel.production
    const entryFiles = parcel.entryFiles

    rm([options.outDir, '.cache'])
    handleParcel(entryFiles, options)
}

switch (action) {
    case 'dev':
        dev()
        break;
    case 'build':
        build();
        break;
    default:
        break;

}