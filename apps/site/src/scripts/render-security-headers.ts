import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { prepareSecurityHeaders } from './security-headers'

const [distributionDirectory, templatePath, outputPath] = process.argv.slice(2)
if (!distributionDirectory || !templatePath || !outputPath) {
  throw new Error('Usage: render-security-headers <dist> <template> <output>')
}

const pages = readdirSync(distributionDirectory, {
  recursive: true,
  encoding: 'utf8',
})
  .filter((file) => file.endsWith('.html'))
  .map((file) => ({
    file,
    html: readFileSync(path.join(distributionDirectory, file), 'utf8'),
  }))

const prepared = prepareSecurityHeaders(
  pages,
  readFileSync(templatePath, 'utf8'),
)
for (const { file, html } of prepared.pages) {
  writeFileSync(path.join(distributionDirectory, file), html)
}
writeFileSync(outputPath, prepared.snippet)
console.log(`CSP: header rendered from ${String(pages.length)} pages`)
