from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json

source = Path('/workspace/scratch/1996b13b789a/mario-assets')
target = Path('/workspace/sites/mario-lima-atelier/dist/assets')
catalog = json.loads((source / 'gallery-map.json').read_text())
captions = {'Street view':'Vista da rua','Top view':'Vista superior','Elevation':'Alçado','Living areas':'Áreas de estar','Bedrooms floor':'Piso dos quartos'}
manifest = {}
tiles = []
for slug, project in catalog.items():
    images = []
    for index, item in enumerate(project['images']):
        original = Image.open(source / item['file']).convert('RGB')
        original.thumbnail((1800, 1400), Image.Resampling.LANCZOS)
        name = Path(item['file']).stem + '.webp'
        original.save(target / name, 'WEBP', quality=85, method=6)
        images.append({'src':'assets/'+name,'caption':captions.get(item['caption'],item['caption']),'width':original.width,'height':original.height})
        if index == 0:
            tile=Image.new('RGB',(420,285),'#eceeea')
            tile.paste(ImageOps.fit(original,(420,250)),(0,0))
            ImageDraw.Draw(tile).text((10,262),slug,fill='#20241f')
            tiles.append(tile)
    manifest[slug] = {'images':images,'sourcePage':project['sourcePage'],'originalGalleryTotal':project['galleryTotal']}
Path('/workspace/sites/mario-lima-atelier/dist/gallery.js').write_text('window.GALLERIES = '+json.dumps(manifest,ensure_ascii=False)+';\n')
Path('/workspace/sites/mario-lima-atelier/asset-sources.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
sheet=Image.new('RGB',(1680,855),'#eceeea')
for i,tile in enumerate(tiles): sheet.paste(tile,((i%4)*420,(i//4)*285))
sheet.save('/workspace/scratch/1996b13b789a/mario-assets/contact-sheet.jpg')
print(json.dumps({'projects':len(manifest),'images':sum(len(x['images']) for x in manifest.values()),'total_bytes':sum(p.stat().st_size for p in target.glob('*.webp'))}))
