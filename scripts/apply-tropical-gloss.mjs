import {readFileSync,writeFileSync} from 'node:fs';
const css=readFileSync('tropical-gloss.css','utf8');
for(const name of ['index.html','admin.html']){
 const path='site/public/'+name;let html=readFileSync(path,'utf8');
 if(!html.includes('</head>'))throw Error('Tropical palette: head missing');
 html=html.replace('</head>','<style id="okok-tropical-gloss-v1">'+css+'</style>\n</head>');
 html=html.replace(/(<meta name="theme-color" content=")[^"]+/, '$1#061d27');
 // Existing setTheme remains responsible for updating the browser chrome.
 const themeAnchor='theme === "light" ? "#f2f5f7" : "#0b1b3a"';
 if(name==='index.html'&&!html.includes(themeAnchor))throw Error('Theme chrome anchor missing');
 html=html.replace(themeAnchor,'theme === "light" ? "#eef5ef" : "#061d27"');
 writeFileSync(path,html);
}
const path='site/public/manifest.json',manifest=JSON.parse(readFileSync(path,'utf8'));
manifest.theme_color='#061d27';manifest.background_color='#061d27';
writeFileSync(path,JSON.stringify(manifest,null,2));
console.log('Owner-approved Tropical Night: saturated ceramic gloss, both themes, layout preserved.');
