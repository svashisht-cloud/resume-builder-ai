import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('./public/brand/forte-app-icon-1024.svg')
await sharp(svg).resize(1024, 1024).png().toFile('./app/apple-icon.png')
console.log('apple-icon.png written at 1024x1024')
