const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const {
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');

const { detectProject, formatTitle } = require('../src/project.js');

describe('project detection', () => {
  const testRoot = join(tmpdir(), 'claude-done-test-' + Date.now());

  beforeEach(() => {
    mkdirSync(testRoot, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('should detect Node.js project', () => {
    const dir = join(testRoot, 'myapp');
    mkdirSync(dir);
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'myapp' }));

    const result = detectProject(dir);
    assert.strictEqual(result.name, 'myapp');
    assert.strictEqual(result.type, 'Node.js');
  });

  it('should detect React framework', () => {
    const dir = join(testRoot, 'react-app');
    mkdirSync(dir);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        name: 'react-app',
        dependencies: { react: '^18.0.0' },
      })
    );

    const result = detectProject(dir);
    assert.strictEqual(result.framework, 'React');
  });

  it('should detect Next.js over React', () => {
    const dir = join(testRoot, 'next-app');
    mkdirSync(dir);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        name: 'next-app',
        dependencies: { next: '^14.0.0', react: '^18.0.0' },
      })
    );

    const result = detectProject(dir);
    assert.strictEqual(result.framework, 'Next.js');
  });

  it('should detect Rust project', () => {
    const dir = join(testRoot, 'rustapp');
    mkdirSync(dir);
    writeFileSync(
      join(dir, 'Cargo.toml'),
      '[package]\nname = "proxyclawd"\nversion = "0.1.0"'
    );

    const result = detectProject(dir);
    assert.strictEqual(result.name, 'proxyclawd');
    assert.strictEqual(result.type, 'Rust');
  });

  it('should detect Python project', () => {
    const dir = join(testRoot, 'pyapp');
    mkdirSync(dir);
    writeFileSync(join(dir, 'requirements.txt'), 'flask\nrequests\n');

    const result = detectProject(dir);
    assert.strictEqual(result.type, 'Python');
    assert.strictEqual(result.framework, 'Flask');
  });

  it('should detect Go project', () => {
    const dir = join(testRoot, 'goapp');
    mkdirSync(dir);
    writeFileSync(join(dir, 'go.mod'), 'module github.com/user/mygoapp\n\ngo 1.21\n');

    const result = detectProject(dir);
    assert.strictEqual(result.name, 'mygoapp');
    assert.strictEqual(result.type, 'Go');
  });

  it('should detect Java/Spring project', () => {
    const dir = join(testRoot, 'javaapp');
    mkdirSync(dir);
    writeFileSync(
      join(dir, 'pom.xml'),
      '<project><dependency>spring-boot</dependency></project>'
    );

    const result = detectProject(dir);
    assert.strictEqual(result.type, 'Java');
    assert.strictEqual(result.framework, 'Spring');
  });

  it('should detect Ruby/Rails project', () => {
    const dir = join(testRoot, 'railsapp');
    mkdirSync(dir);
    writeFileSync(join(dir, 'Gemfile'), "source 'https://rubygems.org'\ngem 'rails'\n");

    const result = detectProject(dir);
    assert.strictEqual(result.type, 'Ruby');
    assert.strictEqual(result.framework, 'Rails');
  });

  it('should detect C#/.NET project', () => {
    const dir = join(testRoot, 'dotnetapp');
    mkdirSync(dir);
    writeFileSync(join(dir, 'MyApp.csproj'), '<Project></Project>');

    const result = detectProject(dir);
    assert.strictEqual(result.type, 'C#/.NET');
  });

  it('should fallback to directory name', () => {
    const dir = join(testRoot, 'unknownapp');
    mkdirSync(dir);

    const result = detectProject(dir);
    assert.strictEqual(result.name, 'unknownapp');
    assert.strictEqual(result.type, null);
  });

  it('should format title with project info', () => {
    const project = { name: 'proxyclawd', type: 'Rust', framework: null };
    const title = formatTitle(
      project,
      '{{project}} ({{type}}) - Task complete',
      'Claude Code - Task complete'
    );
    assert.strictEqual(title, 'proxyclawd (Rust) - Task complete');
  });

  it('should format title with framework', () => {
    const project = { name: 'myapp', type: 'Node.js', framework: 'Next.js' };
    const title = formatTitle(
      project,
      '{{project}} ({{type}}) - Task complete',
      'Claude Code - Task complete'
    );
    assert.strictEqual(title, 'myapp (Node.js/Next.js) - Task complete');
  });

  it('should use fallback title when no type detected', () => {
    const project = { name: 'myapp', type: null, framework: null };
    const title = formatTitle(
      project,
      '{{project}} ({{type}}) - Task complete',
      'Claude Code - Task complete'
    );
    assert.strictEqual(title, 'Claude Code - Task complete');
  });
});
