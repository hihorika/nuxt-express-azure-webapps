/* eslint-disable no-console */

// This file is duplicated from nuxt/bin/nuxt-start and modified.

const fs = require('fs')
const parseArgs = require('minimist')
const { resolve } = require('path')

const { Nuxt, Utils } = require('nuxt')  // original path is '..'
const { loadNuxtConfig, getLatestHost } = require('nuxt/bin/common/utils') // original path is './common/utils'

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    h: 'help',
    H: 'hostname',
    p: 'port',
    c: 'config-file',
    s: 'spa',
    u: 'universal'
  },
  boolean: ['h', 's', 'u'],
  string: ['H', 'c'],
  default: {
    c: 'nuxt.config.js'
  }
})

if (argv.hostname === '') {
  Utils.fatalError('Provided hostname argument has no value')
}

if (argv.help) {
  console.log(`
    Description
      Starts the application in production mode.
      The application should be compiled with \`nuxt build\` first.
    Usage
      $ nuxt start <dir> -p <port number> -H <hostname>
    Options
      --port, -p            A port number on which to start the application
      --hostname, -H        Hostname on which to start the application
      --spa                 Launch in SPA mode
      --universal           Launch in Universal mode (default)
      --config-file, -c     Path to Nuxt.js config file (default: nuxt.config.js)
      --help, -h            Displays this message
  `)
  process.exit(0)
}

const options = loadNuxtConfig(argv)

// Force production mode (no webpack middleware called)
options.dev = false

const nuxt = new Nuxt(options)

// Setup hooks
nuxt.hook('error', (_err, from) => Utils.fatalError(_err, from))

// Check if project is built for production
const distDir = resolve(
  nuxt.options.rootDir,
  nuxt.options.buildDir || '.nuxt',
  'dist'
)
if (!fs.existsSync(distDir)) {
  Utils.fatalError(
    'No build files found, please run `nuxt build` before launching `nuxt start`'
  )
}

// Check if SSR Bundle is required
if (nuxt.options.render.ssr === true) {
  const ssrBundlePath = resolve(distDir, 'server-bundle.json')
  if (!fs.existsSync(ssrBundlePath)) {
    Utils.fatalError(
      'No SSR build! Please start with `nuxt start --spa` or build using `nuxt build --universal`'
    )
  }
}

const { port, host } = getLatestHost(argv)

nuxt.listen(port, host)
