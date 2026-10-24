import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
export function projectContext(tag) {
  const memory = JSON.parse(readFileSync(new URL('ops/project-memory.json', root), 'utf8'));
  if (memory.schemaVersion !== 1) throw Error('unsupported_memory_schema');
  const ids = new Set();
  for (const record of [...memory.decisions, ...memory.tasks]) {
    if (!record.id || ids.has(record.id) || !record.status || !record.sources?.length) throw Error('invalid_memory_record');
    ids.add(record.id);
  }
  const select = rows => rows.filter(row => row.status !== 'done' && (!tag || row.tags.includes(tag)));
  const decisions = select(memory.decisions), tasks = select(memory.tasks);
  const sources = [...new Set(['AGENTS.md', ...[...decisions, ...tasks].flatMap(row => row.sources)])];
  return {project: memory.project, recordedAt: memory.updatedAt, observedAt: new Date().toISOString(),
    scope: tag || 'all', decisions, tasks,
    sources: sources.map(path => ({path, sha256: createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')})),
    reminder: 'Read relevant source instructions and compare current Git/live state. These notes do not prove deployment, delivery or current facts.'};
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const tag = process.argv[2];
  if (tag && !/^[a-z-]+$/.test(tag)) throw Error('invalid_context_tag');
  console.log(JSON.stringify(projectContext(tag), null, 2));
}
