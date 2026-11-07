import sharp from '../../../node_modules/.pnpm/sharp@0.35.5/node_modules/sharp/dist/index.mjs';
import { writeFile } from 'node:fs/promises';
const source='design/references/pg27-hero/Футуристический центр аналитики мира.png';
const assets=[];
for(const width of [640,1024,1649])for(const format of ['webp','avif']) {
 const path=`public/images/pg27/revised-world-analytics-${width}.${format}`;
 const info=await sharp(source).resize({width,withoutEnlargement:true}).toFormat(format,{quality:format==='webp'?88:65}).toFile(path);
 assets.push({path,...info});
}
await writeFile('design/reviews/pg27-product-hero-v1/generated-assets.json',JSON.stringify(assets,null,2));
