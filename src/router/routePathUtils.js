/** `import.meta.glob`으로 얻은 views 파일 경로 → Vue Router path (alias·상대·절대 경로 모두 허용) */
export function filePathToRoutePath(filePath) {
  let path = String(filePath)
    .replace(/\\/g, '/')
    .replace(/^.*\/src\/views\//, '')
    .replace(/^@\/views\//, '')
    .replace(/\/index\.vue$/, '')
    .replace(/^index$/, '');

  if (path === '') {
    return '/';
  }

  return '/' + path;
}

export function filePathToRouteName(filePath) {
  let name = filePath
    .replace(/^@\/views\//, '')
    .replace(/\/index\.vue$/, '')
    .replace(/^index$/, 'Home')
    .split('/')
    .map((part) =>
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
    )
    .join('');

  return name || 'Home';
}
