const { existsSync, readFileSync, readdirSync } = require('fs');
const { join, basename } = require('path');

/**
 * Detect project info from a directory.
 * Returns { name, type, framework }
 */
function detectProject(cwd) {
  if (!cwd || !existsSync(cwd)) {
    return { name: basename(cwd || 'unknown'), type: null, framework: null };
  }

  // Node.js — package.json
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const name = pkg.name || basename(cwd);
      const framework = detectNodeFramework(pkg);
      return { name, type: 'Node.js', framework };
    } catch {}
  }

  // Rust — Cargo.toml
  const cargoPath = join(cwd, 'Cargo.toml');
  if (existsSync(cargoPath)) {
    const name = parseTomlName(cargoPath) || basename(cwd);
    return { name, type: 'Rust', framework: null };
  }

  // Python — pyproject.toml or requirements.txt
  const pyprojectPath = join(cwd, 'pyproject.toml');
  const requirementsPath = join(cwd, 'requirements.txt');
  if (existsSync(pyprojectPath) || existsSync(requirementsPath)) {
    const name = existsSync(pyprojectPath)
      ? parseTomlName(pyprojectPath) || basename(cwd)
      : basename(cwd);
    const framework = detectPythonFramework(cwd);
    return { name, type: 'Python', framework };
  }

  // Go — go.mod
  const goModPath = join(cwd, 'go.mod');
  if (existsSync(goModPath)) {
    const name = parseGoModName(goModPath) || basename(cwd);
    return { name, type: 'Go', framework: null };
  }

  // Java — pom.xml
  const pomPath = join(cwd, 'pom.xml');
  if (existsSync(pomPath)) {
    const framework = detectJavaFramework(cwd);
    return { name: basename(cwd), type: 'Java', framework };
  }

  // Ruby — Gemfile
  const gemfilePath = join(cwd, 'Gemfile');
  if (existsSync(gemfilePath)) {
    const framework = detectRubyFramework(cwd);
    return { name: basename(cwd), type: 'Ruby', framework };
  }

  // C# / .NET — *.sln or *.csproj
  try {
    const files = readdirSync(cwd);
    if (files.some(f => f.endsWith('.sln') || f.endsWith('.csproj'))) {
      return { name: basename(cwd), type: 'C#/.NET', framework: null };
    }
  } catch {}

  // Fallback — use directory name
  return { name: basename(cwd), type: null, framework: null };
}

function detectNodeFramework(pkg) {
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (allDeps['next']) return 'Next.js';
  if (allDeps['nuxt'] || allDeps['nuxt3']) return 'Nuxt';
  if (allDeps['react']) return 'React';
  if (allDeps['vue']) return 'Vue';
  if (allDeps['svelte'] || allDeps['@sveltejs/kit']) return 'Svelte';
  if (allDeps['express']) return 'Express';
  if (allDeps['fastify']) return 'Fastify';
  if (allDeps['@nestjs/core']) return 'NestJS';
  if (allDeps['@angular/core']) return 'Angular';
  return null;
}

function detectPythonFramework(cwd) {
  const files = [
    join(cwd, 'pyproject.toml'),
    join(cwd, 'requirements.txt'),
    join(cwd, 'setup.py'),
  ];

  for (const filePath of files) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (/django/i.test(content)) return 'Django';
      if (/fastapi/i.test(content)) return 'FastAPI';
      if (/flask/i.test(content)) return 'Flask';
    } catch {}
  }
  return null;
}

function detectJavaFramework(cwd) {
  try {
    const content = readFileSync(join(cwd, 'pom.xml'), 'utf-8');
    if (/spring/i.test(content)) return 'Spring';
  } catch {}
  return null;
}

function detectRubyFramework(cwd) {
  try {
    const content = readFileSync(join(cwd, 'Gemfile'), 'utf-8');
    if (/rails/i.test(content)) return 'Rails';
    if (/sinatra/i.test(content)) return 'Sinatra';
  } catch {}
  return null;
}

function parseTomlName(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/^name\s*=\s*"([^"]+)"/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function parseGoModName(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/^module\s+(\S+)/m);
    if (match) {
      // "github.com/user/repo" → "repo"
      const parts = match[1].split('/');
      return parts[parts.length - 1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format project info for notification title.
 */
function formatTitle(project, titleTemplate, fallbackTemplate) {
  if (!project.type) {
    return fallbackTemplate;
  }

  const type = project.framework
    ? `${project.type}/${project.framework}`
    : project.type;

  return titleTemplate
    .replace('{{project}}', project.name)
    .replace('{{type}}', type);
}

module.exports = { detectProject, formatTitle };
