import pako from 'pako';
import msgpack from 'msgpack-lite';

/**
 * Uint8Array를 base64url로 인코딩
 * @param {Uint8Array} uint8arr
 * @returns {string}
 */
export function base64UrlEncode(uint8arr) {
  let b64 = btoa(String.fromCharCode(...uint8arr));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * base64url 문자열을 Uint8Array로 디코딩
 * @param {string} str
 * @returns {Uint8Array}
 */
export function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

/**
 * 데이터를 msgpack + pako + base64url로 인코딩하여 공유용 URL 생성
 * @param {any} data
 * @returns {string}
 */
export function encodeForShare(data) {
  const raw = msgpack.encode(data);
  const deflated = pako.deflate(raw);
  return base64UrlEncode(deflated);
}

/**
 * 공유용 URL에서 데이터 디코딩
 * @param {string} b64url
 * @returns {any}
 */
export function decodeFromShare(b64url) {
  const deflated = base64UrlDecode(b64url);
  const raw = pako.inflate(deflated);
  return msgpack.decode(raw);
}



