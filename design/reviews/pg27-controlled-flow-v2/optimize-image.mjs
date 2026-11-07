import sharp from '../../../node_modules/.pnpm/sharp@0.35.5/node_modules/sharp/dist/index.mjs';
import { writeFile } from 'node:fs/promises';
const source='design/references/pg27-hero/Гидроэлектростанция на закате.png';
const assets=[];
for(const width of [640,1024,1983])for(const format of ['webp','avif']) {
 const path=`public/images/pg27/controlled-flow-dam-${width}.${format}`;
 const info=await sharp(source).resize({width,withoutEnlargement:true}).toFormat(format,{quality:format==='webp'?88:65}).toFile(path);
 assets.push({path,...info});
}
await writeFile('design/reviews/pg27-controlled-flow-v2/generated-assets.json',JSON.stringify(assets,null,2));
