import * as fs from 'node:fs/promises'
import json5 from 'json5'
import axios from 'axios'
import {spawn} from 'node:child_process'

async function safeReadJson(path, def = null) {
  try {
    return json5.parse(await fs.readFile(path, 'utf-8'))
  } catch (ignore) {
    return def
  }
}

/**
 * @param packageName
 * @param tag
 * @return {Promise<string>}
 */
async function getPackageVersion(packageName, tag = 'latest') {
  const {data} = await axios.get(`https://registry.npmjs.org/${packageName}/${tag}`)
  return data.version
}

async function getGitChangedFiles() {
  // git diff --name-only
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['diff', '--name-only'])

    let paths = []

    child.stdout.on(
      'data',
      data => paths
        .push(
          ...data.toString()
            .split(/(\r?\n)+/g)
            .map(el => el.trim())
            .filter(Boolean),
        ),
    )

    child.on('close', code => {
      if (code === 0) {
        resolve(paths)
      } else {
        reject(code)
      }
    })
  })
}

// Main ------------------------------------------------------------------------

const {projects} = await safeReadJson('rush.json', {projects: []})
const localProjects = projects.map(p => p.packageName)

/**
 * @type {Map<string, {dir: string, shouldDeploy: boolean, reason: string, dependsOn: Array<string>}>}
 */
const state = new Map()

await Promise.all(projects.map(async p => {
  const stat = {
    dir: p.projectFolder,
  }

  const packageJson = await safeReadJson(`${p.projectFolder}/package.json`)

  const dependentPackages = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
  ]

  stat.dependsOn = dependentPackages.filter(p => localProjects.includes(p))

  if (p.shouldPublish) {
    const remoteVersion = await getPackageVersion(packageJson.name)
    stat.shouldDeploy = remoteVersion !== packageJson.version
    stat.reason = stat.shouldDeploy
      ? `current version ${packageJson.version}, remote version is ${remoteVersion}`
      : `same remote version`
  } else {
    stat.shouldDeploy = false
    stat.reason = 'Package is not marked for publishing in rush.json'
  }

  state.set(p.packageName, stat)
}))

const deploymentOrder = [...state.keys()]
  .filter(p => state.get(p).shouldDeploy)
  .sort((a, b) => {
    const aDeps = state.get(a).dependsOn
    const bDeps = state.get(b).dependsOn

    if (aDeps.includes(b)) {
      return 1
    }

    if (bDeps.includes(a)) {
      return -1
    }

    return 0
  })

if (deploymentOrder.length === 0) {
  console.log('Nothing to publish')
  process.exit(0)
}

console.log('Deployment order:')
for (const p of deploymentOrder) {
  const stat = state.get(p)
  console.log(`- ${p} (${stat.reason})`)
}
console.log()

// git commit checks
const changedFiles = await getGitChangedFiles()
const foundUncommittedChanges = []

for (const changedFile of changedFiles) {
  for (const [packageName, stat] of state.entries()) {
    if (!deploymentOrder.includes(packageName)) {
      continue
    }

    if (changedFile.startsWith(stat.dir)) {
      foundUncommittedChanges.push(`Changes in ${changedFile} detected for ${packageName} which is marked for publishing`)
    }
  }
}

if (foundUncommittedChanges.length > 0) {
  console.error('Uncommitted changes detected:')
  for (const change of foundUncommittedChanges) {
    console.error(`- ${change}`)
  }
  process.exit(1)
}

// Publish

for (const packageName of deploymentOrder) {
  const stat = state.get(packageName)

  console.log(`Publishing ${packageName}...`)

  const child = spawn('npm', ['publish'], {
    cwd: stat.dir,
    stdio: 'inherit',
    shell: true,
  })

  await new Promise((resolve, reject) => {
    child.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(code)
      }
    })
  })
}

console.log('Published packages:')
for (const packageName of deploymentOrder) {
  console.log(`- ${packageName} https://www.npmjs.com/package/${packageName}`)
}
