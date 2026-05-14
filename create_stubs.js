const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src/components/tools');
const files = ['DocumentConverter', 'AudioConverter', 'UnitConverter', 'JsonFormatter', 'DiffChecker', 'SlugGenerator', 'LoremIpsum', 'Base64Tool', 'HashGenerator', 'AesEncryptor', 'UuidGenerator', 'MinifierTool', 'PrettierTool', 'RegexTester', 'ColorConverter', 'DateCalculator', 'MetadataExtractor', 'ScreenshotTool', 'SvgEditor', 'TodoList'];
files.forEach(name => {
  const content = `export default function ${name}({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
    return (
      <div className="p-8 bg-slate-900 rounded-xl border border-slate-800 text-center text-slate-300">
        <h2 className="text-xl font-bold mb-2">${name}</h2>
        <p>Herramienta en desarrollo...</p>
      </div>
    );
  }`;
  fs.writeFileSync(path.join(dir, name + '.tsx'), content);
});
console.log('Stubs created.');
