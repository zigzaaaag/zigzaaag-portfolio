// No dependencies. Friendly validation for everyday portfolio edits.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
let errors = 0;
function fail(message) { errors++; console.error(`错误：${message}`); }
for (const file of ['script.js', 'portfolio.js', 'server.cjs', 'data/site.js', 'data/projects.js']) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (result.status !== 0) fail(`${file} 有语法问题\n${result.stderr}`);
}
if (errors) process.exit(1);
const context = { window: {} };
vm.createContext(context);
for (const file of ['data/site.js', 'data/projects.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
const site = context.window.PORTFOLIO_SITE;
const projects = context.window.PORTFOLIO_PROJECTS;
function asset(src, where) {
  if (typeof src !== 'string' || !src.trim()) { fail(`${where} 缺少文件路径`); return; }
  if (/^https?:\/\//.test(src)) { console.log(`提示：${where} 使用外部资源，未验证离线可用性`); return; }
  const resolved = path.resolve(root, src);
  if (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) fail(`${where} 找不到文件：${src}`);
}
asset(site.heroImage, 'Hero');
if (!Array.isArray(site.categories) || new Set(site.categories).size !== site.categories.length || site.categories.includes('All')) fail('categories 应为不重复的分类数组，不要手动加入 All');
if (!Array.isArray(projects)) { fail('projects 必须是数组'); process.exit(1); }
const ids = new Set();
const layouts = new Set(['full', 'landscape', 'portrait', 'pair', 'triple', 'small', 'asymmetric', 'text-media', 'video']);
function media(item, where) {
  if (!item || !['image', 'video'].includes(item.type)) { fail(`${where} type 只能是 image 或 video`); return; }
  asset(item.src, where);
  if (item.poster) asset(item.poster, `${where} poster`);
  if (item.fullSrc) asset(item.fullSrc, `${where} fullSrc`);
  if (item.type === 'video' && !/\.(mp4|webm)(\?.*)?$/i.test(item.src)) fail(`${where} 视频使用 .mp4 或 .webm`);
  if (item.type === 'image' && !item.alt) console.log(`提示：${where} 建议补充 alt 图像说明`);
  for (const key of ['autoplay', 'muted', 'loop', 'controls']) if (item[key] !== undefined && typeof item[key] !== 'boolean') fail(`${where} ${key} 应为 true 或 false（不要引号）`);
}
for (const project of projects) {
  const where = project.id || '未命名项目';
  if (!/^[a-z0-9-]+$/.test(project.id || '') || ids.has(project.id)) fail(`${where} id 应是唯一的小写英文、数字、短横线`);
  ids.add(project.id);
  for (const key of ['number', 'title', 'year']) if (typeof project[key] !== 'string' || !project[key]) fail(`${where} 缺少 ${key} 字符串`);
  if (!Array.isArray(project.category) || !project.category.length) fail(`${where} 至少需要一个 category`);
  else project.category.forEach(category => { if (!site.categories.includes(category)) fail(`${where} 分类 ${category} 未在 site.js 声明`); });
  const covers = Array.isArray(project.cover) ? project.cover : [project.cover];
  if (covers.length < 1 || covers.length > 3) fail(`${where} cover 应为 1～3 个媒体`);
  covers.forEach((item, i) => media(item, `${where} cover ${i + 1}`));
  if (!Array.isArray(project.media)) { fail(`${where} media 必须是数组`); continue; }
  project.media.forEach((block, i) => {
    const label = `${where} media 第 ${i + 1} 组`;
    if (!layouts.has(block.layout)) fail(`${label} 未知布局 ${block.layout}`);
    const expected = { pair: 2, triple: 3, asymmetric: 2 }[block.layout];
    if (expected && block.items?.length !== expected) fail(`${label} 需要 ${expected} 个 items`);
    (block.items || [block]).forEach(item => media(item, label));
  });
}
for (const file of ['index.html', 'project.html', 'about.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
    if (!/^(https?:|mailto:)/.test(match[1])) asset(match[1], file);
  }
}
if (errors) { console.error(`共 ${errors} 个错误，请按上面的文件位置修改。`); process.exitCode = 1; }
else console.log(`检查通过：${projects.length} 个项目，${site.categories.length} 个分类，脚本语法与本地媒体路径正常。`);
