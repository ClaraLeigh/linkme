const wordDictionary = {
  'Hello': 'a',
  'world': 'b',
  'Welcome': 'c',
  'friend': 'd',
  'follow': 'e',
  'profile': 'f',
  'connect': 'h',
  'laravel': 'i',
  'developer': 'j',
  'engineer': 'k',
  'love': 'l',
  'send': 'm',
  'message': 'n',
  '❤️': '0',
  '😀': '1',
  '🎉': '2',
  '🏳️‍🌈': '3',
  '🚀': '4',
  '🌈': '5',
  '🔥': '6',
  '👋': '7',
  '🏳️‍⚧️': '8',
  '🇦🇺' : '9',
};

const commonUrlDictionary = {
  'https://tinyurl.com/': 'a',
  'https://bit.ly/': 'b',
}

const tldDictionary = {
  'com': 'a',
  'net': 'b',
  'org': 'c',
  'io': 'd',
  'dev': 'e',
  'ly': 'f',
}

const reverseWordDictionary = {};
for (const [word, code] of Object.entries(wordDictionary)) {
  reverseWordDictionary[code] = word;
}

function compressText(text) {
  return text.replace(/\b\w{3,}\b/g, (word) => { // Only target words with 3 or more characters
    if (wordDictionary.hasOwnProperty(word)) {
      // Preserve original casing
      const code = wordDictionary[word];
      return `@${code}@`;
    }
    return word;
  });
}

function decompressText(text) {
  return text.replace(/@(\w+)@/g, (match, code) => {
    if (reverseWordDictionary.hasOwnProperty(code)) {
      const word = reverseWordDictionary[code];
      // Check if the original code was capitalized
      const start = match.charAt(1);
      if (start === start.toUpperCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }
    return match; // If code not found, return the original match
  });
}

// URL Compression Functions
function compressUrl(url) {
  // check common URL dictionary
  for (const [commonUrl, code] of Object.entries(commonUrlDictionary)) {
    if (url.startsWith(commonUrl)) {
      return '*' + code + url.substring(commonUrl.length);
    }
  }

  if (url.startsWith('https://')) {
    url = url.substring(8);
  }


  // Remove common TLDs
  for (const [tld, code] of Object.entries(tldDictionary)) {
    if (url.endsWith(`.${tld}`)) {
      url = url.substring(0, url.length - tld.length - 1) + code;
      break;
    }
  }

  return url;
}

function decompressUrl(url) {
  // Check common URL dictionary
  if (url.startsWith('*')) {
    const code = url.charAt(1);
    url = url.substring(2);
    for (const [commonUrl, commonCode] of Object.entries(commonUrlDictionary)) {
      if (code === commonCode) {
        return commonUrl + url;
      }
    }
  }

  // Add back the common TLDs
  for (const [tld, code] of Object.entries(tldDictionary)) {
    if (url.endsWith(code)) {
      url = url.substring(0, url.length - 1) + `.${tld}`;
      break;
    }
  }
  return `https://${url}`;
}